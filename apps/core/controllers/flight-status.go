package controllers

import (
	flight_status "apps/core/services/flight-status"
	_ "apps/core/utils"
	"apps/core/utils/logger"
	"github.com/gin-gonic/gin"
)

// FlightStatusController data type
type FlightStatusController struct {
	logger          logger.Logger
	flightStatusSvc flight_status.FlightStatusService
}

// NewFlightStatusController creates new FlightStatus controller
func NewFlightStatusController(
	logger logger.Logger,
	flightStatusSvc flight_status.FlightStatusService,
) FlightStatusController {
	return FlightStatusController{
		logger:          logger,
		flightStatusSvc: flightStatusSvc,
	}
}

// GetFlightStatus
// @Summary  Get current of FlightStatus
// @Tags     Flight_Status
// @Accept   json
// @Produce  json
// @Success  200  {object}  models.FlightStatus
// @Failure  500  {object}  utils.ResponseError
// @Router   /flightStatus [get]
func (u FlightStatusController) GetFlightStatus(c *gin.Context) {
	c.JSON(200, u.flightStatusSvc.GetFlightStatus())
}
