package models

import "time"

type TimeFormat string
type TemperatureFormat string

const (
	TimeFormat12Hour            TimeFormat        = "12hr"
	TimeFormat24Hour            TimeFormat        = "24hr"
	TemperatureFormatCelcius    TemperatureFormat = "c"
	TemperatureFormatFahrenheit TemperatureFormat = "f"
)

type UserPreference struct {
	ID                int               `json:"id"`
	TimeFormat        TimeFormat        `json:"time_format"`
	TemperatureFormat TemperatureFormat `json:"temperature_format"`
	AlertSound        bool              `json:"alert_sound"`
	CreatedAt         time.Time         `json:"created_at"`
	UpdatedAt         time.Time         `json:"updated_at"`
}

func (timef TimeFormat) IsValid() bool {
	switch timef {
	case TimeFormat12Hour,
		TimeFormat24Hour:
		return true
	default:
		return false
	}
}

func (tempf TemperatureFormat) IsValid() bool {
	switch tempf {
	case TemperatureFormatCelcius,
		TemperatureFormatFahrenheit:
		return true
	default:
		return false
	}
}
