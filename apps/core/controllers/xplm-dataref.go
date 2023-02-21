package controllers

import (
	"apps/core/services/dataref"
	"apps/core/utils"
	"apps/core/utils/logger"
	"github.com/gin-gonic/gin"
)

// DatarefController data type
type DatarefController struct {
	logger     logger.Logger
	datarefSvc dataref.DatarefService
}

// NewDatarefController creates new Dataref controller
func NewDatarefController(logger logger.Logger, datarefSvc dataref.DatarefService) DatarefController {
	return DatarefController{
		logger:     logger,
		datarefSvc: datarefSvc,
	}
}

// GetDataref
// @Summary  Get Dataref
// @Tags     XPLM_Dataref
// @Param    dataref_str  query string true "xplane dataref string"
// @Param    alias  query string false "alias name, if not set, dataref_str will be used"
// @Param    precision  query int8 true "-1: raw, 2: round up to two digits"
// @Param    is_byte_array query bool false "transform xplane byte array to string"
// @Accept   json
// @Produce  json
// @Success  200  {object}  models.DatarefValue
// @Failure  500  {object}  utils.ResponseError
// @Router   /xplm/dataref [get]
func (u DatarefController) GetDataref(c *gin.Context) {
	dataref, success := c.GetQuery("dataref_str")
	if !success {
		c.JSON(500, utils.ResponseError{Message: `missing "dataref_str"`})
	}

	var alias string
	alias, success = c.GetQuery("alias")
	if !success {
		alias = dataref
	}

	var precision *int8
	precisionInt := c.GetInt("precision")
	precisionInt8 := int8(precisionInt)
	precision = &(precisionInt8)
	res := u.datarefSvc.GetValueByDatarefName(dataref, alias, precision, c.GetBool("is_byte_array"))
	c.JSON(200, res)
}

// GetDatarefs
// @Summary  Get a list of Dataref
// @Tags     XPLM_Dataref
// @Accept   json
// @Produce  json
// @Success  200  {object}  []models.DatarefValue
// @Failure  501  "Not Implemented"
// @Router   /xplm/datarefs [post]
func (u DatarefController) GetDatarefs(c *gin.Context) {
	c.JSON(501, "not implemented")
}

// SetDataref
// @Summary  Set Dataref
// @Tags     XPLM_Dataref
// @Accept   json
// @Produce  json
// @Failure  501  "Not Implemented"
// @Router   /xplm/dataref [put]
func (u DatarefController) SetDataref(c *gin.Context) {
	c.JSON(501, "not implemented")
}

// SetDatarefs
// @Summary  Set a list of Dataref
// @Tags     XPLM_Dataref
// @Accept   json
// @Produce  json
// @Failure  501  "Not Implemented"
// @Router   /xplm/datarefs [put]
func (u DatarefController) SetDatarefs(c *gin.Context) {
	c.JSON(501, "not implemented")
}
