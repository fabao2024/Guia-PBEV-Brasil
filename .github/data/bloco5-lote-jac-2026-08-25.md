# Lote JAC · Bloco 5 — marcas restantes

Data da verificação/aplicação: 2026-08-25
Fontes oficiais (`official_manufacturer`, JAC Motors Brasil — jacmotors.com.br): páginas de modelo `/carros/e-js1/`, `/carros/e-js4/`, `/carros/e-j7/` e menu de modelos.

## Resultado

Cobertura do registro: **246/763** campos verificados (era 232/763; +14 no lote). Correções aprovadas explicitamente pelo mantenedor e aplicadas via TDD RED→GREEN.

## Campos verificados sem alteração de valor

| Veículo | Campos |
|---|---|
| `jac-e-js1` | `price` (R$ 119.900), `power` (62 cv), `availability` |
| `jac-e-js4` | `price` (R$ 254.900), `battery` (55 kWh), `availability` |
| `jac-e-j7` | `price` (R$ 259.900), `power` (193 cv), `battery` (50 kWh), `availability` |
| `jac-e-jv5-5` | `availability` |
| `jac-iev330p` | `availability` |

## Correções aplicadas (aprovação explícita em 25/08/2026)

| Veículo | Campo | Antes | Depois | Fonte |
|---|---|---|---|---|
| E-JS1 | `battery` | 30,2 kWh | **31,4 kWh** LFP | página oficial do modelo |
| E-JS4 | `power` | 150 cv | **200 cv** (147 kW) | página oficial do modelo |

Textos descritivos coerentes atualizados (química LFP do E-JS4 conforme linha oficial).

## Fail-closed e observações registradas

- **iEV330P**: catálogo diverge do lançamento oficial de 2020 (potência 204 vs 150 cv; bateria 65,3 vs 67,2 kWh; preço R$ 389.900 vs R$ 289.990; autonomia 226 km vs 320 NEDC). Sem fonte oficial atual capturável — nada alterado; triagem futura.
- **E-J7 — divergência entre fontes oficiais**: a página oficial cita 249 km (INMETRO) enquanto a tabela PBEV vigente homologa 263 km (valor do catálogo, já verificado junto ao regulador). Prevalece o regulador; divergência documentada.
- Potências de carregamento AC/DC em kW não são publicadas nas páginas oficiais da JAC — campos seguem `legacy_unverified`.

## Método

1. Captura das páginas oficiais por modelo e do menu de modelos (25/08/2026);
2. comparação campo a campo com `public/data/cars.json`;
3. aprovação explícita do mantenedor para cada correção;
4. teste RED → edição em `src/constants.ts` → GREEN;
5. regeneração de artefatos; `npm run test:run` (274/274), TypeScript, build Vite, rotas estáticas, scanner de `dist` e verificador de proveniência aprovados.
