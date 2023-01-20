package utils

import (
	"apps/core/models"
	"apps/core/utils/logger"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"path"
)

const dbFileName = "xws.dat"

func CreateDatabase(logger logger.Logger, myPath string) (*gorm.DB, error) {
	dbFilePath := path.Join(myPath, dbFileName)
	logger.Infof("DB file path: %s", dbFilePath)
	db, err := gorm.Open(sqlite.Open(dbFilePath), &gorm.Config{})
	if err != nil {
		logger.Errorf("%+v", err)
		return nil, err
	}

	// Migrate the schema
	err = db.AutoMigrate(
		&models.FlightStatusEvent{},
		&models.FlightStatus{},
		&models.FlightStatusLocation{},
	)
	if err != nil {
		logger.Errorf("%+v", err)
		return nil, err
	}
	logger.Infof("created/connected to database: %s/%s", myPath, dbFileName)
	return db, err
}
