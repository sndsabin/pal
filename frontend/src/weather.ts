import { DateTime } from "luxon";
import { CurrentWeather, HourlyWeather, WeatherData } from "./types";

export const getHourlyWeatherForToday = (
  hourlyWeather: HourlyWeather[],
  referenceTimezone: string,
) => {
  const today = DateTime.now().setZone(referenceTimezone);
  const todayHourlyWeather = [];

  for (const item of hourlyWeather) {
    if (!item) {
      continue;
    }

    const forecastDate = DateTime.fromISO(item.forecast_at, {
      zone: "utc",
    }).setZone(referenceTimezone);

    if (forecastDate.hasSame(today, "day")) {
      todayHourlyWeather.push(item);
    }
  }

  return todayHourlyWeather.sort(
    (a, b) =>
      DateTime.fromISO(a.forecast_at, { zone: "utc" }).toMillis() -
      DateTime.fromISO(b.forecast_at, { zone: "utc" }).toMillis(),
  );
};

export const celsiusToFahrenheit = (celcius: number) => {
  return (celcius * 9) / 5 + 32;
};

export const getWeatherDataByLocationId = (
  weatherData: WeatherData[] | null,
  isFahrenheit: boolean,
) => {
  if (!weatherData) {
    return {};
  }

  const data: Record<
    number,
    {
      current: CurrentWeather;
      hourly: HourlyWeather[];
    }
  > = {};

  for (const weather of weatherData) {
    const current = weather.Current;

    if (!current) {
      continue;
    }

    const hourly = weather.Hourly ?? [];

    data[current.location_id] = {
      current: {} as CurrentWeather,
      hourly: [],
    };

    data[current.location_id]["current"] = {
      ...current,
      temperature: isFahrenheit ? celsiusToFahrenheit(current.temperature) : current.temperature,
      feels_like: isFahrenheit ? celsiusToFahrenheit(current.feels_like) : current.feels_like,
    };
    data[current.location_id]["hourly"] = [];

    for (const item of hourly) {
      if (!item) {
        continue;
      }

      data[current.location_id]["hourly"].push({
        ...item,
        temperature: isFahrenheit ? celsiusToFahrenheit(item.temperature) : item.temperature,
        feels_like: isFahrenheit ? celsiusToFahrenheit(item.feels_like) : item.feels_like,
      });
    }
  }

  return data;
};
