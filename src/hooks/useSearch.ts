import { useState, useMemo, useEffect, useCallback } from 'react';
import Fuse, { IFuseOptions } from 'fuse.js';
import { Car } from '../types';

const FUSE_OPTIONS: IFuseOptions<Car> = {
  keys: [
    { name: 'model', weight: 0.6 },
    { name: 'brand', weight: 0.3 },
    { name: 'cat',   weight: 0.1 },
  ],
  threshold: 0.2,
  distance: 80,
  minMatchCharLength: 2,
  includeScore: true,
  ignoreLocation: true,
  shouldSort: true,
};

export function useSearch(cars: Car[]) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  const fuse = useMemo(() => new Fuse(cars, FUSE_OPTIONS), [cars]);

  const searchResults = useMemo<Car[]>(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 2) return cars;
    return fuse.search(trimmed)
      .filter(r => (r.score ?? 1) < 0.2)
      .map(r => r.item);
  }, [debouncedQuery, fuse, cars]);

  const clearSearch = useCallback(() => setQuery(''), []);

  return { query, setQuery, searchResults, clearSearch, isSearching: debouncedQuery.trim().length >= 2 };
}
