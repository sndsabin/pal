import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Info } from "lucide-react";

import { convertTime, getNow } from "../pages/time";

import { HomeLocation, TrackedLocationSelectOption } from "../types";

interface Props {
  locationSelectOptions: TrackedLocationSelectOption[];
  homeLocation: HomeLocation;
}

const TimeConverter = ({ locationSelectOptions, homeLocation }: Props) => {
  const [selectedTimezone, setSelectedTimezone] = useState(
    () => locationSelectOptions[0]?.timezone ?? "",
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    const targetTimezone = locationSelectOptions[0]?.timezone ?? "";
    setSelectedTimezone(targetTimezone);

    if (!targetTimezone) {
      return;
    }

    const nowInTarget = getNow(homeLocation.timezone).setZone(selectedTimezone);

    setSelectedDate(nowInTarget.toFormat("yyyy-MM-dd"));
    setSelectedTime(nowInTarget.toFormat("HH:mm"));
  }, [locationSelectOptions, homeLocation.timezone]);

  const convertedHomeDateTime = useMemo(() => {
    if (!selectedTimezone || !selectedDate || !selectedTime) return null;

    return convertTime(selectedDate, selectedTime, selectedTimezone, homeLocation.timezone);
  }, [selectedDate, selectedTime, selectedTimezone, homeLocation.timezone]);

  const homeDate = convertedHomeDateTime
    ? convertedHomeDateTime.toFormat("yyyy-MM-dd")
    : homeLocation.date;
  const homeTime = convertedHomeDateTime
    ? convertedHomeDateTime.toFormat("HH:mm")
    : homeLocation.time;
  const homeDayPeriod = convertedHomeDateTime
    ? convertedHomeDateTime.toFormat("a")
    : homeLocation.dayPeriod;

  return (
    <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto border-b border-white/10 bg-[#090f24]">
      <div className="space-y-4 px-5 pt-5 pb-5">
        <div className="text-center">
          <div className="text-[11px] font-medium tracking-[0.18em] text-blue-200/50 uppercase">
            Time Converter
          </div>

          <div className="mt-1 text-xs text-white/30">
            Convert time between your added locations.
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-white/10 bg-[#0b1022] p-3 shadow-inner">
          <div className="flex items-center justify-between text-[11px] font-medium tracking-wider text-blue-200/60 uppercase">
            <span>When it's</span>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="cursor-pointer rounded border border-white/10 bg-[#060812] px-2 py-0.5 font-mono text-[11px] text-blue-200 [color-scheme:dark] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center rounded-xl border border-white/10 bg-[#060812] px-3 py-2">
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full cursor-pointer bg-transparent font-mono text-sm font-semibold text-white [color-scheme:dark] focus:outline-none"
              />
            </div>

            <div className="flex items-center rounded-xl border border-white/10 bg-[#060812] px-3 py-2">
              <select
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
                className="w-full cursor-pointer bg-transparent text-sm font-medium text-white/80 [color-scheme:dark] focus:outline-none"
              >
                {locationSelectOptions.map((location: TrackedLocationSelectOption, index) => (
                  <option
                    key={index}
                    value={location.timezone}
                    className="bg-[#0b1022] text-white/80"
                  >
                    {location.countryFlag + " " + location.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="relative z-10 -my-1 flex justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-[#121936] text-blue-300 shadow">
            <ArrowRight className="h-3.5 w-3.5 rotate-90" />
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-white/10 bg-[#0b1022] p-3 shadow-inner">
          <div className="flex items-center justify-between text-[11px] font-medium tracking-wider text-blue-200/60 uppercase">
            <span>It's</span>

            <span>{homeDate}</span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#060812] px-3.5 py-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{homeLocation.countryFlag}</span>

              <span className="text-sm font-medium text-white/80">{homeLocation.name}</span>
            </div>

            <div className="text-right font-mono">
              <span className="text-base font-light text-white/80">{homeTime}</span>

              <span className="ml-1 text-xs text-blue-100/80">{homeDayPeriod}</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 pt-1">
            <span className="pointer-events-none flex items-center space-x-1.5 text-xs text-blue-200/70 select-none">
              <Info className="h-3.5 w-3.5 text-blue-400" />
              <span>DST Adjusted</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeConverter;
