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
	"pal/backend/workspace"
	"path/filepath"
	"strings"
)

//go:embed resources/db/db.sqlite
var dbFS []byte

type App struct {
	Logger                 *logging.Logger
	db                     *sql.DB
	LocationService        *services.LocationService
	UserPreferenceService  *services.UserPreferenceService
	ApplicationInfoService *services.ApplicationInfoService
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
		return nil, fmt.Errorf("error connection database: %w", err)
	}

	// initialize repositories
	userLocationRepo := repositories.NewUserLocationRepository(db)
	locationSearchRepo := repositories.NewLocationSearchRepository(db)
	userPreferenceRepo := repositories.NewUserPreferenceRepository(db)

	// initialize services
	userPreferenceService := services.NewUserService(logger, *userPreferenceRepo)
	locationService := services.NewLocationService(
		logger,
		*locationSearchRepo,
		*userLocationRepo,
	)
	applicationInfoService := services.NewApplicationInfoService(appName, appVersion)

	return &App{
		Logger:                 logger,
		db:                     db,
		LocationService:        locationService,
		UserPreferenceService:  userPreferenceService,
		ApplicationInfoService: applicationInfoService,
	}, nil
}

func (a *App) Close() {
	if a.db != nil {
		if err := a.db.Close(); err != nil {
			a.Logger.Error("error closing db: " + err.Error())
		}
	}

	a.Logger.Close()
}
