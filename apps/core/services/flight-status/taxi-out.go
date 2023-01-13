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
