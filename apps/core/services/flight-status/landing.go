package flight_status

import (
	"apps/core/models"
)

func (f flightStatusService) processDatarefLanding(datarefValues models.DatarefValues) {
	if datarefValues["gs"].GetFloat64() < 30/1.9438 {
		airportId, airportName := f.DatarefSvc.GetNearestAirport()
		f.setArrivalFlightInfo(
			airportId,
			airportName,
			datarefValues["ts"].GetFloat64(),
			0,
			0,
		)

		f.changeState(models.FlightStateTaxiIn, 0.2)
		f.addLocation(datarefValues, -1, nil)
		return
	} else {
		f.addLocation(datarefValues, 0.1, nil)
	}
	// go-around
	//if datarefValues["vs"].GetFloat64() > 500 &&
	//	datarefValues["gear_force"].GetFloat64() < 1 {
	//	f.addFlightEvent(datarefValues, "Climb")
	//	f.changeState(models.FlightStateClimb, 0.2)
	//	return
	//}
}
