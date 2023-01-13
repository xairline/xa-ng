package flight_status

import "apps/core/models"

func (f flightStatusService) processDatarefDescend(datarefValues models.DatarefValues) {
	if datarefValues["agl"].Value.(float64) < 30 &&
		datarefValues["vs"].Value.(float64) < -200 &&
		datarefValues["gear_force"].Value.(float64) < 5 {
		// get additional one time data
		f.FlightStatus.Events = append(f.FlightStatus.Events, models.FlightStatusEvent{
			Timestamp:     datarefValues["ts"].Value.(float64),
			Description:   "Landing %TODO%",
			DatarefValues: datarefValues,
		})
		f.changeState(models.FlightStateLanding, -1)
	} else {
		// watch for violation
	}
}
