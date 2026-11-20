import { useEffect, useRef, useState } from "react";
import { DateTime } from "luxon";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { isDay } from "../time";
import WeatherIcon from "./WeatherIcon";

import type { HourlyWeather } from "../types";

interface Props {
  hourlyWeather: HourlyWeather[];
  hour12: boolean;
  locationTimezone: string;
}

const VISIBLE_CELLS = 5;

const HourlyStrip = ({ hourlyWeather, hour12, locationTimezone }: Props) => {
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
          const forecastAt = DateTime.fromISO(data.forecast_at).setZone(locationTimezone);

          const previousForecast = hourlyWeather[i - 1]
            ? DateTime.fromISO(hourlyWeather[i - 1].forecast_at, {
                zone: "utc",
              }).setZone(locationTimezone)
            : null;

          const showDaySeperator =
            !previousForecast || !forecastAt.hasSame(previousForecast, "day");

          return (
            <Cell
              key={i}
              temperature={data.temperature}
              time={forecastAt.toFormat(hour12 ? "h a" : "HH:mm")}
              condition={data.condition}
              isDay={isDay(forecastAt)}
              showDaySeperator={showDaySeperator && i != 0}
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
  time: string;
  condition: string;
  isDay: boolean;
  showDaySeperator: boolean;
}

const Cell = ({ temperature, time, condition, isDay, showDaySeperator }: CellProps) => (
  <div
    className="relative flex shrink-0 snap-start flex-col items-center gap-1"
    style={{ flexBasis: `${100 / VISIBLE_CELLS}%` }}
  >
    {showDaySeperator && (
      <div className="absolute top-1/2 left-0 h-9 w-[2px] -translate-y-1/2 rounded-full bg-blue-200/50" />
    )}
    <div className="flex flex-col items-center leading-tight">
      <span className="text-[11px] font-medium text-blue-100/90">{time}</span>
    </div>

    <WeatherIcon condition={condition} isDay={isDay} className="h-5 w-5" />

    <span className="text-[13px] leading-4 font-medium text-white/90">{temperature}°</span>
  </div>
);
