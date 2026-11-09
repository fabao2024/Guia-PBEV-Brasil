import type { MapCharger } from '../types/chargers';
import { importOcmCharger } from './chargerImport';

const text = (element: Element | null): string => element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
function referenceId(element: Element | null, prefix: string): number | undefined {
  const raw = element?.getAttribute('data-localize');
  const suffix = raw?.startsWith(prefix) ? raw.slice(prefix.length) : '';
  return suffix && /^\d+$/.test(suffix) ? Number(suffix) : undefined;
}

export function parseOcmBrowseIds(document: Document): number[] {
  const list = document.querySelector('.ocm-poi-list');
  if (!list) throw new Error('Missing OCM primary result list.');
  const links = [...list.querySelectorAll('.ocm-poi-card-title a[href]')];
  const ids = links.map(link => link.getAttribute('href')?.match(/^\/poi\/details\/(\d+)$/)?.[1])
    .filter((value): value is string => !!value).map(Number);
  if (!ids.length || ids.some(id => !Number.isSafeInteger(id) || id <= 0) || new Set(ids).size !== ids.length) throw new Error('Invalid OCM result identities.');
  return ids;
}

/** Reads only the public primary location/equipment sections; no contributor/comment data. */
export function parseOcmPublicPage(document: Document, id: number, consultedAt: string): MapCharger | null {
  const general = document.querySelector('#tab-general');
  if (!general || text(general.querySelector('dt[data-localize="ocm.details.refNumber"] + dd')) !== `OCM-${id}`) throw new Error('OCM identity mismatch or changed primary markup.');
  const numericFact = (key: string) => {
    const value = text(general.querySelector(`dt[data-localize="ocm.details.location.${key}"] + dd`));
    if (!/^-?\d+(?:\.\d+)?$/.test(value)) throw new Error('Invalid OCM coordinates.');
    return Number(value);
  };
  const latitude = numericFact('latitude'), longitude = numericFact('longitude');
  const address = [...general.querySelectorAll('address > div')].map(element => text(element));
  if (address.length !== 6 || address[5] !== 'Brazil') return null;
  const name = text(document.querySelector('h1'));
  if (!name) throw new Error('Missing OCM location name.');
  const providerCard = general.querySelector('[data-localize="ocm.details.dataProvider.sectionTitle"]')?.closest('.card');
  const providerTitle = text(providerCard?.querySelector('.fw-semibold') ?? null);
  if (!providerTitle) throw new Error('Missing OCM provider attribution.');
  const license = text(providerCard?.querySelector('dt[data-localize="ocm.details.dataProvider.license"] + dd') ?? null);
  const operatorCard = general.querySelector('[data-localize="ocm.details.operator.sectionTitle"]')?.closest('.card');
  const operator = text(operatorCard?.querySelector('.fw-semibold') ?? null);
  const connections = [...document.querySelectorAll('#tab-equipment .ocm-equipment-card')].map(card => {
    const type = card.querySelector('h3 [data-localize^="ocm.reference.connectionType.value_"]');
    const powerLine = [...card.querySelectorAll('.ocm-equipment-specs > div')].find(element => /^\d+(?:\.\d+)?\s+kW$/.test(text(element)));
    const countText = [...card.querySelectorAll('.badge')].map(element => text(element)).find(value => /^\d+ present$/.test(value));
    return { ConnectionTypeID: referenceId(type, 'ocm.reference.connectionType.value_'),
      ConnectionTypeTitle: text(type),
      CurrentTypeID: referenceId(card.querySelector('[data-localize^="ocm.reference.supplyType.value_"]'), 'ocm.reference.supplyType.value_'),
      StatusTypeID: referenceId(card.querySelector('[data-localize^="ocm.reference.statusType.value_"]'), 'ocm.reference.statusType.value_'),
      PowerKW: powerLine ? Number.parseFloat(text(powerLine)) : undefined,
      Quantity: countText ? Number.parseInt(countText, 10) : undefined };
  });
  const points = [...general.querySelectorAll('dl.ocm-facts dt')].find(element => /Number Of Stations\/Bays/i.test(text(element)));
  return importOcmCharger({
    ID: id, DataProviderID: 0, OperatorID: operator && !/^\(Unknown Operator\)$/i.test(operator) ? 2 : 1,
    UsageTypeID: referenceId(general.querySelector('dd[data-localize^="ocm.reference.usageType.value_"]'), 'ocm.reference.usageType.value_'),
    StatusTypeID: referenceId(general.querySelector('dd[data-localize^="ocm.reference.statusType.value_"]'), 'ocm.reference.statusType.value_'),
    NumberOfPoints: points ? Number(text(points.nextElementSibling)) : undefined,
    AddressInfo: { CountryID: 36, Title: name, AddressLine1: address.slice(0, 2).filter(Boolean).join(', '),
      Town: address[2], StateOrProvince: address[3], Postcode: address[4], Latitude: latitude, Longitude: longitude },
    Connections: connections,
  }, { consultedAt, providers: [{ ID: 0, Title: providerTitle, IsOpenDataLicensed: true, License: license }],
    operators: [{ ID: 2, Title: operator }],
    connectionTypes: connections.filter(connection => connection.ConnectionTypeID != null).map(connection => ({ ID: connection.ConnectionTypeID, Title: connection.ConnectionTypeTitle })),
  });
}

/** Reject loops, overlapping or unsorted pages instead of silently exporting a partial country. */
export function validateOcmApiPage(value: unknown, previousId: number): number {
  if (!Array.isArray(value)) throw new Error('Invalid OCM API page.');
  let cursor = previousId;
  for (const item of value) {
    if (!item || !Number.isSafeInteger(item.ID) || item.ID <= cursor) throw new Error('Non-ascending OCM API identity.');
    cursor = item.ID;
  }
  return cursor;
}
