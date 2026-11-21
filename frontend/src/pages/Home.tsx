import { useEffect, useMemo, useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import { Clock, CloudSun, TimerIcon } from "lucide-react";

import Header from "../components/Header";
import TabBar from "../components/TabBar";
import ErrorCard from "../components/ErrorCard";

import { api } from "../api";
import useMinuteTick from "../hooks/useMinuteTick";
import { getDateTime, getTimeDifference } from "../time";

import { TemperatureFormatOption, TimeFormatOption } from "../constants";

import type {
  TimeFormat,
  ErrorState,
  UserLocation,
  HomeLocation,
  TrackedLocation,
  WeatherData,
  TemperatureFormat,
} from "../types";
import { getWeatherDataByLocationId } from "../weather";

interface AppContext {
  forceWeatherRefresh: boolean;
}

const Home = () => {
  const tick = useMinuteTick();
  const { forceWeatherRefresh } = useOutletContext<AppContext>();

  const [error, setError] = useState<ErrorState | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [rawHomeLocation, setRawHomeLocation] = useState<UserLocation | null>(null);
  const [rawTrackedLocations, setRawTrackedLocations] = useState<UserLocation[]>([]);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(TimeFormatOption.TimeFormat12Hour);
  const [temperatureFormat, setTemperatureFormat] = useState<TemperatureFormat>(
    TemperatureFormatOption.TemperatureFormatCelcius,
  );
  const [weatherData, setWeatherData] = useState<WeatherData[] | null>(null);

  const reportError = (err: unknown) => {
    setError({ id: Date.now(), message: err instanceof Error ? err.message : String(err) });
  };

  useEffect(() => {
    setIsLocationLoading(true);

    api
      .getUserPreference()
      .then((preference) => {
        if (preference) {
          setTimeFormat(preference.time_format);
          setTemperatureFormat(preference.temperature_format);
        }
      })
      .catch(reportError);

    Promise.all([api.getHomeLocation(), api.getTrackedLocation()])
      .then(([homeLocation, trackedLocations]) => {
        if (homeLocation && homeLocation.id !== 0) {
          setRawHomeLocation(homeLocation);
        }

        setRawTrackedLocations(trackedLocations ?? []);
      })
      .catch(reportError)
      .finally(() => {
        setIsLocationLoading(false);
      });

    getWeatherData(forceWeatherRefresh);

    const unsubscribeWeatherRefreshedEvent = api.onWeatherRefreshed(getWeatherData);

    return () => {
      unsubscribeWeatherRefreshedEvent();
    };
  }, []);

  const homeLocation: HomeLocation | null = useMemo(() => {
    if (!rawHomeLocation) return null;

    const timezone = rawHomeLocation.timezone;
    const datetime = getDateTime(timezone, timeFormat == TimeFormatOption.TimeFormat12Hour);
    return {
      id: rawHomeLocation.id,
      name: rawHomeLocation.city || rawHomeLocation.state || rawHomeLocation.country,
      date: datetime.date,
      time: datetime.time,
      isDay: datetime.isDay,
      dayPeriod: datetime.dayPeriod,
      countryFlag: rawHomeLocation.country_flag,
      timezone: timezone,
    };
  }, [timeFormat, rawHomeLocation, tick]);

  const trackedLocations: TrackedLocation[] = useMemo(() => {
    const tracked = rawTrackedLocations.map((location) => {
      const timezone = location.timezone;
      const datetime = getDateTime(timezone, timeFormat == TimeFormatOption.TimeFormat12Hour);

      return {
        id: location.id,
        name: location.city || location.state || location.country,
        date: datetime.date,
        time: datetime.time,
        isDay: datetime.isDay,
        dayPeriod: datetime.dayPeriod,
        timeDifference: homeLocation
          ? getTimeDifference(location.timezone, homeLocation.timezone)
          : "",
        countryFlag: location.country_flag,
        timezone: location.timezone,
      };
    });

    return tracked;
  }, [rawTrackedLocations, timeFormat, homeLocation, tick]);

  const handleTrackedLocationDeleteAction = async (id: number) => {
    try {
      await api.deleteTrackedLocation(id);
      setRawTrackedLocations(rawTrackedLocations.filter((location) => location.id !== id));
    } catch (err: unknown) {
      reportError(err);
    }
  };

  const getWeatherData = async (forceRefresh: boolean = false) => {
    try {
      const record = await api.getWeatherData(forceRefresh);
      if (record) {
        setWeatherData(record.filter((data: WeatherData | null) => data !== null));
      }
    } catch (err: unknown) {
      reportError(err);
    }
  };

  const isFahrenheit = temperatureFormat === TemperatureFormatOption.TemperatureFormatFahrenheit;
  const weatherByLocationId = useMemo(() => {
    return getWeatherDataByLocationId(weatherData, isFahrenheit);
  }, [weatherData, isFahrenheit]);

  const tabs = [
    { to: "/", label: "Clocks", Icon: Clock },
    { to: "/weather", label: "Weather", Icon: CloudSun },
    { to: "/timer", label: "Timer", Icon: TimerIcon },
  ];

  return (
    <>
      <Header
        homeLocation={homeLocation}
        currentWeather={
          homeLocation ? (weatherByLocationId[homeLocation.id]?.["current"] ?? null) : null
        }
      />
      <TabBar tabs={tabs} />

      <div className="z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        {error && <ErrorCard key={error.id} message={error.message} />}

        <Outlet
          context={{
            homeLocation: homeLocation,
            trackedLocations: trackedLocations,
            isLocationLoading: isLocationLoading,
            weatherData: weatherData,
            timeFormat: timeFormat,
            temperatureFormat: temperatureFormat,
            onRefreshWeather: async () => {
              await getWeatherData(true);
            },
            onTrackedLocationDelete: handleTrackedLocationDeleteAction,
            onError: reportError,
          }}
        />
      </div>
    </>
  );
};

export default Home;
