package routes

import (
	"apps/core/utils/logger"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

type StaticRoutes struct {
	logger logger.Logger
	gin    *gin.Engine
	path   string
}

func NewStaticRoutes(logger logger.Logger, gin *gin.Engine, path string) StaticRoutes {
	return StaticRoutes{
		logger: logger,
		gin:    gin,
		path:   path,
	}
}

func (o StaticRoutes) Setup() {
	o.logger.Info("Setting up routes")
	o.gin.Use(static.Serve("/", static.LocalFile(o.path, false)))
}
