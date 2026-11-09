import type { TFunction } from 'i18next';
import type { MapCharger } from '../types/chargers';
import { locationStatus } from './chargerLocations';
import { chargerElectricalLabel } from './chargerCatalog';

export const CHARGER_MARKER_SIZE: [number, number] = [44, 48];
export const CHARGER_MARKER_ANCHOR: [number, number] = [22, 43];

export function chargerMarkerLabel(charger: MapCharger, t: TFunction): string {
  const status = locationStatus(charger);
  const locality = [charger.cidade, charger.uf].filter(Boolean).join('/');
  return `${charger.nome}${locality ? ` — ${locality}` : ''}. ${t(`chargingMap.${status}`)}` +
    (status === 'unverified' ? '' : `. ${chargerElectricalLabel(charger, t)}`);
}

/** Only fixed decorative SVG is constructed here; external text never becomes HTML. */
export function createChargerMarkerElement(charger: MapCharger, selected = false): HTMLSpanElement {
  const status = locationStatus(charger);
  const root = document.createElement('span');
  root.className = 'ev-map-pin';
  root.dataset.chargerId = String(charger.id);
  root.dataset.quality = status;
  root.dataset.selected = String(selected);
  root.setAttribute('aria-hidden', 'true');
  const body = document.createElement('span');
  body.className = 'ev-map-pin__body';
  if (status === 'unverified') {
    const question = document.createElement('span');
    question.className = 'ev-map-pin__question';
    question.textContent = '?';
    body.appendChild(question);
  } else {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    const bolt = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    bolt.setAttribute('d', 'M13 2 4 14h6l-1 8L20 9h-7l1-7Z');
    bolt.setAttribute('fill', 'currentColor');
    svg.appendChild(bolt);
    body.appendChild(svg);
  }
  root.appendChild(body);
  const badge = document.createElement('span');
  badge.className = 'ev-map-pin__quality';
  badge.textContent = status === 'confirmed' ? '✓' : status === 'approximate' ? '~' : '?';
  root.appendChild(badge);
  return root;
}

export function createChargerMarkerTooltip(charger: MapCharger, t: TFunction): HTMLDivElement {
  const root = document.createElement('div');
  const title = document.createElement('div');
  title.className = 'ev-map-station-label__title';
  title.textContent = charger.nome;
  const detail = document.createElement('div');
  detail.className = 'ev-map-station-label__detail';
  const status = locationStatus(charger);
  detail.textContent = (status === 'unverified' ? '' : `${chargerElectricalLabel(charger, t)} · `) + t(`chargingMap.${status}`);
  root.append(title, detail);
  return root;
}

export interface ChargerMarkerGroup {
  chargers: MapCharger[];
  position: [number, number];
}

/** Screen-space grouping avoids moving station coordinates to make room for icons. */
export function groupChargerMarkers(
  chargers: MapCharger[],
  project: (point: [number, number]) => { x: number; y: number },
  distancePx = 52,
): ChargerMarkerGroup[] {
  const points = chargers.map(charger => project([charger.lat, charger.lng]));
  const parent = chargers.map((_, index) => index);
  const boxes = points.map(point => ({ left: point.x, right: point.x, top: point.y, bottom: point.y }));
  const root = (index: number): number => {
    while (parent[index] !== index) { parent[index] = parent[parent[index]]; index = parent[index]; }
    return index;
  };
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y) >= distancePx) continue;
      const a = root(i), b = root(j);
      if (a === b) continue;
      const box = { left: Math.min(boxes[a].left, boxes[b].left), right: Math.max(boxes[a].right, boxes[b].right),
        top: Math.min(boxes[a].top, boxes[b].top), bottom: Math.max(boxes[a].bottom, boxes[b].bottom) };
      // A long chain of neighboring pins must not absorb an entire country at low zoom.
      if (box.right - box.left > distancePx * 2 || box.bottom - box.top > distancePx * 2) continue;
      parent[b] = a;
      boxes[a] = box;
    }
  }
  const groups = new Map<number, MapCharger[]>();
  chargers.forEach((charger, index) => {
    const key = root(index);
    const group = groups.get(key) ?? [];
    group.push(charger);
    groups.set(key, group);
  });
  return [...groups.values()].map(group => ({
    chargers: group,
    position: [group.reduce((sum, charger) => sum + charger.lat, 0) / group.length,
      group.reduce((sum, charger) => sum + charger.lng, 0) / group.length],
  }));
}
