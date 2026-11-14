package services

import (
	"fmt"
	"pal/backend/database/models"
	"pal/backend/logging"
	"runtime"

	"github.com/wailsapp/wails/v3/pkg/services/notifications"
)

const (
	osLinux   = "linux"
	osWindows = "windows"
)

type NotificationService struct {
	logger                *logging.Logger
	notifier              *notifications.NotificationService
	userPreferenceService *UserPreferenceService
}

func NewNotificationService(
	logger *logging.Logger,
	notifier *notifications.NotificationService,
	userPreferenceService *UserPreferenceService,
) *NotificationService {
	authorized, err := notifier.CheckNotificationAuthorization()
	if err != nil {
		logger.Error("error checking notification authorization", "err", err)
	}

	if !authorized {
		authorized, err = notifier.RequestNotificationAuthorization()
		if err != nil {
			logger.Error("error requesting notification authorization", "err", err)
		}
	}

	return &NotificationService{
		logger:                logger,
		notifier:              notifier,
		userPreferenceService: userPreferenceService,
	}
}

func (n *NotificationService) SendTimerCompletedNotification(timer *models.Timer) error {
	if timer == nil {
		return nil
	}

	userPreference, err := n.userPreferenceService.GetUserPreference()
	if err != nil {
		n.logger.Error("error retrieving user preferences", "err", err)
		return nil
	}

	var sound *notifications.NotificationSound

	if userPreference.AlertSound {
		sound = getTimerSound()
	} else {
		sound = &notifications.NotificationSound{
			Silent: !userPreference.AlertSound,
		}
	}

	name := "Timer"
	if timer.Name != nil && *timer.Name != "" {
		name = *timer.Name
	}

	return n.notifier.SendNotification(
		notifications.NotificationOptions{
			ID:    fmt.Sprintf("timer-%d", timer.ID),
			Title: fmt.Sprintf("⏰ %s", name),
			Body:  "Time's up!",
			Sound: sound,
		},
	)
}

func getTimerSound() *notifications.NotificationSound {
	switch runtime.GOOS {
	case osLinux:
		return &notifications.NotificationSound{Name: "bell"}
	case osWindows:
		return &notifications.NotificationSound{Name: "Reminder"}
	default: // darwin
		return nil // system default sound
	}
}
