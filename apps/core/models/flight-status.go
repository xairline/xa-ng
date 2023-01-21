package models

import "gorm.io/gorm"

type FlightStatus struct {
	gorm.Model
	CurrentState        FlightState            `gorm:"-" swaggerignore:"true"`
	PollFrequency       float32                `gorm:"-" swaggerignore:"true"`
	Locations           []FlightStatusLocation `gorm:"foreignKey:FlightId"`
	DepartureFlightInfo FlightInfo             `gorm:"embedded;embeddedPrefix:departure_"`
	ArrivalFlightInfo   FlightInfo             `gorm:"embedded;embeddedPrefix:arrival_"`
	AircraftICAO        string
	AircraftDisplayName string
}

type FlightStatusLocation struct {
	gorm.Model
	FlightId  int
	Timestamp float64
	Vs        float64
	Ias       float64
	Lat       float64
	Lng       float64
	Altitude  float64
	Agl       float64
	GearForce float64
	GForce    float64
	Heading   float64
	State     FlightState       `gorm:"embedded"`
	Event     FlightStatusEvent `gorm:"embedded"`
}

type FlightStatusEvent struct {
	EventType   FlightStatusEventType
	Description string
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
