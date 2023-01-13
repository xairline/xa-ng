package flight_status

import (
	"apps/core/models"
	"fmt"
)

func (f flightStatusService) processDatarefParked(datarefValues models.DatarefValues) {
	if datarefValues["gs"].Value.(float64) > 1 {
		departureAirport := f.DatarefSvc.GetNearestAirport()
		f.FlightStatus.FlightInfo.Departure = departureAirport
		f.FlightStatus.Events = append(f.FlightStatus.Events, models.FlightStatusEvent{
			Timestamp:     datarefValues["ts"].Value.(float64),
			Description:   fmt.Sprintf("Taxi out at: %s", departureAirport),
			DatarefValues: datarefValues,
		})
		f.changeState(models.FlightStateTaxiOut, 0.2)
	}
}
