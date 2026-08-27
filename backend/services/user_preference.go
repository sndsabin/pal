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

func (us *UserPreferenceService) GetTimeFormat() (models.TimeFormat, error) {
	userPreference, err := us.getUserPrefernce()
	if err != nil {
		return "", err
	}

	return userPreference.TimeFormat, nil
}

func (us *UserPreferenceService) UpdateTimeFormat(timeFormat string) error {
	userPreference, err := us.getUserPrefernce()
	if err != nil {
		return err
	}

	tf := models.TimeFormat(timeFormat)
	if !tf.IsValid() {
		return errors.New("invalid time format")
	}
	userPreference.TimeFormat = tf

	err = us.userPreferenceRepository.Update(*userPreference)
	if err != nil {
		us.logger.Error("error updating user preference: " + err.Error())

		return errors.New("error saving preference")
	}

	return nil
}

func (us *UserPreferenceService) getUserPrefernce() (*models.UserPreference, error) {
	userPreference, err := us.userPreferenceRepository.GetById(1)
	if err != nil {
		us.logger.Error("error fetching user preference: " + err.Error())

		return nil, errors.New("error fetching user preference.")
	}

	return userPreference, nil
}
