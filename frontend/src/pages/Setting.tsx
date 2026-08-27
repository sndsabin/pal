import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

import ErrorCard from "../components/ErrorCard";
import LocationField from "../components/inputs/LocationField";

import { api } from "../api";
import {
  locationSearchResultToLocationPayload,
  userLocationToLocationSearchResult,
} from "../mapper";

import useLocationSearch from "../hooks/useLocationSearch";

import { TimeFormatOption } from "../constants";
import { ErrorState, LocationSearchResult, TimeFormat } from "../types";

const Setting = () => {
  const [query, setQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(TimeFormatOption.TimeFormat12Hour);

  const [selectedLocation, setSelectedLocation] = useState<LocationSearchResult | null>(null);

  const navigate = useNavigate();
  const locationSuggestions = useLocationSearch(query);

  const canSave = Boolean(
    selectedLocation && selectedLocation.timezone_count === 1 && selectedLocation.timezone_id,
  );

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
      await api.updateTimeFormatPreference(timeFormat);
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
      .getTimeFormatPreference()
      .then((tf) => {
        setTimeFormat(tf);
      })
      .catch((err) => {
        reportError(err);
      });

    api
      .getHomeLocation()
      .then((home) => {
        if (home && home.id !== 0) {
          setSelectedLocation(userLocationToLocationSearchResult(home));
        }
      })
      .catch((err) => {
        reportError(err);
      });
  }, []);

  return (
    <div className="relative z-15 flex min-h-0 flex-col overflow-visible bg-[#070b1a]/95 p-6 backdrop-blur-md">
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

      <div className="min-h-0 flex-1 space-y-6">
        <span className="mb-2 block text-xs font-medium tracking-wider text-blue-200/70 uppercase">
          Time Format
        </span>

        <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/15 bg-[#0b1022] p-1">
          <button
            type="button"
            onClick={() => setTimeFormat(TimeFormatOption.TimeFormat12Hour)}
            className={`rounded-lg py-2 text-xs font-medium transition ${
              timeFormat === "12hr"
                ? "bg-white/20 text-white shadow"
                : "text-blue-200/60 hover:text-white"
            }`}
          >
            12-Hour (AM/PM)
          </button>

          <button
            type="button"
            onClick={() => setTimeFormat(TimeFormatOption.TimeFormat24Hour)}
            className={`rounded-lg py-2 text-xs font-medium transition ${
              timeFormat === "24hr"
                ? "bg-white/20 text-white shadow"
                : "text-blue-200/60 hover:text-white"
            }`}
          >
            24-Hour
          </button>
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

      {error && <ErrorCard key={error.id} message={error.message} />}

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
