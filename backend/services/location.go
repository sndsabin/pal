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

func (ls *LocationService) SearchLocation(name string, limit int) ([]models.LocationSearchResult, error) {
	if name == "" {
		return []models.LocationSearchResult{}, fmt.Errorf("name cannot be empty")
	}

	result, err := ls.locationSearchRepository.FindLocation(name, limit)
	if err != nil {
		ls.logger.Error("error finding location: " + err.Error())

		return []models.LocationSearchResult{}, errors.New("error finding location")
	}

	locations := make([]models.LocationSearchResult, 0, len(result))
	for _, location := range result {
		locations = append(locations, *location)
	}

	return locations, nil
}

func (ls *LocationService) GetHomeLocation() (models.UserLocation, error) {
	locations, err := ls.userLocationRepository.GetLocationByType(string(models.LocationTypeHome))
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

func (ls *LocationService) GetTrackedLocation() ([]models.UserLocation, error) {
	result, err := ls.userLocationRepository.GetLocationByType(string(models.LocationTypeTracked))
	if err != nil {
		return []models.UserLocation{}, err
	}

	locations := make([]models.UserLocation, 0, len(result))
	for _, location := range result {
		locations = append(locations, *location)
	}

	return locations, nil
}

func (ls *LocationService) UpsertHomeLocation(location LocationPayload) error {
	homeLocation, err := ls.GetHomeLocation()
	if err != nil {
		ls.logger.Error("error getting home location: " + err.Error())
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
		err = ls.userLocationRepository.Create(homeLocation)
	} else {
		err = ls.userLocationRepository.Update(homeLocation)
	}

	if err != nil {
		ls.logger.Error("error updating home location: " + err.Error())
		return errors.New("error updating home location")
	}

	return nil
}

func (ls *LocationService) AddTrackedLocation(location LocationPayload) error {
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

	err := ls.userLocationRepository.Create(userLocation)
	if err != nil {
		ls.logger.Error("error adding location: " + err.Error())
		return errors.New("error saving location")
	}

	return nil
}

func (ls *LocationService) DeleteTrackedLocation(id int) error {
	err := ls.userLocationRepository.Delete(id)
	if err != nil {
		ls.logger.Error("error deleting location: " + err.Error())
		return errors.New("error deleting location")
	}

	return nil
}
