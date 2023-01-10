package main

import (
	"apps/core/services"
	"os"
	"time"

	"github.com/nakabonne/tstorage"
	"github.com/xairline/goplane/extra/logging"
)

const PollFeq = 20

var tracking bool

func main() {
}

func init() {
	// setup storage
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

	xplaneSvc := services.NewXplaneService(myTstorage)

	logging.Infof("Plugin Version: %s", xplaneSvc.GetVersion())
}
