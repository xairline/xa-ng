package dataref

//go:generate mockgen -destination=../__mocks__/dataref/dataref.go -package=mocks -source=dataref.go

import "C"
import (
	"apps/core/models"
	"apps/core/utils/logger"
	_ "embed"
	"fmt"
	"github.com/xairline/goplane/xplm/dataAccess"
	"github.com/xairline/goplane/xplm/navigation"
	"gopkg.in/yaml.v3"
	"math"
	"sync"
)

var datarefSvcLock = &sync.Mutex{}
var datarefSvc DatarefService

//go:embed dataref.yaml
var datarefBytes []byte

type DatarefService interface {
	GetCurrentValues() models.DatarefValues
	GetValueByDatarefName(dataref, name string, precision *int8, isByteArray bool) models.DatarefValue
	GetNearestAirport() (string, string)
	getCurrentValue(datarefExt *models.DatarefExt) models.DatarefValue
}

type datarefService struct {
	DatarefExtList []models.DatarefExt
	Logger         logger.Logger
}

func (d datarefService) GetNearestAirport() (string, string) {
	latLngPrecision := int8(-1)
	latDataref := d.GetValueByDatarefName("sim/flightmodel/position/latitude", "lat", &latLngPrecision, false)
	lngDataref := d.GetValueByDatarefName("sim/flightmodel/position/longitude", "lng", &latLngPrecision, false)
	navRef := navigation.FindNavAid(
		"",
		"",
		float32(latDataref.Value.(float64)),
		float32(lngDataref.Value.(float64)),
		math.MaxInt32,
		navigation.Nav_Airport,
	)
	_, _, _, _, _, _, airportId, airportName, _ := navigation.GetNavAidInfo(navRef)
	d.Logger.Infof("Nearest Airport:%s - %s", airportId, airportName)
	return airportId, airportName
}

func (d datarefService) GetValueByDatarefName(dataref, name string, precision *int8, isByteArray bool) models.DatarefValue {
	myDataref, success := dataAccess.FindDataRef(dataref)
	if !success {
		d.Logger.Errorf("Failed to find dataref: %s", name)
	}
	datarefExt := models.DatarefExt{
		Name:         name,
		Dataref:      myDataref,
		DatarefType:  dataAccess.GetDataRefTypes(myDataref),
		Precision:    precision,
		IsBytesArray: isByteArray,
	}
	return d.getCurrentValue(&datarefExt)
}

func (d datarefService) getCurrentValue(datarefExt *models.DatarefExt) models.DatarefValue {
	var currentValue interface{}
	switch datarefExt.DatarefType {
	case dataAccess.TypeInt:
		currentValue = dataAccess.GetIntData(datarefExt.Dataref)
	case dataAccess.TypeFloat, dataAccess.TypeDouble, 6:
		tmp := dataAccess.GetFloatData(datarefExt.Dataref)
		if datarefExt.Precision != nil {
			currentValue = dataRoundup(float64(tmp), int(*datarefExt.Precision))
		} else {
			currentValue = tmp
		}
	case dataAccess.TypeFloatArray:
		tmpValue := dataAccess.GetFloatArrayData(datarefExt.Dataref)
		res := make([]float64, len(tmpValue))
		if datarefExt.Precision != nil {
			for index, tmp := range tmpValue {
				res[index] = dataRoundup(float64(tmp), int(*datarefExt.Precision))
			}
			currentValue = res
		} else {
			currentValue = tmpValue
		}
	case dataAccess.TypeIntArray:
		currentValue = dataAccess.GetIntArrayData(datarefExt.Dataref)
	case dataAccess.TypeData: // string??
		tmpValue := dataAccess.GetData(datarefExt.Dataref)
		if datarefExt.IsBytesArray {
			currentValue = ""
			for _, element := range tmpValue {
				if element == 0 {
					break
				}
				currentValue = fmt.Sprintf("%s", currentValue) + string(byte(element))
			}
		} else {
			currentValue = tmpValue
		}
	default:
		d.Logger.Errorf("Unknown dataref type for %+v", datarefExt)
	}
	return models.DatarefValue{
		Name:  datarefExt.Name,
		Value: currentValue,
	}
}

func (d datarefService) GetCurrentValues() models.DatarefValues {
	var res = models.DatarefValues{}
	//var wg sync.WaitGroup
	for _, value := range d.DatarefExtList {
		//wg.Add(1)
		datarefExt := value
		//go func() {
		//	defer wg.Done()
		currentValue := d.getCurrentValue(&datarefExt)
		res[currentValue.Name] = currentValue
		//}()
	}
	//wg.Wait()
	return res
}

func NewDatarefService(logger logger.Logger) DatarefService {
	if datarefSvc != nil {
		logger.Info("Dataref SVC has been initialized already")
		return datarefSvc
	} else {
		logger.Info("Dataref SVC: initializing")
		datarefSvcLock.Lock()
		defer datarefSvcLock.Unlock()

		var datarefList []models.Dataref
		err := yaml.Unmarshal(datarefBytes, &datarefList)
		if err != nil {
			logger.Errorf("Unmarshal: %v", err)
		}
		var datarefExtList []models.DatarefExt
		for _, dataref := range datarefList {
			xplaneDataref, success := dataAccess.FindDataRef(dataref.DatarefStr)
			if !success {
				logger.Errorf("Failed to FindDataRef: %s", dataref.DatarefStr)
			}
			precision := dataref.Precision
			datarefExtList = append(datarefExtList, models.DatarefExt{
				Name:         dataref.Name,
				Dataref:      xplaneDataref,
				DatarefType:  dataAccess.GetDataRefTypes(xplaneDataref),
				Precision:    &precision,
				IsBytesArray: dataref.IsBytesArray,
			})
		}

		datarefSvc = datarefService{
			DatarefExtList: datarefExtList,
			Logger:         logger,
		}
		return datarefSvc
	}
}

func dataRoundup(value float64, precision int) float64 {
	if precision == -1 {
		return value
	}
	precisionFactor := math.Pow10(precision)
	return math.Round(value*precisionFactor) / precisionFactor
}
