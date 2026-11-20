package models

import "time"

type CurrentWeather struct {
	ID          int       `json:"id"`
	LocationID  int       `json:"location_id"`
	Description string    `json:"description"`
	Temperature float64   `json:"temperature"`
	FeelsLike   float64   `json:"feels_like"`
	Condition   string    `json:"condition"`
	Icon        string    `json:"icon"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type HourlyWeather struct {
	ID          int       `json:"id"`
	LocationID  int       `json:"location_id"`
	Description string    `json:"description"`
	Temperature float64   `json:"temperature"`
	FeelsLike   float64   `json:"feels_like"`
	Condition   string    `json:"condition"`
	Icon        string    `json:"icon"`
	ForecastAt  time.Time `json:"forecast_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type WeatherData struct {
	Timezone string `json:"timezone"`
	Current  *CurrentWeather
	Hourly   []*HourlyWeather
}
