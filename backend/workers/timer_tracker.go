package workers

import (
	"pal/backend/logging"
	"pal/backend/services"
	"time"

	"github.com/wailsapp/wails/v3/pkg/application"
)

var timerCompletedEvent = "timer:completed"

func TrackRunningTimers(
	app *application.App,
	logger *logging.Logger,
	timerService *services.TimerService,
	notificationService *services.NotificationService,
) {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			runningTimers, err := timerService.GetRunningTimers()
			if err != nil {
				logger.Error("error fetching running timers", "err", err)
				continue
			}

			now := time.Now()

			for _, timer := range runningTimers {
				finishedAt := timer.CreatedAt.Add(time.Duration(timer.Duration) * time.Second)

				if !now.Before(finishedAt) {
					result, err := timerService.CompleteTimer(timer.ID)
					if err != nil {
						logger.Error("error completing timers", "id", timer.ID, "err", err)
						continue
					}

					app.Event.Emit(timerCompletedEvent, result)

					if err := notificationService.SendTimerCompletedNotification(timer); err != nil {
						logger.Error("error sending timer completed notification", "err", err)
					}
				}
			}

		case <-app.Context().Done():
			return
		}
	}
}
