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
  GetTimeFormat,
  UpdateTimeFormat,
} from "../bindings/pal/backend/services/userpreferenceservice";
import { WINDOW_HIDE_EVENT, WINDOW_SHOW_EVENT } from "./constants";

export const api = {
  searchLocation: SearchLocation,
  getHomeLocation: GetHomeLocation,
  upsertHomeLocation: UpsertHomeLocation,
  getTimeFormatPreference: GetTimeFormat,
  getTrackedLocation: GetTrackedLocation,
  addTrackedLocation: AddTrackedLocation,
  deleteTrackedLocation: DeleteTrackedLocation,
  updateTimeFormatPreference: UpdateTimeFormat,
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
};
