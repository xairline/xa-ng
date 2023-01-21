package flight_status

import "apps/core/models"

func (f flightStatusService) processDatarefClimb(datarefValues models.DatarefValues) {
	if datarefValues["vs"].Value.(float64) > -500 &&
		datarefValues["vs"].Value.(float64) < 500 {
		*f.cruiseCounter += 1
	} else {
		*f.cruiseCounter = 0
	}
	if datarefValues["vs"].Value.(float64) < -500 {
		*f.descendCounter += 1
	} else {
		*f.descendCounter = 0
	}
	// 15s
	if *f.cruiseCounter >= int(15/f.FlightStatus.PollFrequency) {
		event := f.addFlightEvent("Cruise")
		f.addLocation(datarefValues, -1, &event)
		f.changeState(models.FlightStateCruise, 1)
		return
	}
	if *f.descendCounter >= int(15/f.FlightStatus.PollFrequency) {
		event := f.addFlightEvent("Descend")
		f.addLocation(datarefValues, -1, &event)
		f.changeState(models.FlightStateDescend, 0.2)
	}
	f.addLocation(datarefValues, 10, nil)
}
