package flight_status

import (
	"apps/core/models"
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
					PollFrequency: 0.2,
					Events:        nil,
					FlightInfo:    models.FlightInfo{},
				},
				cruiseCounter: new(int),
			},
			datarefValues: []models.DatarefValues{
				map[string]models.DatarefValue{
					"vs": models.DatarefValue{
						Value: 400.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": models.DatarefValue{
						Value: 400.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": models.DatarefValue{
						Value: 400.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": models.DatarefValue{
						Value: 400.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": models.DatarefValue{
						Value: 400.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": models.DatarefValue{
						Value: 400.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": models.DatarefValue{
						Value: 400.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": models.DatarefValue{
						Value: 400.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": models.DatarefValue{
						Value: 400.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": models.DatarefValue{
						Value: 400.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": models.DatarefValue{
						Value: 400.0,
					},
				},
				map[string]models.DatarefValue{
					"vs": models.DatarefValue{
						Value: 400.0,
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
			//assert.Equal(t, tt.initSvc.)
		})
	}
}
