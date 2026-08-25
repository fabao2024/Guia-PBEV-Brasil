# Matriz de proveniência por campo · Bloco 5

Data: 2026-08-25
Referência do ciclo: `docs/CATALOG_REVIEW_HANDOFF.md`
Registro estruturado: `.github/data/catalog-provenance.json` (`schemaVersion: 1`)
Validador: `node .github/scripts/check-catalog-provenance.mjs`

## Objetivo

Substituir registros genéricos `legacy_unverified` por evidência específica por campo, com fonte, data da fonte, data da verificação e URL pública. Este bloco **não autoriza alteração de valores** do catálogo: se a verificação revelar divergência, a divergência é registrada e tratada em decisão própria, seguindo o mesmo fluxo do Bloco 4 (aprovação explícita antes de editar `src/constants.ts`).

## Baseline (2026-08-25)

Cobertura: 5/327 campos verificados (109 veículos × 3 campos rastreados: `price`, `range_km`, `availability`).

Campos já verificados:

| Veículo | Campo | Fonte |
|---|---|---|
| `audi-q6-sportback-e-tron.range_km` | official_regulator | Tabela PBEV 2026_14_AGOd |
| `audi-sq6-sportback-e-tron.range_km` | official_regulator | Tabela PBEV 2026_14_AGOd |
| `bmw-i7-xdrive60.price` | official_manufacturer | bmw.com.br (verificação do Bloco 4) |
| `jac-e-j7.range_km` | official_regulator | Tabela PBEV 2026_14_AGOd |
| `volvo-ex30-ultra.range_km` | official_regulator | Tabela PBEV 2026_14_AGOd |

## Matriz por campo

| Campo catálogo | Fonte primária | Fallback aceito | Rótulo obrigatório | Validade prática |
|---|---|---|---|---|
| `price` | Tabela de preços oficial da montadora no site brasileiro | Nota oficial/press release da montadora com preço de tabela | Preço indicativo 0 km, não FIPE, não usado | Mensal |
| `range_km` | Autonomia elétrica homologada na tabela PBEV/Inmetro vigente | Página oficial da montadora com ciclo declarado (WLTP) | Ciclo de medição (PBEV ou WLTP) | Enquanto a tabela citada vigorar |
| `consumption` | Consumo homologado na tabela PBEV/Inmetro vigente (MJ/km) | — | Unidade (MJ/km) | Enquanto a tabela citada vigorar |
| `power` | Página técnica oficial da montadora (potência combinada/sistema) | Press release oficial da montadora | cv/kW e regime combinado | Até face-lift/nova geração |
| `battery` | Página técnica oficial da montadora | Press release oficial | Capacidade bruta vs útil, quando distintos | Até face-lift/nova geração |
| `charging` | Página técnica oficial da montadora (CA e CC máximas) | Press release oficial | Potência CA (kW) e CC (kW), faixa 10–80% quando divulgada | Até face-lift/nova geração |
| `availability` | Configurador/site oficial (à venda) ou anúncio oficial de descontinuação | Press release oficial | Status: à venda / descontinuado | Mensal |

## Regras de aceite

1. Só contam como `verified` fontes dos níveis `official_manufacturer`, `official_regulator` e `official_press_release` (lista `fieldVerificationSources` do registro).
2. `specialist_media` e `speculative_watchlist` nunca verificam campo; no máximo alimentam watchlist.
3. Todo registro `verified` exige: `sourceUrl` HTTPS, `sourceUpdatedAt` (AAAA-MM-DD) e `verifiedAt`.
4. Ausência de fonte verificável mantém o campo como `legacy_unverified`. Nunca transformar ausência de fonte em estimativa.
5. Divergência entre catálogo e fonte é registrada no relatório do lote, não corrigida automaticamente.
6. Modelos fora da tabela PBEV vigente não recebem `range_km`/`consumption` homologados por inferência.
7. Preservar cronologia: novos snapshots vão ao fim (`src/constants/priceHistory.ts`); fontes anteriores não são reescritas.

## Plano de execução em lotes

Verificação por marca, um lote por commit, sempre com relatório de lote em `.github/data/`:

1. **Lote piloto** — validar o processo ponta a ponta com uma marca pequena (ex.: Volvo).
2. **Lotes PBEV primeiro** — `range_km` + `consumption` para todos os veículos com homologação na tabela vigente, pois têm fonte única coletiva (uma leitura da tabela verifica muitos veículos de marcas diferentes).
3. **Lotes por marca** — `price`, `power`, `battery`, `charging` nas páginas oficiais de cada montadora, marca por marca.
4. **`availability` por último** — depende de varredura de configuradores e anúncios de descontinuação, mais volátil.

Ordem sugerida das marcas (maior presença no catálogo primeiro): BYD, BMW, Chevrolet, Hyundai, Mercedes-Benz, Volvo, GAC, Kia, Audi, demais.

## Extensão de esquema proposta

Hoje o registro rastreia 3 campos. Para cobrir o escopo deste bloco, estender `FIELDS` em `check-catalog-provenance.mjs` para 7 campos (`price`, `range_km`, `consumption`, `power`, `battery`, `charging`, `availability`) e rodar `--bootstrap` uma vez para criar as entradas novas como `legacy_unverified`. Cobertura esperada passa de 327 para 763 campos. Sem mudança de `schemaVersion` enquanto nenhum campo existir com semântica alterada.

## Critério de conclusão do bloco

- Cobertura `verified` publicada e auditável por campo, sem orfãos nem veículos ausentes;
- relatório de cada lote com fontes arquivadas por veículo;
- divergências encontradas listadas com decisão pendente ou resolvida via fluxo aprovado;
- `npm run test:run`, `npm run build`, scanner de `dist` e verificador de proveniência passando.
