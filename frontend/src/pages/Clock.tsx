import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import EmptyLocation from "../components/EmptyLocation";
import TimeConverter from "../components/TimeConverter";
import TrackedLocationsList from "../components/ClockList";
import TimeConverterBar from "../components/TimeConverterBar";

import type {
  HomeLocation,
  TemperatureFormat,
  TimeFormat,
  TrackedLocation,
  TrackedLocationSelectOption,
  WeatherData,
} from "../types";

export interface HomeOutletContext {
  homeLocation: HomeLocation | null;
  trackedLocations: TrackedLocation[];
  isLocationLoading: boolean;
  weatherData: WeatherData[] | null;
  timeFormat: TimeFormat;
  temperatureFormat: TemperatureFormat;
  onError: (err: unknown) => void;
  onRefreshWeather: (ignoreWeatherCacheTTL?: boolean) => Promise<void>;
  onTrackedLocationDelete: (id: number) => Promise<void>;
}

const Clock = () => {
  const navigate = useNavigate();
  const {
    homeLocation,
    trackedLocations,
    isLocationLoading,
    weatherData,
    temperatureFormat,
    onTrackedLocationDelete,
  } = useOutletContext<HomeOutletContext>();
  const [isConverterExpanded, setIsConverterExpanded] = useState(false);
  const [trackedLocationSelectOptions, setTrackedLocationSelectOptions] = useState<
    TrackedLocationSelectOption[]
  >([]);

  const handleTimeConverterBarToggleAction = () => {
    setIsConverterExpanded((current) => !current);
  };

  useEffect(() => {
    const options = trackedLocations.map((location) => {
      return {
        name: location.name,
        countryFlag: location.countryFlag,
        timezone: location.timezone,
      };
    });
    setTrackedLocationSelectOptions(options);
  }, [trackedLocations]);

  const hasHomeLocation = !isLocationLoading && homeLocation;
  const hasTrackedLocation = !isLocationLoading && trackedLocations;
  const showEmptyLocation = !isLocationLoading && !homeLocation;
  const showTrackedLocation = hasHomeLocation && !isConverterExpanded;
  const showTimeConverter = isConverterExpanded && hasHomeLocation && hasTrackedLocation;
  const showTimeConverterBar = hasHomeLocation && hasTrackedLocation;

  return (
    <>
      {showEmptyLocation && (
        <EmptyLocation
          title={"No hometown set"}
          description={"Set hometown to personalize your time view."}
          buttonLabel={"Set Hometown"}
          onButtonClick={() => navigate("/settings")}
        />
      )}

      {showTrackedLocation && (
        <TrackedLocationsList
          locations={trackedLocations}
          weatherData={weatherData}
          temperatureFormat={temperatureFormat}
          onDelete={onTrackedLocationDelete}
        />
      )}

      {showTimeConverter && (
        <TimeConverter
          locationSelectOptions={trackedLocationSelectOptions}
          homeLocation={homeLocation}
        />
      )}

      {showTimeConverterBar && (
        <TimeConverterBar
          isExpanded={isConverterExpanded}
          onToggle={handleTimeConverterBarToggleAction}
        />
      )}
    </>
  );
};

export default Clock;
