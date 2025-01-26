package main

import (
	_ "apps/core/docs"
	"apps/core/services"
	"apps/core/utils/logger"
	"github.com/gin-gonic/gin"
	"github.com/xairline/goplane/extra/logging"
	"github.com/xairline/goplane/xplm/plugins"
	"github.com/xairline/goplane/xplm/utilities"
	"path/filepath"
)

// @BasePath  /apis

func main() {
}

func init() {
	gin.SetMode(gin.ReleaseMode)
	xplaneLogger := logger.NewXplaneLogger()
	plugins.EnableFeature("XPLM_USE_NATIVE_PATHS", true)
	logging.MinLevel = logging.Info_Level
	logging.PluginName = "X Web Stack"
	// get plugin path
	systemPath := utilities.GetSystemPath()
	pluginPath := filepath.Join(systemPath, "Resources", "plugins", "XWebStack")
	xplaneLogger.Infof("Plugin path: %s", pluginPath)

	datarefSvc := services.NewDatarefService(xplaneLogger)
	// entrypoint
	services.NewXplaneService(
		datarefSvc,
		xplaneLogger,
	)
}
