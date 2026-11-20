import { useMemo, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";

import WeatherIcon from "../components/WeatherIcon";
import EmptyLocation from "../components/EmptyLocation";

import { formatTimeAgo } from "../time";
import { HomeOutletContext } from "./Clock";
import { getWeatherDataByLocationId } from "../weather";

import { TemperatureFormatOption, TimeFormatOption } from "../constants";
import { HomeLocation, TrackedLocation } from "../types";
import WeatherDetail from "../components/WeatherDetail";

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
  const [selectedLocation, setSelectedLocation] = useState<HomeLocation | TrackedLocation | null>(
    homeLocation,
  );

  const is12hr = timeFormat === TimeFormatOption.TimeFormat12Hour;
  const isFahrenheit = temperatureFormat === TemperatureFormatOption.TemperatureFormatFahrenheit;

  const weatherByLocationId = useMemo(() => {
    return getWeatherDataByLocationId(weatherData, isFahrenheit);
  }, [weatherData, isFahrenheit]);

  const locations = [homeLocation, ...trackedLocations];

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

  const homeCurrentWeather = weatherByLocationId[homeLocation.id]?.["current"] ?? null;

  const renderWeatherDetail = (
    location: HomeLocation | TrackedLocation,
    referenceTimezone: string,
  ) => {
    const currentWeather = weatherByLocationId[location.id]?.["current"] ?? null;
    const hourlyWeatherData = weatherByLocationId[location.id]?.["hourly"] ?? null;

    return (
      <WeatherDetail
        name={location.name}
        countryFlag={location.countryFlag}
        currentWeather={currentWeather}
        hourlyWeatherData={hourlyWeatherData}
        locationTimezone={location.timezone}
        referenceTimezone={referenceTimezone}
        is12hr={is12hr}
        isDay={location.isDay}
        isHome={homeLocation.id === location.id}
      />
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 pt-2">
      <div className="shrink-0 rounded-2xl border border-white/10 bg-[#0b1022] shadow-inner">
        {selectedLocation
          ? renderWeatherDetail(selectedLocation, homeLocation.timezone)
          : renderWeatherDetail(homeLocation, homeLocation.timezone)}
      </div>

      <div className="mt-2.5 flex h-[30px] shrink-0 items-center justify-between">
        <div className="text-[11px] font-medium tracking-[0.12em] text-blue-200/70 uppercase">
          Locations
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

      <div className="custom-scrollbar min-h-0 flex-1 divide-y divide-white/10 overflow-y-auto">
        {locations.length > 0 &&
          locations.map((location) => {
            if (!location) {
              return;
            }

            const currentWeather = weatherByLocationId[location.id]?.["current"] ?? null;

            return (
              <button
                key={location.id}
                className={`font-inherit flex h-[52px] w-full cursor-pointer items-center justify-between border-0 border-l-2 bg-transparent p-0 pl-2 text-left transition-colors ${
                  selectedLocation?.id === location.id
                    ? "border-l-white/50"
                    : "border-l-transparent hover:bg-white/[0.03]"
                }`}
                onClick={() => {
                  setSelectedLocation(location);
                }}
              >
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
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default Weather;
