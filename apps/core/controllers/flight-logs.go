package controllers

import (
	"apps/core/models"
	"apps/core/utils"
	"apps/core/utils/logger"
	"fmt"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"strconv"
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
// @Failure  500  {object}  utils.ResponseError
// @Router   /flight-logs [get]
func (u FlightLogsController) GetFlightLogs(c *gin.Context) {
	var res []models.FlightStatus
	result := u.db.Model(&models.FlightStatus{}).Find(&res)
	if result.Error != nil {
		c.JSON(500, utils.ResponseError{Message: fmt.Sprintf("Failed to get flight logs: %+v", result.Error)})
	}
	c.JSON(200, res)
}

// GetFlightLog
// @Summary  Get one FlightLog
// @Param    id  path  string  true  "id of a flight log item"
// @Tags     Flight_Logs
// @Accept   json
// @Produce  json
// @Success  200  {object}  models.FlightStatus
// @Failure  404  "Not Found"
// @Router   /flight-logs/{id} [get]
func (u FlightLogsController) GetFlightLog(c *gin.Context) {
	var res models.FlightStatus
	id, _ := strconv.Atoi(c.Param("id"))
	result := u.db.Model(&models.FlightStatus{}).Preload("Events").First(&res, id)
	if result.Error == nil {
		c.JSON(200, res)
	} else {
		u.logger.Infof("%+v", result.Error)
		c.JSON(404, "not found")
	}
}

// GetFlightLogEvents
// @Summary  Get events of a Flight
// @Param    id  path  string  true  "id of a flight log item"
// @Tags     Flight_Logs
// @Accept   json
// @Produce  json
// @Success  200  {object}  []models.FlightStatusEvent
// @Failure  501  "Not Implemented"
// @Router   /flight-logs/{id}/events [get]
func (u FlightLogsController) GetFlightLogEvents(c *gin.Context) {
	c.JSON(501, "not implemented")
}

// GetFlightLogLandingData
// @Summary  Get landing data of a Flight
// @Param    id  path  string  true  "id of a flight log item"
// @Tags     Flight_Logs
// @Accept   json
// @Produce  json
// @Success  200  {object}  []models.FlightStatusEvent
// @Failure  501  "Not Implemented"
// @Router   /flight-logs/{id}/landing [get]
func (u FlightLogsController) GetFlightLogLandingData(c *gin.Context) {
	c.JSON(501, "not implemented")
}
