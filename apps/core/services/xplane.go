package services

//go:generate mockgen -destination=../mocks/services/xplane.go -package=mocks -source=xplane.go

import (
	"github.com/gin-gonic/gin"
	"github.com/nakabonne/tstorage"
	"github.com/xairline/goplane/extra"
	"github.com/xairline/goplane/extra/logging"
	"github.com/xairline/goplane/xplm/plugins"
	"github.com/xairline/goplane/xplm/processing"
	"github.com/xairline/goplane/xplm/utilities"
	"path/filepath"
	"sync"
)

type XplaneService interface {
	onPluginStateChanged(state extra.PluginState, plugin *extra.XPlanePlugin)
	onPluginStart()
	onPluginStop()
	onPluginEnable()
	onPluginDisable()
	flightLoop(elapsedSinceLastCall, elapsedTimeSinceLastFlightLoop float32, counter int, ref interface{}) float32
	GetVersion() string
}

type xplaneService struct {
	Plugin *extra.XPlanePlugin
	Tstore tstorage.Storage
}

var lock = &sync.Mutex{}
var xplaneSvc XplaneService

func NewXplaneService(tstorage tstorage.Storage) XplaneService {
	if xplaneSvc != nil {
		return xplaneSvc
	} else {
		lock.Lock()
		defer lock.Unlock()
		svc := xplaneService{
			Plugin: extra.NewPlugin("X Airline NG", "com.github.xairline.xa-ng", "X Airline NG"),
			Tstore: tstorage,
		}
		svc.Plugin.SetPluginStateCallback(svc.onPluginStateChanged)
		plugins.EnableFeature("XPLM_USE_NATIVE_PATHS", true)
		logging.MinLevel = logging.Info_Level
		return svc
	}
}

func (s xplaneService) GetVersion() string {
	return "development"
}

func (s xplaneService) onPluginStateChanged(state extra.PluginState, plugin *extra.XPlanePlugin) {
	switch state {
	case extra.PluginStart:
		s.onPluginStart()
	case extra.PluginStop:
		s.onPluginStop()
	case extra.PluginEnable:
		s.onPluginEnable()
	case extra.PluginDisable:
		s.onPluginDisable()
	}
}

func (s xplaneService) onPluginStart() {
	logging.Info("Plugin started")

	// get plugin path
	systemPath := utilities.GetSystemPath()
	pluginPath := filepath.Join(systemPath, "Resources", "plugins", "xairline")
	logging.Infof("Plugin path: %s", pluginPath)

	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		logging.Info("ping")
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	go r.Run(":8080")
	processing.RegisterFlightLoopCallback(s.flightLoop, -1, nil)
}

func (s xplaneService) onPluginStop() {
	defer s.Tstore.Close()
	logging.Info("Plugin stopped")
}

func (s xplaneService) onPluginEnable() {
	logging.Info("Plugin enabled")
}

func (s xplaneService) onPluginDisable() {
	logging.Info("Plugin disabled")
}

func (s xplaneService) flightLoop(elapsedSinceLastCall, elapsedTimeSinceLastFlightLoop float32, counter int, ref interface{}) float32 {
	logging.Infof("Flight loop:%f", elapsedSinceLastCall)
	return -1
}
