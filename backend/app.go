package backend

import (
	"database/sql"
	_ "embed"
	"errors"
	"fmt"
	"pal/backend/database"
	"pal/backend/database/repositories"
	"pal/backend/logging"
	"pal/backend/services"
	"pal/backend/weather"
	"pal/backend/workers"
	"pal/backend/workspace"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
)

//go:embed resources/db/db.sqlite
var dbFS []byte

type App struct {
	db                     *sql.DB
	Logger                 *logging.Logger
	LocationService        *services.LocationService
	UserPreferenceService  *services.UserPreferenceService
	ApplicationInfoService *services.ApplicationInfoService
	WeatherService         *services.WeatherService
	TimerService           *services.TimerService
	NotificationService    *services.NotificationService
}

func New(appName string, appVersion string) (*App, error) {
	if appName == "" || appVersion == "" {
		return nil, errors.New("app name or version cannot be empty")
	}

	// initialize workspace
	workspace, err := workspace.New(appName)
	if err != nil {
		return nil, err
	}

	// initialize logger
	logger, err := logging.New(workspace.Dirs.Logs)
	if err != nil {
		return nil, err
	}

	// sync embedded db to disk
	err = workspace.SyncEmbeddedDb(dbFS, appName)
	if err != nil {
		return nil, fmt.Errorf("error syncing resources: %w", err)
	}

	// connect to database
	dbName := strings.ToLower(appName) + ".sqlite"
	dbPath := filepath.Join(workspace.Dirs.Db, dbName)
	db, err := database.Open(dbPath)
	if err != nil {
		return nil, fmt.Errorf("error connecting database: %w", err)
	}

	// apply db migration
	err = database.Migrate(db)
	if err != nil {
		return nil, fmt.Errorf("error applying database migrations: %w", err)
	}

	// providers
	weatherProvider := weather.NewWttrClient()

	// repositories
	userLocationRepo := repositories.NewUserLocationRepository(db)
	locationSearchRepo := repositories.NewLocationSearchRepository(db)
	userPreferenceRepo := repositories.NewUserPreferenceRepository(db)
	weatherRepo := repositories.NewWeatherRepository(db)
	timerRepo := repositories.NewTimerRepository(db)

	// services
	userPreferenceService := services.NewUserService(logger, *userPreferenceRepo)
	locationService := services.NewLocationService(
		logger,
		*locationSearchRepo,
		*userLocationRepo,
	)
	applicationInfoService := services.NewApplicationInfoService(appName, appVersion)
	weatherService := services.NewWeatherService(logger, weatherProvider, *userLocationRepo, *weatherRepo)
	timerService := services.NewTimerService(logger, *timerRepo)
	notificationService := services.NewNotificationService(logger, userPreferenceService)

	return &App{
		db:                     db,
		Logger:                 logger,
		LocationService:        locationService,
		UserPreferenceService:  userPreferenceService,
		ApplicationInfoService: applicationInfoService,
		WeatherService:         weatherService,
		TimerService:           timerService,
		NotificationService:    notificationService,
	}, nil
}

func (a *App) RegisterEventHandlers(app *application.App, window *application.WebviewWindow) {
	app.Event.OnApplicationEvent(events.Common.ApplicationStarted, func(*application.ApplicationEvent) {
		// refresh weather data of all users location periodically
		go workers.RefreshWeatherDataPeriodically(app, a.Logger, a.WeatherService)

		// track running timers
		go workers.TrackRunningTimers(
			app,
			a.Logger,
			a.TimerService,
			a.NotificationService,
		)
	})

	app.Event.On(services.TimerCompletedClickedEvent, func(e *application.CustomEvent) {
		window.Show()
		window.Focus()
	})
}

func (a *App) Close() {
	if a.db != nil {
		if err := a.db.Close(); err != nil {
			a.Logger.Error("error closing db", "err", err)
		}
	}

	a.Logger.Close()
}
