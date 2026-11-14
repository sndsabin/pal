import { DateTime } from "luxon";
import { Bell, Pause, Play, X } from "lucide-react";

import TimerRing from "./TimerRing";
import { formatClockTime, formatCountdown } from "../../time";

import { TimerStatus, type Timer } from "../../types";

interface Props {
  timer: Timer;
  now: number;
  hour12: boolean;
  onAddMinute: (id: number) => void;
  onResume: (id: number) => void;
  onPause: (id: number) => void;
  onDelete: (id: number) => void;
}

const getRemainingSeconds = (timer: Timer) => {
  if (timer.status === TimerStatus.TimerStatusCompleted) {
    return 0;
  }

  return Math.max(
    0,
    Math.ceil(
      DateTime.fromISO(timer.created_at).toSeconds() + timer.duration - DateTime.now().toSeconds(),
    ),
  );
};

const TimerDetail = ({ timer, now, hour12, onAddMinute, onResume, onPause, onDelete }: Props) => {
  const isPaused = timer.status === TimerStatus.TimerStatusPaused;

  const remainingSeconds = getRemainingSeconds(timer);

  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 pt-2 pb-3">
      <TimerRing fraction={remainingSeconds / timer.duration} tone="blue">
        <div
          role="timer"
          aria-label={`${timer.name} timer, ${formatCountdown(remainingSeconds)} left`}
          className="flex flex-col items-center"
        >
          <div className="max-w-[110px] truncate text-[11px] font-medium tracking-[0.18em] text-blue-200/70 uppercase">
            {timer.name}
          </div>

          <div
            className={`mt-1 text-[40px] leading-none font-light tracking-tight tabular-nums ${
              isPaused ? "text-white/50" : "text-white/90"
            }`}
          >
            {formatCountdown(remainingSeconds)}
          </div>

          <div className="mt-1.5 flex items-center gap-1 text-xs text-blue-100/80">
            {isPaused ? (
              "Paused"
            ) : (
              <>
                <Bell className="h-3 w-3 text-blue-400" />
                {formatClockTime(
                  DateTime.fromISO(timer.created_at).toSeconds() + timer.duration,
                  hour12,
                )}
              </>
            )}
          </div>
        </div>
      </TimerRing>

      <div className="mt-3 grid h-[54px] shrink-0 grid-cols-[1fr_54px_1fr] items-center gap-x-5">
        <button
          type="button"
          onClick={() => onAddMinute(timer.id)}
          className="h-9 justify-self-end rounded-full border border-white/10 bg-white/10 px-3.5 text-xs font-medium text-blue-100 shadow-inner transition hover:bg-white/20"
        >
          +1:00
        </button>

        <button
          type="button"
          aria-label={isPaused ? "Resume timer" : "Pause timer"}
          onClick={() => (isPaused ? onResume(timer.id) : onPause(timer.id))}
          className="flex h-[54px] w-[54px] items-center justify-center rounded-full border border-white/20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 transition hover:opacity-90"
        >
          {isPaused ? (
            <Play className="h-[22px] w-[22px]" fill="currentColor" />
          ) : (
            <Pause className="h-[22px] w-[22px]" fill="currentColor" />
          )}
        </button>

        <button
          type="button"
          aria-label="Delete timer"
          onClick={() => onDelete(timer.id)}
          className={`flex h-9 w-9 items-center justify-center justify-self-start rounded-full border border-white/10 bg-white/10 text-white shadow-inner transition hover:bg-white/20`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TimerDetail;
