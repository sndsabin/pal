package models

import "time"

type TimeFormat string

const (
	TimeFormat12Hour TimeFormat = "12hr"
	TimeFormat24Hour TimeFormat = "24hr"
)

type UserPreference struct {
	ID         int        `json:"id"`
	TimeFormat TimeFormat `json:"time_format"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

func (tf TimeFormat) IsValid() bool {
	switch tf {
	case TimeFormat12Hour,
		TimeFormat24Hour:
		return true
	default:
		return false
	}
}
