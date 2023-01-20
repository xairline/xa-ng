package flight_status

import "apps/core/models"

func (f flightStatusService) processDatarefCruise(datarefValues models.DatarefValues) {
	if datarefValues["vs"].Value.(float64) > 500 {
		*f.climbCounter += 1
	} else {
		*f.climbCounter = 0
	}
	if datarefValues["vs"].Value.(float64) < -500 {
		*f.descendCounter += 1
	} else {
		*f.descendCounter = 0
	}
	// 30s
	if *f.climbCounter >= int(30/f.FlightStatus.PollFrequency) {
		f.addFlightEvent(datarefValues, "Climb")
		f.changeState(models.FlightStateClimb, 0.2)
	}
	if *f.descendCounter >= int(30/f.FlightStatus.PollFrequency) {
		f.addFlightEvent(datarefValues, "Descend")
		f.changeState(models.FlightStateDescend, 0.2)
	}
}
