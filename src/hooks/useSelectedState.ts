import { useSyncExternalStore } from 'react';

const eventName = 'pbev-selected-state';
let memoryState: string | undefined;

function snapshot(): string {
  try { return localStorage.getItem('selectedState') ?? 'SP'; }
  catch { return memoryState ?? 'SP'; }
}

function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === 'selectedState' || event.key === null) callback();
  };
  window.addEventListener(eventName, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(eventName, callback);
    window.removeEventListener('storage', onStorage);
  };
}

function save(state: string) {
  memoryState = state;
  try { localStorage.setItem('selectedState', state); } catch { /* armazenamento opcional */ }
  window.dispatchEvent(new Event(eventName));
}

export function useSelectedState(): [string, (state: string) => void] {
  return [useSyncExternalStore(subscribe, snapshot, () => 'SP'), save];
}
