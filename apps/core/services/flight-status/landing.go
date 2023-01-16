package flight_status

import (
	"apps/core/models"
	"fmt"
)

func (f flightStatusService) processDatarefLanding(datarefValues models.DatarefValues) {
	if datarefValues["gs"].Value.(float64) < 30/1.9438 {
		airportId, airportName := f.DatarefSvc.GetNearestAirport()
		f.setArrivalFlightInfo(
			airportId,
			airportName,
			datarefValues["ts"].Value.(float64),
			0,
			0,
		)
		f.addFlightEvent(datarefValues, fmt.Sprintf("Taxi in at %s", airportId))
		f.changeState(models.FlightStateTaxiIn, 0.2)
	} else {
		// watch for violation
	}
}
