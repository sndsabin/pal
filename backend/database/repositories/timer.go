package repositories

import (
	"context"
	"database/sql"
	"pal/backend/database/models"
)

type TimerRepository struct {
	db *sql.DB
}

func NewTimerRepository(db *sql.DB) *TimerRepository {
	return &TimerRepository{
		db: db,
	}
}

func (t *TimerRepository) GetById(id int) (*models.Timer, error) {
	ctx, cancel := context.WithTimeout(context.Background(), QueryTimeoutDuration)
	defer cancel()

	query := `
		SELECT
			id,
			name,
			duration,
			status,
			created_at,
			paused_at,
			updated_at
		FROM timers
		WHERE id = $1;
	`

	row := t.db.QueryRowContext(ctx, query, id)

	var timer models.Timer

	err := row.Scan(
		&timer.ID,
		&timer.Name,
		&timer.Duration,
		&timer.Status,
		&timer.CreatedAt,
		&timer.PausedAt,
		&timer.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &timer, nil
}

func (t *TimerRepository) GetByStatus(status string) ([]*models.Timer, error) {
	ctx, cancel := context.WithTimeout(context.Background(), QueryTimeoutDuration)
	defer cancel()

	query := `
		SELECT
			id,
			name,
			duration,
			status,
			created_at,
			paused_at,
			updated_at
		FROM timers
		WHERE status = $1
		ORDER BY updated_at DESC;
	`

	rows, err := t.db.QueryContext(ctx, query, models.TimerStatus(status))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanTimers(rows)
}

func (t *TimerRepository) ListAll() ([]*models.Timer, error) {
	ctx, cancel := context.WithTimeout(context.Background(), QueryTimeoutDuration)
	defer cancel()

	query := `
		SELECT
			id,
			name,
			duration,
			status,
			created_at,
			paused_at,
			updated_at
		FROM timers
		ORDER BY updated_at DESC;
	`

	rows, err := t.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanTimers(rows)
}

func (t *TimerRepository) Create(timer models.Timer) (*models.Timer, error) {
	ctx, cancel := context.WithTimeout(context.Background(), QueryTimeoutDuration)
	defer cancel()

	query := `
		INSERT INTO timers
		(
			name,
			duration,
			status
		) 
		VALUES (
			$1, $2, $3
		)
		RETURNING
			id,
			name,
			duration,
			status,
			created_at,
			paused_at,
			updated_at;
	`

	row := t.db.QueryRowContext(
		ctx,
		query,
		timer.Name,
		timer.Duration,
		timer.Status,
	)

	return scanTimer(row)
}

func (t *TimerRepository) Update(timer models.Timer) (*models.Timer, error) {
	ctx, cancel := context.WithTimeout(context.Background(), QueryTimeoutDuration)
	defer cancel()

	query := `
		UPDATE timers
		SET
			name=$1,
			duration=$2,
			status=$3,
			created_at=$4,
			paused_at=$5
		WHERE id = $6
		RETURNING
			id,
			name,
			duration,
			status,
			created_at,
			paused_at,
			updated_at;
	`

	row := t.db.QueryRowContext(
		ctx,
		query,
		timer.Name,
		timer.Duration,
		timer.Status,
		timer.CreatedAt,
		timer.PausedAt,
		timer.ID,
	)

	return scanTimer(row)
}

func (t *TimerRepository) Delete(id int) error {
	ctx, cancel := context.WithTimeout(context.Background(), QueryTimeoutDuration)
	defer cancel()

	query := `
		DELETE FROM timers
		WHERE id=$1;
	`

	_, err := t.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}

	return nil
}

func scanTimer(row *sql.Row) (*models.Timer, error) {
	var result models.Timer

	err := row.Scan(
		&result.ID,
		&result.Name,
		&result.Duration,
		&result.Status,
		&result.CreatedAt,
		&result.PausedAt,
		&result.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func scanTimers(rows *sql.Rows) ([]*models.Timer, error) {
	var timers []*models.Timer

	for rows.Next() {
		var timer models.Timer

		err := rows.Scan(
			&timer.ID,
			&timer.Name,
			&timer.Duration,
			&timer.Status,
			&timer.CreatedAt,
			&timer.PausedAt,
			&timer.UpdatedAt,
		)

		if err != nil {
			return nil, err
		}

		timers = append(timers, &timer)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return timers, nil
}
