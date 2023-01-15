package flight_status

//go:generate mockgen -destination=../__mocks__/flight-status/flight-status.go -package=mocks -source=flight-status.go

import (
	"apps/core/models"
	"apps/core/services/dataref"
	"apps/core/utils/logger"
	_ "embed"
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
}

type flightStatusService struct {
	FlightStatus   *models.FlightStatus
	DatarefSvc     dataref.DatarefService
	cruiseCounter  *int
	climbCounter   *int
	descendCounter *int
	Logger         logger.Logger
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
	event := models.FlightStatusEvent{
		Timestamp:     datarefValues["ts"].Value.(float64),
		Description:   description,
		DatarefValues: datarefValues,
	}
	f.FlightStatus.Events = append(f.FlightStatus.Events, event)
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
	case models.FlightStateClimb:
		f.processDatarefClimb(datarefValues)
	case models.FlightStateCruise:
		f.processDatarefCruise(datarefValues)
	case models.FlightStateDescend:
		f.processDatarefDescend(datarefValues)
	case models.FlightStateLanding:
		f.processDatarefLanding(datarefValues)
	case models.FlightStateTaxiIn:
		f.processDatarefTaxiIn(datarefValues)
	}
	return f.FlightStatus.PollFrequency
}

func (f flightStatusService) ResetFlightStatus() {
	f.Logger.Warning("====== RESET Flight status ======")
	f.Logger.Warningf("%+v", f.GetFlightStatus())
	f.FlightStatus.Events = []models.FlightStatusEvent{}
	f.FlightStatus.ArrivalFlightInfo = models.FlightInfo{}
	f.FlightStatus.DepartureFlightInfo = models.FlightInfo{}
	f.changeState(models.FlightStateParked, 5)
	f.Logger.Warning("====== RESET Flight status ======")
}

func NewFlightStatusService(datarefSvc dataref.DatarefService, logger logger.Logger) FlightStatusService {
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
