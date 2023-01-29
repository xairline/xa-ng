package routes

import (
	"apps/core/controllers"
	"apps/core/utils/logger"
	"github.com/gin-gonic/gin"
)

// DatarefRoutes struct
type DatarefRoutes struct {
	logger            logger.Logger
	gin               *gin.Engine
	datarefController controllers.DatarefController
}

// Setup Dataref routes
func (s DatarefRoutes) Setup() {
	s.logger.Info("Setting up routes")
	api := s.gin.Group("/apis/xplm/dataref")
	{
		api.GET("", s.datarefController.GetDataref)
		api.PUT("", s.datarefController.SetDataref)

	}
}

// NewDatarefRoutes creates new Dataref controller
func NewDatarefRoutes(
	logger logger.Logger,
	gin *gin.Engine,
	datarefController controllers.DatarefController,
) DatarefRoutes {
	return DatarefRoutes{
		logger:            logger,
		gin:               gin,
		datarefController: datarefController,
	}
}
