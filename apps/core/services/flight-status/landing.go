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
		event := f.addFlightEvent(fmt.Sprintf("Taxi in at %s", airportId))
		f.addLocation(datarefValues, -1, &event)
		f.changeState(models.FlightStateTaxiIn, 0.2)
		return
	} else {
		f.addLocation(datarefValues, 0.1, nil)
	}
	// go-around
	//if datarefValues["vs"].Value.(float64) > 500 &&
	//	datarefValues["gear_force"].Value.(float64) < 1 {
	//	f.addFlightEvent(datarefValues, "Climb")
	//	f.changeState(models.FlightStateClimb, 0.2)
	//	return
	//}
}
