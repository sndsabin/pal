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
import { GetOrRefreshWeatherData } from "../bindings/pal/backend/services/weatherservice";

import {
  TIMER_COMPLETED_EVENT,
  WEATHER_REFRESHED_EVENT,
  WINDOW_HIDE_EVENT,
  WINDOW_SHOW_EVENT,
} from "./constants";
import { Timer } from "./types";

export const api = {
  searchLocation: SearchLocation,
  getHomeLocation: GetHomeLocation,
  upsertHomeLocation: UpsertHomeLocation,
  getUserPreference: GetUserPreference,
  getTrackedLocation: GetTrackedLocation,
  getWeatherData: GetOrRefreshWeatherData,
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
};
