package flight_status

//go:generate mockgen -destination=../__mocks__/flight-status.go -package=mocks -source=flight-status.go

import (
	"apps/core/models"
	_ "embed"
	"github.com/xairline/goplane/extra/logging"
	"sync"
)

var flightStatusSvcLock = &sync.Mutex{}
var flightStatusSvc FlightStatusService

type FlightStatusService interface {
	ResetFlightStatus()
	GetFlightStatus() models.FlightStatus
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
}

type flightStatusService struct {
	FlightStatus   *models.FlightStatus
	cruiseCounter  *int
	climbCounter   *int
	descendCounter *int
}

func (f flightStatusService) GetFlightStatus() models.FlightStatus {
	return *f.FlightStatus
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
	f.FlightStatus.Events = []models.FlightStatusEvent{}
	f.changeState(models.FlightStateParked, 5)
}

func NewFlightStatusService() FlightStatusService {
	if flightStatusSvc != nil {
		logging.Info("FlightStatus SVC has been initialized already")
		return flightStatusSvc
	} else {
		logging.Info("FlightStatus SVC: initializing")
		flightStatusSvcLock.Lock()
		defer flightStatusSvcLock.Unlock()
		flightStatus := models.FlightStatus{}
		flightStatusSvc = flightStatusService{
			FlightStatus:   &flightStatus,
			cruiseCounter:  new(int),
			climbCounter:   new(int),
			descendCounter: new(int),
		}
		flightStatusSvc.ResetFlightStatus()
		return flightStatusSvc
	}
}
