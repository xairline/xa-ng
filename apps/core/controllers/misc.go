package controllers

import (
	"apps/core/utils"
	"apps/core/utils/logger"
	"github.com/gin-gonic/gin"
)

// use ldflags to replace this value during build:
// 		https://www.digitalocean.com/community/tutorials/using-ldflags-to-set-version-information-for-go-applications
const VERSION string = "development"

// MiscController data type
type MiscController struct {
	logger logger.Logger
}

// NewMiscController creates new Misc controller
func NewMiscController(logger logger.Logger) MiscController {
	return MiscController{
		logger: logger,
	}
}

// GetVersion
// @Summary  Get version of cray-nls service
// @Tags     Misc
// @Accept   json
// @Produce  json
// @Success  200  {object}  utils.ResponseOk
// @Failure  500  {object}  utils.ResponseError
// @Router   /version [get]
func (u MiscController) GetVersion(c *gin.Context) {
	c.JSON(200, utils.ResponseOk{Message: VERSION})
}
