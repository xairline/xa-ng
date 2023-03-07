package utils

import (
	"apps/core/models"
	"apps/core/utils/logger"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	gorm_logger "gorm.io/gorm/logger"
	"path"
)

const dbFileName = "xws.dat"

func CreateDatabase(logger logger.Logger, myPath string, debug bool) (*gorm.DB, error) {
	dbFilePath := path.Join(myPath, "..", dbFileName)
	logger.Infof("DB file path: %s", dbFilePath)
	config := &gorm.Config{}
	if debug {
		config = &gorm.Config{Logger: gorm_logger.Default.LogMode(gorm_logger.Info)}
	}
	db, err := gorm.Open(sqlite.Open(dbFilePath), config)
	if err != nil {
		logger.Errorf("%+v", err)
		return nil, err
	}

	// Migrate the schema
	err = db.AutoMigrate(
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
