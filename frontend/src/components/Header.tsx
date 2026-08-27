import { useNavigate } from "react-router-dom";
import { Plus, Settings } from "lucide-react";

import { HomeLocation } from "../types";

interface Props {
  homeLocation: HomeLocation | null;
}

const Header = ({ homeLocation }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/10 px-6 pt-5 pb-7">
      <div className="flex items-center">
        <img src="/assets/logo.svg" alt="logo" className="absolute h-11 w-11 object-contain" />
      </div>

      <div className="pointer-events-none absolute top-3.5 right-0 left-0 text-center">
        <h1 className="text-lg leading-none font-semibold tracking-wide text-white/80">pal</h1>

        {homeLocation && (
          <>
            <div className="mt-2.5 text-[11px] leading-none">
              <span className="text-white/90">{homeLocation.time}</span>
              <span className="text-white/90">
                {" "}
                {homeLocation.dayPeriod ? ` ${homeLocation.dayPeriod}` : ""}
              </span>
              <span className="mx-1.5 text-white/30">•</span>
              <span className="text-blue-100/80">{homeLocation.date}</span>
            </div>

            <div className="mt-1 text-[12px] leading-none text-blue-200/70">
              <span>{homeLocation.countryFlag}</span>
              <span className="ml-1.5">{homeLocation.name}</span>
            </div>
          </>
        )}
      </div>

      <div className="z-10 ml-auto flex items-center space-x-2">
        <button
          onClick={() => {
            navigate("/add");
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-inner transition hover:bg-white/20"
          title="Add City"
        >
          <Plus className="h-4 w-4 text-white" />
        </button>

        <button
          onClick={() => {
            navigate("/settings");
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-inner transition hover:bg-white/20"
          title="Settings"
        >
          <Settings className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
};

export default Header;
