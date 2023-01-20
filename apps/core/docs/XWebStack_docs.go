// Package docs GENERATED BY SWAG; DO NOT EDIT
// This file was generated by swaggo/swag
package docs

import "github.com/swaggo/swag"

const docTemplateXWebStack = `{
    "schemes": {{ marshal .Schemes }},
    "swagger": "2.0",
    "info": {
        "description": "{{escape .Description}}",
        "title": "{{.Title}}",
        "contact": {},
        "version": "{{.Version}}"
    },
    "host": "{{.Host}}",
    "basePath": "{{.BasePath}}",
    "paths": {
        "/flight-logs": {
            "get": {
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Flight_Logs"
                ],
                "summary": "Get a list of FlightLogs",
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "type": "array",
                            "items": {
                                "$ref": "#/definitions/models.FlightStatus"
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error",
                        "schema": {
                            "$ref": "#/definitions/ResponseError"
                        }
                    }
                }
            }
        },
        "/flight-logs/{id}": {
            "get": {
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Flight_Logs"
                ],
                "summary": "Get one FlightLog",
                "parameters": [
                    {
                        "type": "string",
                        "description": "id of a flight log item",
                        "name": "id",
                        "in": "path",
                        "required": true
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/models.FlightStatus"
                        }
                    },
                    "404": {
                        "description": "Not Found"
                    }
                }
            }
        },
        "/flight-logs/{id}/events": {
            "get": {
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Flight_Logs"
                ],
                "summary": "Get events of a Flight",
                "parameters": [
                    {
                        "type": "string",
                        "description": "id of a flight log item",
                        "name": "id",
                        "in": "path",
                        "required": true
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "type": "array",
                            "items": {
                                "$ref": "#/definitions/models.FlightStatusEvent"
                            }
                        }
                    },
                    "501": {
                        "description": "Not Implemented"
                    }
                }
            }
        },
        "/flight-logs/{id}/landing": {
            "get": {
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Flight_Logs"
                ],
                "summary": "Get landing data of a Flight",
                "parameters": [
                    {
                        "type": "string",
                        "description": "id of a flight log item",
                        "name": "id",
                        "in": "path",
                        "required": true
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "type": "array",
                            "items": {
                                "$ref": "#/definitions/models.FlightStatusEvent"
                            }
                        }
                    },
                    "501": {
                        "description": "Not Implemented"
                    }
                }
            }
        },
        "/xplm/dataref": {
            "get": {
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "XPLM_Dataref"
                ],
                "summary": "Get Dataref",
                "parameters": [
                    {
                        "type": "string",
                        "description": "xplane dataref string",
                        "name": "dataref_str",
                        "in": "query",
                        "required": true
                    },
                    {
                        "type": "string",
                        "description": "alias name, if not set, dataref_str will be used",
                        "name": "alias",
                        "in": "query"
                    },
                    {
                        "type": "integer",
                        "description": "-1: raw, 2: round up to two digits",
                        "name": "precision",
                        "in": "query",
                        "required": true
                    },
                    {
                        "type": "boolean",
                        "description": "transform xplane byte array to string",
                        "name": "is_byte_array",
                        "in": "query"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/models.DatarefValue"
                        }
                    },
                    "500": {
                        "description": "Internal Server Error",
                        "schema": {
                            "$ref": "#/definitions/ResponseError"
                        }
                    }
                }
            },
            "put": {
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "XPLM_Dataref"
                ],
                "summary": "Set Dataref",
                "responses": {
                    "501": {
                        "description": "Not Implemented"
                    }
                }
            }
        },
        "/xplm/datarefs": {
            "put": {
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "XPLM_Dataref"
                ],
                "summary": "Set a list of Dataref",
                "responses": {
                    "501": {
                        "description": "Not Implemented"
                    }
                }
            },
            "post": {
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "XPLM_Dataref"
                ],
                "summary": "Get a list of Dataref",
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "type": "array",
                            "items": {
                                "$ref": "#/definitions/models.DatarefValue"
                            }
                        }
                    },
                    "501": {
                        "description": "Not Implemented"
                    }
                }
            }
        }
    },
    "definitions": {
        "ResponseError": {
            "type": "object",
            "properties": {
                "message": {
                    "type": "string"
                }
            }
        },
        "dataAccess.DataRefType": {
            "type": "integer",
            "enum": [
                0,
                1,
                2,
                4,
                8,
                16,
                32
            ],
            "x-enum-varnames": [
                "TypeUnknown",
                "TypeInt",
                "TypeFloat",
                "TypeDouble",
                "TypeFloatArray",
                "TypeIntArray",
                "TypeData"
            ]
        },
        "gorm.DeletedAt": {
            "type": "object",
            "properties": {
                "time": {
                    "type": "string"
                },
                "valid": {
                    "description": "Valid is true if Time is not NULL",
                    "type": "boolean"
                }
            }
        },
        "models.DatarefValue": {
            "type": "object",
            "properties": {
                "dataref_type": {
                    "$ref": "#/definitions/dataAccess.DataRefType"
                },
                "name": {
                    "type": "string"
                },
                "value": {}
            }
        },
        "models.FlightInfo": {
            "type": "object",
            "properties": {
                "airportId": {
                    "type": "string"
                },
                "airportName": {
                    "type": "string"
                },
                "fuelWeight": {
                    "type": "number"
                },
                "time": {
                    "type": "number"
                },
                "totalWeight": {
                    "type": "number"
                }
            }
        },
        "models.FlightStatus": {
            "type": "object",
            "properties": {
                "aircraftDisplayName": {
                    "type": "string"
                },
                "aircraftICAO": {
                    "type": "string"
                },
                "arrivalFlightInfo": {
                    "$ref": "#/definitions/models.FlightInfo"
                },
                "createdAt": {
                    "type": "string"
                },
                "deletedAt": {
                    "$ref": "#/definitions/gorm.DeletedAt"
                },
                "departureFlightInfo": {
                    "$ref": "#/definitions/models.FlightInfo"
                },
                "events": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/models.FlightStatusEvent"
                    }
                },
                "id": {
                    "type": "integer"
                },
                "locations": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/models.FlightStatusLocation"
                    }
                },
                "updatedAt": {
                    "type": "string"
                }
            }
        },
        "models.FlightStatusEvent": {
            "type": "object",
            "properties": {
                "createdAt": {
                    "type": "string"
                },
                "deletedAt": {
                    "$ref": "#/definitions/gorm.DeletedAt"
                },
                "description": {
                    "type": "string"
                },
                "eventType": {
                    "$ref": "#/definitions/models.FlightStatusEventType"
                },
                "extraData": {
                    "type": "string"
                },
                "flightId": {
                    "type": "integer"
                },
                "id": {
                    "type": "integer"
                },
                "timestamp": {
                    "type": "number"
                },
                "updatedAt": {
                    "type": "string"
                }
            }
        },
        "models.FlightStatusEventType": {
            "type": "string",
            "enum": [
                "event:state"
            ],
            "x-enum-varnames": [
                "StateEvent"
            ]
        },
        "models.FlightStatusLocation": {
            "type": "object",
            "properties": {
                "agl": {
                    "type": "number"
                },
                "altitude": {
                    "type": "number"
                },
                "createdAt": {
                    "type": "string"
                },
                "deletedAt": {
                    "$ref": "#/definitions/gorm.DeletedAt"
                },
                "flightId": {
                    "type": "integer"
                },
                "gearForce": {
                    "type": "number"
                },
                "gforce": {
                    "type": "number"
                },
                "ias": {
                    "type": "number"
                },
                "id": {
                    "type": "integer"
                },
                "isLanding": {
                    "type": "boolean"
                },
                "lat": {
                    "type": "number"
                },
                "lng": {
                    "type": "number"
                },
                "timestamp": {
                    "type": "number"
                },
                "updatedAt": {
                    "type": "string"
                },
                "vs": {
                    "type": "number"
                }
            }
        }
    }
}`

// SwaggerInfoXWebStack holds exported Swagger Info so clients can modify it
var SwaggerInfoXWebStack = &swag.Spec{
	Version:          "",
	Host:             "",
	BasePath:         "/apis",
	Schemes:          []string{},
	Title:            "",
	Description:      "",
	InfoInstanceName: "XWebStack",
	SwaggerTemplate:  docTemplateXWebStack,
}

func init() {
	swag.Register(SwaggerInfoXWebStack.InstanceName(), SwaggerInfoXWebStack)
}
