import type { Eletroposto } from '../data/eletropostosData';

export type ChargerCurrent = 'AC' | 'DC' | 'unknown';
export type ChargerAccess = 'public' | 'customers' | 'membership' | 'notice' | 'unknown';

/** A source record describes a location, not one record per socket or parking space. */
export interface ChargerConnection {
  connector: string | null;
  current: ChargerCurrent;
  powerKw: number | null;
  quantity: number | null;
  unavailable?: boolean;
}

/** Discovery is deliberately broader than the DC-only route-planning contract. */
export interface MapCharger extends Omit<Eletroposto, 'potenciaDC' | 'conector'> {
  potenciaDC: number | null;
  conector: string | null;
  connections?: ChargerConnection[];
  access?: ChargerAccess;
  reportedPoints?: number | null;
  reportedStatus?: 'reported-operational' | 'unavailable' | 'unknown';
}

export interface ChargerSnapshot {
  source: string;
  retrievedAt: string;
  snapshotAt: string;
  stations: MapCharger[];
  scope?: 'country' | 'recent-listings';
  completeCountry?: boolean;
}
