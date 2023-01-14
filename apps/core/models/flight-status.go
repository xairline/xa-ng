package models

type FlightStatus struct {
	CurrentState        FlightState
	PollFrequency       float32
	Events              []FlightStatusEvent
	DepartureFlightInfo FlightInfo
	ArrivalFlightInfo   FlightInfo
}

type FlightStatusEvent struct {
	Timestamp     float64
	Description   string
	DatarefValues DatarefValues
}
type FlightInfo struct {
	AirportId   string
	AirportName string
	FuelWeight  float64
	TotalWeight float64
	Time        float64
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
