package routes

import (
	"apps/core/controllers"
	"apps/core/utils/logger"
	"github.com/gin-gonic/gin"
)

// Routes contains multiple routes
type Routes []Route

// Route interface
type Route interface {
	Setup()
}

// NewRoutes sets up routes
func NewRoutes(
	logger logger.Logger,
	gin *gin.Engine,
	datarefController controllers.DatarefController,
	staticPath string,
) Routes {
	return Routes{
		NewOpenAPIRoutes(logger, gin),
		NewDatarefRoutes(logger, gin, datarefController),
		NewStaticRoutes(logger, gin, staticPath),
	}
}

// Setup all the route
func (r Routes) Setup() {
	for _, route := range r {
		route.Setup()
	}
}
