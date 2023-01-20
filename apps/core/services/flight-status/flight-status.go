package flight_status

//go:generate mockgen -destination=../__mocks__/flight-status/flight-status.go -package=mocks -source=flight-status.go

import (
	"apps/core/models"
	"apps/core/services/dataref"
	"apps/core/utils/logger"
	_ "embed"
	"encoding/json"
	"gorm.io/gorm"
	"math"
	"sync"
)

var flightStatusSvcLock = &sync.Mutex{}
var flightStatusSvc FlightStatusService

type FlightStatusService interface {
	ResetFlightStatus()
	GetFlightStatus() *models.FlightStatus
	ProcessDataref(datarefValues models.DatarefValues) float32
	processDatarefParked(datarefValues models.DatarefValues)
	processDatarefTaxiOut(datarefValues models.DatarefValues)
	processDatarefTakeoff(datarefValues models.DatarefValues)
	processDatarefClimb(datarefValues models.DatarefValues)
	processDatarefCruise(datarefValues models.DatarefValues)
	processDatarefDescend(datarefValues models.DatarefValues)
	processDatarefLanding(datarefValues models.DatarefValues)
	processDatarefTaxiIn(datarefValues models.DatarefValues)
	changeState(newState models.FlightState, newPollFrequency float32)
	addFlightEvent(datarefValues models.DatarefValues, description string)
	setDepartureFlightInfo(airportId, airportName string, timestamp, fuelWeight, totalWeight float64)
	setArrivalFlightInfo(airportId, airportName string, timestamp, fuelWeight, totalWeight float64)
	addLocation(datarefValues models.DatarefValues, isLanding bool, threshold float64)
}

type flightStatusService struct {
	FlightStatus   *models.FlightStatus
	DatarefSvc     dataref.DatarefService
	cruiseCounter  *int
	climbCounter   *int
	descendCounter *int
	db             *gorm.DB
	Logger         logger.Logger
}

func (f flightStatusService) addLocation(datarefValues models.DatarefValues, isLanding bool, threshold float64) {
	newLocation := models.FlightStatusLocation{
		FlightId:  int(f.FlightStatus.ID),
		Timestamp: datarefValues["ts"].Value.(float64),
		IsLanding: isLanding,
		Vs:        datarefValues["vs"].Value.(float64),
		Ias:       datarefValues["ias"].Value.(float64),
		Lat:       datarefValues["lat"].Value.(float64),
		Lng:       datarefValues["lng"].Value.(float64),
		Altitude:  datarefValues["elevation"].Value.(float64),
		Agl:       datarefValues["agl"].Value.(float64),
		GearForce: datarefValues["gear_force"].Value.(float64),
		GForce:    datarefValues["g_force"].Value.(float64),
	}
	if len(f.FlightStatus.Locations) == 0 || (isLanding && newLocation.Agl < 5) {
		f.FlightStatus.Locations = append(
			f.FlightStatus.Locations,
			newLocation,
		)
	} else {
		lastLat := f.FlightStatus.Locations[len(f.FlightStatus.Locations)-1].Lat
		lastLng := f.FlightStatus.Locations[len(f.FlightStatus.Locations)-1].Lng
		curLat := datarefValues["lat"].Value.(float64)
		curLng := datarefValues["lng"].Value.(float64)
		delta := distance(lastLat, lastLng, curLat, curLng)
		if delta > threshold {
			f.FlightStatus.Locations = append(
				f.FlightStatus.Locations,
				newLocation,
			)
		}
	}
}

func (f flightStatusService) setDepartureFlightInfo(airportId, airportName string, timestamp, fuelWeight, totalWeight float64) {
	f.FlightStatus.DepartureFlightInfo = models.FlightInfo{
		AirportId:   airportId,
		AirportName: airportName,
		FuelWeight:  fuelWeight,
		TotalWeight: totalWeight,
		Time:        timestamp,
	}
}

func (f flightStatusService) setArrivalFlightInfo(airportId, airportName string, timestamp, fuelWeight, totalWeight float64) {
	f.FlightStatus.ArrivalFlightInfo = models.FlightInfo{
		AirportId:   airportId,
		AirportName: airportName,
		FuelWeight:  fuelWeight,
		TotalWeight: totalWeight,
		Time:        timestamp,
	}
}

func (f flightStatusService) addFlightEvent(datarefValues models.DatarefValues, description string) {
	extraData, err := json.Marshal(datarefValues)
	if err != nil {
		f.Logger.Warningf("ERROR: fail to Marshal json, %s", err.Error())
	}
	event := models.FlightStatusEvent{
		Timestamp:   datarefValues["ts"].Value.(float64),
		Description: description,
		EventType:   models.StateEvent,
		ExtraData:   string(extraData),
		FlightId:    int(f.FlightStatus.ID),
	}
	f.FlightStatus.Events = append(f.FlightStatus.Events, event)
	result := f.db.Create(&event)
	if result.Error != nil {
		f.Logger.Errorf("Failed to store event: %+v", result)
	}
	f.Logger.Infof(
		"NEW Event: %v sec,%+v",
		event.Timestamp-f.FlightStatus.DepartureFlightInfo.Time,
		event.Description,
	)
}

func (f flightStatusService) GetFlightStatus() *models.FlightStatus {
	return f.FlightStatus
}

func (f flightStatusService) ProcessDataref(datarefValues models.DatarefValues) float32 {
	switch f.FlightStatus.CurrentState {
	case models.FlightStateParked:
		f.processDatarefParked(datarefValues)
	case models.FlightStateTaxiOut:
		f.processDatarefTaxiOut(datarefValues)
	case models.FlightStateTakeoff:
		f.processDatarefTakeoff(datarefValues)
		f.addLocation(datarefValues, false, 0.01)
	case models.FlightStateClimb:
		f.processDatarefClimb(datarefValues)
		f.addLocation(datarefValues, false, 10)
	case models.FlightStateCruise:
		f.processDatarefCruise(datarefValues)
		f.addLocation(datarefValues, false, 50)
	case models.FlightStateDescend:
		f.processDatarefDescend(datarefValues)
		f.addLocation(datarefValues, false, 10)
	case models.FlightStateLanding:
		f.processDatarefLanding(datarefValues)
		f.addLocation(datarefValues, true, 0.1)
	case models.FlightStateTaxiIn:
		f.processDatarefTaxiIn(datarefValues)
	}
	return f.FlightStatus.PollFrequency
}

func (f flightStatusService) ResetFlightStatus() {
	f.Logger.Warning("====== RESET Flight status ======")
	f.FlightStatus.Events = []models.FlightStatusEvent{}

	// flush locations to db
	if len(f.FlightStatus.Locations) > 0 {
		locations := f.FlightStatus.Locations
		result := f.db.CreateInBatches(&locations, 500)
		if result.Error != nil {
			f.Logger.Errorf("Failed to store flight: %+v", result)
		}
	}
	f.FlightStatus.Events = []models.FlightStatusEvent{}
	f.FlightStatus.Locations = []models.FlightStatusLocation{}
	f.FlightStatus.ArrivalFlightInfo = models.FlightInfo{}
	f.FlightStatus.DepartureFlightInfo = models.FlightInfo{}
	f.FlightStatus.ID = 0
	f.changeState(models.FlightStateParked, 5)
}

func NewFlightStatusService(datarefSvc dataref.DatarefService, logger logger.Logger, db *gorm.DB) FlightStatusService {
	if flightStatusSvc != nil {
		logger.Info("FlightStatus SVC has been initialized already")
		return flightStatusSvc
	} else {
		logger.Info("FlightStatus SVC: initializing")
		flightStatusSvcLock.Lock()
		defer flightStatusSvcLock.Unlock()
		flightStatus := models.FlightStatus{}
		flightStatusSvc = flightStatusService{
			FlightStatus:   &flightStatus,
			DatarefSvc:     datarefSvc,
			cruiseCounter:  new(int),
			climbCounter:   new(int),
			descendCounter: new(int),
			Logger:         logger,
			db:             db,
		}
		flightStatusSvc.ResetFlightStatus()
		return flightStatusSvc
	}
}

func (f flightStatusService) changeState(newState models.FlightState, newPollFrequency float32) {
	f.FlightStatus.CurrentState = newState
	f.FlightStatus.PollFrequency = newPollFrequency
	*f.cruiseCounter = 0
	*f.climbCounter = 0
	*f.descendCounter = 0
}

func distance(lat1 float64, lng1 float64, lat2 float64, lng2 float64) float64 {
	radlat1 := float64(math.Pi * lat1 / 180)
	radlat2 := float64(math.Pi * lat2 / 180)

	theta := float64(lng1 - lng2)
	radtheta := float64(math.Pi * theta / 180)

	dist := math.Sin(radlat1)*math.Sin(radlat2) + math.Cos(radlat1)*math.Cos(radlat2)*math.Cos(radtheta)
	if dist > 1 {
		dist = 1
	}

	dist = math.Acos(dist)
	dist = dist * 180 / math.Pi
	dist = dist * 60 * 1.1515

	// convert to km
	dist = dist * 1.609344

	return dist
}
