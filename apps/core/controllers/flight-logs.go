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
// @Param    departureAirportId query string false "departure airport"
// @Param    arrivalAirportId query string false "arrival airport"
// @Param    aircraftICAO query string false "aircraft ICAO"
// @Param    source query string false "xplane or xws"
// @Tags     Flight_Logs
// @Accept   json
// @Produce  json
// @Success  200  {object}  []models.FlightStatus
// @Failure  500  {object}  utils.ResponseError
// @Router   /flight-logs [get]
func (u FlightLogsController) GetFlightLogs(c *gin.Context) {
	var res []models.FlightStatus
	isOverview := c.Request.URL.Query().Get("isOverview")
	var result *gorm.DB
	if isOverview == "true" {
		result = u.db.
			Preload("Locations" /*, "event_type = (?)", models.StateEvent*/).
			Model(&models.FlightStatus{})

	} else {
		result = u.db.Model(&models.FlightStatus{})
	}
	// departureAirportId
	departureAirportId := c.Request.URL.Query().Get("departureAirportId")
	if len(departureAirportId) > 0 {
		result = result.Where("departure_airport_id = ?", departureAirportId)
	}
	// arrivalAirportId
	arrivalAirportId := c.Request.URL.Query().Get("arrivalAirportId")
	if len(arrivalAirportId) > 0 {
		result = result.Where("arrival_airport_id = ?", arrivalAirportId)
	}
	// aircraftICAO
	aircraftICAO := c.Request.URL.Query().Get("aircraftICAO")
	if len(aircraftICAO) > 0 {
		result = result.Where("aircraft_icao = ?", aircraftICAO)
	}

	result = result.Where("LENGTH(arrival_airport_id) > 0")
	result.Order("id DESC").Find(&res)
	if result.Error != nil {
		c.JSON(500, utils.ResponseError{Message: fmt.Sprintf("Failed to get flight logs: %+v", result.Error)})
		return
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
		Preload("Events").
		First(&res, id)
	if result.Error == nil {
		c.JSON(200, res)
		return
	} else {
		u.logger.Infof("%+v", result.Error)
		c.JSON(404, "not found")
		return
	}
}
