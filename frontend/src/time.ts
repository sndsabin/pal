import { DateTime } from "luxon";
import { DayPeriodOption } from "./constants";

export const getNow = (timezone: string) => {
  return DateTime.now().setZone(timezone);
};

export const getDateTime = (timezone: string, hour12: boolean) => {
  const now = getNow(timezone);

  let dayPeriod = hour12 ? now.toFormat("a") : null;

  return {
    date: now.toFormat("ccc, LLL d"),
    time: now.toFormat(hour12 ? "h:mm" : "HH:mm"),
    dayPeriod:
      dayPeriod === DayPeriodOption.AM
        ? DayPeriodOption.AM
        : dayPeriod === DayPeriodOption.PM
          ? DayPeriodOption.PM
          : null,
    isDay: now.hour >= 6 && now.hour < 18,
  };
};

export const isDay = (date: string | Date | DateTime) => {
  const hour = date instanceof DateTime ? date.hour : new Date(date).getHours();

  return hour >= 6 && hour < 18;
};

export const getTimeDifference = (timezone: string, referenceTimezone: string) => {
  const locationOffset = getNow(timezone).offset;
  const referenceOffset = getNow(referenceTimezone).offset;

  const difference = locationOffset - referenceOffset;

  if (difference === 0) {
    return "same time";
  }

  const hours = Math.abs(difference) / 60;

  return difference > 0
    ? `${hours} hour${hours === 1 ? "" : "s"} ahead`
    : `${hours} hour${hours === 1 ? "" : "s"} behind`;
};

export const convertTime = (
  date: string,
  time: string,
  fromTimezone: string,
  toTimeZone: string,
) => {
  const source = DateTime.fromFormat(`${date} ${time}`, "yyyy-MM-dd HH:mm", { zone: fromTimezone });

  if (!source.isValid) {
    return null;
  }

  return source.setZone(toTimeZone);
};

export const formatTimeAgo = (timestamp: string) => {
  const now = Date.now();
  const time = new Date(timestamp).getTime();

  const seconds = Math.floor((now - time) / 1000);

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days} day${days !== 1 ? "s" : ""} ago`;
};

export const zeroPad = (val: number) => String(val).padStart(2, "0");

export const formatDuration = (s: number) => {
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = Math.floor(s % 60);

  return hours > 0
    ? `${hours}:${zeroPad(minutes)}:${zeroPad(seconds)}`
    : `${minutes}:${zeroPad(seconds)}`;
};

export const formatCountdown = (s: number) => {
  // clamp to zero if s is negative.
  const totalSeconds = Math.max(0, Math.floor(s));

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return hours > 0
    ? `${hours}:${zeroPad(minutes)}:${zeroPad(seconds)}`
    : `${zeroPad(minutes)}:${zeroPad(seconds)}`;
};

export const formatClockTime = (s: number, hour12: boolean) => {
  return DateTime.fromSeconds(s).toFormat(hour12 ? "h:mm a" : "HH:mm");
};
