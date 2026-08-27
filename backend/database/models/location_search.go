package models

type SearchType string

const (
	SearchTypeCountry SearchType = "country"
	SearchTypeState   SearchType = "state"
	SearchTypeCity    SearchType = "city"
)

type LocationSearch struct {
	ID          int     `json:"id"`
	CityID      *int    `json:"city_id"`
	StateID     *int    `json:"state_id"`
	CountryID   int     `json:"country_id"`
	TimezoneID  *int    `json:"timezone_id"`
	City        *string `json:"city"`
	State       *string `json:"state"`
	Country     string  `json:"country"`
	CountryFlag string  `json:"country_flag"`
	Timezone    *string `json:"timezone"`
}

type LocationSearchResult struct {
	LocationSearch
	Name          string     `json:"name"`
	SearchType    SearchType `json:"type"`
	TimezoneCount int        `json:"timezone_count"`
}
