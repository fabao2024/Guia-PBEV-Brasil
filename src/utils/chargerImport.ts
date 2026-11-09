import type { ChargerConnection, MapCharger } from '../types/chargers';
import { validCoordinates } from './chargerLocations';

type Row = Record<string, unknown>;
const row = (value: unknown): Row => value && typeof value === 'object' && !Array.isArray(value) ? value as Row : {};
const text = (value: unknown): string => typeof value === 'string' ? value.trim().slice(0, 240) : '';
const positive = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
const quantity = (value: unknown): number | null => Number.isSafeInteger(value) && Number(value) > 0 ? Number(value) : null;
const date = (value: unknown): string | undefined => {
  const day = text(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(Date.parse(day)) && new Date(day).toISOString().startsWith(day) ? day : undefined;
};
const UF: Record<string, string> = {
  acre: 'AC', alagoas: 'AL', amapa: 'AP', amazonas: 'AM', bahia: 'BA', ceara: 'CE', 'distrito federal': 'DF',
  'espirito santo': 'ES', goias: 'GO', maranhao: 'MA', 'mato grosso': 'MT', 'mato grosso do sul': 'MS',
  'minas gerais': 'MG', para: 'PA', paraiba: 'PB', parana: 'PR', pernambuco: 'PE', piaui: 'PI',
  'rio de janeiro': 'RJ', 'rio grande do norte': 'RN', 'rio grande do sul': 'RS', rondonia: 'RO', roraima: 'RR',
  'santa catarina': 'SC', 'sao paulo': 'SP', sergipe: 'SE', tocantins: 'TO',
};
function uf(value: unknown): string {
  const state = text(value).replace(/^BR-/i, '');
  return Object.values(UF).includes(state.toUpperCase()) ? state.toUpperCase()
    : UF[state.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()] ?? '';
}
function brazilCoordinates(lat: unknown, lng: unknown): lat is number {
  return typeof lat === 'number' && typeof lng === 'number' && validCoordinates(lat, lng) &&
    lat >= -34 && lat <= 6 && lng >= -74 && lng <= -28;
}
function electrical(connections: ChargerConnection[]): Pick<MapCharger, 'potenciaDC' | 'conector'> {
  const dcPower = connections.filter(c => c.current === 'DC' && c.powerKw != null).map(c => c.powerKw!);
  const connectors = [...new Set(connections.map(c => c.connector).filter(Boolean))];
  return { potenciaDC: dcPower.length ? Math.max(...dcPower) : null, conector: connectors.join(' + ') || null };
}

export interface OcmImportContext {
  consultedAt: string;
  providers: Row[];
  operators: Row[];
  connectionTypes: Row[];
}

/** Explicit license allowlist; a provider's "open" boolean alone is not a reuse license. */
export function ocmLicense(provider: Row): string | null {
  if (provider.IsOpenDataLicensed !== true) return null;
  const license = text(provider.License);
  if (/noncommercial|non-commercial|\bNC\b|\bSA\b/i.test(license)) return null;
  if (/\bCC[- ]?0\b|creativecommons.org\/publicdomain\/zero/i.test(license)) return 'CC0';
  if (/CC[- ]BY\s*4\.0|Attribution 4\.0|creativecommons.org\/licenses\/by\/4\.0/i.test(license)) return 'CC BY 4.0';
  return null;
}

export function importOcmCharger(input: unknown, context: OcmImportContext): MapCharger | null {
  const poi = row(input), address = row(poi.AddressInfo);
  if (!Number.isSafeInteger(poi.ID) || Number(poi.ID) <= 0 || !Number.isSafeInteger(Number(poi.ID) + 100_000) ||
    address.CountryID !== 36 || !brazilCoordinates(address.Latitude, address.Longitude) || !date(context.consultedAt)) return null;
  if ([2, 3].includes(Number(poi.UsageTypeID)) || [150, 200, 210].includes(Number(poi.StatusTypeID))) return null;
  const provider = context.providers.find(p => p.ID === poi.DataProviderID);
  const license = provider && ocmLicense(provider);
  if (!license) return null;
  const connections: ChargerConnection[] = (Array.isArray(poi.Connections) ? poi.Connections : []).map(value => {
    const connection = row(value);
    const connector = text(context.connectionTypes.find(type => type.ID === connection.ConnectionTypeID)?.Title) || null;
    return { connector: connection.ConnectionTypeID === 0 ? null : connector,
      current: connection.CurrentTypeID === 30 ? 'DC' : [10, 20].includes(Number(connection.CurrentTypeID)) ? 'AC' : 'unknown',
      powerKw: positive(connection.PowerKW), quantity: quantity(connection.Quantity),
      ...([30, 100, 150, 200, 210].includes(Number(connection.StatusTypeID)) ? { unavailable: true } : {}) };
  });
  const usage = Number(poi.UsageTypeID);
  const operator = context.operators.find(p => p.ID === poi.OperatorID);
  return {
    id: 100_000 + Number(poi.ID), nome: text(address.Title) || `OCM ${poi.ID}`, operador: poi.OperatorID === 1 ? '' : text(operator?.Title),
    cidade: text(address.Town), uf: uf(address.StateOrProvince), lat: address.Latitude as number, lng: address.Longitude as number,
    ...electrical(connections), connections, reportedPoints: quantity(poi.NumberOfPoints),
    address: [text(address.AddressLine1), text(address.Postcode)].filter(Boolean).join(', ') || undefined,
    access: usage === 6 ? 'customers' : usage === 4 ? 'membership' : usage === 7 ? 'notice' : [1, 5].includes(usage) ? 'public' : 'unknown',
    ...(usage === 4 ? { usage: 'membership-required' as const } : usage === 5 ? { usage: 'pay-at-location' as const } : {}),
    reportedStatus: [30, 100].includes(Number(poi.StatusTypeID)) ? 'unavailable' : [10, 20, 50, 75].includes(Number(poi.StatusTypeID)) ? 'reported-operational' : 'unknown',
    location: {
      status: 'approximate', source: 'Open Charge Map', externalId: String(poi.ID), sourceUrl: `https://openchargemap.org/poi/details/${poi.ID}`,
      consultedAt: context.consultedAt, sourceUpdatedAt: date(poi.DateLastStatusUpdate), license, attribution: text(provider!.Title),
    },
  };
}

const OSM_SOCKETS: Array<[string, string, ChargerConnection['current']]> = [
  ['type2', 'Type 2', 'AC'], ['type2_cable', 'Type 2 (cabo)', 'AC'], ['type1', 'Type 1', 'AC'],
  ['schuko', 'Schuko', 'AC'], ['nema_5_15', 'NEMA 5-15', 'AC'], ['brazilian', 'NBR 14136', 'AC'],
  ['ccs2', 'CCS2', 'DC'], ['type2_combo', 'CCS2', 'DC'], ['chademo', 'CHAdeMO', 'DC'],
  ['tesla_supercharger', 'Supercharger', 'DC'], ['tesla_ccs', 'CCS2', 'DC'], ['gb_t', 'GB/T DC', 'DC'],
];
function osmPower(value: unknown): number | null {
  const match = text(value).match(/^(\d+(?:[.,]\d+)?)\s*(kW|W)$/i);
  return match ? positive(Number(match[1].replace(',', '.')) / (match[2].toLowerCase() === 'w' ? 1000 : 1)) : null;
}

export function importOsmCharger(input: unknown, consultedAt: string): MapCharger | null {
  const element = row(input), tags = row(element.tags), center = row(element.center);
  const lat = element.lat ?? center.lat, lng = element.lon ?? center.lon;
  const typeIndex = ['node', 'way', 'relation'].indexOf(text(element.type));
  if (typeIndex < 0 || !Number.isSafeInteger(element.id) || Number(element.id) <= 0 ||
    !Number.isSafeInteger(Number(element.id) * 3 + typeIndex) || !brazilCoordinates(lat, lng) || !date(consultedAt)) return null;
  if (tags.amenity !== 'charging_station' || ['private', 'no'].includes(text(tags.access)) || tags.motorcar === 'no' ||
    (text(tags['addr:country']) && text(tags['addr:country']).toUpperCase() !== 'BR') ||
    ['disused', 'abandoned', 'construction', 'proposed'].some(key => tags[key] === 'yes' || tags[key] === 'charging_station')) return null;
  const connections: ChargerConnection[] = OSM_SOCKETS.flatMap(([key, connector, current]) => {
    const raw = text(tags[`socket:${key}`]);
    if (!/^(yes|[1-9]\d*)$/i.test(raw)) return [];
    return [{ connector, current, powerKw: osmPower(tags[`socket:${key}:output`]), quantity: raw === 'yes' ? null : quantity(Number(raw)) }];
  });
  const externalId = `${element.type}/${element.id}`;
  return {
    id: -(Number(element.id) * 3 + typeIndex), nome: text(tags.name) || text(tags.brand) || text(tags.operator) || 'Eletroposto OSM',
    operador: text(tags.operator) || text(tags.brand) || text(tags.network), cidade: text(tags['addr:city']) || text(tags['addr:town']), uf: uf(tags['addr:state']),
    lat: lat as number, lng: lng as number, ...electrical(connections), connections,
    access: tags.access === 'customers' ? 'customers' : ['yes', 'permissive'].includes(text(tags.access)) ? 'public' : 'unknown',
    reportedPoints: quantity(Number(tags.capacity)), reportedStatus: 'unknown',
    address: [text(tags['addr:street']), text(tags['addr:housenumber'])].filter(Boolean).join(', ') || undefined,
    location: { status: 'approximate', source: 'OSM', externalId, sourceUrl: `https://www.openstreetmap.org/${externalId}`,
      positionMethod: typeIndex === 0 ? 'source-point' : 'area-center',
      consultedAt, sourceUpdatedAt: date(element.timestamp), license: 'ODbL 1.0', attribution: '© OpenStreetMap contributors' },
  };
}
