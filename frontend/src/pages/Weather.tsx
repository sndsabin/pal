import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";

import HourlyStrip from "../components/HourlyStrip";
import WeatherIcon from "../components/WeatherIcon";
import EmptyLocation from "../components/EmptyLocation";

import { formatTimeAgo } from "../time";
import { HomeOutletContext } from "./Clock";
import { getCurrentWeatherDataFor, getHourlyWeatherDataFor } from "../weather";

import { TemperatureFormatOption, TimeFormatOption } from "../constants";

const Weather = () => {
  const navigate = useNavigate();
  const {
    homeLocation,
    trackedLocations,
    weatherData,
    timeFormat,
    temperatureFormat,
    onRefreshWeather,
  } = useOutletContext<HomeOutletContext>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!homeLocation) {
    return (
      <EmptyLocation
        title={"No hometown set"}
        description={"Set hometown to personalize your time view."}
        buttonLabel={"Set Hometown"}
        onButtonClick={() => navigate("/settings")}
      />
    );
  }

  const isFahrenheit = temperatureFormat === TemperatureFormatOption.TemperatureFormatFahrenheit;
  const is12hr = timeFormat === TimeFormatOption.TimeFormat12Hour;

  const homeCurrentWeather = weatherData
    ? getCurrentWeatherDataFor(weatherData, homeLocation.id, isFahrenheit)
    : null;

  const homeHourlyWeather = weatherData
    ? getHourlyWeatherDataFor(weatherData, homeLocation.id, isFahrenheit)
    : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 pt-2">
      <div className="shrink-0 rounded-2xl border border-white/10 bg-[#0b1022] shadow-inner">
        {homeCurrentWeather ? (
          <>
            <div className="flex h-32 items-center justify-between px-4 pt-3 pb-2.5">
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-xs text-blue-100/85">
                  <span className="font-flags text-sm select-none">{homeLocation.countryFlag}</span>
                  <span className="font-medium">{homeLocation.name}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-blue-200/70">Home</span>
                </div>

                <div className="text-5xl leading-[48px] font-light tracking-tight text-white/90">
                  {homeCurrentWeather.temperature}°
                </div>

                <div className="mt-1 text-sm text-white/80">{homeCurrentWeather.description}</div>

                <div className="mt-0.5 text-xs text-blue-200/70">
                  Feels like {homeCurrentWeather.feels_like}°
                </div>
              </div>

              <WeatherIcon
                condition={homeCurrentWeather.condition}
                isDay={homeLocation.isDay}
                className="h-[72px] w-[72px] stroke-[1.4]"
              />
            </div>

            {homeHourlyWeather?.length && (
              <HourlyStrip hourlyWeather={homeHourlyWeather} hour12={is12hr} />
            )}
          </>
        ) : (
          <div className="flex h-[180px] items-center justify-center text-xs text-blue-200/50">
            Weather unavailable.
          </div>
        )}
      </div>

      <div className="mt-2.5 flex h-[30px] shrink-0 items-center justify-between">
        <div className="text-[11px] font-medium tracking-[0.12em] text-blue-200/70 uppercase">
          Tracked cities
        </div>

        <div className="flex items-center gap-2">
          {homeCurrentWeather?.updated_at && (
            <span className="text-[11px] text-blue-200/70">
              Synced {formatTimeAgo(homeCurrentWeather.updated_at)}
            </span>
          )}

          <button
            type="button"
            title="Refresh weather"
            aria-label="Refresh weather"
            disabled={isRefreshing}
            onClick={async () => {
              setIsRefreshing(true);
              await onRefreshWeather(true);
              setIsRefreshing(false);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-inner transition hover:bg-white/20 disabled:opacity-60"
          >
            <RefreshCcw className={`h-[13px] w-[13px] ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {trackedLocations.length === 0 && (
        <EmptyLocation
          title={"No locations found"}
          description={"Add a location to see its weather."}
          buttonLabel={"Add Location"}
          onButtonClick={() => navigate("/add")}
        />
      )}

      <div className="custom-scrollbar min-h-0 flex-1 divide-y divide-white/10 overflow-y-auto">
        {trackedLocations.map((location) => {
          let currentWeather = weatherData
            ? getCurrentWeatherDataFor(weatherData, location.id, isFahrenheit)
            : null;
          return (
            <div key={location.id} className="flex h-[52px] items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="font-flags text-2xl select-none">{location.countryFlag}</span>

                <div className="flex flex-col">
                  <span className="text-base leading-[22px] font-normal tracking-wide text-white/80">
                    {location.name}
                  </span>

                  <span className="text-xs text-blue-200/60">
                    <span className="inline-block min-w-[9rem]">
                      {currentWeather ? currentWeather.description : "No data"}
                    </span>
                    · {location.time}
                    {location.dayPeriod ? ` ${location.dayPeriod}` : ""}
                  </span>
                </div>
              </div>

              {currentWeather && (
                <div className="flex items-center gap-2.5">
                  <WeatherIcon
                    condition={currentWeather.condition}
                    isDay={location.isDay}
                    className="h-[18px] w-[18px]"
                  />

                  <span className="text-xl font-light tracking-tight text-white/80">
                    {currentWeather.temperature}°
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Weather;
