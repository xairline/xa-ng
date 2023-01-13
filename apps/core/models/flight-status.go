package models

type FlightStatus struct {
	CurrentState  FlightState
	PollFrequency float32
	Events        []FlightStatusEvent
	FlightInfo    FlightInfo
}

type FlightStatusEvent struct {
	Timestamp     float64
	Description   string
	DatarefValues DatarefValues
}
type FlightInfo struct {
	Departure   string
	Arrival     string
	FuelWeight  float32
	TotalWeight float32
}

type FlightState string

const (
	FlightStateParked  FlightState = "parked"
	FlightStateTaxiOut             = "taxi_out"
	FlightStateTakeoff             = "takeoff"
	FlightStateClimb               = "climb"
	FlightStateCruise              = "cruise"
	FlightStateDescend             = "descend"
	FlightStateLanding             = "landing"
	FlightStateTaxiIn              = "taxi_in"
)
