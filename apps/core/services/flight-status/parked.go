package flight_status

import (
	"apps/core/models"
	"fmt"
)

func (f flightStatusService) processDatarefParked(datarefValues models.DatarefValues) {
	if datarefValues["gs"].Value.(float64) > 1 {
		departureAirport := f.DatarefSvc.GetNearestAirport()
		f.FlightStatus.FlightInfo.Departure = departureAirport
		f.addFlightEvent(datarefValues, fmt.Sprintf("Taxi in at %s", departureAirport))
		f.changeState(models.FlightStateTaxiOut, 0.2)
	}
}
