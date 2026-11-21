import { Events } from "@wailsio/runtime";
import {
  SearchLocation,
  GetHomeLocation,
  UpsertHomeLocation,
  GetTrackedLocation,
  AddTrackedLocation,
  DeleteTrackedLocation,
} from "../bindings/pal/backend/services/locationservice";
import {
  GetUserPreference,
  UpdateUserPreference,
} from "../bindings/pal/backend/services/userpreferenceservice";

import {
  AddDuration,
  AddTimer,
  DeleteTimer,
  GetAllTimers,
  PauseTimer,
  StartTimer,
} from "../bindings/pal/backend/services/timerservice";

import { GetAllUserLocationWeatherData } from "../bindings/pal/backend/services/weatherservice";

import {
  HOME_LOCATION_UPDATED_EVENT,
  TIMER_COMPLETED_EVENT,
  WEATHER_REFRESHED_EVENT,
  WINDOW_HIDE_EVENT,
  WINDOW_SHOW_EVENT,
} from "./constants";

import type { Timer } from "./types";

export const api = {
  searchLocation: SearchLocation,
  getHomeLocation: GetHomeLocation,
  upsertHomeLocation: UpsertHomeLocation,
  getUserPreference: GetUserPreference,
  getTrackedLocation: GetTrackedLocation,
  getWeatherData: async (forceRefresh: boolean = false) => {
    return await GetAllUserLocationWeatherData(forceRefresh);
  },
  getAllTimers: GetAllTimers,
  addTrackedLocation: AddTrackedLocation,
  deleteTrackedLocation: DeleteTrackedLocation,
  updateUserPreference: UpdateUserPreference,
  addTimer: AddTimer,
  startTimer: StartTimer,
  pauseTimer: PauseTimer,
  addDuration: AddDuration,
  deleteTimer: DeleteTimer,
  onWindowsShown: (handler: () => void) => {
    Events.On(WINDOW_SHOW_EVENT, handler);

    // cleanup
    return () => Events.Off(WINDOW_SHOW_EVENT);
  },
  onWindowsHidden: (handler: () => void) => {
    Events.On(WINDOW_HIDE_EVENT, handler);

    // cleanup
    return () => Events.Off(WINDOW_HIDE_EVENT);
  },
  onWeatherRefreshed: (handler: () => void) => {
    const unsubscribe = Events.On(WEATHER_REFRESHED_EVENT, handler);

    // cleanup
    return unsubscribe;
  },
  onTimerCompleted: (handler: (timer: Timer) => void) => {
    const unsubscribe = Events.On(TIMER_COMPLETED_EVENT, (event) => {
      handler(event.data);
    });

    // cleanup
    return unsubscribe;
  },
  onHomeLocationUpdated: (handler: () => void) => {
    const unsubscribe = Events.On(HOME_LOCATION_UPDATED_EVENT, (event) => {
      handler();
    });

    // cleanup
    return unsubscribe;
  },
};
