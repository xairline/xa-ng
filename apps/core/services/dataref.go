package services

//go:generate mockgen -destination=./__mocks__/dataref.go -package=mocks -source=dataref.go

import (
	"apps/core/models"
	_ "embed"
	"fmt"
	"github.com/xairline/goplane/extra/logging"
	"github.com/xairline/goplane/xplm/dataAccess"
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
	getCurrentValue(datarefExt *models.DatarefExt) models.DatarefValue
}

type datarefService struct {
	DatarefExtList []models.DatarefExt
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
		logging.Errorf("Unknown dataref type for %+v", datarefExt)
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

func NewDatarefService() DatarefService {
	if datarefSvc != nil {
		logging.Info("Dataref SVC has been initialized already")
		return datarefSvc
	} else {
		logging.Info("Dataref SVC: initializing")
		datarefSvcLock.Lock()
		defer datarefSvcLock.Unlock()

		var datarefList []models.Dataref
		err := yaml.Unmarshal(datarefBytes, &datarefList)
		if err != nil {
			logging.Errorf("Unmarshal: %v", err)
		}
		var datarefExtList []models.DatarefExt
		for _, dataref := range datarefList {
			xplaneDataref, success := dataAccess.FindDataRef(dataref.DatarefStr)
			if !success {
				logging.Errorf("Failed to FindDataRef: %s", dataref.DatarefStr)
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
