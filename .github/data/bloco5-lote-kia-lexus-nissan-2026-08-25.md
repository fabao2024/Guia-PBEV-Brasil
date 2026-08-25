# Lote Kia + Lexus + Nissan · Bloco 5 — marcas restantes

Data da verificação/aplicação: 2026-08-25
Fontes oficiais: kia.com.br (páginas de modelo `/ev5`, `/ev9`, páginas de especificações e fichas técnicas oficiais hospedadas em `kiasiteblob.kia.com.br`). Lexus: dados da fabricante divulgados no lançamento brasileiro (mai/2026), convergidos em cobertura especializada — o site lexus.com.br renderiza especificações apenas via JavaScript.

## Resultado

Cobertura do registro: **257/763** campos verificados (era 246/763; +11 no lote). Correções aprovadas explicitamente pelo mantenedor e aplicadas via TDD RED→GREEN.

## Campos verificados sem alteração de valor

| Veículo | Campos |
|---|---|
| `kia-ev5-land` | `price` (R$ 389.990), `power` (217 cv / 160 kW), `availability` |
| `kia-ev9-gt-line` | `price` (R$ 749.990, válido até 31/08/2026), `range_km` (434 km Inmetro), `battery` (99,8 kWh NCM), `charging` (CA 11 kW), `availability` |

## Correções aplicadas (aprovação explícita em 25/08/2026)

| Veículo | Campo | Antes | Depois | Fonte |
|---|---|---|---|---|
| EV5 Land | `battery` | 88 kWh | **88,16 kWh** LFP Blade | ficha técnica oficial Kia; texto da feature corrigido de "NMC" para LFP |
| EV9 GT-Line | `power` | 384 cv | **385 cv** (283 kW) | ficha técnica oficial Kia |
| RZ 500e | `battery` | *(vazio)* | **77 kWh** | dados da fabricante no lançamento brasileiro |
| RZ 500e | CA | *(vazio)* | **22 kW** | idem |

## Fail-closed e observações registradas

- **RZ 500e**: os novos valores de bateria/carregamento CA ficam `legacy_unverified` porque o site oficial não expõe especificações sem JavaScript; preenchimento seguiu o precedente de convergência independente (Dolphin Plus).
- **EV5**: consumo do catálogo (0,60 MJ/km) foi verificado contra a tabela PBEV vigente e diverge da ficha Kia (0,63 MJ/km) — prevalece o regulador; divergência documentada. Potência oficial é 217,5 cv (catálogo trunca para 217, como a imprensa).
- **DC dos Kias**: as fichas oficiais citam a potência do equipamento de carga (350–360 kW EVSE), não a aceita pelo veículo — campos CC permanecem `legacy_unverified`.
- **Ariya**: descontinuada desde o Bloco 2; sem páginas oficiais ativas para captura — campos permanecem como estão.

## Método

1. Captura das páginas e fichas técnicas oficiais Kia e levantamento dos dados de lançamento da Lexus (25/08/2026);
2. comparação campo a campo com `public/data/cars.json`;
3. aprovação explícita do mantenedor para cada correção;
4. teste RED → edição em `src/constants.ts` → GREEN;
5. regeneração de artefatos; `npm run test:run` (276/276), TypeScript, build Vite, rotas estáticas, scanner de `dist` e verificador de proveniência aprovados.
