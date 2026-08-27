package services

import (
	"errors"
	"pal/backend/logging"
	"time"
)

type DateTimeService struct {
	logger *logging.Logger
}

func NewDateTimeService(logger *logging.Logger) *DateTimeService {
	return &DateTimeService{
		logger: logger,
	}
}

func (dt *DateTimeService) GetCurrentDateTime(timezone string) (string, error) {
	if timezone == "" {
		return "", errors.New("timezone cannot be empty")
	}

	location, err := time.LoadLocation(timezone)
	if err != nil {
		dt.logger.Error("error loading location: " + err.Error())
		return "", errors.New("error loading location")
	}

	now := time.Now().In(location)

	return now.Format(time.RFC3339), nil
}

func (dt *DateTimeService) ConvertDateTime(datetime string, fromTz string, toTz string) (string, error) {
	if datetime == "" || fromTz == "" || toTz == "" {
		return "", errors.New("datetime or fromTz or toTz cannot be empty")
	}

	fromLocation, err := time.LoadLocation(fromTz)
	if err != nil {
		dt.logger.Error("error loading from location: " + err.Error())
		return "", errors.New("error loading location")
	}

	toLocation, err := time.LoadLocation(toTz)
	if err != nil {
		dt.logger.Error("error loading to location: " + err.Error())
		return "", errors.New("error loading location")
	}

	fromTime, err := time.ParseInLocation(time.RFC3339, datetime, fromLocation)
	if err != nil {
		dt.logger.Error("error parsing datetime: " + err.Error())
		return "", errors.New("error parsing datetime")
	}

	return fromTime.In(toLocation).Format(time.RFC3339), nil
}
