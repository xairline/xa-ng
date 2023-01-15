package services

//go:generate mockgen -destination=./__mocks__/xplane.go -package=mocks -source=xplane.go

import (
	"apps/core/services/dataref"
	"apps/core/services/flight-status"
	"apps/core/utils/logger"
	"github.com/gin-gonic/gin"
	"github.com/xairline/goplane/extra"
	"github.com/xairline/goplane/extra/logging"
	"github.com/xairline/goplane/xplm/plugins"
	"github.com/xairline/goplane/xplm/processing"
	"github.com/xairline/goplane/xplm/utilities"
	"path/filepath"
	"sync"
)

type XplaneService interface {
	// init
	onPluginStateChanged(state extra.PluginState, plugin *extra.XPlanePlugin)
	onPluginStart()
	onPluginStop()
	// flight loop
	flightLoop(elapsedSinceLastCall, elapsedTimeSinceLastFlightLoop float32, counter int, ref interface{}) float32
}

type xplaneService struct {
	Plugin              *extra.XPlanePlugin
	DatarefSvc          dataref.DatarefService
	FlightStatusService flight_status.FlightStatusService
	Logger              logger.Logger
}

var xplaneSvcLock = &sync.Mutex{}
var xplaneSvc XplaneService

func NewXplaneService(
	datarefSvc dataref.DatarefService,
	flightStatusSvc flight_status.FlightStatusService,
	logger logger.Logger,
) XplaneService {
	if xplaneSvc != nil {
		logger.Info("Xplane SVC has been initialized already")
		return xplaneSvc
	} else {
		logger.Info("Xplane SVC: initializing")
		xplaneSvcLock.Lock()
		defer xplaneSvcLock.Unlock()
		xplaneSvc := xplaneService{
			Plugin:              extra.NewPlugin("X Airline Marketplace", "com.github.xairline.xa-ng", "A plugin enables Frontend developer to contribute to xplane"),
			DatarefSvc:          datarefSvc,
			FlightStatusService: flightStatusSvc,
			Logger:              logger,
		}
		xplaneSvc.Plugin.SetPluginStateCallback(xplaneSvc.onPluginStateChanged)
		plugins.EnableFeature("XPLM_USE_NATIVE_PATHS", true)
		logging.MinLevel = logging.Info_Level
		return xplaneSvc
	}
}

func (s xplaneService) onPluginStateChanged(state extra.PluginState, plugin *extra.XPlanePlugin) {
	switch state {
	case extra.PluginStart:
		s.onPluginStart()
	case extra.PluginStop:
		s.onPluginStop()
	case extra.PluginEnable:
		s.Logger.Infof("Plugin: %s enabled", plugin.GetName())
	case extra.PluginDisable:
		s.Logger.Infof("Plugin: %s disabled", plugin.GetName())
	}
}

func (s xplaneService) onPluginStart() {
	s.Logger.Info("Plugin started")

	// get plugin path
	systemPath := utilities.GetSystemPath()
	pluginPath := filepath.Join(systemPath, "Resources", "plugins", "xairline")
	s.Logger.Infof("Plugin path: %s", pluginPath)

	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		s.Logger.Info("ping")
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	go func() {
		err := r.Run(":8080")
		if err != nil {
			s.Logger.Errorf("Failed to start gin server, %v", err)
		}
	}()
	processing.RegisterFlightLoopCallback(s.flightLoop, -1, nil)
}

func (s xplaneService) onPluginStop() {
	s.Logger.Info("Plugin stopped")
}

func (s xplaneService) flightLoop(elapsedSinceLastCall, elapsedTimeSinceLastFlightLoop float32, counter int, ref interface{}) float32 {
	datarefValues := s.DatarefSvc.GetCurrentValues()
	return s.FlightStatusService.ProcessDataref(datarefValues)
}
