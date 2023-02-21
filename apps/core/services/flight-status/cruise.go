package flight_status

import (
	"apps/core/models"
	"math"
)

func (f flightStatusService) processDatarefCruise(datarefValues models.DatarefValues) {
	if datarefValues["vs"].GetFloat64() > 500 {
		*f.climbCounter += 1
	} else {
		*f.climbCounter = 0
	}
	if datarefValues["vs"].GetFloat64() < -500 {
		*f.descendCounter += 1
	} else {
		*f.descendCounter = 0
	}
	// 30s
	if *f.climbCounter >= int(30/f.FlightStatus.PollFrequency) {
		event := f.addFlightEvent("Climb")
		f.addLocation(datarefValues, -1, &event)
		f.changeState(models.FlightStateClimb, 0.2)
	}
	if *f.descendCounter >= int(30/f.FlightStatus.PollFrequency) {
		event := f.addFlightEvent("Descend")
		f.addLocation(datarefValues, -1, &event)
		f.changeState(models.FlightStateDescend, 0.2)
	}

	currentHeading := datarefValues["heading"].GetFloat64()
	lastHeading := f.FlightStatus.Locations[len(f.FlightStatus.Locations)-1].Heading
	if math.Abs(lastHeading-currentHeading) > 10 {
		f.addLocation(datarefValues, -1, nil)
	} else {
		f.addLocation(datarefValues, 50, nil)
	}
}
