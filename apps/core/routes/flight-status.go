package routes

import (
	"apps/core/controllers"
	"apps/core/utils/logger"
	"github.com/gin-gonic/gin"
)

// FlightStatusRoutes struct
type FlightStatusRoutes struct {
	logger                 logger.Logger
	gin                    *gin.Engine
	flightStatusController controllers.FlightStatusController
}

// Setup FlightStatus routes
func (s FlightStatusRoutes) Setup() {
	s.logger.Info("Setting up routes")
	api := s.gin.Group("/apis/flightStatus")
	{
		api.GET("", s.flightStatusController.GetFlightStatus)

	}
}

// NewFlightStatusRoutes creates new FlightStatus controller
func NewFlightStatusRoutes(
	logger logger.Logger,
	gin *gin.Engine,
	flightStatusController controllers.FlightStatusController,
) FlightStatusRoutes {
	return FlightStatusRoutes{
		logger:                 logger,
		gin:                    gin,
		flightStatusController: flightStatusController,
	}
}
