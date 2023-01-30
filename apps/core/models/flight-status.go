package models

import (
	"gorm.io/gorm"
	"time"
)

type FlightStatus struct {
	ID                  uint      `gorm:"primarykey" json:"id"`
	CreatedAt           time.Time `json:"createdAt"`
	UpdatedAt           time.Time
	DeletedAt           gorm.DeletedAt         `gorm:"index"`
	CurrentState        FlightState            `gorm:"-" swaggerignore:"true"`
	PollFrequency       float32                `gorm:"-" swaggerignore:"true"`
	Locations           []FlightStatusLocation `gorm:"foreignKey:FlightId" json:"locations"`
	DepartureFlightInfo FlightInfo             `gorm:"embedded;embeddedPrefix:departure_" json:"departureFlightInfo"`
	ArrivalFlightInfo   FlightInfo             `gorm:"embedded;embeddedPrefix:arrival_" json:"arrivalFlightInfo"`
	AircraftICAO        string                 `json:"aircraftICAO"`
	AircraftDisplayName string                 `json:"aircraftDisplayName"`
	VaFiled             bool                   `gorm:"default:false" json:"va_filed"`
	Source              string                 `gorm:"default:xws" json:"source"`
}

type FlightStatusLocation struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
	FlightId  int
	Timestamp float64 `json:"timestamp"`
	Vs        float64 `json:"vs"`
	Ias       float64 `json:"ias"`
	Lat       float64 `json:"lat"`
	Lng       float64 `json:"lng"`
	Altitude  float64
	Agl       float64 `json:"agl"`
	GearForce float64 `json:"gearForce"`
	GForce    float64 `json:"gforce"`
	Heading   float64
	State     FlightState       `gorm:"embedded" json:"state"`
	Event     FlightStatusEvent `gorm:"embedded" json:"event"`
}

type FlightStatusEvent struct {
	EventType   FlightStatusEventType `json:"eventType"`
	Description string                `json:"description"`
}
type FlightInfo struct {
	AirportId   string  `json:"airportId"`
	AirportName string  `json:"airportName"`
	FuelWeight  float64 `json:"fuelWeight"`
	TotalWeight float64 `json:"totalWeight"`
	Time        float64 `json:"time"`
}

type FlightState string
type FlightStatusEventType string

const (
	FlightStateParked  FlightState = "parked"
	FlightStateTaxiOut FlightState = "taxi_out"
	FlightStateTakeoff FlightState = "takeoff"
	FlightStateClimb   FlightState = "climb"
	FlightStateCruise  FlightState = "cruise"
	FlightStateDescend FlightState = "descend"
	FlightStateLanding FlightState = "landing"
	FlightStateTaxiIn  FlightState = "taxi_in"
)

const (
	StateEvent     FlightStatusEventType = "event:state"
	LocationEvent                        = "event:location"
	ViolationEvent                       = "event:violation"
)
