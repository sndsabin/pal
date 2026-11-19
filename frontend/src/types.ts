import { LucideIcon } from "lucide-react";
import { DayPeriodOption, TONE_SUN, TONE_SKY } from "./constants";

export interface TrackedLocation {
  id: number;
  name: string;
  date: string;
  time: string;
  isDay: boolean;
  dayPeriod: DayPeriod;
  timeDifference: string;
  countryFlag: string;
  timezone: string;
}

export interface TrackedLocationSelectOption {
  name: string;
  countryFlag: string;
  timezone: string;
}

export interface HomeLocation {
  id: number;
  name: string;
  date: string;
  time: string;
  isDay: boolean;
  dayPeriod: DayPeriod;
  countryFlag: string;
  timezone: string;
}

export interface ErrorState {
  id: number;
  message: string;
}

export interface WeatherDescription {
  label: string;
  Icon: LucideIcon;
  tone: typeof TONE_SUN | typeof TONE_SKY;
}

export interface Tab {
  to: string;
  label: string;
  Icon: LucideIcon;
}

export type DayPeriod = (typeof DayPeriodOption)[keyof typeof DayPeriodOption] | null;

export type { LocationPayload } from "../bindings/pal/backend/services";
export type { LocationSearchResult } from "../bindings/pal/backend/database/models";
export type {
  UserLocation,
  UserPreference,
  TimeFormat,
  TemperatureFormat,
  WeatherData,
  CurrentWeather,
  HourlyWeather,
  Timer,
} from "./../bindings/pal/backend/database/models/models";
export { WeatherCondition } from "../bindings/pal/backend/weather";
export { TimerStatus } from "./../bindings/pal/backend/database/models/models";
