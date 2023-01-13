package flight_status

import (
	"apps/core/models"
	"fmt"
	"github.com/xairline/goplane/extra/logging"
	"github.com/xairline/goplane/xplm/navigation"
	"math"
)

func (f flightStatusService) changeState(newState models.FlightState, newPollFrequency float32) {
	f.FlightStatus.CurrentState = newState
	f.FlightStatus.PollFrequency = newPollFrequency
	*f.cruiseCounter = 0
	*f.climbCounter = 0
	*f.descendCounter = 0
	logging.Infof("%+v", f.FlightStatus.Events)
}

func (f flightStatusService) processDatarefParked(datarefValues models.DatarefValues) {
	if datarefValues["gs"].Value.(float64) > 0 {
		navRef := navigation.FindNavAid("", "", math.MaxFloat32, math.MaxFloat32, math.MaxInt32, navigation.Nav_Airport)
		_, _, _, _, _, _, _, departureAirport, _ := navigation.GetNavAidInfo(navRef)
		f.FlightStatus.FlightInfo.Departure = departureAirport
		f.FlightStatus.Events = append(f.FlightStatus.Events, models.FlightStatusEvent{
			Timestamp:     datarefValues["ts"].Value.(float64),
			Description:   fmt.Sprintf("Taxi out at: %s", departureAirport),
			DatarefValues: datarefValues,
		})
		f.changeState(models.FlightStateTaxiOut, 0.2)
	}
}

func (f flightStatusService) processDatarefTaxiOut(datarefValues models.DatarefValues) {
	//todo: fix below
	var n1 float64
	for _, value := range datarefValues["n1"].Value.([]float64) {
		n1 = value
		break
	}
	if n1 > 75 {
		// get additional one time data
		f.FlightStatus.Events = append(f.FlightStatus.Events, models.FlightStatusEvent{
			Timestamp:     datarefValues["ts"].Value.(float64),
			Description:   "Takeoff %TODO%",
			DatarefValues: datarefValues,
		})
		f.changeState(models.FlightStateTakeoff, 0.1)
	} else {
		// watch for violation
	}
}

func (f flightStatusService) processDatarefTakeoff(datarefValues models.DatarefValues) {
	if datarefValues["vs"].Value.(float64) > 200 &&
		datarefValues["gear_force"].Value.(float64) < 1 {
		// get additional one time data
		f.FlightStatus.Events = append(f.FlightStatus.Events, models.FlightStatusEvent{
			Timestamp:     datarefValues["ts"].Value.(float64),
			Description:   "Climb %TODO%",
			DatarefValues: datarefValues,
		})
		f.changeState(models.FlightStateClimb, 0.2)
	} else {
		// watch for violation
	}
}

func (f flightStatusService) processDatarefClimb(datarefValues models.DatarefValues) {
	if datarefValues["vs"].Value.(float64) > -500 &&
		datarefValues["vs"].Value.(float64) < 500 {
		*f.cruiseCounter += 1
	} else {
		*f.cruiseCounter = 0
	}
	// 15s
	if *f.cruiseCounter >= int(15/f.FlightStatus.PollFrequency) {
		f.FlightStatus.Events = append(f.FlightStatus.Events, models.FlightStatusEvent{
			Timestamp:     datarefValues["ts"].Value.(float64),
			Description:   "Cruise %TODO%",
			DatarefValues: datarefValues,
		})
		f.changeState(models.FlightStateCruise, 1)
	}
}

func (f flightStatusService) processDatarefCruise(datarefValues models.DatarefValues) {
	if datarefValues["vs"].Value.(float64) > 500 {
		*f.climbCounter += 1

	} else {
		*f.climbCounter = 0
	}
	if datarefValues["vs"].Value.(float64) < -500 &&
		datarefValues["elevation"].Value.(float64) < 20000/3.28 {
		*f.descendCounter += 1

	} else {
		*f.descendCounter = 0
	}
	// 30s
	if *f.climbCounter >= int(30/f.FlightStatus.PollFrequency) {
		f.FlightStatus.Events = append(f.FlightStatus.Events, models.FlightStatusEvent{
			Timestamp:     datarefValues["ts"].Value.(float64),
			Description:   "Climb %TODO%",
			DatarefValues: datarefValues,
		})
		f.changeState(models.FlightStateClimb, 0.2)
	}
	if *f.descendCounter >= int(30/f.FlightStatus.PollFrequency) {
		f.FlightStatus.Events = append(f.FlightStatus.Events, models.FlightStatusEvent{
			Timestamp:     datarefValues["ts"].Value.(float64),
			Description:   "Descend %TODO%",
			DatarefValues: datarefValues,
		})
		f.changeState(models.FlightStateDescend, 0.2)
	}
}

func (f flightStatusService) processDatarefDescend(datarefValues models.DatarefValues) {
	if datarefValues["agl"].Value.(float64) < 30 &&
		datarefValues["vs"].Value.(float64) < -200 &&
		datarefValues["gear_force"].Value.(float64) < 5 {
		// get additional one time data
		f.FlightStatus.Events = append(f.FlightStatus.Events, models.FlightStatusEvent{
			Timestamp:     datarefValues["ts"].Value.(float64),
			Description:   "Descend %TODO%",
			DatarefValues: datarefValues,
		})
		f.changeState(models.FlightStateLanding, -1)
	} else {
		// watch for violation
	}
}

func (f flightStatusService) processDatarefLanding(datarefValues models.DatarefValues) {
	if datarefValues["gs"].Value.(float64) < 30/1.9438 {
		navRef := navigation.FindNavAid("", "", math.MaxFloat32, math.MaxFloat32, math.MaxInt32, navigation.Nav_Airport)
		_, _, _, _, _, _, _, arrivalAirport, _ := navigation.GetNavAidInfo(navRef)
		f.FlightStatus.FlightInfo.Arrival = arrivalAirport
		f.FlightStatus.Events = append(f.FlightStatus.Events, models.FlightStatusEvent{
			Timestamp:     datarefValues["ts"].Value.(float64),
			Description:   "Taxi in at %TODO%",
			DatarefValues: datarefValues,
		})
		f.changeState(models.FlightStateTaxiIn, 0.2)
	} else {
		// watch for violation
	}
}

func (f flightStatusService) processDatarefTaxiIn(datarefValues models.DatarefValues) {
	if datarefValues["gs"].Value.(float64) < 30/1.9438 {
		// get additional one time data
		// publish event
		// change state
		// update poll_frequency
		// reset
		f.ResetFlightStatus()
	} else {
		// watch for violation
	}
}
