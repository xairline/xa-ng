package flight_status

import "apps/core/models"

func (f flightStatusService) processDatarefTaxiIn(datarefValues models.DatarefValues) {
	//todo: fix below
	var n1 float64
	for _, value := range datarefValues["n1"].Value.([]float64) {
		n1 = value
		break
	}
	if datarefValues["gs"].Value.(float64) < 1/1.9438 &&
		n1 < 1 {
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
