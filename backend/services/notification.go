package services

import (
	"context"
	"fmt"
	"pal/backend/database/models"
	"pal/backend/logging"
	"runtime"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/services/notifications"
)

const (
	osLinux                    = "linux"
	osWindows                  = "windows"
	TimerCompleted             = "timer-completed"
	TimerCompletedClickedEvent = "notification:timer-completed:clicked"
)

type NotificationService struct {
	logger                *logging.Logger
	event                 *application.EventManager
	notifier              *notifications.NotificationService
	userPreferenceService *UserPreferenceService
}

func NewNotificationService(
	logger *logging.Logger,
	userPreferenceService *UserPreferenceService,
) *NotificationService {
	notifier := notifications.New()

	return &NotificationService{
		logger:                logger,
		notifier:              notifier,
		userPreferenceService: userPreferenceService,
	}
}

func (n *NotificationService) ServiceStartup(ctx context.Context, opts application.ServiceOptions) error {
	n.event = application.Get().Event

	if err := n.notifier.ServiceStartup(ctx, opts); err != nil {
		return fmt.Errorf("error starting notifier: %w", err)
	}

	authorized, err := n.notifier.CheckNotificationAuthorization()
	if err != nil {
		n.logger.Error("error checking notification authorization", "err", err)
	}

	if !authorized {
		authorized, err = n.notifier.RequestNotificationAuthorization()
		if err != nil {
			n.logger.Error("error requesting notification authorization", "err", err)
		}
	}

	n.notifier.OnNotificationResponse(func(result notifications.NotificationResult) {
		if result.Error != nil {
			n.logger.Error("notification response error", "err", result.Error)
			return
		}
		if result.Response.ActionIdentifier != notifications.DefaultActionIdentifier {
			return
		}

		kind, exists := result.Response.UserInfo["type"]
		if !exists {
			return
		}

		switch kind {
		case TimerCompleted:
			n.event.Emit(TimerCompletedClickedEvent, result.Response.ID)
		default:
			return
		}
	})

	return nil
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
			Data: map[string]interface{}{
				"type": TimerCompleted,
			},
		},
	)
}

func (n *NotificationService) ServiceShutdown() error {
	return n.notifier.ServiceShutdown()
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
