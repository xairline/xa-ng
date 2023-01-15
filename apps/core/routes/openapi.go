package routes

import (
	"apps/core/docs"
	"apps/core/utils/logger"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

type OpenAPIRoutes struct {
	logger logger.Logger
	gin    *gin.Engine
}

func NewOpenAPIRoutes(logger logger.Logger, gin *gin.Engine) OpenAPIRoutes {
	return OpenAPIRoutes{
		logger: logger,
		gin:    gin,
	}
}

func (o OpenAPIRoutes) Setup() {
	o.logger.Info("Setting up routes")
	docs.SwaggerInfoMarketplace.Title = "X Marketplace"
	o.gin.GET("/api-docs/*any", ginSwagger.WrapHandler(
		swaggerFiles.Handler,
		ginSwagger.DocExpansion("none"),
		ginSwagger.InstanceName("Marketplace"),
	))
}
