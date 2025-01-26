package services

//go:generate mockgen -destination=./__mocks__/xplane.go -package=mocks -source=xplane.go

import (
	"apps/core/models"
	"apps/core/utils/logger"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	"github.com/xairline/goplane/extra"
	"github.com/xairline/goplane/xplm/processing"
	"github.com/xairline/goplane/xplm/utilities"
	"gorm.io/gorm"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
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
	// setup websocket
	setupWebsocket()
}

type xplaneService struct {
	Plugin     *extra.XPlanePlugin
	DatarefSvc DatarefService
	Logger     logger.Logger
	db         *gorm.DB
}

var xplaneSvcLock = &sync.Mutex{}
var xplaneSvc XplaneService

var commands []string

func NewXplaneService(
	datarefSvc DatarefService,
	logger logger.Logger,
) XplaneService {
	if xplaneSvc != nil {
		logger.Info("Xplane SVC has been initialized already")
		return xplaneSvc
	} else {
		logger.Info("Xplane SVC: initializing")
		xplaneSvcLock.Lock()
		defer xplaneSvcLock.Unlock()
		xplaneSvc := xplaneService{
			Plugin:     extra.NewPlugin("X Web Stack", "com.github.xairline.xwebstack", "A plugin exposes XP datarefs and commands to web clients"),
			DatarefSvc: datarefSvc,
			Logger:     logger,
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

	s.setupWebsocket()
	processing.RegisterFlightLoopCallback(s.flightLoop, -1, nil)
}

func (s xplaneService) onPluginStop() {
	s.Logger.Info("Plugin stopped")
}

func (s xplaneService) flightLoop(elapsedSinceLastCall, elapsedTimeSinceLastFlightLoop float32, counter int, ref interface{}) float32 {
	if len(commands) != 0 {
		command := commands[len(commands)-1]
		commands = commands[:len(commands)-1]
		cmdRef := utilities.FindCommand(command)
		utilities.CommandOnce(cmdRef)
		s.Logger.Infof("Command: %+v executed", cmdRef)
	}
	return 0.02
}

func (s xplaneService) setupWebsocket() {
	// get plugin path
	systemPath := utilities.GetSystemPath()
	pluginPath := filepath.Join(systemPath, "Resources", "plugins", "XWebStack")
	err := godotenv.Load(filepath.Join(pluginPath, "config"))
	if err != nil {
		s.Logger.Errorf("Some error occured. Err: %s", err)
	}

	token := os.Getenv("CLIENT_TOKEN")
	s.Logger.Infof("CLIENT_TOKEN: %s", token)
	if token == "" {
		s.Logger.Errorf("CLIENT_TOKEN is empty")
		return
	}

	go func() {
		for {
			// Use the token to connect to the WebSocket endpoint
			wsUrl := "wss://app.xairline.org/apis/ws?auth=" + token
			ws, _, err := websocket.DefaultDialer.Dial(wsUrl, nil)
			if err != nil {
				s.Logger.Errorf("Could not open a ws connection on %s %v", wsUrl, err)
				time.Sleep(time.Second * 5) // Wait for 5 seconds before trying to reconnect
				continue
			}

			// Loop for reading messages and handling pings
		wsloop:
			for {
				// Read the response from the WebSocket server
				messageType, responseMessage, err := ws.ReadMessage()
				if err != nil {
					s.Logger.Errorf("Could not read message from ws connection %v", err)
					break wsloop
				}
				// Handle text messages
				if messageType == websocket.TextMessage &&
					len(responseMessage) > 0 &&
					strings.Contains(string(responseMessage), "|") {
					message := string(responseMessage)
					// split by | to get action and req
					action := message[:strings.IndexByte(message, '|')]
					req := message[strings.IndexByte(message, '|')+1:]
					s.Logger.Infof("action: %s, req: %s", action, req)
					// depends on action, handle req
					switch action {
					case "SyncFlightLogs":
						var lastSyncedFlightStatus models.FlightStatus
						lastSyncedId, _ := strconv.ParseUint(req, 10, 0)
						s.db.Model(&models.FlightStatus{}).
							Where("arrival_total_weight > 10").
							Order("id desc").
							Limit(1).
							Find(&lastSyncedFlightStatus)
						s.Logger.Infof("lastSyncedFlightStatus: %+v", lastSyncedFlightStatus)
						if lastSyncedFlightStatus.ID == uint(lastSyncedId) {
							s.Logger.Infof("Synced flight logs for client")
							err := ws.WriteMessage(websocket.TextMessage, []byte("SyncFlightLogs|Done"))
							if err != nil {
								s.Logger.Errorf("Failed to send message to ws connection %v", err)
							}
							break
						}
						s.Logger.Infof("lastSyncedId: %d", lastSyncedId)
						s.Logger.Infof("lastSyncedFlightStatus: %d", lastSyncedFlightStatus.ID)
						var res []models.FlightStatus
						s.db.Preload("Locations").
							Preload("Events").
							Model(&models.FlightStatus{}).
							Where("id > ? AND arrival_total_weight > 10", lastSyncedId).
							Order("id asc").
							Limit(5).
							Find(&res)
						msgBytes, _ := json.Marshal(res)
						err := ws.WriteMessage(websocket.TextMessage, msgBytes)
						if err != nil {
							s.Logger.Errorf("Failed to send message to ws connection %v", err)
						}
						break
					case "GetFlightStatus":
						//flightStatus := s.FlightStatusService.GetFlightStatus()
						err := ws.WriteMessage(websocket.TextMessage, []byte("test"))
						//err := ws.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("action:GetFlightStatus, data:%s", flightStatus)))
						if err != nil {
							s.Logger.Errorf("Failed to get flight status, %v", err)
							// send error message back
							_ = ws.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("action:GetFlightStatus, error:%v", err)))
							break wsloop
						}
						break
					case "GetDataref":
						datarefReq := &models.Dataref{}
						err := json.Unmarshal([]byte(req), &datarefReq)
						if err != nil {
							s.Logger.Errorf("Failed to unmarshal datarefReq, %v", err)
						}
						precision := int8(0)
						if datarefReq.Precision != 0 {
							precision = datarefReq.Precision
						}
						datarefValue := s.DatarefSvc.GetValueByDatarefName(
							datarefReq.Name,
							datarefReq.Name,
							&precision,
							datarefReq.IsBytesArray,
						)
						s.Logger.Infof("datarefValue: %+v", datarefValue)
						msg, _ := json.Marshal(datarefValue)
						err = ws.WriteMessage(websocket.TextMessage, msg)
						if err != nil {
							s.Logger.Errorf("Failed to get dataref, %v", err)
							// send error message back
							_ = ws.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("action:GetFlightStatus, error:%v", err)))
							break wsloop
						}
						break
					case "SetDataref":
						datarefReq := &models.SetDatarefValue{}
						json.Unmarshal([]byte(req), &datarefReq)
						s.DatarefSvc.SetValueByDatarefName(
							datarefReq.Dataref,
							datarefReq.Value,
						)

						err := ws.WriteMessage(websocket.TextMessage, []byte("value set"))
						if err != nil {
							s.Logger.Errorf("Failed to set dataref, %v", err)
							// send error message back
							_ = ws.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("action:GetFlightStatus, error:%v", err)))
							break wsloop
						}
						break
					case "SendCommand":
						cmdRef := utilities.FindCommand(req)
						if cmdRef == nil {
							_ = ws.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("action:SendCommand, error:%v", "command not found")))
							break
						}
						commands = append(commands, req)
						err := ws.WriteMessage(websocket.TextMessage, []byte("command sent"))
						if err != nil {
							s.Logger.Errorf("Failed to send cmd, %v", err)
							// send error message back
							_ = ws.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("action:SendCommand, error:%v", err)))
							break wsloop
						}
						break
					}

				}
			}
			// Set up a defer function to close the WebSocket connection
			defer func(ws *websocket.Conn) {
				err := ws.Close()
				if err != nil {
					s.Logger.Errorf("Could not close ws connection %v", err)
				}
			}(ws)
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
		s.Logger.Infof("Unable to read input file "+pilotLogPath, err)
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
				Source:              "xplane",
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
