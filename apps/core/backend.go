package main

import (
	"apps/core/controllers"
	_ "apps/core/docs"
	"apps/core/routes"
	"apps/core/services/dataref"
	"apps/core/utils"
	"apps/core/utils/logger"
	"github.com/gin-gonic/gin"
	"os"
	"path"
)

// @BasePath  /apis

func main() {
	g := gin.New()
	logger := logger.NewGenericLogger()
	home, _ := os.UserHomeDir()
	db, err := utils.CreateDatabase(logger, path.Join(home, "/X-Plane 12/Resources/plugins/XWebStack"))
	if err != nil {
		logger.Errorf("Failed to create/connect database, %v", err)
	}
	routes.NewRoutes(
		logger,
		g,
		controllers.NewDatarefController(logger, dataref.NewDatarefService(logger)),
		controllers.NewFlightLogsController(logger, db),
	).Setup()

	err = g.Run(":8080")
	if err != nil {
		logger.Errorf("Failed to start gin server, %v", err)
	}
}
