package repositories

import (
	"context"
	"database/sql"
	"errors"
	"pal/backend/database/models"
	"strings"
	"time"
)

type WeatherRepository struct {
	db *sql.DB
}

func NewWeatherRepostiory(db *sql.DB) *WeatherRepository {
	return &WeatherRepository{
		db: db,
	}
}

func (w *WeatherRepository) GetCurrentWeather(locationIds []int) ([]*models.CurrentWeather, error) {
	if len(locationIds) == 0 {
		return nil, errors.New("invalid location ids provided")
	}

	ctx, cancel := context.WithTimeout(context.Background(), QueryTimeoutDuration)
	defer cancel()

	placeholders := make([]string, len(locationIds))
	args := make([]any, len(locationIds))

	for i, locationId := range locationIds {
		placeholders[i] = "?"
		args[i] = locationId
	}

	query := `
		SELECT
			id,
			location_id,
			description,
			temperature,
			feels_like,
			condition,
			icon,
			created_at,
			updated_at
		FROM current_weather
		WHERE location_id IN (` + strings.Join(placeholders, ",") + `);
	`

	rows, err := w.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var currentWeatherData []*models.CurrentWeather

	for rows.Next() {
		var currentWeather models.CurrentWeather

		err := rows.Scan(
			&currentWeather.ID,
			&currentWeather.LocationID,
			&currentWeather.Description,
			&currentWeather.Temperature,
			&currentWeather.FeelsLike,
			&currentWeather.Condition,
			&currentWeather.Icon,
			&currentWeather.CreatedAt,
			&currentWeather.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		currentWeatherData = append(currentWeatherData, &currentWeather)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return currentWeatherData, nil
}

func (w *WeatherRepository) GetHourlyWeather(locationId int) ([]*models.HourlyWeather, error) {
	ctx, cancel := context.WithTimeout(context.Background(), QueryTimeoutDuration)
	defer cancel()

	query := `
		SELECT
			id,
			location_id,
			description,
			temperature,
			feels_like,
			condition,
			icon,
			forecast_at,
			created_at,
			updated_at
		FROM hourly_weather
		WHERE DATE(forecast_at) = DATE('now') AND
		location_id = $1
		ORDER BY forecast_at ASC;
	`

	rows, err := w.db.QueryContext(ctx, query, locationId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanHourlyWeather(rows)
}

func (w *WeatherRepository) SaveWeather(current models.CurrentWeather, hourly []models.HourlyWeather) (*models.WeatherData, error) {
	ctx, cancel := context.WithTimeout(context.Background(), QueryTimeoutDuration)
	defer cancel()

	tx, err := w.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	currentWeather, err := w.upsertCurrentWeather(ctx, tx, current)
	if err != nil {
		return nil, err
	}

	hourlyWeather, err := w.upsertHourlyWeather(ctx, tx, hourly)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	if currentWeather == nil || hourlyWeather == nil {
		return nil, errors.New("current weather data or hourly weather data is empty")
	}

	var result models.WeatherData

	result = models.WeatherData{
		Current: currentWeather,
		Hourly:  hourlyWeather,
	}

	return &result, nil
}

func (w *WeatherRepository) CleanupHourlyWeather(locationId int) error {
	ctx, cancel := context.WithTimeout(context.Background(), QueryTimeoutDuration)
	defer cancel()

	query := `
		DELETE FROM hourly_weather
		WHERE location_id = $1
		AND forecast_at < $2;
	`

	_, err := w.db.ExecContext(
		ctx,
		query,
		locationId,
		time.Now().Unix(),
	)
	if err != nil {
		return err
	}

	return nil
}

func (w *WeatherRepository) upsertCurrentWeather(ctx context.Context, tx *sql.Tx, weather models.CurrentWeather) (*models.CurrentWeather, error) {
	query := `
		INSERT INTO current_weather
		(
			location_id,
			description,
			temperature,
			feels_like,
			condition,
			icon
		)
		VALUES (
			$1, $2, $3, $4, $5, $6
		)
		ON CONFLICT(location_id) DO UPDATE SET
			description=excluded.description,
			temperature=excluded.temperature,
			feels_like=excluded.feels_like,
			condition=excluded.condition,
			icon=excluded.icon
		RETURNING 
			id,
			location_id,
			description,
			temperature,
			feels_like,
			condition,
			icon,
			created_at,
			updated_at
		;
	`

	var currentWeather models.CurrentWeather

	err := tx.QueryRowContext(
		ctx,
		query,
		weather.LocationID,
		weather.Description,
		weather.Temperature,
		weather.FeelsLike,
		weather.Condition,
		weather.Icon,
	).Scan(
		&currentWeather.ID,
		&currentWeather.LocationID,
		&currentWeather.Description,
		&currentWeather.Temperature,
		&currentWeather.FeelsLike,
		&currentWeather.Condition,
		&currentWeather.Icon,
		&currentWeather.CreatedAt,
		&currentWeather.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &currentWeather, nil
}

func (w *WeatherRepository) upsertHourlyWeather(ctx context.Context, tx *sql.Tx, weather []models.HourlyWeather) ([]*models.HourlyWeather, error) {
	if len(weather) == 0 {
		return nil, errors.New("weather data is empty")
	}

	query := `
		INSERT INTO hourly_weather
		(
			location_id,
			description,
			temperature,
			feels_like,
			condition,
			icon,
			forecast_at
		)
		VALUES
	`

	args := make([]any, 0, len(weather)*6)

	for i, data := range weather {
		if i != len(weather)-1 {
			query += "(?, ?, ?, ?, ?, ?, ?),"
		} else {
			query += "(?, ?, ?, ?, ?, ?, ?)"
		}

		args = append(args,
			data.LocationID,
			data.Description,
			data.Temperature,
			data.FeelsLike,
			data.Condition,
			data.Icon,
			data.ForecastAt,
		)
	}

	query += `
		ON CONFLICT(location_id, forecast_at)
		DO UPDATE SET
			description=excluded.description,
			temperature=excluded.temperature,
			feels_like=excluded.feels_like,
			condition=excluded.condition,
			icon=excluded.icon
		RETURNING
			id,
			location_id,
			description,
			temperature,
			feels_like,
			condition,
			icon,
			forecast_at,
			created_at,
			updated_at
	`

	rows, err := tx.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanHourlyWeather(rows)
}

func scanHourlyWeather(rows *sql.Rows) ([]*models.HourlyWeather, error) {
	var result []*models.HourlyWeather

	for rows.Next() {
		var hourlyWeather models.HourlyWeather

		err := rows.Scan(
			&hourlyWeather.ID,
			&hourlyWeather.LocationID,
			&hourlyWeather.Description,
			&hourlyWeather.Temperature,
			&hourlyWeather.FeelsLike,
			&hourlyWeather.Condition,
			&hourlyWeather.Icon,
			&hourlyWeather.ForecastAt,
			&hourlyWeather.CreatedAt,
			&hourlyWeather.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		result = append(result, &hourlyWeather)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return result, nil
}
