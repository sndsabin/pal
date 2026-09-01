import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import Header from "../components/Header";
import ErrorCard from "../components/ErrorCard";
import EmptyLocation from "../components/EmptyLocation";
import TimeConverter from "../components/TimeConverter";
import TimeConverterBar from "../components/TimeConverterBar";
import TrackedLocationsList from "../components/TrackedLocationList";

import { api } from "../api";
import useMinuteTick from "../hooks/useMinuteTick";
import { getDateTime, getTimeDifference } from "./time";

import { TimeFormatOption } from "../constants";

import { TimeFormat, ErrorState, UserLocation, TrackedLocationSelectOption } from "../types";

type OutletContext = {
  isConverterExpanded: boolean;
  setIsConverterExpanded: React.Dispatch<React.SetStateAction<boolean>>;
};

const Home = () => {
  const tick = useMinuteTick();
  const [error, setError] = useState<ErrorState | null>(null);
  const [rawHomeLocation, setRawHomeLocation] = useState<UserLocation | null>(null);
  const [rawTrackedLocations, setRawTrackedLocations] = useState<UserLocation[]>([]);
  const { isConverterExpanded, setIsConverterExpanded } = useOutletContext<OutletContext>();
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(TimeFormatOption.TimeFormat12Hour);
  const [trackedLocationSelectOptions, setTrackedLocationSelectOptions] = useState<
    TrackedLocationSelectOption[]
  >([]);

  const navigate = useNavigate();

  const handleTimeConverterBarToggleAction = () => {
    setIsConverterExpanded((current) => !current);
  };

  const reportError = (err: unknown) => {
    setError({ id: Date.now(), message: err instanceof Error ? err.message : String(err) });
  };

  const handleDeleteAction = async (id: number) => {
    try {
      await api.deleteTrackedLocation(id);
      setRawTrackedLocations(rawTrackedLocations.filter((location) => location.id !== id));
    } catch (err) {
      reportError(err);
    }
  };

  useEffect(() => {
    api
      .getTimeFormatPreference()
      .then((tf) => {
        setTimeFormat(tf);
      })
      .catch((err) => {
        reportError(err);
      });

    api
      .getHomeLocation()
      .then((location) => {
        if (location && location.id !== 0) {
          setRawHomeLocation(location);
        }
      })
      .catch((err) => {
        reportError(err);
      });

    api.getTrackedLocation().then((location) => {
      setRawTrackedLocations(location ?? []);
    });
  }, []);

  const homeLocation = useMemo(() => {
    if (!rawHomeLocation) return null;

    const timezone = rawHomeLocation.timezone;
    const datetime = getDateTime(timezone, timeFormat == TimeFormatOption.TimeFormat12Hour);
    return {
      name: rawHomeLocation.city || rawHomeLocation.state || rawHomeLocation.country,
      date: datetime.date,
      time: datetime.time,
      dayPeriod: datetime.dayPeriod,
      countryFlag: rawHomeLocation.country_flag,
      timezone: timezone,
    };
  }, [timeFormat, rawHomeLocation, tick]);

  const trackedLocations = useMemo(() => {
    const tracked = rawTrackedLocations.map((location) => {
      const timezone = location.timezone;
      const datetime = getDateTime(timezone, timeFormat == TimeFormatOption.TimeFormat12Hour);

      return {
        id: location.id,
        name: location.city || location.state || location.country,
        date: datetime.date,
        time: datetime.time,
        dayPeriod: datetime.dayPeriod,
        timeDifference: homeLocation
          ? getTimeDifference(location.timezone, homeLocation.timezone)
          : "",
        timezone: location.timezone,
        countryFlag: location.country_flag,
      };
    });

    return tracked;
  }, [rawTrackedLocations, timeFormat, homeLocation, tick]);

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
      <Header homeLocation={homeLocation} />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        {error && <ErrorCard key={error.id} message={error.message} />}

        {!homeLocation && (
          <EmptyLocation
            title={"No hometown set"}
            description={"Set hometown to personalize your time view."}
            buttonLabel={"Set Hometown"}
            onButtonClick={() => navigate("/settings")}
          />
        )}

        {!isConverterExpanded && homeLocation && (
          <TrackedLocationsList locations={trackedLocations} onDelete={handleDeleteAction} />
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
      </div>
    </>
  );
};

export default Home;
