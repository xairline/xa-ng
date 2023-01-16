package flight_status

import "apps/core/models"

func (f flightStatusService) processDatarefTaxiIn(datarefValues models.DatarefValues) {
	//todo: fix below
	var n1 float64
	for _, value := range datarefValues["n1"].Value.([]float64) {
		n1 = value
		break
	}
	if datarefValues["gs"].Value.(float64) < 1/1.9438 &&
		n1 < 1 {
		var weightPrecision int8 = 1
		fuelWeight := f.DatarefSvc.GetValueByDatarefName("sim/flightmodel/weight/m_fuel_total", "fuel_weight", &weightPrecision, false)
		totalWeight := f.DatarefSvc.GetValueByDatarefName("sim/flightmodel/weight/m_total", "total_weight", &weightPrecision, false)
		f.FlightStatus.ArrivalFlightInfo.FuelWeight = fuelWeight.Value.(float64)
		f.FlightStatus.ArrivalFlightInfo.TotalWeight = totalWeight.Value.(float64)
		f.db.Model(&models.FlightStatus{}).Where("id = ?", f.FlightStatus.ID).Updates(f.FlightStatus)
		f.ResetFlightStatus()
	} else {
		// watch for violation
	}
}
