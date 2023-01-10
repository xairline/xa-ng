package main

import (
	"apps/core/services"
	"go.uber.org/fx"
)

const PollFeq = 20

var tracking bool

func main() {
}

func init() {
	myTstorage := services.NewTstorageService()
	services.NewXplaneService(myTstorage)

	go fx.New(services.Module).Run()
}
