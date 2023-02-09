package flight_status

import (
	"apps/core/models"
	"math"
)

func (f flightStatusService) processDatarefTaxiIn(datarefValues models.DatarefValues) {
	//todo: fix below
	var n1 float64
	for _, value := range datarefValues["n1"].Value.([]float64) {
		n1 = value
		break
	}
	if datarefValues["gs"].GetFloat64() < 1/1.9438 &&
		n1 < 3 {
		var weightPrecision int8 = 1
		fuelWeight := f.DatarefSvc.GetValueByDatarefName("sim/flightmodel/weight/m_fuel_total", "fuel_weight", &weightPrecision, false)
		totalWeight := f.DatarefSvc.GetValueByDatarefName("sim/flightmodel/weight/m_total", "total_weight", &weightPrecision, false)
		f.FlightStatus.ArrivalFlightInfo.FuelWeight = fuelWeight.GetFloat64()
		f.FlightStatus.ArrivalFlightInfo.TotalWeight = totalWeight.GetFloat64()
		f.addLocation(datarefValues, -1, nil)
		f.db.Model(&models.FlightStatus{}).Where("id = ?", f.FlightStatus.ID).Updates(f.FlightStatus)
		f.ResetFlightStatus()
	} else {
		currentHeading := datarefValues["heading"].GetFloat64()
		lastHeading := f.FlightStatus.Locations[len(f.FlightStatus.Locations)-1].Heading
		if math.Abs(lastHeading-currentHeading) > 10 {
			f.addLocation(datarefValues, -1, nil)
		}
	}
}
