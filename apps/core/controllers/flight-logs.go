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
	//flightStatusSvc flight_status.FlightStatusService
}

// NewFlightLogsController creates new FlightLogs controller
func NewFlightLogsController(
	logger logger.Logger,
	db *gorm.DB,
	/* flightStatusSvc flight_status.FlightStatusService, */
) FlightLogsController {
	return FlightLogsController{
		logger: logger,
		db:     db,
		//flightStatusSvc: flightStatusSvc,
	}
}

// GetFlightLogs
// @Summary  Get a list of FlightLogs
// @Param    isOverview    query     string  false  "specify if it's overview"
// @Tags     Flight_Logs
// @Accept   json
// @Produce  json
// @Success  200  {object}  []models.FlightStatus
// @Failure  500  {object}  utils.ResponseError
// @Router   /flight-logs [get]
func (u FlightLogsController) GetFlightLogs(c *gin.Context) {
	var res []models.FlightStatus
	isOverview := c.Request.URL.Query().Get("isOverview")
	if isOverview == "true" {
		result := u.db.
			Preload("Locations" /*, "event_type = (?)", models.StateEvent*/).
			Model(&models.FlightStatus{}).Order("created_at DESC").
			Find(&res)
		if result.Error != nil {
			c.JSON(500, utils.ResponseError{Message: fmt.Sprintf("Failed to get flight logs: %+v", result.Error)})
		}
	} else {
		result := u.db.Model(&models.FlightStatus{}).Order("created_at DESC").Find(&res)
		if result.Error != nil {
			c.JSON(500, utils.ResponseError{Message: fmt.Sprintf("Failed to get flight logs: %+v", result.Error)})
		}
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
	result := u.db.
		Model(&models.FlightStatus{}).
		Preload("Locations").
		First(&res, id)
	if result.Error == nil {
		c.JSON(200, res)
	} else {
		u.logger.Infof("%+v", result.Error)
		c.JSON(404, "not found")
	}
}
