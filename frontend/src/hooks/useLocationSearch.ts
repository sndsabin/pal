import { useEffect, useState } from "react";

import { api } from "../api";

import { LocationSearchResult } from "../types";

const TIME_DELAY = 300;
const SUGGESTION_LIMIT = 3;
const MIN_QUERY_LENGTH = 2;

const useLocationSearch = (query: string) => {
  const [searchResult, setSearchResult] = useState<LocationSearchResult[]>([]);

  useEffect(() => {
    const locationQuery = query.trim().toLocaleLowerCase();

    if (locationQuery.length < MIN_QUERY_LENGTH) {
      setSearchResult([]);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      const results = await api.searchLocation(locationQuery, SUGGESTION_LIMIT);
      if (!cancelled) {
        setSearchResult(results ?? []);
      }
    }, TIME_DELAY);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return searchResult;
};

export default useLocationSearch;
