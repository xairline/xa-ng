package flight_status

import (
	"apps/core/models"
	"fmt"
)

func (f flightStatusService) processDatarefLanding(datarefValues models.DatarefValues) {
	if datarefValues["gs"].Value.(float64) < 30/1.9438 {
		airportId, airportName := f.DatarefSvc.GetNearestAirport()
		var weightPrecision int8 = 1
		fuelWeight := f.DatarefSvc.GetValueByDatarefName("sim/flightmodel/weight/m_fuel_total", "fuel_weight", &weightPrecision, false)
		totalWeight := f.DatarefSvc.GetValueByDatarefName("sim/flightmodel/weight/m_total", "total_weight", &weightPrecision, false)
		f.setArrivalFlightInfo(
			airportId,
			airportName,
			datarefValues["ts"].Value.(float64),
			fuelWeight.Value.(float64),
			totalWeight.Value.(float64),
		)

		f.addFlightEvent(datarefValues, fmt.Sprintf("Taxi in at %s", airportId))
		f.changeState(models.FlightStateTaxiIn, 0.2)
	} else {
		// watch for violation
	}
}
