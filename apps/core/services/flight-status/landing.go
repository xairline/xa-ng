package flight_status

import (
	"apps/core/models"
	"github.com/xairline/goplane/xplm/navigation"
	"math"
)

func (f flightStatusService) processDatarefLanding(datarefValues models.DatarefValues) {
	if datarefValues["gs"].Value.(float64) < 30/1.9438 {
		navRef := navigation.FindNavAid("", "", math.MaxFloat32, math.MaxFloat32, math.MaxInt32, navigation.Nav_Airport)
		_, _, _, _, _, _, _, arrivalAirport, _ := navigation.GetNavAidInfo(navRef)
		f.FlightStatus.FlightInfo.Arrival = arrivalAirport
		f.FlightStatus.Events = append(f.FlightStatus.Events, models.FlightStatusEvent{
			Timestamp:     datarefValues["ts"].Value.(float64),
			Description:   "Taxi in at %TODO%",
			DatarefValues: datarefValues,
		})
		f.changeState(models.FlightStateTaxiIn, 0.2)
	} else {
		// watch for violation
	}
}
