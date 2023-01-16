package utils

import (
	"apps/core/models"
	"apps/core/utils/logger"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

const dbFileName = "xws.dat"

func CreateDatabase(logger logger.Logger, path string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(path+dbFileName), &gorm.Config{})
	if err != nil {
		logger.Errorf("%+v", err)
		return nil, err
	}

	// Migrate the schema
	err = db.AutoMigrate(&models.FlightStatusEvent{}, &models.FlightStatus{})
	if err != nil {
		logger.Errorf("%+v", err)
		return nil, err
	}
	logger.Infof("created/connected to database: %s/%s", path, dbFileName)
	return db, err
}
