package flight_status

import "apps/core/models"

func (f flightStatusService) processDatarefDescend(datarefValues models.DatarefValues) {
	if datarefValues["agl"].Value.(float64) < 30 &&
		datarefValues["vs"].Value.(float64) < -200 &&
		datarefValues["gear_force"].Value.(float64) < 5 {
		f.addFlightEvent(datarefValues, "Landing")
		f.changeState(models.FlightStateLanding, -1)
	} else {
		// watch for violation
	}
}
