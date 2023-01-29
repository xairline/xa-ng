package flight_status

import "apps/core/models"

func (f flightStatusService) processDatarefTakeoff(datarefValues models.DatarefValues) {
	if datarefValues["vs"].Value.(float64) > 200 &&
		datarefValues["gear_force"].Value.(float64) < 1 {
		event := f.addFlightEvent("Climb")
		f.addLocation(datarefValues, -1, &event)
		f.changeState(models.FlightStateClimb, 0.2)
	} else {
		f.addLocation(datarefValues, 0.01, nil)
	}
}
