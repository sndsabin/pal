import { WeatherData } from "./types";

export const getCurrentWeatherDataFor = (
  data: WeatherData[],
  locationId: number,
  toFahrenheit: boolean,
) => {
  const weatherData = getWeatherDataFor(data, locationId, toFahrenheit);

  return weatherData?.Current ?? null;
};

export const getHourlyWeatherDataFor = (
  data: WeatherData[],
  locationId: number,
  toFahrenheit: boolean,
) => {
  const weatherData = getWeatherDataFor(data, locationId, toFahrenheit);

  return weatherData?.Hourly?.filter((item) => item !== null) ?? null;
};

export const celsiusToFahrenheit = (celcius: number) => {
  return (celcius * 9) / 5 + 32;
};

const getWeatherDataFor = (data: WeatherData[], locationId: number, toFahrenheit: boolean) => {
  let weatherData = data.find((item) => item.Current?.location_id === locationId);

  if (!weatherData) {
    return null;
  }

  if (!toFahrenheit) {
    return weatherData;
  }

  return {
    ...weatherData,
    Current: weatherData.Current
      ? {
          ...weatherData.Current,
          temperature: celsiusToFahrenheit(weatherData.Current.temperature),
          feels_like: celsiusToFahrenheit(weatherData.Current.feels_like),
        }
      : weatherData.Current,
    Hourly: weatherData.Hourly?.map((item) =>
      item
        ? {
            ...item,
            temperature: celsiusToFahrenheit(item.temperature),
            feels_like: celsiusToFahrenheit(item.feels_like),
          }
        : item,
    ),
  };
};
