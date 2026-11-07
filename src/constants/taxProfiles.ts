import type { Car } from '../types';

type TaxProfile = NonNullable<Car['taxProfile']>;
const gwm = 'https://www.gwmmotors.com.br/content/dam/gwm/pages/br/pt/models/';
const hevManual = `${gwm}haval-hev2-my25/manual-do-proprietario-h6-hev-my-27-flex-2.pdf`;
const phevManual = `${gwm}phev-35/manual-do-proprietario-h6-phev-my-27-flex.pdf`;
const songManual = 'https://www.byd.com/material/__CN/byd-site/br/manuais-p%C3%B3s-vendas/updates-19-08-2026/SONG_PRO_FLEX_MP_26061_Site.pdf';

// Não corrigir silenciosamente unidades inconsistentes no manual HEV MY27:
// p. 329 apresenta "Potência máxima [N·m] 130" e "Torque máximo [kW] 295".
// Tensão e regeneração são verificáveis, mas potência fica pendente de fonte inequívoca.
const h6Hev: TaxProfile = {
  voltageV: 306.6, regenerativeBraking: true, sourceUrl: hevManual,
  scope: 'Brasil · Haval H6 HEV Flex MY27', reviewedAt: '2026-11-06',
  sources: [{ url: hevManual, label: 'GWM HEV Flex MY27 · regeneração p. 108; bateria p. 330; potência com unidade inconsistente p. 329' }],
};
const song: TaxProfile = {
  electricMotorKw: 120, regenerativeBraking: true, sourceUrl: songManual,
  scope: 'Brasil · Song Pro DM-i Flex GL/GS · manual 26061', reviewedAt: '2026-11-06',
  sources: [
    { url: songManual, label: 'BYD Song Pro Flex · motor de tração p. 194 (120 kW); tensão de tração não informada' },
    { url: 'https://www.byd.com/material/__CN/byd-site/br/product/songpro-flex/BYD_SongProFlex_Rev3_05_08_2026.pdf', label: 'BYD Song Pro Flex GL/GS · combustível e frenagem regenerativa CRBS' },
  ],
};
const corollaCross: TaxProfile = {
  electricMotorKw: 53, voltageV: 201.6, regenerativeBraking: true,
  sourceUrl: 'https://media.toyota.com.br/39017a3b-e8be-46a9-8671-8788607dbc4c.pdf',
  scope: 'Brasil · Corolla Cross Hybrid MY26 · manual 01999-98B40 · motor 2ZR-FXB', reviewedAt: '2026-11-06',
  sources: [{ url: 'https://media.toyota.com.br/39017a3b-e8be-46a9-8671-8788607dbc4c.pdf', label: 'Toyota Corolla Cross Hybrid MY26 · motor 53 kW p. 424; bateria 201,6 V p. 425; regeneração p. 65' }],
};
const corolla: TaxProfile = {
  electricMotorKw: 53, voltageV: 201.6, regenerativeBraking: true,
  sourceUrl: 'https://media.toyota.com.br//5dadfd9c-cfa9-4452-a735-8619b5139465.pdf',
  scope: 'Brasil · Corolla GLi/Altis Hybrid · manual 01999-98734-RP · motor 2ZR-FXB', reviewedAt: '2026-11-06',
  sources: [{ url: 'https://media.toyota.com.br//5dadfd9c-cfa9-4452-a735-8619b5139465.pdf', label: 'Toyota Corolla Hybrid · motor 53 kW p. 456; bateria 201,6 V p. 459; regeneração p. 65' }],
};
const yarisCross: TaxProfile = {
  electricMotorKw: 59, voltageV: 177.6, regenerativeBraking: true,
  sourceUrl: 'https://media.toyota.com.br/b7ef5677-9835-4cc2-8ec8-96072011548f.pdf',
  scope: 'Brasil · Yaris Cross Hybrid XRE/XRX · manual OM9AK-42BRAb · motor flex 2NR-VDX', reviewedAt: '2026-11-06',
  sources: [{ url: 'https://media.toyota.com.br/b7ef5677-9835-4cc2-8ec8-96072011548f.pdf', label: 'Toyota Yaris Cross Hybrid · motor 59 kW e bateria 177,6 V p. 615; regeneração p. 74' }],
};

/** Evidências somente das versões brasileiras indicadas. Ausência ≠ inelegibilidade.
 * Potência de tração, não combinada; tensão da bateria de tração, não tomada/V2L.
 * A documentação de auditoria detalha lacunas e páginas das fontes.
 */
export const TAX_PROFILES: Readonly<Record<string, TaxProfile>> = {
  'Corolla GLi Hybrid': corolla,
  'Corolla Altis Hybrid': corolla,
  'Corolla Cross Hybrid': corollaCross,
  'Yaris Cross XRE Hybrid': yarisCross,
  'Yaris Cross XRX Hybrid': yarisCross,
  'Haval H6 HEV ONE': h6Hev,
  'Haval H6 HEV2': h6Hev,
  'Haval H6 PHEV19': {
    electricMotorKw: 130, voltageV: 313, regenerativeBraking: true, sourceUrl: phevManual,
    scope: 'Brasil · H6 PHEV Flex MY27 · 2WD / bateria PB313061B (19 kWh)', reviewedAt: '2026-11-06',
    sources: [{ url: phevManual, label: 'GWM PHEV Flex MY27 · tração 2WD p. 354; bateria p. 355; regeneração de energia' }],
  },
  'Haval H6 PHEV35': {
    electricMotorKw: 215, voltageV: 310.8, regenerativeBraking: true, sourceUrl: phevManual,
    scope: 'Brasil · H6 PHEV Flex MY27 · AWD / bateria PE311114E (35 kWh)', reviewedAt: '2026-11-06',
    sources: [{ url: phevManual, label: 'GWM PHEV Flex MY27 · motores AWD 80 + 135 kW p. 354; bateria p. 355; regeneração de energia' }],
  },
  'Haval H6 GT': {
    electricMotorKw: 215, voltageV: 310.8, regenerativeBraking: true,
    sourceUrl: `${gwm}haval-h6-gt-my25/manual-do-proprietario-h6-gt-phev-my-27-flex.pdf`,
    scope: 'Brasil · H6 GT PHEV Flex MY27 · motores 80 + 135 kW; bateria PE311114E', reviewedAt: '2026-11-06',
  },
  'Haval H7 PHEV': {
    electricMotorKw: 230, voltageV: 313, regenerativeBraking: true,
    sourceUrl: `${gwm}haval-h7/manual-do-proprietario-haval-h7-phev-my27gwm.pdf`,
    scope: 'Brasil · H7 Flex MY27 · potência/bateria p. 374; regeneração p. 198', reviewedAt: '2026-11-06',
  },
  'Tank 300': {
    electricMotorKw: 120, voltageV: 325.6, regenerativeBraking: true,
    sourceUrl: `${gwm}tank-300/manual-do-proprietario-tank300flex-my27-1.pdf`,
    scope: 'Brasil · Tank 300 Flex MY27 · potência/bateria p. 386; recuperação p. 130', reviewedAt: '2026-11-06',
  },
  'Song Pro GL': song,
  'Song Pro GS': song,
  'Atto 2 GS': {
    regenerativeBraking: true,
    sourceUrl: 'https://www.byd.com/material/__CN/byd-site/br/fichas-tecnicas-2026/update-13-07-2026/07-13-2026---ficha-txiunica/BYD_Atto2_V2.pdf',
    scope: 'Brasil · Atto 2 DM-i Flex GS · ficha V2 (potência elétrica e tensão pendentes)', reviewedAt: '2026-11-06',
  },
  'CS55 PHEV': {
    electricMotorKw: 172, voltageV: 341, regenerativeBraking: true,
    sourceUrl: 'https://cloudfront.alpes.one/public/6aa/9c4/827/6aa9c4827acd0592549197.pdf',
    scope: 'Brasil · CS55 Ultra-Hybrid PHEV Flex · tração p. 208; bateria p. 209; RBS p. 70', reviewedAt: '2026-11-06',
  },
};
