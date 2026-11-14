export const DayPeriodOption = {
  AM: "AM",
  PM: "PM",
} as const;

export const WINDOW_SHOW_EVENT = "window:show";
export const WINDOW_HIDE_EVENT = "window:hide";

export const WEATHER_REFRESHED_EVENT = "weather:refreshed";

export const TIMER_COMPLETED_EVENT = "timer:completed";

export const TONE_SUN = "sun";
export const TONE_SKY = "sky";
export const TONE_BLUE = "blue";
export const TONE_AMBER = "amber";

export { SearchType as LocationType } from "../bindings/pal/backend/database/models";
export {
  TimeFormat as TimeFormatOption,
  TemperatureFormat as TemperatureFormatOption,
} from "./../bindings/pal/backend/database/models/models";
