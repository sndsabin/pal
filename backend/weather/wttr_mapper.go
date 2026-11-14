package weather

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"
)

func ToWeather(data *WttrResponse) (*WeatherResponse, error) {
	if data == nil || len(data.CurrentCondition) == 0 {
		return nil, errors.New("empty data or missing current condition data")
	}

	current := data.CurrentCondition[0]

	result := &WeatherResponse{}

	result.Current.Description = parseDescription(current.Description)
	result.Current.Temperature = toFloat(current.Temperature)
	result.Current.FeelsLike = toFloat(current.FeelsLike)
	result.Current.Condition = LookupWWOCondition(toInt(current.WeatherCode))
	result.Current.Icon = parseIcon(current.Icon)

	for _, day := range data.Weather {
		for _, hour := range day.Hourly {
			forecastAt, err := parseForcastTime(day.Date, hour.Hour)
			if err != nil {
				return nil, err
			}

			result.Hourly = append(result.Hourly, Hourly{
				Description: parseDescription(hour.Description),
				Temperature: toFloat(hour.Temperature),
				FeelsLike:   toFloat(hour.FeelsLike),
				Condition:   LookupWWOCondition(toInt(hour.WeatherCode)),
				Icon:        parseIcon(hour.Icon),
				ForecastAt:  forecastAt,
			})
		}
	}

	return result, nil
}

func toFloat(value string) float64 {
	result, _ := strconv.ParseFloat(value, 64)
	return result
}

func toInt(value string) int {
	result, _ := strconv.Atoi(value)
	return result
}

func parseDescription(values []struct {
	Value string `json:"value"`
}) string {
	if len(values) == 0 {
		return ""
	}

	return values[0].Value
}

func parseIcon(values []struct {
	Url string `json:"value"`
}) string {
	if len(values) == 0 {
		return ""
	}

	return values[0].Url
}

func parseForcastTime(date string, val string) (time.Time, error) {
	hour, err := strconv.Atoi(strings.TrimSpace(val))
	if err != nil {
		return time.Time{}, fmt.Errorf("error parsing forecast hour: %w", err)
	}

	// wttr.in returns the hour as HHMM without a colon in 24 hour format
	// 0 = 00:00, 300 = 03:00, 600 = 06:00, 1200 = 12:00.
	if hour < 0 || hour > 2300 || hour%100 != 0 {
		return time.Time{}, fmt.Errorf("invalid forecast hour: %d", hour)
	}

	forecastTime := fmt.Sprintf("%04d", hour)
	forecastAt, err := time.Parse("2006-01-02 1504", date+" "+forecastTime)
	if err != nil {
		return time.Time{}, fmt.Errorf("invalid forecast datetime: %w", err)
	}

	return forecastAt, nil
}
