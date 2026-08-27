package repositories

import (
	"context"
	"database/sql"
	"pal/backend/database/models"
)

type LocationSearchRepository struct {
	db *sql.DB
}

func NewLocationSearchRepository(db *sql.DB) *LocationSearchRepository {
	return &LocationSearchRepository{
		db: db,
	}
}

func (ls *LocationSearchRepository) FindLocation(name string, limit int) ([]*models.LocationSearchResult, error) {
	ctx, cancel := context.WithTimeout(context.Background(), QueryTimeoutDuration)
	defer cancel()

	query := `
		SELECT
		'country' AS type,
		NULL AS city_id,
		NULL AS state_id,
		country_id,
		CASE
			WHEN COUNT(DISTINCT timezone_id) = 1
			THEN MIN(timezone_id)
		END AS timezone_id,
		country AS name,
		CASE
			WHEN COUNT(DISTINCT timezone_id) = 1
			THEN MIN(timezone)
		END AS timezone,
		NULL AS city,
		NULL AS state,
		country AS country,
		country_flag,
		COUNT(DISTINCT timezone_id) AS timezone_count
		FROM location_search
		WHERE country LIKE $1
		GROUP BY country_id

		UNION ALL

		SELECT
			'state' AS type,
			NULL AS city_id,
			state_id,
			country_id,
			CASE
				WHEN COUNT(DISTINCT timezone_id) = 1
				THEN MIN(timezone_id)
			END AS timezone_id,
			state AS name,
			CASE
				WHEN COUNT(DISTINCT timezone_id) = 1
				THEN MIN(timezone)
			END AS timezone,
			NULL AS city,
			state,
			country,
			country_flag,
			COUNT(DISTINCT timezone_id) AS timezone_count
		FROM location_search
		WHERE state LIKE $1
		GROUP BY state_id

		UNION ALL

		SELECT
			'city' AS type,
			city_id,
			state_id,
			country_id,
			timezone_id,
			city AS name,
			timezone,
			city,
			state,
			country,
			country_flag,
			1 AS timezone_count
		FROM location_search
		WHERE city LIKE $1
		LIMIT $2;
	`

	rows, err := ls.db.QueryContext(ctx, query, name+"%", limit)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	searchResults := []*models.LocationSearchResult{}

	for rows.Next() {
		var searchResult models.LocationSearchResult

		err := rows.Scan(
			&searchResult.SearchType,
			&searchResult.CityID,
			&searchResult.StateID,
			&searchResult.CountryID,
			&searchResult.TimezoneID,
			&searchResult.Name,
			&searchResult.Timezone,
			&searchResult.City,
			&searchResult.State,
			&searchResult.Country,
			&searchResult.CountryFlag,
			&searchResult.TimezoneCount,
		)
		if err != nil {
			return nil, err
		}

		searchResults = append(searchResults, &searchResult)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return searchResults, nil
}
