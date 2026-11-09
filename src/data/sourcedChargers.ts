import type { ChargerLocation, Eletroposto } from './eletropostosData';

/** Small, source-linked public snapshot; not nationwide coverage or live status. */
export const CHARGER_SNAPSHOT_DATE = '2026-11-09';

function evidence(id: number, contributorData = false): ChargerLocation {
  return {
    status: 'approximate', source: 'Open Charge Map', externalId: String(id),
    sourceUrl: `https://openchargemap.org/poi/details/${id}`,
    consultedAt: CHARGER_SNAPSHOT_DATE,
    license: contributorData ? 'CC BY 4.0' : 'CC0',
    attribution: contributorData ? 'Open Charge Map Contributors' : 'TriCharge via Open Charge Map',
  };
}

/** Coordinates, power and connectors transcribed from each linked POI, not geocoded addresses. */
export const SOURCED_CHARGERS: Eletroposto[] = [
  {
    id: 613710, nome: 'Avenida do Rio Bonito, 2002', operador: '', cidade: 'São Paulo', uf: 'SP',
    lat: -23.695222503765905, lng: -46.701610346314055, potenciaDC: 80, conector: 'CCS2',
    address: 'Avenida do Rio Bonito, Interlagos, 04776-003', usage: 'pay-at-location',
    location: evidence(513710, true),
  },
  {
    id: 291634, nome: 'Copel Telecomunicações', operador: 'Copel', cidade: 'Curitiba', uf: 'PR',
    lat: -25.432603925814988, lng: -49.339198023151965, potenciaDC: 50, conector: 'CCS2+CHAdeMO',
    address: 'Rua José Izidoro Biazetto, 158, Mossunguê, 82305-100', usage: 'membership-required',
    location: evidence(191634, true),
  },
  {
    id: 613602, nome: 'Pronto Eletroposto', operador: 'TriCharge (BR)', cidade: 'Boa Vista', uf: 'RR',
    lat: 2.820616, lng: -60.694527, potenciaDC: 40, conector: 'CCS2',
    address: 'Rua Lourenço Belfort, 69304-600', usage: 'membership-required',
    location: evidence(513602),
  },
  {
    id: 613541, nome: 'Posto Mahalo', operador: 'TriCharge (BR)', cidade: 'Florianópolis', uf: 'SC',
    lat: -27.450711, lng: -48.457894, potenciaDC: 30, conector: 'CCS2',
    address: 'Rodovia José Carlos Daux, 88052-800', usage: 'membership-required',
    location: evidence(513541),
  },
  {
    id: 613601, nome: 'Energy Station', operador: 'TriCharge (BR)', cidade: 'Jaboatão dos Guararapes', uf: 'PE',
    lat: -8.167048, lng: -34.921742, potenciaDC: 80, conector: 'CCS2',
    address: 'Avenida Barreto de Menezes, 54360-160', usage: 'membership-required',
    location: evidence(513601),
  },
  {
    id: 613594, nome: 'America Shopping - JJVM BRASIL 60KW', operador: 'TriCharge (BR)', cidade: 'Goiânia', uf: 'GO',
    lat: -16.654814, lng: -49.384142, potenciaDC: 60, conector: 'CCS2',
    address: 'Ciclovia dos Romeiros, 74493-970', usage: 'membership-required',
    location: evidence(513594),
  },
  {
    id: 613595, nome: 'Eletroposto To Nem Aí', operador: 'TriCharge (BR)', cidade: 'Salvador', uf: 'BA',
    lat: -12.931991, lng: -38.431417, potenciaDC: 40, conector: 'CCS2',
    address: 'Avenida Oceano Atlântico, 41250-010', usage: 'membership-required',
    location: evidence(513595),
  },
];
