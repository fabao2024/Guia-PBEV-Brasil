# Lote Geely · Bloco 5 — marcas restantes

Data da verificação/aplicação: 2026-08-25
Fontes oficiais (todas `official_manufacturer`, Geely Auto Brasil — geelybrasil.com.br):

- Páginas de modelo: `/ex2`, `/ex5`
- Fichas técnicas oficiais hospedadas na plataforma do site da Geely Brasil: `ficha-tecnica-geely-ex5.pdf`, `Ficha_Tecnica_GEELY_EX2.pdf`
- Release de pré-venda do EX5 (17/07/2025) e oferta vigente do EX5 Max (válida até 31/08/2026)

## Resultado

Cobertura do registro: **232/763** campos verificados (era 211/763; +21 no lote). Correções aprovadas explicitamente pelo mantenedor e aplicadas via TDD RED→GREEN com snapshots em `src/constants/priceHistory.ts`.

## Campos verificados sem alteração de valor

| Veículo | Campos |
|---|---|
| `geely-ex2-pro` | `range_km` (289 km Inmetro), `power` (116 cv), `availability` |
| `geely-ex2-max` | `power` (116 cv), `availability` |
| `geely-ex5-pro` | `range_km` (413 km Inmetro), `power` (218 cv), `availability` |
| `geely-ex5-max` | `range_km` (349 km Inmetro), `power` (218 cv), `availability` |

## Correções aplicadas (aprovação explícita em 25/08/2026)

| Veículo | Campo | Antes | Depois | Fonte |
|---|---|---|---|---|
| EX5 Pro | `price` | R$ 195.800 | **R$ 205.800** | tabela oficial do release; o valor anterior correspondia ao preço com bônus promocional de R$ 10 mil |
| EX5 Max | `price` | R$ 215.800 | **R$ 225.800** | oferta oficial vigente ("por R$ 225.800,00 à vista") |
| EX5 Pro / EX5 Max | CC | 160 kW | **100 kW** | ficha técnica oficial EX5 |
| EX5 Max | `battery` | 60,1 kWh | **60,22 kWh** | ficha técnica oficial (bateria única Short Blade LFP para a linha) |
| EX2 Pro | `battery` | 39 kWh | **39,4 kWh** | ficha técnica/página oficial EX2 |
| EX2 Pro / EX2 Max | CA | 7 kW | **6,6 kW** | ficha técnica/página oficial EX2 |

## Fail-closed

- Preços das versões EX2 (Pro R$ 123.800 / Max R$ 136.800): coincidem com a tabela pós-lançamento relatada por imprensa especializada, mas sem página oficial com preço por versão capturada — permanecem `legacy_unverified`, sem alteração de valor.

## Achados colaterais registrados (sem alteração)

- Catálogo marca os EX2 como tração `FWD`; todas as fontes oficiais e especializadas descrevem **tração traseira** — tratar no próximo ciclo.
- A linha EX5 EM-i (híbrido plug-in) estreou no site oficial — fora do escopo BEV deste catálogo.
- Diferença de autonomia entre as versões do EX5 (413 km Pro / 349 km Max) é oficial e homologada; catálogo já reflete corretamente.

## Método

1. Captura das páginas oficiais, fichas técnicas hospedadas no domínio/plataforma da Geely Brasil e condições comerciais vigentes (25/08/2026);
2. comparação campo a campo com `public/data/cars.json`;
3. aprovação explícita do mantenedor para cada correção;
4. teste RED → edição em `src/constants.ts` + histórico → GREEN;
5. regeneração de artefatos; `npm run test:run` (273/273), TypeScript, build Vite, rotas estáticas, scanner de `dist` e verificador de proveniência aprovados.
