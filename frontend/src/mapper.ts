import { LocationType } from "./constants";
import { LocationPayload, LocationSearchResult, UserLocation } from "./types";

export function locationSearchResultToLocationPayload(data: LocationSearchResult) {
  if (!data.timezone_id || !data.timezone) {
    throw new Error("timezone_id or timezone is missing");
  }

  const location: LocationPayload = {
    city_id: data.city_id,
    state_id: data.state_id,
    country_id: data.country_id,
    timezone_id: data.timezone_id,
    city: data.city,
    state: data.state,
    country: data.country,
    country_flag: data.country_flag,
    timezone: data.timezone,
  };
  return location;
}

export function userLocationToLocationSearchResult(data: UserLocation) {
  if (!data) {
    return null;
  }

  let type = LocationType.SearchTypeCountry;

  if (data.city) {
    type = LocationType.SearchTypeCity;
  } else if (data.state) {
    type = LocationType.SearchTypeState;
  }

  const location: LocationSearchResult = {
    id: data.id,
    city_id: data.city_id,
    state_id: data.state_id,
    country_id: data.country_id,
    timezone_id: data.timezone_id,
    city: data.city,
    state: data.state,
    country: data.country,
    country_flag: data.country_flag,
    timezone: data.timezone,
    name: data.city || data.state || data.country,
    type: type,
    timezone_count: 1,
  };

  return location;
}
