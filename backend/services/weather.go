package services

import (
	"errors"
	"fmt"
	"pal/backend/database/models"
	"pal/backend/database/repositories"
	"pal/backend/logging"
	"pal/backend/weather"
	"strings"
	"sync"
	"time"
)

const maxWorkers = 5
const cacheTTL = 30 * time.Minute

type WeatherService struct {
	logger                 *logging.Logger
	weatherProvider        weather.WeatherProvider
	userLocationRepository repositories.UserLocationRepository
	weatherRepository      repositories.WeatherRepository
}

type WeatherPayload struct {
	LocationID         int
	LocationIdentifier string
}

func NewWeatherService(
	logger *logging.Logger,
	weatherProvider weather.WeatherProvider,
	userLocationRepository repositories.UserLocationRepository,
	weatherRepository repositories.WeatherRepository,
) *WeatherService {
	return &WeatherService{
		logger:                 logger,
		weatherProvider:        weatherProvider,
		userLocationRepository: userLocationRepository,
		weatherRepository:      weatherRepository,
	}
}

func (w *WeatherService) RefreshWeatherData() error {
	userLocations, err := w.userLocationRepository.GetAllLocation()
	if err != nil {
		w.logger.Error("error fetching all user locations", "err", err)
		return errors.New("something went wrong while fetching all user locations")
	}

	var payload []WeatherPayload
	for _, location := range userLocations {
		if location == nil {
			continue
		}

		payload = append(payload, WeatherPayload{
			LocationID:         location.ID,
			LocationIdentifier: getLocationIdentifier(location),
		})
	}

	if _, err = w.GetOrRefreshWeatherData(payload, false); err != nil {
		w.logger.Error("error refreshing weather for all user locations", "err", err)
		return errors.New("something went wrong while fetching all weather data")
	}

	return nil
}

func (w *WeatherService) GetOrRefreshWeatherData(payload []WeatherPayload, ignoreCacheTTL bool) ([]*models.WeatherData, error) {
	if len(payload) == 0 {
		return nil, errors.New("location ids cant be empty")
	}

	locationIds := make([]int, 0, len(payload))

	for _, item := range payload {
		locationIds = append(locationIds, item.LocationID)
	}

	currentWeather, err := w.weatherRepository.GetCurrentWeather(locationIds)
	if err != nil {
		return nil, err
	}

	currentWeatherByLocationId := make(map[int]*models.CurrentWeather, len(currentWeather))

	for _, item := range currentWeather {
		if item != nil {
			currentWeatherByLocationId[item.LocationID] = item
		}
	}

	var wg sync.WaitGroup
	var mu sync.Mutex
	var semaphore = make(chan struct{}, maxWorkers)
	var errChan = make(chan error, len(payload))
	var result []*models.WeatherData

	for _, location := range payload {
		current, exists := currentWeatherByLocationId[location.LocationID]

		wg.Add(1) // increase the counter

		go func() {
			defer wg.Done() // decrease the counter

			// acquire a worker slot
			semaphore <- struct{}{}
			defer func() {
				<-semaphore
			}()

			// fetch current weather if missing or outdated
			if !exists || !isFresh(current) || ignoreCacheTTL {
				weatherData, err := w.fetchAndSaveWeatherData(location.LocationIdentifier, location.LocationID)
				if err != nil {
					errChan <- fmt.Errorf("something went wrong while fetching and saving weather data for %s: %w", location.LocationIdentifier, err)
				}

				if weatherData != nil {
					mu.Lock()
					result = append(result, weatherData)
					mu.Unlock()
					return // skip refetching hourly weather data
				}

				// if there's no current weather data for specified location and fetching failed
				// skip fetching the hourly weather record
				if !exists {
					return
				}
			}

			// fetch hourly record
			hourlyData, err := w.weatherRepository.GetHourlyWeather(location.LocationID)
			if err != nil {
				errChan <- fmt.Errorf("error fetching hourly weather record for location id %v: %w", location.LocationID, err)
				return
			}

			mu.Lock()
			result = append(result, &models.WeatherData{
				Current: current,
				Hourly:  hourlyData,
			})
			mu.Unlock()
		}()
	}

	wg.Wait() // wait for all the go routines to complete
	close(errChan)

	for err := range errChan {
		if err != nil {
			w.logger.Error("something went wrong while fetching weather data", "err", err)
			return nil, err
		}
	}

	return result, nil
}

func (w *WeatherService) GetWWOConditionFor(code int) weather.WeatherCondition {
	return weather.LookupWWOCondition(code)
}

func (w *WeatherService) fetchAndSaveWeatherData(identifier string, locationId int) (*models.WeatherData, error) {
	w.logger.Info("fetching weather data: ", "location", identifier)

	weatherData, err := w.weatherProvider.FetchWeather(identifier)
	if err != nil {
		w.logger.Error(
			"error fetching weather data",
			"location", identifier,
			"err", err,
		)

		return nil, errors.New("something went wrong while fetching weather data")
	}

	current := models.CurrentWeather{
		LocationID:  locationId,
		Description: weatherData.Current.Description,
		Temperature: weatherData.Current.Temperature,
		FeelsLike:   weatherData.Current.FeelsLike,
		Condition:   string(weatherData.Current.Condition),
		Icon:        weatherData.Current.Icon,
	}

	var hourly []models.HourlyWeather

	for _, hourlyWeatherData := range weatherData.Hourly {
		hourlyData := models.HourlyWeather{
			LocationID:  locationId,
			Description: hourlyWeatherData.Description,
			Temperature: hourlyWeatherData.Temperature,
			FeelsLike:   hourlyWeatherData.FeelsLike,
			Condition:   string(hourlyWeatherData.Condition),
			Icon:        hourlyWeatherData.Icon,
			ForecastAt:  hourlyWeatherData.ForecastAt,
		}

		hourly = append(hourly, hourlyData)
	}

	data, err := w.weatherRepository.SaveWeather(current, hourly)
	if err != nil {
		w.logger.Error(
			"error saving weather data",
			"location", identifier,
			"err", err,
		)
		return nil, errors.New("something went wrong while saving weather data")
	}

	// cleanup old hourly weather data
	err = w.weatherRepository.CleanupHourlyWeather(locationId)
	if err != nil {
		w.logger.Error(
			"error cleaning old hourly weather data",
			"location_id", locationId,
			"err", err,
		)
	}

	return data, nil
}

func isFresh(data *models.CurrentWeather) bool {
	if data == nil {
		return false
	}

	return time.Since(data.UpdatedAt) < cacheTTL
}

func getLocationIdentifier(location *models.UserLocation) string {
	if location == nil {
		return ""
	}

	var result []string

	appendIfNotEmpty := func(val string) {
		trimmedValue := strings.TrimSpace(val)

		if trimmedValue != "" {
			result = append(result, trimmedValue)
		}
	}

	for _, value := range []*string{location.City, location.State} {
		if value == nil {
			continue
		}

		appendIfNotEmpty(*value)
	}

	appendIfNotEmpty(location.Country)

	return strings.Join(result, ",")
}
