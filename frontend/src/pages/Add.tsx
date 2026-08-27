import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader } from "lucide-react";

import ErrorCard from "../components/ErrorCard";
import LocationField from "../components/inputs/LocationField";
import useLocationSearch from "../hooks/useLocationSearch";

import { api } from "../api";
import { locationSearchResultToLocationPayload } from "../mapper";

import { ErrorState, LocationSearchResult } from "../types";

const Add = () => {
  const [query, setQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationSearchResult | null>(null);

  const navigate = useNavigate();
  const locationSuggestions = useLocationSearch(query);

  const canSave = Boolean(
    selectedLocation && selectedLocation.timezone_count === 1 && selectedLocation.timezone,
  );

  const handleSaveAction = async () => {
    if (!selectedLocation || !selectedLocation.timezone_id) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await api.addTrackedLocation(locationSearchResultToLocationPayload(selectedLocation));
      navigate("/");
    } catch (err) {
      setError({
        id: Date.now(),
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="z-15 flex min-h-0 flex-1 flex-col overflow-hidden bg-[#070b1a]/95 p-6 backdrop-blur-md">
      <div className="mb-6 flex shrink-0 items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 transition hover:bg-white/20"
        >
          <ArrowLeft className="h-4 w-4 text-white" />
        </button>

        <h2 className="text-base font-medium text-white">Add New City</h2>

        <div className="w-8" />
      </div>

      <div className="flex min-h-0 flex-col space-y-4">
        <div className="shrink-0">
          <label className="mb-1.5 block text-xs font-medium text-blue-200/70">Location</label>

          <div className="relative">
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

        <div className="mt-auto shrink-0 pb-0">
          <button
            onClick={handleSaveAction}
            type="button"
            disabled={isSaving || !canSave}
            className={`flex w-full items-center justify-center rounded-xl border border-white/20 py-3 text-sm font-medium text-white shadow-lg transition ${
              !isSaving && canSave
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/20 hover:opacity-90"
                : "cursor-not-allowed bg-white/10 text-white/30"
            }`}
          >
            {isSaving ? <Loader size={13} className="animate-spin" /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Add;
