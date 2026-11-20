package services

import (
	"errors"
	"pal/backend/database/models"
	"pal/backend/database/repositories"
	"pal/backend/logging"
)

type UserPreferenceService struct {
	logger                   *logging.Logger
	userPreferenceRepository repositories.UserPreferenceRepository
}

type UserPreferencePayload struct {
	TimeFormat        string
	TemperatureFormat string
	AlertSound        bool
}

func NewUserService(logger *logging.Logger, upRepo repositories.UserPreferenceRepository) *UserPreferenceService {
	return &UserPreferenceService{
		logger:                   logger,
		userPreferenceRepository: upRepo,
	}
}

func (up *UserPreferenceService) GetUserPreference() (*models.UserPreference, error) {
	// user preference table has only one row as of now.
	userPreference, err := up.userPreferenceRepository.GetById(1)
	if err != nil {
		up.logger.Error("error fetching user preference", "err", err)

		return nil, errors.New("error fetching user preference.")
	}

	return userPreference, nil
}

func (up *UserPreferenceService) UpdateUserPreference(payload UserPreferencePayload) error {
	userPreference, err := up.GetUserPreference()
	if err != nil {
		return err
	}

	timef := models.TimeFormat(payload.TimeFormat)
	if !timef.IsValid() {
		return errors.New("invalid time format")
	}

	tempf := models.TemperatureFormat(payload.TemperatureFormat)
	if !tempf.IsValid() {
		return errors.New("invalid temperature format")
	}

	userPreference.TimeFormat = timef
	userPreference.TemperatureFormat = tempf
	userPreference.AlertSound = payload.AlertSound

	err = up.userPreferenceRepository.Update(*userPreference)
	if err != nil {
		up.logger.Error("error updating user preference", "err", err)

		return errors.New("error saving preference")
	}

	return nil
}
