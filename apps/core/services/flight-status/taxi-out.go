package flight_status

import "apps/core/models"

func (f flightStatusService) processDatarefTaxiOut(datarefValues models.DatarefValues) {
	//todo: fix below
	var n1 float64
	for _, value := range datarefValues["n1"].Value.([]float64) {
		n1 = value
		break
	}
	if n1 > 75 {
		f.addFlightEvent(datarefValues, "Takeoff")
		f.changeState(models.FlightStateTakeoff, 0.1)
	} else {
		// watch for violation
	}
}
