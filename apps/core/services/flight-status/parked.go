package flight_status

import (
	"apps/core/models"
	"fmt"
	"github.com/xairline/goplane/xplm/navigation"
	"math"
)

func (f flightStatusService) processDatarefParked(datarefValues models.DatarefValues) {
	if datarefValues["gs"].Value.(float64) > 0 {
		navRef := navigation.FindNavAid("", "", math.MaxFloat32, math.MaxFloat32, math.MaxInt32, navigation.Nav_Airport)
		_, _, _, _, _, _, _, departureAirport, _ := navigation.GetNavAidInfo(navRef)
		f.FlightStatus.FlightInfo.Departure = departureAirport
		f.FlightStatus.Events = append(f.FlightStatus.Events, models.FlightStatusEvent{
			Timestamp:     datarefValues["ts"].Value.(float64),
			Description:   fmt.Sprintf("Taxi out at: %s", departureAirport),
			DatarefValues: datarefValues,
		})
		f.changeState(models.FlightStateTaxiOut, 0.2)
	}
}
