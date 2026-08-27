import { useNavigate } from "react-router-dom";

import EmptyLocation from "./EmptyLocation";

import { TrackedLocation } from "../types";

interface Props {
  locations: TrackedLocation[];
  onDelete: (id: number) => void;
}

const TrackedLocationsList = ({ locations, onDelete }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="custom-scrollbar min-h-0 flex-1 divide-y divide-white/10 overflow-y-auto px-6 py-2">
      {locations.length === 0 && (
        <EmptyLocation
          title={"No locations found"}
          description={"Add a location to start tracking its local time."}
          buttonLabel={"Add Location"}
          onButtonClick={() => navigate("/add")}
        />
      )}
      {locations.map((location) => {
        return (
          <div key={location.id} className="group flex items-center justify-between py-3.5">
            <div className="flex items-center space-x-3">
              <span className="text-2xl select-none"> {location.countryFlag} </span>{" "}
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="text-base font-normal tracking-wide text-white/80">
                    {location.name}{" "}
                  </span>{" "}
                  <button
                    onClick={() => onDelete(location.id)}
                    className="p-0.5 text-white/80 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                    title="Remove"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <p className="mt-0.5 text-xs">
                  <span className="text-blue-200/60"> {location.timeDifference} </span>
                  <span className="mx-1 text-white/20">•</span>
                  <span className="text-blue-100/80"> {location.date} </span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-light tracking-tight text-white/80">
                {location.time}
                <span className="text-xs text-blue-100/80"> {location.dayPeriod} </span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TrackedLocationsList;
