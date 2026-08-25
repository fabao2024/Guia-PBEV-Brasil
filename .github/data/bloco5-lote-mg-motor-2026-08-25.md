# Lote MG Motor · Bloco 5 — fichas técnicas oficiais e tabela MY 26/27

Data da verificação/aplicação: 2026-08-25
Fontes: fichas técnicas oficiais MG Motor Brasil por modelo (`mgmotoroficial.com.br/pdfs/`; metadados dos PDFs: mg4/mgs5/cyberster 2026-06-16, MG4 Urban 2026-07-16), páginas oficiais de modelo e páginas `/oferta` MY 26/27 (`/oferta/mg4`, `/oferta/mgs5`), verificadas em 2026-08-25.

## Resultado

Cobertura do registro: **381/763** campos verificados (era 339/763; **+42 no lote**). Correções de valor aplicadas somente após aprovação explícita do mantenedor, via TDD RED→GREEN (`src/__tests__/catalogIndicativePrices.test.ts`, dois blocos novos).

## Marcados como verificados sem alteração de valor

| Veículo | Campos |
|---|---|
| MG4 Comfort | range_km 364, power 190, battery 64 |
| MG4 Luxury | range_km 364, power 190, battery 64, charging DC 140 |
| MG4 XPower | range_km 279, power 435, battery 64 |
| MG4 Urban Comfort/Luxury | range_km 299, power 150 |
| MG4 Urban Luxury 54kWh | range_km 358, power 160 |
| MGS5 Comfort/Luxury | battery 64 (nominal) |
| Cyberster | range_km 342, power 510, battery 77 |

`availability` dos 9 veículos marcada como verificada pelas páginas oficiais de modelo ativas.

## Correções aplicadas (aprovação explícita em 25/08/2026)

| Veículo | Campo | Antes | Depois |
|---|---|---|---|
| MG4 Comfort | `price` | R$ 164.600 | **R$ 184.600** (tabela; promoção R$ 169.600 não é preço de tabela) |
| MG4 Comfort | `charging` AC/DC | 6,6 / 87 kW | **11 / 140 kW** |
| MG4 Luxury | `price` | R$ 189.800 (= promoção) | **R$ 199.800** |
| MG4 Luxury | `charging` AC | 6,6 kW | **11 kW** |
| MG4 XPower | `charging` AC | 6,6 kW | **11 kW** |
| MG4 Urban Comfort/Luxury | `battery` | 43 kWh | **42,8 kWh** (nominal; útil 41,9) |
| MG4 Urban Comfort/Luxury | `charging` AC/DC | — / 87 kW | **11 / 82 kW** |
| MG4 Urban Luxury 54kWh | `battery` | 54 kWh | **53,9 kWh** (nominal) |
| MG4 Urban Luxury 54kWh | `charging` AC | — | **11 kW** |
| MGS5 Comfort | `price` | R$ 195.800 | **R$ 218.800** (promoção R$ 189.800) |
| MGS5 Luxury | `price` | R$ 219.800 (= promoção) | **R$ 238.800** |
| MGS5 Comfort/Luxury | `power` | 204 cv | **205 cv** |
| MGS5 Comfort/Luxury | `charging` AC/DC | 6,6 / 100 kW | **7 / 150 kW** |
| Cyberster | `charging` AC/DC | 6,6 / 140 kW | **11 / 150 kW** |

Snapshots `2026-08` registrados no histórico de preços para MG4 Comfort, MG4 Luxury, MGS5 Comfort e MGS5 Luxury. Textos correspondentes em `features` alinhados (inclui "Bateria NMC 61,1 kWh" → "64 kWh (nominal)" do MGS5).

## Fail-closed (documentado, sem alteração)

- **Consumo MGS5**: valor legado 0,51 MJ/km mantido como `legacy_unverified`; o modelo não tem linha pareada na tabela PBEV vigente.
- **Preço MG4 XPower**: sem preço exposto nas fontes oficiais atuais; permanece `legacy_unverified`.
- **Preços MG4 Urban ×3 e Cyberster**: não expostos no site oficial; permanecem como estão.

## Verificações

`npm run test:run` 285/285 · TypeScript limpo · build Vite · rotas estáticas · scanner de `dist` · verificador de proveniência (381/763).
