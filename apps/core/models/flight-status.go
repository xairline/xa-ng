package models

import "gorm.io/gorm"

type FlightStatus struct {
	gorm.Model
	CurrentState        FlightState         `gorm:"-" swaggerignore:"true"`
	PollFrequency       float32             `gorm:"-" swaggerignore:"true"`
	Events              []FlightStatusEvent `gorm:"foreignKey:FlightId"`
	DepartureFlightInfo FlightInfo          `gorm:"embedded;embeddedPrefix:departure_"`
	ArrivalFlightInfo   FlightInfo          `gorm:"embedded;embeddedPrefix:arrival_"`
	AircraftICAO        string
	AircraftDisplayName string
}

type FlightStatusEvent struct {
	gorm.Model
	EventType   FlightStatusEventType
	FlightId    int
	Timestamp   float64
	Description string
	ExtraData   string
}
type FlightInfo struct {
	AirportId   string
	AirportName string
	FuelWeight  float64
	TotalWeight float64
	Time        float64
}

type FlightState string
type FlightStatusEventType string

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

const (
	StateEvent     FlightStatusEventType = "event:state"
	LocationEvent                        = "event:location"
	ViolationEvent                       = "event:violation"
)
