// Code generated by MockGen. DO NOT EDIT.
// Source: dataref.go

// Package mocks is a generated GoMock package.
package mocks

import (
	models "apps/core/models"
	reflect "reflect"

	gomock "github.com/golang/mock/gomock"
)

// MockDatarefService is a mock of DatarefService interface.
type MockDatarefService struct {
	ctrl     *gomock.Controller
	recorder *MockDatarefServiceMockRecorder
}

// MockDatarefServiceMockRecorder is the mock recorder for MockDatarefService.
type MockDatarefServiceMockRecorder struct {
	mock *MockDatarefService
}

// NewMockDatarefService creates a new mock instance.
func NewMockDatarefService(ctrl *gomock.Controller) *MockDatarefService {
	mock := &MockDatarefService{ctrl: ctrl}
	mock.recorder = &MockDatarefServiceMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockDatarefService) EXPECT() *MockDatarefServiceMockRecorder {
	return m.recorder
}

// GetCurrentValues mocks base method.
func (m *MockDatarefService) GetCurrentValues() models.DatarefValues {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetCurrentValues")
	ret0, _ := ret[0].(models.DatarefValues)
	return ret0
}

// GetCurrentValues indicates an expected call of GetCurrentValues.
func (mr *MockDatarefServiceMockRecorder) GetCurrentValues() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetCurrentValues", reflect.TypeOf((*MockDatarefService)(nil).GetCurrentValues))
}

// GetNearestAirport mocks base method.
func (m *MockDatarefService) GetNearestAirport() (string, string) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetNearestAirport")
	ret0, _ := ret[0].(string)
	ret1, _ := ret[1].(string)
	return ret0, ret1
}

// GetNearestAirport indicates an expected call of GetNearestAirport.
func (mr *MockDatarefServiceMockRecorder) GetNearestAirport() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetNearestAirport", reflect.TypeOf((*MockDatarefService)(nil).GetNearestAirport))
}

// GetValueByDatarefName mocks base method.
func (m *MockDatarefService) GetValueByDatarefName(dataref, name string, precision *int8, isByteArray bool) models.DatarefValue {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetValueByDatarefName", dataref, name, precision, isByteArray)
	ret0, _ := ret[0].(models.DatarefValue)
	return ret0
}

// GetValueByDatarefName indicates an expected call of GetValueByDatarefName.
func (mr *MockDatarefServiceMockRecorder) GetValueByDatarefName(dataref, name, precision, isByteArray interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetValueByDatarefName", reflect.TypeOf((*MockDatarefService)(nil).GetValueByDatarefName), dataref, name, precision, isByteArray)
}

// getCurrentValue mocks base method.
func (m *MockDatarefService) getCurrentValue(datarefExt *models.DatarefExt) models.DatarefValue {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "getCurrentValue", datarefExt)
	ret0, _ := ret[0].(models.DatarefValue)
	return ret0
}

// getCurrentValue indicates an expected call of getCurrentValue.
func (mr *MockDatarefServiceMockRecorder) getCurrentValue(datarefExt interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "getCurrentValue", reflect.TypeOf((*MockDatarefService)(nil).getCurrentValue), datarefExt)
}
