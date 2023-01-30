package routes

import (
	"apps/core/controllers"
	"apps/core/utils/logger"
	"github.com/gin-gonic/gin"
)

// VaRoutes struct
type VaRoutes struct {
	logger       logger.Logger
	gin          *gin.Engine
	vaController controllers.VaController
}

// Setup Va routes
func (s VaRoutes) Setup() {
	s.logger.Info("Setting up routes")
	api := s.gin.Group("/apis/va")
	{
		api.GET("", s.vaController.GetVa)

	}
}

// NewVaRoutes creates new Va controller
func NewVaRoutes(
	logger logger.Logger,
	gin *gin.Engine,
	vaController controllers.VaController,
) VaRoutes {
	return VaRoutes{
		logger:       logger,
		gin:          gin,
		vaController: vaController,
	}
}
