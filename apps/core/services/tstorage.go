package services

//go:generate mockgen -destination=./__mocks__/tstorage.go -package=mocks -source=tstorage.go

import (
	"apps/core/models"
	"github.com/nakabonne/tstorage"
	"github.com/xairline/goplane/extra/logging"
	"os"
	"sync"
	"time"
)

var tstorageSvcLock = &sync.Mutex{}
var tstorageSvc TstorageService

type TstorageService interface {
	Close() error
	Insert(datarefValues []models.DatarefValue, timestamp int) error
}

type tstorageService struct {
	Storage tstorage.Storage
}

func (t tstorageService) Insert(datarefValues []models.DatarefValue, timestamp int) error {
	//todo: batch insert
	var rows []tstorage.Row
	for _, value := range datarefValues {
		rows = append(rows, tstorage.Row{
			Metric: value.Name,
			Labels: nil,
			DataPoint: tstorage.DataPoint{
				//Value:     value.Value,
				Timestamp: int64(timestamp),
			},
		})
	}
	return t.Storage.InsertRows(rows)
}

func NewTstorageService() TstorageService {
	if tstorageSvc != nil {
		logging.Info("Storage SVC has been initialized already")
		return tstorageSvc
	} else {
		logging.Info("Storage SVC: initializing")
		tstorageSvcLock.Lock()
		defer tstorageSvcLock.Unlock()
		storageDuration, _ := time.ParseDuration("1h")
		myTstorage, err := tstorage.NewStorage(
			tstorage.WithDataPath(os.Getenv("HOME")+"/.xairline/data"),
			tstorage.WithPartitionDuration(storageDuration),
			tstorage.WithTimestampPrecision(tstorage.Milliseconds),
		)
		if err != nil {
			logging.Errorf("Failed initialize TS storage: %+v", err)
		}
		logging.Infof("Initialized TS storage: %s", os.Getenv("HOME")+"/.xairline/data")
		tstorageSvc = tstorageService{
			Storage: myTstorage,
		}
		return tstorageSvc
	}

}
func (t tstorageService) Close() error {
	return t.Storage.Close()
}
