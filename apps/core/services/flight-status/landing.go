package flight_status

import (
	"apps/core/models"
)

func (f flightStatusService) processDatarefLanding(datarefValues models.DatarefValues) {
	if datarefValues["gs"].Value.(float64) < 30/1.9438 {
		arrivalAirport := f.DatarefSvc.GetNearestAirport()
		f.FlightStatus.FlightInfo.Arrival = arrivalAirport
		f.FlightStatus.Events = append(f.FlightStatus.Events, models.FlightStatusEvent{
			Timestamp:     datarefValues["ts"].Value.(float64),
			Description:   "Taxi in at %TODO%",
			DatarefValues: datarefValues,
		})
		f.changeState(models.FlightStateTaxiIn, 0.2)
	} else {
		// watch for violation
	}
}
