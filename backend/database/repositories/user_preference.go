package repositories

import (
	"context"
	"database/sql"
	"pal/backend/database/models"
	"time"
)

type UserPreferenceRepository struct {
	db *sql.DB
}

const QueryTimeoutDuration = 5 * time.Second

func NewUserPreferenceRepository(db *sql.DB) *UserPreferenceRepository {
	return &UserPreferenceRepository{
		db: db,
	}
}

func (up *UserPreferenceRepository) GetById(id int) (*models.UserPreference, error) {
	ctx, cancel := context.WithTimeout(context.Background(), QueryTimeoutDuration)
	defer cancel()

	query := `
		SELECT id, time_format, created_at, updated_at FROM user_preferences WHERE id = $1;
	`

	row := up.db.QueryRowContext(ctx, query, id)

	var userPreference models.UserPreference

	err := row.Scan(
		&userPreference.ID,
		&userPreference.TimeFormat,
		&userPreference.CreatedAt,
		&userPreference.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &userPreference, nil
}

func (up *UserPreferenceRepository) Update(userPreference models.UserPreference) error {
	ctx, cancel := context.WithTimeout(context.Background(), QueryTimeoutDuration)
	defer cancel()

	query := `
		UPDATE user_preferences
		SET
			time_format=$1
		WHERE id = $2;
	`

	_, err := up.db.ExecContext(
		ctx,
		query,
		userPreference.TimeFormat,
		userPreference.ID,
	)
	if err != nil {
		return err
	}

	return nil
}
