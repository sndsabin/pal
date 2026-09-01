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

func NewUserService(logger *logging.Logger, upRepo repositories.UserPreferenceRepository) *UserPreferenceService {
	return &UserPreferenceService{
		logger:                   logger,
		userPreferenceRepository: upRepo,
	}
}

func (up *UserPreferenceService) GetTimeFormat() (models.TimeFormat, error) {
	userPreference, err := up.getUserPreference()
	if err != nil {
		return "", err
	}

	return userPreference.TimeFormat, nil
}

func (up *UserPreferenceService) UpdateTimeFormat(timeFormat string) error {
	userPreference, err := up.getUserPreference()
	if err != nil {
		return err
	}

	tf := models.TimeFormat(timeFormat)
	if !tf.IsValid() {
		return errors.New("invalid time format")
	}
	userPreference.TimeFormat = tf

	err = up.userPreferenceRepository.Update(*userPreference)
	if err != nil {
		up.logger.Error("error updating user preference: " + err.Error())

		return errors.New("error saving preference")
	}

	return nil
}

func (up *UserPreferenceService) getUserPreference() (*models.UserPreference, error) {
	// user preference table has only one row as of now.
	userPreference, err := up.userPreferenceRepository.GetById(1)
	if err != nil {
		up.logger.Error("error fetching user preference: " + err.Error())

		return nil, errors.New("error fetching user preference.")
	}

	return userPreference, nil
}
