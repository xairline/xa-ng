package flight_status

import "apps/core/models"

func (f flightStatusService) processDatarefDescend(datarefValues models.DatarefValues) {
	if datarefValues["agl"].Value.(float64) < 30 &&
		datarefValues["vs"].Value.(float64) < -200 &&
		datarefValues["gear_force"].Value.(float64) < 5 {
		f.addFlightEvent(datarefValues, "Landing")
		f.changeState(models.FlightStateLanding, -1)
		return
	}

	// Climb again
	if datarefValues["vs"].Value.(float64) > 500 {
		*f.climbCounter += 1
	} else {
		*f.climbCounter = 0
	}

	// Cruise again
	if datarefValues["vs"].Value.(float64) > -500 &&
		datarefValues["vs"].Value.(float64) < 500 &&
		datarefValues["elevation"].Value.(float64) > 3000 {
		*f.cruiseCounter += 1
	} else {
		*f.cruiseCounter = 0
	}
	// 15s
	if *f.cruiseCounter >= int(15/f.FlightStatus.PollFrequency) {
		f.addFlightEvent(datarefValues, "Cruise")
		f.changeState(models.FlightStateCruise, 1)
		return
	}
	if *f.climbCounter >= int(15/f.FlightStatus.PollFrequency) {
		f.addFlightEvent(datarefValues, "Climb")
		f.changeState(models.FlightStateClimb, 0.2)
	}
}
