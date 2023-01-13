package main

import (
	"apps/core/services"
	"apps/core/services/flight-status"
)

func main() {
}

func init() {
	datarefSvc := services.NewDatarefService()
	flightStatusSvc := flight_status.NewFlightStatusService()
	// entrypoint
	services.NewXplaneService(
		datarefSvc,
		flightStatusSvc,
	)
}
