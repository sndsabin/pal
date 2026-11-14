package weather

import "time"

const RequestTimeOut = 10 * time.Second

type Current struct {
	Description string           `json:"description"`
	Temperature float64          `json:"temperature"`
	FeelsLike   float64          `json:"feels_like"`
	Condition   WeatherCondition `json:"condition"`
	Icon        string           `json:"icon"`
}

type Hourly struct {
	Description string           `json:"description"`
	Temperature float64          `json:"temperature"`
	FeelsLike   float64          `json:"feels_like"`
	Condition   WeatherCondition `json:"condition"`
	Icon        string           `json:"icon"`
	ForecastAt  time.Time        `json:"forecast_at"`
}

type WeatherResponse struct {
	Current Current  `json:"current"`
	Hourly  []Hourly `json:"hourly"`
}

type WeatherProvider interface {
	FetchWeather(location string) (*WeatherResponse, error)
}
