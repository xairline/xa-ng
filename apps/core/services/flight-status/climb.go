package flight_status

import "apps/core/models"

func (f flightStatusService) processDatarefClimb(datarefValues models.DatarefValues) {
	if datarefValues["vs"].Value.(float64) > -500 &&
		datarefValues["vs"].Value.(float64) < 500 {
		*f.cruiseCounter += 1
	} else {
		*f.cruiseCounter = 0
	}
	// 15s
	if *f.cruiseCounter >= int(15/f.FlightStatus.PollFrequency) {
		f.addFlightEvent(datarefValues, "Cruise %TODO%")
		f.changeState(models.FlightStateCruise, 1)
	}
}
