package flight_status

import (
	"apps/core/models"
	"fmt"
)

func (f flightStatusService) processDatarefParked(datarefValues models.DatarefValues) {
	if datarefValues["gs"].Value.(float64) > 1 {
		// get the nearest airport
		airportId, airportName := f.DatarefSvc.GetNearestAirport()
		// get weight information
		var weightPrecision int8 = 1
		fuelWeight := f.DatarefSvc.GetValueByDatarefName("sim/flightmodel/weight/m_fuel_total", "fuel_weight", &weightPrecision, false)
		totalWeight := f.DatarefSvc.GetValueByDatarefName("sim/flightmodel/weight/m_total", "total_weight", &weightPrecision, false)
		f.setDepartureFlightInfo(
			airportId,
			airportName,
			datarefValues["ts"].Value.(float64),
			fuelWeight.Value.(float64),
			totalWeight.Value.(float64),
		)
		// get aircraft name
		aircraftICAO := f.DatarefSvc.GetValueByDatarefName("sim/aircraft/view/acf_ICAO", "icao", nil, true)
		aircraftDisplayName := f.DatarefSvc.GetValueByDatarefName("sim/aircraft/view/acf_ui_name", "acf_ui_name", nil, true)
		f.FlightStatus.AircraftICAO = aircraftICAO.Value.(string)
		f.FlightStatus.AircraftDisplayName = aircraftDisplayName.Value.(string)

		f.Logger.Infof("Departure information: %+v", f.FlightStatus)

		f.addFlightEvent(datarefValues, fmt.Sprintf("Taxi out at %s", airportId))
		f.changeState(models.FlightStateTaxiOut, 0.2)
	}
}
