# Lote decisões pendentes · Bloco 5 — Dolphin Mini, Yuan Plus, eT3, EQB 250+, Ioniq 5 e Equinox EV

Data da verificação/aplicação: 2026-08-25
Referências: `bloco5-itens-1-a-4-2026-08-25.md`, `bloco5-lote-marcas-2026-08-25.md`, `docs/CATALOG_REVIEW_HANDOFF.md`

## Resultado

Cobertura do registro: **183/763** campos verificados (era 171/763). Todas as correções de valor foram aprovadas explicitamente pelo mantenedor antes da edição, aplicadas via TDD RED→GREEN (`src/__tests__/catalogIndicativePrices.test.ts`), com snapshot em `src/constants/priceHistory.ts`.

## Desfechos das sete decisões

| Caso | Desfecho | Evidência |
|---|---|---|
| BYD Dolphin Mini GS | Preço **R$ 119.990 confirmado** e `price` marcado como `verified`; imprensa de ago/2026 que citava tabela de R$ 149.990 foi refutada | `byd.com/br/condicoes`, condições válidas 01–31/08/2026 |
| BYD Dolphin Mini GL | Preço corrigido **R$ 118.990 → R$ 109.990**, `price` verificado, snapshot `2026-08` | Mesmo documento oficial ("preço sugerido de R$ 109.990,00 à vista") |
| BYD Yuan Plus (FWD) | **Sem alteração** por decisão do mantenedor; contexto registrado: linha 2027 (abr/2026) passou a ser versão única AWD | Revisitar em triagem futura |
| BYD Yuan Plus AWD | `range_km` corrigido **350 → 378 km** (PBEV/Inmetro); `power` (449 cv), `charging` (11 kW CA / 205 kW CC) e `availability` verificados na página oficial do modelo | `byd.com/br/car/yuan-plus` |
| BYD eT3 | Marcado como **descontinuado**; fora do menu oficial de modelos; FIPE lista apenas ano 2022 | Menu oficial BYD (25/08/2026); `availability` permanece `legacy_unverified`, seguindo o precedente i4 eDrive35/EQE 300 |
| Mercedes-Benz EQB 250+ | Exibição renomeada de "EQB 250" para "**EQB 250+**" (slug `mercedes-benz-eqb-250` preservado); `price`, `power`, `battery` e `charging` verificados; `availability` verificada | Release oficial `imprensa.mercedes-benz.com.br` (190 cv, 70,5 kWh, até 376 km Inmetro, 11/100 kW, R$ 399.900) + página oficial do modelo |
| Hyundai Ioniq 5 | `battery_kwh` corrigido **72,6 → 84 kWh** (convenção do catálogo = capacidade publicada pela montadora) e `battery` verificado; preço corrigido **R$ 394.990 → R$ 409.990** (Signature) com snapshot `2026-08`; `price` segue `legacy_unverified` por falta de URL oficial direta | `hyundai.com.br/veiculos/ioniq-5.html` + catálogo digital oficial (84 kWh, 374 km, 325 cv); preço por convergência independente: coletiva Hyundai no Salão do Automóvel 2025 (via A Tarde), Globo Autoesporte, FIPE zero-KM ago/2026 (R$ 405.656) |
| Chevrolet Equinox EV | **Mantido como à venda** por decisão do mantenedor; comunicado de esgotamento sem previsão de retorno (jul/2026) registrado para reavaliação futura; preço R$ 349.990 coincide com a última tabela conhecida | Comunicado GM à imprensa especializada |

## Achados colaterais registrados (sem alteração)

- Ioniq 5 catalogado com tração `RWD`; catálogo oficial declara AWD HTRAC para a versão 325 cv — tratar no próximo ciclo.
- Texto descritivo do Yuan Plus AWD cita "10–80% em 25 min"; página oficial diz "20% a 80% em 20 minutos".
- Toyota não possui nenhum veículo BEV no catálogo atual; item de fila encerrado como "nada a verificar", salvo inclusão futura.

## Método

1. Pesquisa dirigida nas páginas oficiais por caso, com captura de URL e data;
2. submissão das propostas ao mantenedor e aprovação explícita por valor;
3. teste RED para cada novo valor, edição somente em `src/constants.ts` + histórico;
4. regeneração de `public/data/cars.json` e `public/sitemap.xml`;
5. `npm run test:run` (269/269), TypeScript, build Vite, rotas estáticas, scanner de `dist` e verificador de proveniência aprovados.
