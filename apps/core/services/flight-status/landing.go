package flight_status

import (
	"apps/core/models"
	"fmt"
)

func (f flightStatusService) processDatarefLanding(datarefValues models.DatarefValues) {
	if datarefValues["gs"].Value.(float64) < 30/1.9438 {
		arrivalAirport := f.DatarefSvc.GetNearestAirport()
		f.FlightStatus.FlightInfo.Arrival = arrivalAirport
		f.addFlightEvent(datarefValues, fmt.Sprintf("Taxi in at %s", arrivalAirport))
		f.changeState(models.FlightStateTaxiIn, 0.2)
	} else {
		// watch for violation
	}
}
