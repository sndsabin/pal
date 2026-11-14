package weather

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
)

type WttrClient struct {
	httpClient *http.Client
}

const baseURL = "https://wttr.in/"

func NewWttrClient() *WttrClient {
	return &WttrClient{
		httpClient: &http.Client{
			Timeout: RequestTimeOut,
		},
	}
}

func (wc *WttrClient) FetchWeather(location string) (*WeatherResponse, error) {
	location = strings.TrimSpace(location)

	if location == "" {
		return nil, errors.New("location cannot be empty")
	}

	url := baseURL + url.PathEscape(location) + "?format=j1"

	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("error creating get request :%w", err)
	}

	req.Header.Set("Accept", "application/json")

	resp, err := wc.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error making request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected response status code %d for %s", resp.StatusCode, url)
	}

	var result WttrResponse

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("error decoding response body: %w", err)
	}

	formattedResult, err := ToWeather(&result)
	if err != nil {
		return nil, err
	}

	return formattedResult, nil
}
