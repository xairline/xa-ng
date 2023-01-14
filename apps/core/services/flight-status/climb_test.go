package flight_status

import (
	"apps/core/models"
	"apps/core/utils/logger"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestFlightStatusService_ProcessDatarefClimb(t *testing.T) {
	var tests = []struct {
		name          string
		initSvc       FlightStatusService
		datarefValues []models.DatarefValues
		expect        models.FlightState
	}{
		{
			name: "it should go from climb to cruise",
			initSvc: flightStatusService{
				FlightStatus: &models.FlightStatus{
					CurrentState:  models.FlightStateTakeoff,
					PollFrequency: 3,
					Events:        nil,
					FlightInfo:    models.FlightInfo{},
				},
				cruiseCounter:  new(int),
				climbCounter:   new(int),
				descendCounter: new(int),
				Logger:         logger.NewGenericLogger(),
			},
			datarefValues: []models.DatarefValues{
				map[string]models.DatarefValue{
					"vs": {
						Value: 400.0,
					},
					"ts": {
						Value: 1.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": {
						Value: 700.0,
					},
					"ts": {
						Value: 1.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": {
						Value: 400.0,
					},
					"ts": {
						Value: 1.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": {
						Value: 400.0,
					},
					"ts": {
						Value: 1.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": {
						Value: 400.0,
					},
					"ts": {
						Value: 1.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": {
						Value: 400.0,
					},
					"ts": {
						Value: 1.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": {
						Value: 400.0,
					},
					"ts": {
						Value: 1.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": {
						Value: 400.0,
					},
					"ts": {
						Value: 1.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": {
						Value: 400.0,
					},
					"ts": {
						Value: 1.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": {
						Value: 400.0,
					},
					"ts": {
						Value: 1.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": {
						Value: 400.0,
					},
					"ts": {
						Value: 1.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": {
						Value: 400.0,
					},
					"ts": {
						Value: 1.0,
					},
				},
			},
			expect: models.FlightStateCruise,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			for _, datarefValues := range tt.datarefValues {
				tt.initSvc.processDatarefClimb(datarefValues)
			}
			assert.Equal(t, tt.initSvc.GetFlightStatus().CurrentState, tt.expect)
		})
	}
}
