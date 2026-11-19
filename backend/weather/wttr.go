package weather

type WttrResponse struct {
	CurrentCondition []struct {
		FeelsLike   string `json:"FeelsLikeC"`
		Temperature string `json:"temp_C"`

		Description []struct {
			Value string `json:"value"`
		} `json:"weatherDesc"`

		WeatherCode string `json:"weatherCode"`

		Icon []struct {
			Url string `json:"value"`
		} `json:"weatherIconUrl"`
	} `json:"current_condition"`

	Weather []struct {
		Date   string `json:"date"`
		Hourly []struct {
			FeelsLike   string `json:"FeelsLikeC"`
			Temperature string `json:"tempC"`
			Hour        string `json:"time"`

			Description []struct {
				Value string `json:"value"`
			} `json:"weatherDesc"`

			WeatherCode string `json:"weatherCode"`

			Icon []struct {
				Url string `json:"value"`
			} `json:"weatherIconUrl"`
		} `json:"hourly"`
	} `json:"weather"`

	Timezone string `json:"timezone"`
}
