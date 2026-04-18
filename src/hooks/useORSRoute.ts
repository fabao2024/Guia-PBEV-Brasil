import { useState, useCallback } from 'react';
import {
  fetchRoute,
  resolveOrsKey,
  saveOrsKey,
  clearOrsKey,
  ORSError,
  type ORSRouteResult as RouteData,
} from '../services/orsService';
import type { LatLng } from '../types/routePlanner';

// Re-exportar o tipo para uso nos hooks superiores
export type { RouteData };

// Rate limit ORS: 20 req/hora com chave gratuita
const ORS_RL_KEY = '_ors_rl';
const ORS_RL_MAX = 20;
const ORS_RL_WINDOW_MS = 3_600_000;

function readOrsTimestamps(): number[] {
  try {
    const raw = localStorage.getItem(ORS_RL_KEY);
    if (!raw) return [];
    const all: number[] = JSON.parse(raw);
    return all.filter((t) => Date.now() - t < ORS_RL_WINDOW_MS);
  } catch {
    return [];
  }
}

function recordOrsRequest(): void {
  try {
    const ts = readOrsTimestamps();
    ts.push(Date.now());
    localStorage.setItem(ORS_RL_KEY, JSON.stringify(ts));
  } catch { /* silent */ }
}

function checkOrsRateLimit(): { allowed: boolean; retryAfterMin: number } {
  const ts = readOrsTimestamps();
  if (ts.length >= ORS_RL_MAX) {
    const oldest = ts[0];
    const retryAfterMs = ORS_RL_WINDOW_MS - (Date.now() - oldest);
    return { allowed: false, retryAfterMin: Math.ceil(retryAfterMs / 60_000) };
  }
  return { allowed: true, retryAfterMin: 0 };
}

export type ORSStatus = 'idle' | 'loading' | 'ready' | 'error';

interface ORSRouteState {
  status: ORSStatus;
  data: RouteData | null;
  errorMessage: string | null;
  apiKey: string;
  hasKey: boolean;
}

interface UseORSRouteReturn extends ORSRouteState {
  calculate: (origin: LatLng, destination: LatLng) => Promise<RouteData | null>;
  setKey: (key: string) => void;
  removeKey: () => void;
}

export function useORSRoute(): UseORSRouteReturn {
  const [state, setState] = useState<ORSRouteState>(() => {
    const key = resolveOrsKey();
    return {
      status: 'idle',
      data: null,
      errorMessage: null,
      apiKey: key,
      hasKey: key.length > 0,
    };
  });

  const setKey = useCallback((key: string) => {
    saveOrsKey(key);
    setState((s) => ({ ...s, apiKey: key.trim(), hasKey: key.trim().length > 0 }));
  }, []);

  const removeKey = useCallback(() => {
    clearOrsKey();
    setState((s) => ({ ...s, apiKey: '', hasKey: false, status: 'idle', data: null }));
  }, []);

  const calculate = useCallback(
    async (origin: LatLng, destination: LatLng): Promise<RouteData | null> => {
      const rl = checkOrsRateLimit();
      if (!rl.allowed) {
        setState((s) => ({
          ...s,
          status: 'error',
          errorMessage: `Limite de rotas atingido. Tente novamente em ${rl.retryAfterMin} min.`,
        }));
        return null;
      }

      setState((s) => ({ ...s, status: 'loading', errorMessage: null }));

      try {
        recordOrsRequest();
        const result = await fetchRoute(origin, destination, state.apiKey);
        setState((s) => ({ ...s, status: 'ready', data: result }));
        return result;
      } catch (err) {
        if (err instanceof ORSError) {
          if (err.kind === 'unauthorized') {
            clearOrsKey();
            setState((s) => ({
              ...s,
              status: 'error',
              apiKey: '',
              hasKey: false,
              errorMessage: 'Chave ORS inválida. Verifique e tente novamente.',
            }));
          } else if (err.kind === 'rate_limit') {
            setState((s) => ({
              ...s,
              status: 'error',
              errorMessage: 'API ORS sobrecarregada — tente em alguns minutos.',
            }));
          } else {
            setState((s) => ({
              ...s,
              status: 'error',
              errorMessage: 'Erro ao calcular rota. Verifique sua conexão.',
            }));
          }
        } else {
          setState((s) => ({
            ...s,
            status: 'error',
            errorMessage: 'Erro inesperado ao calcular rota.',
          }));
        }
        return null;
      }
    },
    [state.apiKey],
  );

  return { ...state, calculate, setKey, removeKey };
}
