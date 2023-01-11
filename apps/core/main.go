package main

import (
	"apps/core/services"
)

func main() {
}

func init() {
	datarefSvc := services.NewDatarefService()
	tstorageSvc := services.NewTstorageService()

	// entrypoint
	services.NewXplaneService(
		tstorageSvc,
		datarefSvc,
	)
}
