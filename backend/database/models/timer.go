package models

import "time"

type TimerStatus string

const TimerStatusPaused TimerStatus = "paused"
const TimerStatusRunning TimerStatus = "running"
const TimerStatusCompleted TimerStatus = "completed"

type Timer struct {
	ID        int         `json:"id"`
	Name      *string     `json:"name"`
	Duration  int         `json:"duration"` // in seconds
	Status    TimerStatus `json:"status"`
	CreatedAt time.Time   `json:"created_at"`
	PausedAt  *time.Time  `json:"paused_at"`
	UpdatedAt time.Time   `json:"updated_at"`
}

func (ts TimerStatus) IsValid() bool {
	switch ts {
	case
		TimerStatusPaused,
		TimerStatusRunning,
		TimerStatusCompleted:
		return true
	default:
		return false
	}
}
