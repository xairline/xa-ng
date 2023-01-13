package flight_status

import "apps/core/models"

func (f flightStatusService) processDatarefTakeoff(datarefValues models.DatarefValues) {
	if datarefValues["vs"].Value.(float64) > 200 &&
		datarefValues["gear_force"].Value.(float64) < 1 {
		// get additional one time data
		f.FlightStatus.Events = append(f.FlightStatus.Events, models.FlightStatusEvent{
			Timestamp:     datarefValues["ts"].Value.(float64),
			Description:   "Climb %TODO%",
			DatarefValues: datarefValues,
		})
		f.changeState(models.FlightStateClimb, 0.2)
	} else {
		// watch for violation
	}
}
