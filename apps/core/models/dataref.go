package models

import "github.com/xairline/goplane/xplm/dataAccess"

type Dataref struct {
	Name         string `yaml:"name"`
	DatarefStr   string `yaml:"value"`
	Precision    int8   `yaml:"precision,omitempty"`
	IsBytesArray bool   `yaml:"isBytesArray,omitempty"`
}

type DatarefExt struct {
	Name         string
	Dataref      dataAccess.DataRef
	DatarefType  dataAccess.DataRefType
	Precision    *int8
	IsBytesArray bool
}

type DatarefValue struct {
	Name        string
	DatarefType dataAccess.DataRefType
	Value       interface{}
}

type DatarefValues map[string]DatarefValue
