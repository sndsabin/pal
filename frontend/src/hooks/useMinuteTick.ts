import { useEffect, useState } from "react";
import { api } from "../api";

const useMinuteTick = () => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let intervalId: ReturnType<typeof setInterval>;

    const stopTicking = () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };

    const startTicking = () => {
      // prevents double firing
      stopTicking();

      setTick((t) => t + 1);

      // Calculate the time remaining until the next minute boundary.
      // The initial timeout synchronizes the first tick with the start of a minute,
      // after which the interval continues firing once every 60 seconds. This keeps
      // tick updates aligned with the system clock (e.g. 10:01:00, 10:02:00, etc.).
      const msUntilNextMinute = 60000 - (Date.now() % 60000);
      timeoutId = setTimeout(() => {
        setTick((t) => t + 1);
        // Once synchronized with the minute boundary, continue ticking every minute.
        intervalId = setInterval(() => setTick((t) => t + 1), 60000);
      }, msUntilNextMinute);
    };

    startTicking();

    const unsubscribeWindowsShownEvent = api.onWindowsShown(startTicking);
    const unsubscribeWindowsHiddenEvent = api.onWindowsShown(stopTicking);

    return () => {
      unsubscribeWindowsShownEvent();
      unsubscribeWindowsHiddenEvent();
    };
  }, []);

  return tick;
};

export default useMinuteTick;
