import { Bell, Plus, RotateCcw } from "lucide-react";
import { DateTime } from "luxon";

import TimerRing from "./TimerRing";
import { formatClockTime, formatCountdown, formatDuration } from "../../time";

import { TONE_AMBER } from "../../constants";

import type { Timer } from "../../types";

interface Props {
  timer: Timer;
  nowInSeconds: number;
  hour12: boolean;
  onAddMinute: (id: number) => void;
  onRestart: (id: number) => void;
  onDismiss: () => void;
}

const TimerFinished = ({
  timer,
  nowInSeconds,
  hour12,
  onAddMinute,
  onRestart,
  onDismiss,
}: Props) => {
  const finishedAt = DateTime.fromISO(timer.created_at)
    .plus({ seconds: timer.duration })
    .toSeconds();

  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 pt-3.5 pb-4">
      <TimerRing fraction={1} tone={TONE_AMBER}>
        <Bell className="h-[30px] w-[30px] text-amber-400" strokeWidth={1.75} />

        <div
          role="timer"
          aria-label={`${formatCountdown(nowInSeconds - finishedAt)} over`}
          className="mt-2 text-2xl leading-none font-light text-amber-300 tabular-nums"
        >
          +{formatCountdown(nowInSeconds - finishedAt)}
        </div>
      </TimerRing>

      <div className="mt-3.5 text-center">
        <div className="text-2xl leading-7 font-semibold text-white/90">Time's up</div>

        <div className="mt-1 truncate text-[13px] text-blue-200/70">
          {timer.name} · {formatDuration(timer.duration)} · Finished{" "}
          {formatClockTime(finishedAt, hour12)}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onAddMinute(timer.id)}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#0b1022] text-[13px] font-medium text-white/85 transition hover:bg-white/[0.06]"
          >
            <Plus className="h-3.5 w-3.5 text-blue-400" /> 1 min
          </button>

          <button
            type="button"
            onClick={() => onRestart(timer.id)}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#0b1022] text-[13px] font-medium text-white/85 transition hover:bg-white/[0.06]"
          >
            <RotateCcw className="h-3.5 w-3.5 text-blue-400" /> Restart
          </button>
        </div>

        <button
          type="button"
          onClick={() => onDismiss()}
          className="flex h-11 items-center justify-center rounded-xl border border-white/20 bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition hover:opacity-90"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default TimerFinished;
