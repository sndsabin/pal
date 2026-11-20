import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Loader2 } from "lucide-react";

import ErrorCard from "../components/ErrorCard";
import LocationField from "../components/inputs/LocationField";

import { api } from "../api";
import {
  locationSearchResultToLocationPayload,
  userLocationToLocationSearchResult,
} from "../mapper";

import useLocationSearch from "../hooks/useLocationSearch";

import { TimeFormatOption, TemperatureFormatOption } from "../constants";
import type { ErrorState, LocationSearchResult, UserPreference } from "../types";

const Setting = () => {
  const [query, setQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [userPreference, setUserPrefrence] = useState<UserPreference | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<LocationSearchResult | null>(null);

  const navigate = useNavigate();
  const locationSuggestions = useLocationSearch(query);

  const canSave = Boolean(
    selectedLocation && selectedLocation.timezone_count === 1 && selectedLocation.timezone_id,
  );

  const updateUserPreference = (key: string, value: string | boolean) => {
    setUserPrefrence((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const reportError = (err: unknown) => {
    setError({
      id: Date.now(),
      message: err instanceof Error ? err.message : String(err),
    });
  };

  const handleSave = async () => {
    if (!selectedLocation || !selectedLocation.timezone_id) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (userPreference) {
        await api.updateUserPreference({
          TimeFormat: userPreference.time_format,
          TemperatureFormat: userPreference.temperature_format,
          AlertSound: userPreference.alert_sound,
        });
      }

      await api.upsertHomeLocation(locationSearchResultToLocationPayload(selectedLocation));
      navigate("/");
    } catch (err) {
      reportError(err);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    api
      .getUserPreference()
      .then((preference) => {
        setUserPrefrence(preference);
      })
      .catch(reportError);

    api
      .getHomeLocation()
      .then((home) => {
        if (home && home.id !== 0) {
          setSelectedLocation(userLocationToLocationSearchResult(home));
        }
      })
      .catch(reportError);
  }, []);

  return (
    <div className="relative z-15 flex min-h-0 flex-col overflow-visible bg-[#070b1a]/95 p-6 backdrop-blur-md">
      {error && <ErrorCard key={error.id} message={error.message} />}

      <div className="mb-6 flex shrink-0 items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 transition hover:bg-white/20"
        >
          <ArrowLeft className="h-4 w-4 text-white" />
        </button>

        <h2 className="text-base font-medium text-white">Settings</h2>

        <div className="w-8" />
      </div>

      <div className="min-h-0 flex-1 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-1">
            <span className="mb-2 block text-xs font-medium tracking-wider text-blue-200/70 uppercase">
              Time Format
            </span>

            <div
              role="group"
              className="grid grid-cols-2 gap-1 rounded-xl border border-white/15 bg-[#0b1022] p-1"
            >
              <button
                type="button"
                onClick={() =>
                  updateUserPreference("time_format", TimeFormatOption.TimeFormat12Hour)
                }
                className={`rounded-lg py-2 text-xs font-medium transition ${
                  userPreference?.time_format === "12hr"
                    ? "bg-white/20 text-white shadow"
                    : "text-blue-200/60 hover:text-white"
                }`}
              >
                12-Hour
              </button>

              <button
                type="button"
                onClick={() =>
                  updateUserPreference("time_format", TimeFormatOption.TimeFormat24Hour)
                }
                className={`rounded-lg py-2 text-xs font-medium transition ${
                  userPreference?.time_format === "24hr"
                    ? "bg-white/20 text-white shadow"
                    : "text-blue-200/60 hover:text-white"
                }`}
              >
                24-Hour
              </button>
            </div>
          </div>
          <div className="col-span-1">
            <span className="mb-2 block text-xs font-medium tracking-wider text-blue-200/70 uppercase">
              Temperature
            </span>

            <div
              role="group"
              className="grid grid-cols-2 gap-1 rounded-xl border border-white/15 bg-[#0b1022] p-1"
            >
              <button
                type="button"
                aria-label="celcius"
                onClick={() =>
                  updateUserPreference(
                    "temperature_format",
                    TemperatureFormatOption.TemperatureFormatCelcius,
                  )
                }
                className={`rounded-lg py-2 text-xs font-medium transition ${
                  userPreference?.temperature_format === "c"
                    ? "bg-white/20 text-white shadow"
                    : "text-blue-200/60 hover:text-white"
                }`}
              >
                °C
              </button>

              <button
                type="button"
                aria-label="fahrenheit"
                onClick={() =>
                  updateUserPreference(
                    "temperature_format",
                    TemperatureFormatOption.TemperatureFormatFahrenheit,
                  )
                }
                className={`rounded-lg py-2 text-xs font-medium transition ${
                  userPreference?.temperature_format === "f"
                    ? "bg-white/20 text-white shadow"
                    : "text-blue-200/60 hover:text-white"
                }`}
              >
                °F
              </button>
            </div>
          </div>

          <div className="col-span-2">
            <span className="mb-2 block text-xs font-medium tracking-wider text-blue-200/70 uppercase">
              Notification
            </span>
            <div className="flex h-10 items-center justify-between rounded-xl border border-white/10 bg-[#0b1022] px-3">
              <span className="flex items-center gap-2 text-sm text-white/80">
                <Bell className="h-3.5 w-3.5 text-blue-400" />
                Alert sound
              </span>

              <button
                type="button"
                role="switch"
                aria-checked={userPreference?.alert_sound}
                aria-label="Alert sound"
                onClick={() => updateUserPreference("alert_sound", !userPreference?.alert_sound)}
                className={`relative h-5 w-9 rounded-full transition ${
                  userPreference?.alert_sound
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                    : "bg-white/15"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                    userPreference?.alert_sound ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="relative">
          <label className="mb-2 block text-xs font-medium tracking-wider text-blue-200/70 uppercase">
            Hometown
          </label>

          <LocationField
            query={query}
            selectedLocation={selectedLocation}
            locationSuggestions={locationSuggestions}
            onLocationSelect={setSelectedLocation}
            onQueryChange={setQuery}
          />
        </div>
      </div>

      <div className="mt-auto shrink-0 pt-4">
        <button
          onClick={handleSave}
          type="button"
          disabled={isSaving || !canSave}
          className={`flex w-full items-center justify-center rounded-xl border border-white/20 py-3 text-sm font-medium text-white shadow-lg transition ${
            !isSaving && canSave
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/20 hover:opacity-90"
              : "cursor-not-allowed bg-white/10 text-white/30"
          }`}
        >
          {isSaving ? <Loader2 size={13} className="animate-spin" /> : "Save"}
        </button>
      </div>
    </div>
  );
};

export default Setting;
