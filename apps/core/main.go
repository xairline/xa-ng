package main

import (
	_ "apps/core/docs"
	"apps/core/services"
	"apps/core/services/dataref"
	"apps/core/services/flight-status"
	"apps/core/utils/logger"
)

// @BasePath  /apis

func main() {
}

func init() {
	datarefSvc := dataref.NewDatarefService(logger.NewXplaneLogger())
	flightStatusSvc := flight_status.NewFlightStatusService(
		datarefSvc,
		logger.NewXplaneLogger(),
	)
	// entrypoint
	services.NewXplaneService(
		datarefSvc,
		flightStatusSvc,
		logger.NewXplaneLogger(),
	)
}
