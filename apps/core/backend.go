package main

import (
	"apps/core/controllers"
	_ "apps/core/docs"
	"apps/core/routes"
	"apps/core/services/dataref"
	"apps/core/utils/logger"
	"github.com/gin-gonic/gin"
)

// @BasePath  /apis

func main() {
	g := gin.New()
	logger := logger.NewGenericLogger()
	routes.NewRoutes(
		logger,
		g,
		controllers.NewDatarefController(logger, dataref.NewDatarefService(logger)),
	).Setup()

	err := g.Run(":8080")
	if err != nil {
		logger.Errorf("Failed to start gin server, %v", err)
	}
}
