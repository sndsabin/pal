import { useState } from "react";
import { Search, MapPin, AlertCircle } from "lucide-react";

import { LocationType } from "../../constants";

import { LocationSearchResult } from "../../types";

interface Props {
  query: string;
  selectedLocation: LocationSearchResult | null;
  locationSuggestions: LocationSearchResult[];
  onQueryChange: (query: string) => void;
  onLocationSelect: (location: LocationSearchResult) => void;
}

const LocationField = ({
  query,
  selectedLocation,
  locationSuggestions,
  onQueryChange,
  onLocationSelect,
}: Props) => {
  const KEY_ENTER = "Enter";
  const KEY_ESCAPE = "Escape";
  const KEY_ARROW_UP = "ArrowUp";
  const KEY_ARROW_DOWN = "ArrowDown";

  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputFocus = () => {
    if (locationSuggestions.length > 0 && query.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleLocationSelect = (location: LocationSearchResult) => {
    onLocationSelect(location);
    setShowSuggestions(false);
    onQueryChange(""); // reset query
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || locationSuggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case KEY_ARROW_DOWN:
        e.preventDefault();
        setHighlightedIndex((current) =>
          current < locationSuggestions.length - 1 ? current + 1 : 0,
        );
        break;

      case KEY_ARROW_UP:
        e.preventDefault();
        setHighlightedIndex((current) =>
          current > 0 ? current - 1 : locationSuggestions.length - 1,
        );
        break;

      case KEY_ENTER:
        e.preventDefault();
        const location = locationSuggestions[highlightedIndex];
        handleLocationSelect(location);
        break;

      case KEY_ESCAPE:
        e.preventDefault();
        setShowSuggestions(false);
        break;

      default:
        return;
    }
  };

  const getInfo = (location: LocationSearchResult) => {
    if (location.type == LocationType.SearchTypeCity) {
      return `${location.state}, ${location.country}`;
    }

    if (location.type === LocationType.SearchTypeState) {
      return location.country;
    }

    return "Country";
  };

  return (
    <>
      <div className="relative w-full">
        <div className="flex w-full items-center rounded-xl border border-white/15 bg-[#0b1022] px-3.5 py-2.5 transition focus-within:border-blue-400">
          <Search className="mr-2.5 h-4 w-4 shrink-0 text-white/40" />

          <input
            type="text"
            value={query}
            onChange={(e) => {
              onQueryChange(e.target.value);
              setShowSuggestions(e.target.value.trim().length >= 2);
            }}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder="City, state, or country"
            className="w-full bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
            autoComplete="off"
          />
        </div>

        {showSuggestions && (
          <div className="absolute top-full right-0 left-0 z-[9999] mt-2 max-h-80 overflow-y-auto rounded-2xl border border-white/15 bg-[#0b1022] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            {locationSuggestions.length > 0 ? (
              <div className="py-1.5">
                {locationSuggestions.map((location, index) => {
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <button
                      key={index}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleLocationSelect(location);
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`flex w-full items-center px-3.5 py-2.5 text-left transition ${
                        isHighlighted ? "bg-white/[0.08]" : "hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05]">
                        {location.type === LocationType.SearchTypeCountry ? (
                          <span className="text-lg">{location.country_flag}</span>
                        ) : (
                          <MapPin className="h-4 w-4 text-blue-300/80" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm text-white">{location.name}</div>

                        <div className="mt-0.5 truncate text-[11px] text-blue-200/50">
                          {getInfo(location)}
                        </div>
                      </div>

                      {location.timezone_count > 1 && (
                        <AlertCircle className="ml-2 h-3.5 w-3.5 shrink-0 text-amber-300/70" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-4 text-center text-xs text-white/40">No locations found</div>
            )}
          </div>
        )}
      </div>

      {selectedLocation && (
        <div
          className={`mt-4 shrink-0 rounded-2xl border p-3 ${
            selectedLocation.timezone_count > 1
              ? "border-amber-300/15 bg-amber-500/[0.06]"
              : "border-blue-300/15 bg-blue-500/[0.06]"
          }`}
        >
          <div className="flex items-center">
            <span className="mr-3 text-2xl">{selectedLocation.country_flag}</span>

            <div className="min-w-0">
              <div className="text-sm font-medium text-white">{selectedLocation.name}</div>

              <div className="mt-0.5 truncate text-xs text-blue-200/60">
                {getInfo(selectedLocation)}
              </div>
            </div>
          </div>

          {selectedLocation.timezone_count === 1 && selectedLocation.timezone && (
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5">
              <span className="text-[11px] text-blue-200/50">Time zone</span>

              <span className="font-mono text-xs text-blue-100/90">
                {selectedLocation.timezone}
              </span>
            </div>
          )}

          {selectedLocation.timezone_count > 1 && (
            <div className="mt-3 flex items-start space-x-2 border-t border-white/10 pt-2.5">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300/70" />

              <p className="text-[11px] leading-relaxed text-amber-100/70">
                {selectedLocation.type == LocationType.SearchTypeCountry
                  ? "Selected country has multiple timezones. Enter a state or city."
                  : "Selected state has multiple timezones. Enter a city."}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default LocationField;
