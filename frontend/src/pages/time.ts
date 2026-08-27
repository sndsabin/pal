import { DateTime } from "luxon";
import { DayPeriodOption } from "../constants";

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
  };
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
