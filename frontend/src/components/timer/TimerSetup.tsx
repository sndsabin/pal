import { useState } from "react";
import { Play } from "lucide-react";

import TimerUnitInput from "./TimerUnitInput";

interface Props {
  onStart: (label: string, duration: number) => void;
}

const PRESET_MINUTES = [1, 5, 10, 25];
const DEFAULT_TIMER_LABEL = "Timer";

const Seperator = () => {
  return (
    <span aria-hidden="true" className="mt-1.5 text-2xl font-light text-white/30">
      :
    </span>
  );
};

const TimerSetup = ({ onStart }: Props) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [name, setName] = useState("");

  const duration = hours * 3600 + minutes * 60 + seconds; // in seconds

  return (
    <div className="flex shrink-0 flex-col">
      <div className="flex h-[188px] shrink-0 flex-col items-center justify-between rounded-2xl border border-white/10 bg-[#0b1022] p-4 shadow-inner">
        <input
          type="text"
          name={name}
          maxLength={24}
          onChange={(e) => setName(e.target.value)}
          placeholder="Timer name (optional)"
          aria-label="Timer name"
          autoComplete="off"
          className="h-[30px] w-full rounded-full border border-white/10 bg-white/5 px-3 text-center text-xs tracking-wide text-white placeholder-white/40 transition focus:border-blue-400 focus:outline-none"
        />

        <div
          role="group"
          aria-label="Timer duration"
          className="flex items-start justify-center gap-2.5"
        >
          <TimerUnitInput label="Hours" value={hours} max={23} onChange={setHours} />
          <Seperator />
          <TimerUnitInput label="Minutes" value={minutes} max={59} onChange={setMinutes} />
          <Seperator />
          <TimerUnitInput label="Seconds" value={seconds} max={59} onChange={setSeconds} />
        </div>

        <div className="flex items-center justify-center gap-2.5">
          {PRESET_MINUTES.map((preset, i) => {
            const isActive = duration === preset * 60;

            return (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  setHours(0);
                  setMinutes(preset);
                  setHours(0);
                }}
                className={`h-6 rounded-full border px-2.5 text-[11px] font-medium transition ${
                  isActive
                    ? "border-blue-400/50 bg-blue-500/15 text-blue-100"
                    : "border-white/10 bg-white/[0.06] text-blue-200/85 hover:bg-white/10"
                }`}
              >
                {preset} min
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex h-[54px] shrink-0 items-center justify-center">
        <button
          type="button"
          aria-label="Start timer"
          disabled={duration === 0}
          className={`flex h-[54px] w-[54px] items-center justify-center rounded-full border border-white/20 text-white transition ${
            duration > 0
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25 hover:opacity-90"
              : "cursor-not-allowed bg-white/10 text-white/30"
          }`}
          onClick={() => {
            if (duration > 0) {
              onStart(name.trim() || DEFAULT_TIMER_LABEL, duration);
            }
          }}
        >
          <Play className="h-[22px] w-[22px]" fill="currentColor" />
        </button>
      </div>
    </div>
  );
};

export default TimerSetup;
