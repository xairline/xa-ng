package services

//go:generate mockgen -destination=./__mocks__/xplane.go -package=mocks -source=xplane.go

import (
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
  Plugin      *extra.XPlanePlugin
  TstorageSvc TstorageService
}

var xplaneSvcLock = &sync.Mutex{}
var xplaneSvc XplaneService

func NewXplaneService(tstorageSvc TstorageService) XplaneService {
  if xplaneSvc != nil {
    logging.Info("Xplane SVC has been initialized already")
    return xplaneSvc
  } else {
    logging.Info("Xplane SVC: initializing")
    xplaneSvcLock.Lock()
    defer xplaneSvcLock.Unlock()
    xplaneSvc := xplaneService{
      Plugin:      extra.NewPlugin("X Airline NG", "com.github.xairline.xa-ng", "X Airline NG"),
      TstorageSvc: tstorageSvc,
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
    logging.Infof("Plugin: %s enabled", plugin.GetName())
  case extra.PluginDisable:
    logging.Infof("Plugin: %s disabled", plugin.GetName())
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
  go func() {
    err := r.Run(":8080")
    if err != nil {
      logging.Errorf("Failed to start gin server, %v", err)
    }
  }()
  processing.RegisterFlightLoopCallback(s.flightLoop, -1, nil)
}

func (s xplaneService) onPluginStop() {
  defer s.TstorageSvc.Close()
  logging.Info("Plugin stopped")
}

func (s xplaneService) flightLoop(elapsedSinceLastCall, elapsedTimeSinceLastFlightLoop float32, counter int, ref interface{}) float32 {
  logging.Infof("Flight loop:%f", elapsedSinceLastCall)
  return -1
}
