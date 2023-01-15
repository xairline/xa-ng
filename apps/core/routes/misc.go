package routes

import (
	"apps/core/controllers"
	"apps/core/utils/logger"
	"github.com/gin-gonic/gin"
)

// MiscRoutes struct
type MiscRoutes struct {
	logger         logger.Logger
	gin            *gin.Engine
	miscController controllers.MiscController
}

// Setup Misc routes
func (s MiscRoutes) Setup() {
	s.logger.Info("Setting up routes")
	api := s.gin.Group("/apis")
	{
		api.GET("/version", s.miscController.GetVersion)

	}
}

// NewMiscRoutes creates new Misc controller
func NewMiscRoutes(
	logger logger.Logger,
	gin *gin.Engine,
	miscController controllers.MiscController,
) MiscRoutes {
	return MiscRoutes{
		logger:         logger,
		gin:            gin,
		miscController: miscController,
	}
}
