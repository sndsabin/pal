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

export type HomeOutletContext = {
  homeLocation: HomeLocation | null;
  trackedLocations: TrackedLocation[];
  isLocationLoading: boolean;
  weatherData: WeatherData[] | null;
  timeFormat: TimeFormat;
  temperatureFormat: TemperatureFormat;
  onError: (err: unknown) => void;
  onRefreshWeather: (ignoreWeatherCacheTTL?: boolean) => void;
  onTrackedLocationDelete: (id: number) => Promise<void>;
};

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

  return (
    <>
      {!isLocationLoading && !homeLocation && (
        <EmptyLocation
          title={"No hometown set"}
          description={"Set hometown to personalize your time view."}
          buttonLabel={"Set Hometown"}
          onButtonClick={() => navigate("/settings")}
        />
      )}

      {!isConverterExpanded && homeLocation && (
        <TrackedLocationsList
          locations={trackedLocations}
          weatherData={weatherData}
          temperatureFormat={temperatureFormat}
          onDelete={onTrackedLocationDelete}
        />
      )}

      {isConverterExpanded && homeLocation && trackedLocations && (
        <TimeConverter
          locationSelectOptions={trackedLocationSelectOptions}
          homeLocation={homeLocation}
        />
      )}

      {homeLocation && trackedLocations && (
        <TimeConverterBar
          isExpanded={isConverterExpanded}
          onToggle={handleTimeConverterBarToggleAction}
        />
      )}
    </>
  );
};

export default Clock;
