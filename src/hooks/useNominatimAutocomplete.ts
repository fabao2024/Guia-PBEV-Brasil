import { useState, useEffect, useRef } from 'react';
import { searchLocation } from '../services/nominatimService';
import type { GeoSuggestion } from '../types/routePlanner';

const DEBOUNCE_MS = 600;
const MIN_QUERY_LENGTH = 3;

interface NominatimAutocompleteResult {
  suggestions: GeoSuggestion[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Autocomplete de localização via Nominatim com debounce de 600ms.
 * Respeita a política de 1 req/s do Nominatim.
 * Cancela requisições pendentes com AbortController.
 */
export function useNominatimAutocomplete(
  query: string,
  enabled = true,
): NominatimAutocompleteResult {
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled || query.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      // Cancela requisição anterior
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const results = await searchLocation(query, abortRef.current.signal);
        setSuggestions(results);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const isTimeout =
          err instanceof Error && err.message.includes('TimeoutError');
        setError(
          isTimeout
            ? 'Serviço de geocoding lento — tente novamente.'
            : 'Nenhum local encontrado no Brasil.',
        );
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [query, enabled]);

  return { suggestions, isLoading, error };
}
