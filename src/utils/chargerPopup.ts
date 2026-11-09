import type { TFunction } from 'i18next';
import type { MapCharger } from '../types/chargers';
import { plugshareUrl } from '../data/eletropostosData';
import { chargerMapsUrl, locationStatus } from './chargerLocations';
import { chargerConnections, chargerElectricalLabel } from './chargerCatalog';

/** DOM textContent is intentional: external station names/tags are not trusted HTML. */
export function createChargerPopup(charger: MapCharger, t: TFunction): HTMLDivElement {
  const root = document.createElement('div');
  root.style.cssText = 'min-width:200px;max-width:280px;line-height:1.6;color:#ccc;';
  const line = (text: string, strong = false) => {
    const element = document.createElement(strong ? 'strong' : 'div');
    element.style.display = 'block';
    element.textContent = text;
    root.appendChild(element);
  };
  const link = (text: string, href: string) => {
    const element = document.createElement('a');
    element.textContent = text;
    element.href = href;
    element.target = '_blank';
    element.rel = 'noopener noreferrer';
    element.style.cssText = 'display:block;color:#72d7ff;margin-top:6px;';
    root.appendChild(element);
  };
  const status = locationStatus(charger);
  line(t(`chargingMap.${status}`), true);
  line(charger.nome, true);
  line([charger.cidade, charger.uf].filter(Boolean).join(' — ') || t('chargingMap.localityUnknown'));
  if (status === 'unverified') {
    line(t('chargingMap.legacyPopup'));
    return root;
  }
  link(`${t('chargingMap.evidence')}: ${charger.location!.source} · ${charger.location!.externalId}`, charger.location!.sourceUrl!);
  line(t('chargingMap.consultedAt', { date: charger.location!.consultedAt }));
  if (charger.location?.license) line(`${charger.location.attribution} · ${charger.location.license}`);
  if (charger.location?.license === 'CC BY 4.0') link('CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/');
  if (charger.location?.license === 'CC0') link('CC0', 'https://creativecommons.org/publicdomain/zero/1.0/');
  if (charger.location?.license === 'ODbL 1.0') link('ODbL 1.0', 'https://www.openstreetmap.org/copyright');
  if (charger.location?.sourceUpdatedAt) line(t('chargingMap.sourceUpdatedAt', { date: charger.location.sourceUpdatedAt }));
  if (charger.location?.positionMethod === 'area-center') line(t('chargingMap.areaCenterWarning'));
  line(chargerElectricalLabel(charger, t));
  line([...new Set(chargerConnections(charger).map(c => c.connector).filter(Boolean))].join(' · ') || t('chargingMap.connectorUnknown'));
  if (charger.reportedPoints) line(t('chargingMap.reportedPoints', { count: charger.reportedPoints }));
  if (charger.access) line(t(`chargingMap.accessValues.${charger.access}`));
  if (charger.reportedStatus === 'unavailable') line(t('chargingMap.reportedUnavailable'));
  line(t('chargingMap.reportedOperator', { operator: charger.operador || t('chargingMap.operatorUnknown') }));
  if (charger.address) line(charger.address);
  if (charger.usage) line(t(`chargingMap.usage.${charger.usage}`));
  if (status === 'confirmed') line(t('chargingMap.verifiedAt', { date: charger.location!.verifiedAt }));
  line(t('chargingMap.communityWarning'));
  link(t(status === 'confirmed' ? 'chargingMap.openMaps' : 'chargingMap.searchMaps'), chargerMapsUrl(charger)!);
  link(t('chargingMap.searchPlugshare'), plugshareUrl(charger.lat, charger.lng));
  return root;
}
