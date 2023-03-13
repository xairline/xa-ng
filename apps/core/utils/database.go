package utils

import (
	"apps/core/models"
	"apps/core/utils/logger"
	"fmt"
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
		&models.FlightStatusEvent{},
	)
	if err != nil {
		logger.Errorf("%+v", err)
		return nil, err
	}

	// manual migrate
	var res []map[string]interface{}
	var result *gorm.DB
	result = db.
		Select("flight_id", "event_type", "description", "timestamp").
		Table("flight_status_locations").
		Where("event_type <> ''").
		Find(&res)
	if result.Error != nil {
		logger.Errorf("Failed to get flight logs: %+v", result.Error)
	}
	var flightStatusEvents []models.FlightStatusEvent
	for _, v := range res {
		v := v
		flightStatusEvent := models.FlightStatusEvent{
			FlightId:    int(v["flight_id"].(int64)),
			EventType:   models.FlightStatusEventType(fmt.Sprintf("%v", v["event_type"])),
			Timestamp:   v["timestamp"].(float64),
			Description: fmt.Sprintf("%v", v["description"]),
		}
		flightStatusEvents = append(flightStatusEvents, flightStatusEvent)
	}
	db.CreateInBatches(&flightStatusEvents, 500)
	db.Migrator().DropColumn(&models.FlightStatusLocation{}, "event_type")
	db.Migrator().DropColumn(&models.FlightStatusLocation{}, "description")

	logger.Infof("created/connected to database: %s/%s", myPath, dbFileName)
	return db, err
}
