import { useEffect, useRef, useState } from "react";
import { DateTime } from "luxon";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { isDay } from "../time";
import WeatherIcon from "./WeatherIcon";

import type { HourlyWeather } from "../types";

interface Props {
  hourlyWeather: HourlyWeather[];
  hour12: boolean;
  timezone: string;
}

const VISIBLE_CELLS = 5;

const HourlyStrip = ({ hourlyWeather, hour12, timezone }: Props) => {
  const scroller = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  const updateEdges = () => {
    const element = scroller.current;

    if (!element) {
      return;
    }

    setCanScrollBack(element.scrollLeft > 1);
    setCanScrollForward(element.scrollLeft + element.clientWidth < element.scrollWidth - 1);
  };

  useEffect(updateEdges, [hourlyWeather.length]);

  const scrollPage = (direction: -1 | 1) => {
    scroller.current?.scrollBy({
      left: direction * scroller.current.clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex h-[68px] items-center gap-0.5 border-t border-white/10 px-1">
      <button
        type="button"
        aria-label="Earlier hours"
        disabled={!canScrollBack}
        onClick={() => scrollPage(-1)}
        className="flex h-10 w-6 shrink-0 items-center justify-center rounded-full text-blue-100/90 transition hover:text-white disabled:opacity-30 disabled:hover:text-blue-100/90"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div
        ref={scroller}
        role="group"
        aria-label="Hourly forecast, scroll sideways"
        onScroll={updateEdges}
        className="flex min-w-0 flex-1 snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto [&::-webkit-scrollbar]:hidden"
      >
        {hourlyWeather.length === 0 && (
          <span className="block w-full text-center text-[11px] leading-3 text-blue-200/70">
            No hourly forecast available.
          </span>
        )}

        {hourlyWeather.map((data: HourlyWeather, i) => {
          // forecast time is UTC. so convert it to specified timezone
          const forecastAt = DateTime.fromISO(data.forecast_at).setZone(timezone);

          return (
            <Cell
              key={i}
              temperature={data.temperature}
              label={forecastAt.toFormat(hour12 ? "h a" : "HH:mm")}
              condition={data.condition}
              isDay={isDay(forecastAt)}
            />
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Later hours"
        disabled={!canScrollForward}
        onClick={() => scrollPage(1)}
        className="flex h-10 w-6 shrink-0 items-center justify-center rounded-full text-blue-100/90 transition hover:text-white disabled:opacity-30 disabled:hover:text-blue-100/90"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default HourlyStrip;

interface CellProps {
  temperature: number;
  label: string;
  condition: string;
  isDay: boolean;
}

const Cell = ({ temperature, label, condition, isDay }: CellProps) => (
  <div
    className="flex shrink-0 snap-start flex-col items-center gap-1"
    style={{ flexBasis: `${100 / VISIBLE_CELLS}%` }}
  >
    <span className="text-[11px] leading-3 text-blue-200/70">{label}</span>
    <WeatherIcon condition={condition} isDay={isDay} className="h-4 w-4" />
    <span className="text-[13px] leading-4 text-white/85">{temperature}°</span>
  </div>
);
