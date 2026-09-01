package services

import (
	"errors"
	"fmt"
	"pal/backend/database/models"
	"pal/backend/database/repositories"
	"pal/backend/logging"
)

type LocationService struct {
	logger                   *logging.Logger
	locationSearchRepository repositories.LocationSearchRepository
	userLocationRepository   repositories.UserLocationRepository
}

type LocationPayload struct {
	CityID      *int    `json:"city_id"`
	StateID     *int    `json:"state_id"`
	CountryID   int     `json:"country_id"`
	TimezoneID  int     `json:"timezone_id"`
	City        *string `json:"city"`
	State       *string `json:"state"`
	Country     string  `json:"country"`
	CountryFlag string  `json:"country_flag"`
	Timezone    string  `json:"timezone"`
}

func NewLocationService(
	logger *logging.Logger,
	lsRepo repositories.LocationSearchRepository,
	ulRepo repositories.UserLocationRepository,
) *LocationService {
	return &LocationService{
		logger:                   logger,
		locationSearchRepository: lsRepo,
		userLocationRepository:   ulRepo,
	}
}

func (l *LocationService) SearchLocation(name string, limit int) ([]models.LocationSearchResult, error) {
	if name == "" {
		return []models.LocationSearchResult{}, fmt.Errorf("name cannot be empty")
	}

	result, err := l.locationSearchRepository.FindLocation(name, limit)
	if err != nil {
		l.logger.Error("error finding location: " + err.Error())

		return []models.LocationSearchResult{}, errors.New("error finding location")
	}

	locations := make([]models.LocationSearchResult, 0, len(result))
	for _, location := range result {
		locations = append(locations, *location)
	}

	return locations, nil
}

func (l *LocationService) GetHomeLocation() (models.UserLocation, error) {
	locations, err := l.userLocationRepository.GetLocationByType(string(models.LocationTypeHome))
	if err != nil {
		return models.UserLocation{}, err
	}

	switch len(locations) {
	case 0:
		return models.UserLocation{}, nil
	case 1:
		return *locations[0], nil
	default:
		return models.UserLocation{}, errors.New("multiple home locations found")
	}
}

func (l *LocationService) GetTrackedLocation() ([]models.UserLocation, error) {
	result, err := l.userLocationRepository.GetLocationByType(string(models.LocationTypeTracked))
	if err != nil {
		return []models.UserLocation{}, err
	}

	locations := make([]models.UserLocation, 0, len(result))
	for _, location := range result {
		locations = append(locations, *location)
	}

	return locations, nil
}

func (l *LocationService) UpsertHomeLocation(location LocationPayload) error {
	homeLocation, err := l.GetHomeLocation()
	if err != nil {
		l.logger.Error("error getting home location: " + err.Error())
		return errors.New("error getting home location")
	}

	isNew := homeLocation == models.UserLocation{}

	homeLocation.LocationType = models.LocationTypeHome
	homeLocation.CityID = location.CityID
	homeLocation.StateID = location.StateID
	homeLocation.CountryID = location.CountryID
	homeLocation.TimezoneID = location.TimezoneID
	homeLocation.City = location.City
	homeLocation.State = location.State
	homeLocation.Country = location.Country
	homeLocation.CountryFlag = location.CountryFlag
	homeLocation.Timezone = location.Timezone

	if isNew {
		err = l.userLocationRepository.Create(homeLocation)
	} else {
		err = l.userLocationRepository.Update(homeLocation)
	}

	if err != nil {
		l.logger.Error("error updating home location: " + err.Error())
		return errors.New("error updating home location")
	}

	return nil
}

func (l *LocationService) AddTrackedLocation(location LocationPayload) error {
	userLocation := models.UserLocation{
		LocationType: models.LocationTypeTracked,
		CityID:       location.CityID,
		StateID:      location.StateID,
		CountryID:    location.CountryID,
		TimezoneID:   location.TimezoneID,
		City:         location.City,
		State:        location.State,
		Country:      location.Country,
		CountryFlag:  location.CountryFlag,
		Timezone:     location.Timezone,
	}

	err := l.userLocationRepository.Create(userLocation)
	if err != nil {
		l.logger.Error("error adding location: " + err.Error())
		return errors.New("error saving location")
	}

	return nil
}

func (l *LocationService) DeleteTrackedLocation(id int) error {
	err := l.userLocationRepository.Delete(id)
	if err != nil {
		l.logger.Error("error deleting location: " + err.Error())
		return errors.New("error deleting location")
	}

	return nil
}
