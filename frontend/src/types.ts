import { DayPeriodOption } from "./constants";

export interface TrackedLocation {
  id: number;
  name: string;
  date: string;
  time: string;
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
  name: string;
  date: string;
  time: string;
  dayPeriod: DayPeriod;
  countryFlag: string;
  timezone: string;
}

export interface ErrorState {
  id: number;
  message: string;
}

export type DayPeriod = (typeof DayPeriodOption)[keyof typeof DayPeriodOption] | null;

export type { LocationPayload } from "../bindings/pal/backend/services";
export type { LocationSearchResult } from "../bindings/pal/backend/database/models";
export type { UserLocation, TimeFormat } from "./../bindings/pal/backend/database/models/models";
