package services

import (
	"errors"
	"pal/backend/database/models"
	"pal/backend/database/repositories"
	"pal/backend/logging"
	"time"
)

type TimerService struct {
	logger          *logging.Logger
	timerRepository repositories.TimerRepository
}

func NewTimerService(logger *logging.Logger, timerRepository repositories.TimerRepository) *TimerService {
	return &TimerService{
		logger:          logger,
		timerRepository: timerRepository,
	}
}

func (t *TimerService) AddTimer(name string, duration int) (*models.Timer, error) {
	newTimer := models.Timer{
		Name:     &name,
		Duration: duration,
		Status:   models.TimerStatusRunning,
	}

	timer, err := t.timerRepository.Create(newTimer)
	if err != nil {
		t.logger.Error("error adding timer", "err", err)
		return nil, errors.New("error saving timer")
	}

	return timer, nil
}

func (t *TimerService) GetAllTimers() ([]*models.Timer, error) {
	return t.timerRepository.ListAll()
}

func (t *TimerService) GetRunningTimers() ([]*models.Timer, error) {
	return t.timerRepository.GetByStatus(string(models.TimerStatusRunning))
}

func (t *TimerService) StartTimer(id int) (*models.Timer, error) {
	timer, err := t.timerRepository.GetById(id)
	if err != nil {
		t.logger.Error("error fetching timer", "id", id, "err", err)
		return nil, errors.New("error starting timer")
	}

	switch timer.Status {
	case models.TimerStatusPaused:
		if timer.PausedAt == nil {
			return nil, errors.New("missing paused_at for paused timer")
		}

		pausedDuration := time.Since(*timer.PausedAt)
		timer.CreatedAt = timer.CreatedAt.Add(pausedDuration)

	case models.TimerStatusCompleted:
		timer.CreatedAt = time.Now()

	case models.TimerStatusRunning:
		return nil, errors.New("timer is already running")
	default:
		return nil, errors.New("invalid timer status")
	}

	timer.PausedAt = nil
	timer.Status = models.TimerStatusRunning

	result, err := t.timerRepository.Update(*timer)
	if err != nil {
		t.logger.Error("error updating timer", "id", id, "err", err)
		return nil, errors.New("error starting timer")
	}

	return result, nil
}

func (t *TimerService) AddDuration(id int, duration int) (*models.Timer, error) {
	timer, err := t.timerRepository.GetById(id)
	if err != nil {
		t.logger.Error("error fetching timer", "id", id, "err", err)
		return nil, errors.New("error adding duration")
	}

	timer.Duration += duration
	timer.Status = models.TimerStatusRunning

	result, err := t.timerRepository.Update(*timer)
	if err != nil {
		t.logger.Error("error updating timer", "id", id, "err", err)
		return nil, errors.New("error adding duration")
	}

	return result, nil
}

func (t *TimerService) PauseTimer(id int) (*models.Timer, error) {
	timer, err := t.timerRepository.GetById(id)
	if err != nil {
		t.logger.Error("error fetching timer", "id", id, "err", err)
		return nil, errors.New("error pausing timer")
	}

	now := time.Now()
	timer.PausedAt = &now
	timer.Status = models.TimerStatusPaused

	result, err := t.timerRepository.Update(*timer)
	if err != nil {
		t.logger.Error("error updating timer", "id", id, "err", err)
		return nil, errors.New("error pausing timer")
	}

	return result, nil
}

func (t *TimerService) CompleteTimer(id int) (*models.Timer, error) {
	result, err := t.timerRepository.Complete(id)
	if err != nil {
		t.logger.Error("error completing timer", "id", id, "err", err)
		return nil, errors.New("error completing timer")
	}

	return result, nil
}

func (t *TimerService) StopTimer(id int) (*models.Timer, error) {
	timer, err := t.timerRepository.GetById(id)
	if err != nil {
		t.logger.Error("error fetching timer", "id", id, "err", err)
		return nil, errors.New("error stopping timer")
	}

	timer.PausedAt = nil
	timer.Status = models.TimerStatusCompleted

	result, err := t.timerRepository.Update(*timer)
	if err != nil {
		t.logger.Error("error updating timer", "id", id, "err", err)
		return nil, errors.New("error stopping timer")
	}

	return result, nil
}

func (t *TimerService) DeleteTimer(id int) error {
	err := t.timerRepository.Delete(id)
	if err != nil {
		t.logger.Error("error deleting timer", "id", id, "err", err)
		return errors.New("error deleting timer")
	}

	return nil
}
