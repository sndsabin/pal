import HourlyStrip from "./HourlyStrip";
import WeatherIcon from "./WeatherIcon";

import { getHourlyWeatherForToday } from "../weather";

import { CurrentWeather, HourlyWeather } from "../types";

interface Props {
  name: string;
  countryFlag: string;
  currentWeather: CurrentWeather | null;
  hourlyWeatherData: HourlyWeather[] | null;
  locationTimezone: string;
  referenceTimezone: string;
  is12hr: boolean;
  isDay: boolean;
  isHome: boolean;
}

const WeatherDetail = ({
  name,
  countryFlag,
  currentWeather,
  hourlyWeatherData,
  locationTimezone,
  referenceTimezone,
  is12hr,
  isDay,
  isHome,
}: Props) => {
  const hourlyWeather = hourlyWeatherData
    ? getHourlyWeatherForToday(hourlyWeatherData, referenceTimezone)
    : [];

  if (!currentWeather) {
    return (
      <div className="flex h-[180px] items-center justify-center text-xs text-blue-200/50">
        Weather unavailable.
      </div>
    );
  }

  return (
    <>
      <div className="flex h-32 items-center justify-between px-4 pt-3 pb-2.5">
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-xs text-blue-100/85">
            <span className="font-flags text-sm select-none">{countryFlag}</span>
            <span className="font-medium">{name}</span>
            {isHome && (
              <>
                <span className="text-white/30">•</span>
                <span className="text-blue-200/70">Home</span>
              </>
            )}
          </div>

          <div className="text-5xl leading-[48px] font-light tracking-tight text-white/90">
            {currentWeather.temperature}°
          </div>

          <div className="mt-1 text-sm text-white/80">{currentWeather.description}</div>

          <div className="mt-0.5 text-xs text-blue-200/70">
            Feels like {currentWeather.feels_like}°
          </div>
        </div>

        <WeatherIcon
          condition={currentWeather.condition}
          isDay={isDay}
          className="h-[72px] w-[72px] stroke-[1.4]"
        />
      </div>

      <HourlyStrip
        hourlyWeather={hourlyWeather}
        hour12={is12hr}
        locationTimezone={locationTimezone}
      />
    </>
  );
};

export default WeatherDetail;
