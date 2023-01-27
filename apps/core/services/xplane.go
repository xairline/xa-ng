package services

//go:generate mockgen -destination=./__mocks__/xplane.go -package=mocks -source=xplane.go

import (
	"apps/core/controllers"
	"apps/core/models"
	"apps/core/routes"
	"apps/core/services/dataref"
	"apps/core/services/flight-status"
	"apps/core/utils/logger"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/xairline/goplane/extra"
	"github.com/xairline/goplane/xplm/processing"
	"github.com/xairline/goplane/xplm/utilities"
	"gorm.io/gorm"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"sync"
	"time"
)

type XplaneService interface {
	// init
	onPluginStateChanged(state extra.PluginState, plugin *extra.XPlanePlugin)
	onPluginStart()
	onPluginStop()
	// flight loop
	flightLoop(elapsedSinceLastCall, elapsedTimeSinceLastFlightLoop float32, counter int, ref interface{}) float32
	// setup gin
	setupGin()
}

type xplaneService struct {
	Plugin              *extra.XPlanePlugin
	DatarefSvc          dataref.DatarefService
	FlightStatusService flight_status.FlightStatusService
	Logger              logger.Logger
	db                  *gorm.DB
}

var xplaneSvcLock = &sync.Mutex{}
var xplaneSvc XplaneService

func NewXplaneService(
	datarefSvc dataref.DatarefService,
	flightStatusSvc flight_status.FlightStatusService,
	logger logger.Logger,
	db *gorm.DB,
) XplaneService {
	if xplaneSvc != nil {
		logger.Info("Xplane SVC has been initialized already")
		return xplaneSvc
	} else {
		logger.Info("Xplane SVC: initializing")
		xplaneSvcLock.Lock()
		defer xplaneSvcLock.Unlock()
		xplaneSvc := xplaneService{
			Plugin:              extra.NewPlugin("X Web Stack", "com.github.xairline.xwebstack", "A plugin enables Frontend developer to contribute to xplane"),
			DatarefSvc:          datarefSvc,
			FlightStatusService: flightStatusSvc,
			Logger:              logger,
			db:                  db,
		}
		xplaneSvc.Plugin.SetPluginStateCallback(xplaneSvc.onPluginStateChanged)
		return xplaneSvc
	}
}

func (s xplaneService) onPluginStateChanged(state extra.PluginState, plugin *extra.XPlanePlugin) {
	switch state {
	case extra.PluginStart:
		s.onPluginStart()
	case extra.PluginStop:
		s.onPluginStop()
	case extra.PluginEnable:
		s.Logger.Infof("Plugin: %s enabled", plugin.GetName())
	case extra.PluginDisable:
		s.Logger.Infof("Plugin: %s disabled", plugin.GetName())
	}
}

func (s xplaneService) onPluginStart() {
	s.Logger.Info("Plugin started")
	// import xplane logs
	//s.ImportXplanePilotLogs()

	s.setupGin()
	processing.RegisterFlightLoopCallback(s.flightLoop, -1, nil)
}

func (s xplaneService) onPluginStop() {
	s.Logger.Info("Plugin stopped")
}

func (s xplaneService) flightLoop(elapsedSinceLastCall, elapsedTimeSinceLastFlightLoop float32, counter int, ref interface{}) float32 {
	datarefValues := s.DatarefSvc.GetCurrentValues()
	return s.FlightStatusService.ProcessDataref(datarefValues)
}

func (s xplaneService) setupGin() {
	g := gin.Default()
	// get plugin path
	systemPath := utilities.GetSystemPath()
	pluginPath := filepath.Join(systemPath, "Resources", "plugins", "XWebStack")
	routes.NewRoutes(
		s.Logger,
		g,
		controllers.NewDatarefController(s.Logger, s.DatarefSvc),
		controllers.NewFlightLogsController(s.Logger, s.db),
		pluginPath+"/xws",
	).Setup()

	go func() {
		err := g.Run(":9090")
		if err != nil {
			s.Logger.Errorf("Failed to start gin server, %v", err)
		}
	}()
}

func (s xplaneService) ImportXplanePilotLogs() {
	var count int64 = 0
	s.db.Model(&models.FlightStatus{}).Count(&count)
	if count != 0 {
		s.Logger.Infof("Pilot logs have been imported")
		//return
	}
	// get xplane pilotlogs path
	systemPath := utilities.GetSystemPath()
	pilotLogPath := filepath.Join(systemPath, "Output", "logbooks", "X-Plane Pilot.txt")
	s.Logger.Infof("Pilot logs path: %s", pilotLogPath)

	f, err := os.Open(pilotLogPath)
	if err != nil {
		log.Fatal("Unable to read input file "+pilotLogPath, err)
	}
	defer f.Close()

	csvReader := csv.NewReader(f)
	csvReader.Comma = ' '
	csvReader.TrimLeadingSpace = true
	csvReader.FieldsPerRecord = -1
	records, err := csvReader.ReadAll()
	if err != nil {
		s.Logger.Errorf("Unable to parse file as CSV for "+pilotLogPath, err)
		return
	}
	var flightStatuses []models.FlightStatus
	for _, row := range records {
		if row[0] == "2" {
			const layout = "20060102"

			// Calling Parse() method with its parameters
			tm, _ := time.Parse(layout, "20"+row[1])
			flightTime, _ := strconv.ParseFloat(row[5], 32)
			flightTime *= 3600
			if row[2] == row[3] {
				continue
			}
			depICAO := row[2]
			depInfo, err := s.getAirportInfoFromICAO(depICAO)
			if err != nil {
				continue
			}
			s.Logger.Debugf("dep: %+v", depInfo)

			arrICAO := row[3]
			arrInfo, err := s.getAirportInfoFromICAO(arrICAO)
			if err != nil {
				continue
			}
			s.Logger.Debugf("arr: %+v", arrInfo)

			flightStatus := models.FlightStatus{
				CreatedAt: tm,
				UpdatedAt: time.Time{},
				Locations: []models.FlightStatusLocation{
					{
						Timestamp: 0,
						Lat:       depInfo["Lat"].(float64),
						Lng:       depInfo["Lng"].(float64),
					},
					{
						Timestamp: flightTime,
						Lat:       arrInfo["Lat"].(float64),
						Lng:       arrInfo["Lng"].(float64),
					},
				}, //1st and last
				DepartureFlightInfo: models.FlightInfo{
					AirportId:   depICAO,
					AirportName: depInfo["AirportName"].(string),
					Time:        0,
				},
				ArrivalFlightInfo: models.FlightInfo{
					AirportId:   arrICAO,
					AirportName: arrInfo["AirportName"].(string),
					Time:        flightTime,
				},
				AircraftICAO:        "",
				AircraftDisplayName: row[10],
			}
			flightStatuses = append(flightStatuses, flightStatus)
		}
	}
	result := s.db.CreateInBatches(&flightStatuses, 100)
	s.Logger.Infof("row: %+v", result)
}

func (s xplaneService) getAirportInfoFromICAO(icao string) (map[string]interface{}, error) {
	data := url.Values{
		"icao":    {icao},
		"country": {"ALL"},
		"db":      {"airports"},
		"action":  {"search"},
	}

	resp, err := http.PostForm("https://openflights.org/php/apsearch.php", data)

	if err != nil {
		return map[string]interface{}{}, err
	}

	var res map[string]interface{}

	json.NewDecoder(resp.Body).Decode(&res)

	if res["airports"] == nil {
		return map[string]interface{}{}, fmt.Errorf("%s", "Failed to find airport info")
	}

	airport := res["airports"].([]interface{})[0]
	s.Logger.Infof("%+v", airport)
	lat, err := strconv.ParseFloat(airport.(map[string]interface{})["y"].(string), 64)
	if err != nil {
		return map[string]interface{}{}, err
	}
	lng, err := strconv.ParseFloat(airport.(map[string]interface{})["x"].(string), 64)
	if err != nil {
		return map[string]interface{}{}, err
	}
	return map[string]interface{}{
		"AirportName": airport.(map[string]interface{})["name"],
		"Lat":         lat,
		"Lng":         lng,
	}, nil
}
