package workers

import (
	"pal/backend/logging"
	"pal/backend/services"
	"time"

	"github.com/wailsapp/wails/v3/pkg/application"
)

var (
	weatherRefreshedEvent      = "weather:refreshed"
	weatherDataRefreshInterval = 30 * time.Minute
)

func RefreshWeatherDataPeriodically(app *application.App, logger *logging.Logger, weatherService *services.WeatherService) {
	ticker := time.NewTicker(weatherDataRefreshInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			if err := weatherService.RefreshWeatherData(); err != nil {
				logger.Error("error refreshing weather data", "err", err)
				continue
			}
			app.Event.Emit(weatherRefreshedEvent)

		case <-app.Context().Done():
			return
		}
	}
}
