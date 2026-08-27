package models

import "time"

type LocationType string
type LocationScope string

const (
	LocationTypeHome    LocationType = "home"
	LocationTypeTracked LocationType = "tracked"

	LocationScopeCity    LocationScope = "city"
	LocationScopeState   LocationScope = "state"
	LocationScopeCountry LocationScope = "country"
)

type UserLocation struct {
	ID           int           `json:"id"`
	LocationType LocationType  `json:"type"`
	Scope        LocationScope `json:"scope"`
	CityID       *int          `json:"city_id"`
	StateID      *int          `json:"state_id"`
	CountryID    int           `json:"country_id"`
	TimezoneID   int           `json:"timezone_id"`
	City         *string       `json:"city"`
	State        *string       `json:"state"`
	Country      string        `json:"country"`
	CountryFlag  string        `json:"country_flag"`
	Timezone     string        `json:"timezone"`
	CreatedAt    time.Time     `json:"created_at"`
	UpdatedAt    time.Time     `json:"updated_at"`
}

func (lt LocationType) IsValid() bool {
	switch lt {
	case LocationTypeHome,
		LocationTypeTracked:
		return true

	default:
		return false
	}
}

func (ls LocationScope) IsValid() bool {
	switch ls {
	case LocationScopeCity,
		LocationScopeState,
		LocationScopeCountry:
		return true
	default:
		return false
	}
}
