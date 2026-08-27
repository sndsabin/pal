package repositories

import (
	"context"
	"database/sql"
	"pal/backend/database/models"
)

type UserLocationRepository struct {
	db *sql.DB
}

func NewUserLocationRepository(db *sql.DB) *UserLocationRepository {
	return &UserLocationRepository{
		db: db,
	}
}

func (ul *UserLocationRepository) GetLocationByType(locationType string) ([]*models.UserLocation, error) {
	ctx, cancel := context.WithTimeout(context.Background(), QueryTimeoutDuration)
	defer cancel()

	query := `
		SELECT 
			id,
			type,
			scope,
			city_id,
			state_id,
			country_id,
			timezone_id,
			city,
			state,
			country,
			country_flag,
			timezone,
			created_at,
			updated_at 
		FROM user_locations
		WHERE type = $1;
	`

	rows, err := ul.db.QueryContext(ctx, query, locationType)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var locations []*models.UserLocation

	for rows.Next() {
		var location models.UserLocation

		err := rows.Scan(
			&location.ID,
			&location.LocationType,
			&location.Scope,
			&location.CityID,
			&location.StateID,
			&location.CountryID,
			&location.TimezoneID,
			&location.City,
			&location.State,
			&location.Country,
			&location.CountryFlag,
			&location.Timezone,
			&location.CreatedAt,
			&location.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		locations = append(locations, &location)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return locations, nil
}

func (ul *UserLocationRepository) Create(location models.UserLocation) error {
	ctx, cancel := context.WithTimeout(context.Background(), QueryTimeoutDuration)
	defer cancel()

	query := `
		INSERT INTO user_locations
		(
			type,
			scope,
			city_id,
			state_id,
			country_id,
			timezone_id,
			city,
			state,
			country,
			country_flag,
			timezone
		)
		VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
		);
	`

	_, err := ul.db.ExecContext(
		ctx,
		query,
		location.LocationType,
		getLocationScope(location),
		location.CityID,
		location.StateID,
		location.CountryID,
		location.TimezoneID,
		location.City,
		location.State,
		location.Country,
		location.CountryFlag,
		location.Timezone,
	)
	if err != nil {
		return err
	}

	return nil
}

func (ul *UserLocationRepository) Update(location models.UserLocation) error {
	ctx, cancel := context.WithTimeout(context.Background(), QueryTimeoutDuration)
	defer cancel()

	query := `
		UPDATE user_locations
		SET
			type=$1,
			scope=$2,
			city_id=$3,
			state_id=$4,
			country_id=$5,
			timezone_id=$6,
			city=$7,
			state=$8,
			country=$9,
			country_flag=$10,
			timezone=$11
		WHERE id = $12;
	`

	_, err := ul.db.ExecContext(
		ctx,
		query,
		location.LocationType,
		getLocationScope(location),
		location.CityID,
		location.StateID,
		location.CountryID,
		location.TimezoneID,
		location.City,
		location.State,
		location.Country,
		location.CountryFlag,
		location.Timezone,
		location.ID,
	)
	if err != nil {
		return err
	}

	return nil
}

func (ul *UserLocationRepository) Delete(id int) error {
	ctx, cancel := context.WithTimeout(context.Background(), QueryTimeoutDuration)
	defer cancel()

	query := `
		DELETE FROM user_locations
		WHERE id = $1;
	`

	_, err := ul.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}

	return nil
}

func getLocationScope(location models.UserLocation) models.LocationScope {
	if location.CityID != nil {
		return models.LocationScopeCity
	}

	if location.StateID != nil {
		return models.LocationScopeState
	}

	return models.LocationScopeCountry
}
