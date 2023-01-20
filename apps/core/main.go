package main

import (
	_ "apps/core/docs"
	"apps/core/services"
	"apps/core/services/dataref"
	"apps/core/services/flight-status"
	"apps/core/utils"
	"apps/core/utils/logger"
	"github.com/xairline/goplane/extra/logging"
	"github.com/xairline/goplane/xplm/plugins"
	"github.com/xairline/goplane/xplm/utilities"
	"path/filepath"
)

// @BasePath  /apis

func main() {
}

func init() {
	logger := logger.NewXplaneLogger()
	plugins.EnableFeature("XPLM_USE_NATIVE_PATHS", true)
	logging.MinLevel = logging.Info_Level
	logging.PluginName = "X Web Stack"
	// get plugin path
	systemPath := utilities.GetSystemPath()
	pluginPath := filepath.Join(systemPath, "Resources", "plugins", "XWebStack")
	logger.Infof("Plugin path: %s", pluginPath)

	db, err := utils.CreateDatabase(logger, pluginPath)
	if err != nil {
		logger.Errorf("Failed to create/connect database, %v", err)
	}
	datarefSvc := dataref.NewDatarefService(logger)
	flightStatusSvc := flight_status.NewFlightStatusService(
		datarefSvc,
		logger,
		db,
	)
	// entrypoint
	services.NewXplaneService(
		datarefSvc,
		flightStatusSvc,
		logger,
		db,
	)
}
