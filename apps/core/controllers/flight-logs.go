package controllers

import (
	"apps/core/utils/logger"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// FlightLogsController data type
type FlightLogsController struct {
	logger logger.Logger
	db     *gorm.DB
}

// NewFlightLogsController creates new FlightLogs controller
func NewFlightLogsController(logger logger.Logger, db *gorm.DB) FlightLogsController {
	return FlightLogsController{
		logger: logger,
		db:     db,
	}
}

// GetFlightLogs
// @Summary  Get a list of FlightLogs
// @Tags     Flight_Logs
// @Accept   json
// @Produce  json
// @Success  200  {object}  []models.FlightStatus
// @Failure  501  "Not Implemented"
// @Router   /flight-logs [get]
func (u FlightLogsController) GetFlightLogs(c *gin.Context) {
	c.JSON(501, "not implemented")
}

// GetFlightLog
// @Summary  Get one FlightLogs
// @Param    id  path  string  true  "id of a flight log item"
// @Tags     Flight_Logs
// @Accept   json
// @Produce  json
// @Success  200  {object}  models.FlightStatus
// @Failure  501  "Not Implemented"
// @Router   /flight-logs/{id} [get]
func (u FlightLogsController) GetFlightLog(c *gin.Context) {
	c.JSON(501, "not implemented")
}
