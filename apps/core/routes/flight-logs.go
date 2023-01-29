package routes

import (
	"apps/core/controllers"
	"apps/core/utils/logger"
	"github.com/gin-gonic/gin"
)

// FlightLogsRoutes struct
type FlightLogsRoutes struct {
	logger               logger.Logger
	gin                  *gin.Engine
	flightLogsController controllers.FlightLogsController
}

// Setup FlightLogs routes
func (s FlightLogsRoutes) Setup() {
	s.logger.Info("Setting up routes")
	api := s.gin.Group("/apis/flight-logs")
	{
		api.GET("", s.flightLogsController.GetFlightLogs)
		api.GET(":id", s.flightLogsController.GetFlightLog)

	}
}

// NewFlightLogsRoutes creates new FlightLogs controller
func NewFlightLogsRoutes(
	logger logger.Logger,
	gin *gin.Engine,
	flightLogsController controllers.FlightLogsController,
) FlightLogsRoutes {
	return FlightLogsRoutes{
		logger:               logger,
		gin:                  gin,
		flightLogsController: flightLogsController,
	}
}
