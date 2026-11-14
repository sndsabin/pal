import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Pause, Play, X } from "lucide-react";

import { api } from "../api";
import { HomeOutletContext } from "./Clock";
import { formatDuration, formatTimeAgo } from "../time";
import TimerSetup from "../components/timer/TimerSetup";
import TimerDetail from "../components/timer/TimerDetail";

import { TimeFormatOption } from "../constants";
import { TimerStatus, type Timer } from "../types";
import TimerFinished from "../components/timer/TimerFinished";

const Timer = () => {
  const { timeFormat, onError } = useOutletContext<HomeOutletContext>();
  const [timers, setTimers] = useState<Timer[] | null>(null);
  const [dismissedTimerId, setDismissedTimerId] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const hour12 = timeFormat === TimeFormatOption.TimeFormat12Hour;

  const runningTimer = useMemo(() => {
    return timers?.find((timer) => timer.status === TimerStatus.TimerStatusRunning) ?? null;
  }, [timers]);

  const otherTimers = timers?.filter((timer) => timer.id !== runningTimer?.id) ?? [];

  const sortTimers = (items: Timer[]) => {
    return [...items].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
  };

  const updateTimers = (updatedTimer: Timer) => {
    setTimers((prev) => {
      return (prev ?? []).map((timer) => {
        if (timer.id === updatedTimer.id) {
          return { ...timer, ...updatedTimer };
        }

        return timer;
      });
    });
  };

  useEffect(() => {
    api
      .getAllTimers()
      .then((timers) => {
        if (!timers) {
          return;
        }

        setTimers(timers.filter((timer) => timer != null));
      })
      .catch(onError);

    const unsubscribeTimerCompletedEvent = api.onTimerCompleted((timer: Timer) => {
      updateTimers(timer);
    });

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      unsubscribeTimerCompletedEvent();
      clearInterval(interval);
    };
  }, []);

  const recentlyFinishedTimer = useMemo(() => {
    const recentlyFinished = (timer: Timer, timeWindowInSeconds: number = 10) => {
      const finishedAt = new Date(timer.created_at).getTime() / 1000 + timer.duration;
      const elapsed = Date.now() / 1000 - finishedAt;

      return elapsed >= 0 && elapsed < timeWindowInSeconds;
    };

    return timers?.find((timer) => {
      if (
        timer.id != dismissedTimerId &&
        timer.status === TimerStatus.TimerStatusCompleted &&
        recentlyFinished(timer)
      ) {
        return timer;
      }
    });
  }, [timers, dismissedTimerId]);

  const handleCreateTimerAction = (name: string, duration: number) => {
    api
      .addTimer(name, duration)
      .then((timer) => {
        if (!timer) {
          return;
        }
        setTimers((prev) => [...(prev ?? []), timer]);
      })
      .catch(onError);
  };

  const handleStartTimerAction = (id: number) => {
    api
      .startTimer(id)
      .then((timer) => {
        if (!timer) {
          return;
        }

        setTimers((prev) => {
          return (prev ?? []).map((t) => {
            if (t.id === timer.id) {
              return { ...t, ...timer };
            }

            return t;
          });
        });
      })
      .catch(onError)
      .finally(() => {
        setDismissedTimerId(null);
      });
  };

  const handlePauseTimerAction = (id: number) => {
    api
      .pauseTimer(id)
      .then((timer) => {
        if (!timer) {
          return;
        }

        updateTimers(timer);
      })
      .catch(onError);
  };

  const handleDeleteTimerAction = (id: number) => {
    api
      .deleteTimer(id)
      .then(() => {
        setTimers((prev) => {
          return (prev ?? []).filter((t) => t.id !== id);
        });
      })
      .catch(onError);
  };

  const handleAddMinuteAction = (id: number) => {
    api
      .addDuration(id, 60)
      .then((timer) => {
        if (!timer) {
          return;
        }

        updateTimers(timer);
      })
      .catch(onError);
  };

  const handleRestartAction = (id: number) => {
    api
      .startTimer(id)
      .then((timer) => {
        if (!timer) {
          return;
        }

        updateTimers(timer);
      })
      .catch(onError);
  };

  if (recentlyFinishedTimer) {
    return (
      <TimerFinished
        timer={recentlyFinishedTimer}
        nowInSeconds={now / 1000}
        hour12={hour12}
        onAddMinute={handleAddMinuteAction}
        onRestart={handleRestartAction}
        onDismiss={() => setDismissedTimerId(recentlyFinishedTimer.id)}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 pt-2 pb-3">
      <div className="h-[240px] shrink-0">
        {runningTimer ? (
          <TimerDetail
            timer={runningTimer}
            now={now}
            hour12={hour12}
            onAddMinute={handleAddMinuteAction}
            onResume={handleStartTimerAction}
            onPause={handlePauseTimerAction}
            onDelete={handleDeleteTimerAction}
          />
        ) : (
          <TimerSetup onStart={handleCreateTimerAction} />
        )}
      </div>

      {otherTimers.length > 0 && (
        <div className="custom-scrollbar mt-3.5 min-h-0 flex-1 overflow-y-auto">
          <div className="text-[11px] font-medium tracking-[0.12em] text-blue-200/70 uppercase">
            Other Timers
          </div>

          {sortTimers(otherTimers).map((timer) => {
            const isRunning = timer.status === TimerStatus.TimerStatusRunning;

            return (
              <div
                key={timer.id}
                className="flex h-[46px] items-center justify-between border-t border-white/10"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-white/80">{timer.name}</div>

                  <div className="mt-0.5 text-[11px] text-blue-200/70">
                    Used {formatTimeAgo(timer.updated_at)}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xl font-light text-white/80 tabular-nums">
                    {formatDuration(timer.duration)}
                  </span>

                  <button
                    type="button"
                    aria-label={`${isRunning ? "Stop" : "Start"} ${timer.name} timer`}
                    onClick={() => {
                      isRunning
                        ? handlePauseTimerAction(timer.id)
                        : handleStartTimerAction(timer.id);
                    }}
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-inner transition hover:bg-white/20"
                  >
                    {isRunning ? (
                      <Pause className="h-[13px] w-[13px]" fill="currentColor" />
                    ) : (
                      <Play className="h-[13px] w-[13px]" fill="currentColor" />
                    )}
                  </button>

                  <button
                    type="button"
                    aria-label={`Delete ${timer.name} timer`}
                    title="Delete"
                    onClick={() => handleDeleteTimerAction(timer.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-blue-200/60 transition hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Timer;
