# Lote GAC · Bloco 5 — marcas restantes

Data da verificação/aplicação: 2026-08-25
Fontes oficiais (todas `official_manufacturer`, GAC Brasil — gacgroup.com/pt-br):

- Landings: `/pt-br/hatchback/aion-ut`, `/pt-br/sedan/aion-es`, `/pt-br/suv/aion-y`, `/pt-br/suv/aion-v`, `/pt-br/suv/hyptec-ht`
- Configuradores de especificação: `/pt-br/configuration/{aion-ut,aion-es,aion-y,aion-v,hyptec-ht}/2024`

## Resultado

Cobertura do registro: **211/763** campos verificados (era 183/763; +28 no lote). Correções aprovadas explicitamente pelo mantenedor e aplicadas via TDD RED→GREEN com snapshots em `src/constants/priceHistory.ts`.

## Campos verificados sem alteração de valor

| Veículo | Campos |
|---|---|
| `gac-aion-ut-premium` | `power` (204 cv), `battery` (44,12 kWh), `charging` (6,6 CA / 64 CC), `availability` |
| `gac-aion-ut-elite` | `power` (204 cv), `battery` (60 kWh), `charging` (6,6 / 87), `availability` |
| `gac-aion-es` | `price` (R$ 170.990), `range_km` (314 km Inmetro), `power` (136 cv), `availability` |
| `gac-aion-y-elite` | `power` (204 cv), `battery` (63,2 kWh), `charging` (6,6 / 75), `availability` |
| `gac-aion-v-elite` | `range_km` (389 km Inmetro), `power` (204 cv), `availability` |
| `gac-hyptec-ht` | `power` (340 cv), `availability` |

## Correções aplicadas (aprovação explícita em 25/08/2026)

| Veículo | Campo | Antes | Depois | Fonte |
|---|---|---|---|---|
| Aion V Elite | `price` | R$ 219.000 | **R$ 219.990** | landing "A partir de" |
| Aion V Elite | `battery` | 75 kWh | **75,3 kWh** | configurador oficial |
| Aion V Elite | CA | 11 kW | **6,6 kW** | configurador oficial |
| Aion ES | `battery` | 55 kWh | **55,2 kWh** | configurador oficial |
| Aion ES | CC | 70 kW | **68 kW** | configurador oficial |
| Hyptec HT | `price` | R$ 359.990 | **R$ 314.990** | landing "A partir de" (entrada mapeada à versão Elite) |
| Hyptec HT | `battery` | 80 kWh | **83 kWh** | configurador oficial da linha atual |
| Hyptec HT | CA | 11 kW | **6,6 kW** | configurador oficial |
| Hyptec HT | CC | 150 kW | **280 kW** | configurador oficial |

Textos descritivos coerentes atualizados junto aos campos (química LFP conforme oficial nos Aion ES/V/Hyptec HT).

## Fail-closed

- Preços das versões Aion UT Premium/Elite e Aion Y Elite: o site oficial não publica preço por versão; imprensa especializada e revendas convergem com os valores do catálogo nos UTs, mas a fonte não é oficial direta.

## Lacunas de cobertura detectadas (triagem futura)

- **Aion Y Premium** (~R$ 175.990, "A partir de") à venda no site oficial e ausente do catálogo;
- **Hyptec HT Ultra** (~R$ 370.000 na linha 2027 segundo a imprensa) à venda no configurador oficial e ausente do catálogo;
- Página oficial do Hyptec HT mistura conteúdo da linha anterior (landing cita 72,7 kWh/362 km) com a linha atual (configurador: 83 kWh/280 kW) — registrado como ressalva de fonte.

## Método

1. Captura das landings e configuradores oficiais por modelo (URLs acima, 25/08/2026);
2. comparação campo a campo com `public/data/cars.json`;
3. aprovação explícita do mantenedor para cada correção;
4. teste RED → edição em `src/constants.ts` + histórico → GREEN;
5. regeneração de artefatos; `npm run test:run` (271/271), TypeScript, build Vite, rotas estáticas, scanner de `dist` e verificador de proveniência aprovados.
