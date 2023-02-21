package controllers

import (
	_ "apps/core/utils"
	"apps/core/utils/logger"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"io/ioutil"
	"net/http"
)

// VaController data type
type VaController struct {
	logger logger.Logger
	db     *gorm.DB
	//flightStatusSvc flight_status.FlightStatusService
}

// NewVaController creates new Va controller
func NewVaController(
	logger logger.Logger,
	db *gorm.DB,
	/* flightStatusSvc flight_status.FlightStatusService, */
) VaController {
	return VaController{
		logger: logger,
		db:     db,
		//flightStatusSvc: flightStatusSvc,
	}
}

// GetVa
// @Summary  Get a list of Va
// @Tags     Va
// @Accept   json
// @Produce  json
// @Success  200  {object}  []models.Va
// @Failure  500  {object}  utils.ResponseError
// @Router   /va [get]
func (u VaController) GetVa(c *gin.Context) {
	resp, err := http.Get("https://raw.githubusercontent.com/xairline/xairline-v2/main/va.json")
	if err != nil {
		c.JSON(500, err)
		return
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		c.JSON(500, err)
		return
	}
	c.Data(200, "application/json; charset=utf-8", body)
}
