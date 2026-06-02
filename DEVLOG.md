# DEVLOG — Guia PBEV Brasil

> Log operacional por item de sprint. Append-only — cada entrada registra o ciclo completo: Dev → Build → Teste → Commit.
> Para o roadmap estratégico (sprints, backlog, monetização), ver `ROADMAP.md`.

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Etapa concluída sem problemas |
| ⚠️ | Concluída com ressalvas (ver Notas) |
| ❌ | Etapa falhou (ver Notas) |
| — | Não aplicável |

---

## Notas de Pesquisa — Sprint 4 (Monetização)

### Análise de seguradoras para afiliado de seguro EV · 21/03/2026

Pesquisa realizada sobre programas de afiliados das seguradoras citadas no ROADMAP Sprint 4:

| Seguradora | Programa | Aceita site sem SUSEP | Status |
|---|---|---|---|
| Porto Seguro | Corretor oficial (nacional) | ❌ Exige SUSEP | Descartada |
| Porto Seguro | Rede Tonziro (regional Bahia) | ⚠️ Aparentemente sim | Regional — não oficial |
| Tokio Marine | Apenas corretor SUSEP | ❌ Exige SUSEP | Descartada |
| Bradesco Seguros | Programa Recompensa / Lomadee | ❌ Lomadee pausado; Recompensa exige R$15k/mês + SUSEP | Descartada |
| Minuto Seguros / Youse | Corretoras digitais intermediárias | ⚠️ Programas Lomadee inativados | Monitorar reativação |

**Conclusão:** Trendseg permanece como único afiliado viável identificado. Porto Seguro, Tokio Marine e Bradesco exigem habilitação SUSEP de corretor — inviável para operação atual. Reavaliar Minuto Seguros/Youse se reativarem programas em plataformas de afiliados.

---

## Sprint 5 — TCO Calculator · 14–15/03/2026

### [S5-A] TCO 4 anos com depreciação, seguro e manutenção

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `src/utils/tco.ts`: `calcTCO()` com depreciação linear, seguro sobre valor depreciado, manutenção por km, toggle gasolina/etanol (ETHANOL_FACTOR = 1.30) |
| Build  | ✅ | `npm run build` — sem erros |
| Testes | ✅ | Testes unitários de `calcTCO` passando; 70/70 suite completa |
| Commit | ✅ | `36650e5` `9766df2` |

**Notas:** fix de loop `year → y` necessário logo após o commit principal (`9766df2`).

---

### [S5-B] Tarifas ANP/ANEEL por estado + UX do simulador

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `fuelPricesByState.ts` + `electricityPricesByState.ts`; sliders auto-preenchidos por estado; badge muda cor gasolina/etanol; custo/km por modelo |
| Build  | ✅ | `npm run build` — sem erros |
| Testes | ✅ | Testes manuais — troca de estado e tipo de combustível verificados |
| Commit | ✅ | `6358ee4` |

---

## Sprint 6 — Mobile UX & PWA · 16/03/2026

### [S6-PWA] manifest.json + ícone SVG

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `public/manifest.json`, `public/icon.svg`, meta tags iOS em `index.html` |
| Build  | ✅ | `npm run build` |
| Testes | ⚠️ | Testado apenas em Chrome DevTools "installable" check; iOS não testado |
| Commit | ✅ | `efa0f64` |

---

### [S6-UX1] Mobile touch targets, botão Site Oficial, preço no card

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | Touch targets 36×36px, `<a href>` no CTA, preço reposicionado, ExternalLink removido, texto oculto em mobile |
| Build  | ✅ | `npm run build` |
| Testes | ✅ | Verificado em viewport 390px (iPhone 14) via DevTools |
| Commit | ✅ | `deeafec` `8680d4a` `cd8fed5` `ec29b82` |

---

### [S6-UX2] Sticky bar, sliders mobile (−/+), seletor de estado no topo

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | Barra sticky com fundo sólido; sliders `hidden md:block`, botões `md:hidden`; state selector movido para primeiro slot |
| Build  | ✅ | `npm run build` |
| Testes | ✅ | Rolagem do simulador testada em mobile — sem alteração acidental de valores |
| Commit | ✅ | `3a5e14c` `7633dfc` `20155d2` `2dc70ab` |

---

### [S6-UX3] Fix overlay modais, título simulador, UX copy (3 grupos)

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `absolute` → `fixed` em todos os modais; novos títulos/labels; badge "Maior Economia"; tooltips FWD/RWD/AWD e bateria kWh |
| Build  | ✅ | `npm run build` |
| Testes | ✅ | Scroll atrás do modal testado; i18n PT+EN verificado |
| Commit | ✅ | `86b301d` `03e5159` `a23b17a` `21d99be` `e4807b5` |

---

### [S6-AI] Chat IA: dados por estado + retry exponencial

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | Injeção ANP/ANEEL/IPVA no system prompt; retry 1s/2s/4s em 503/429 |
| Build  | ✅ | `npm run build` |
| Testes | ⚠️ | Testado manualmente com chave Gemini; sem testes automatizados para o chatbot |
| Commit | ✅ | `82d6276` `ec5e39f` |

---

## Sprint 6.1 — Simulador: consumo personalizado + contexto de seleção · 17/03/2026

### [S6.1-A] Consumo customizável (Opção B) + initialCars + lastViewedCar

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | Sliders `customEvKwh`/`customCombKmL` no painel compartilhado (1 carro); `lastViewedCar` em App.tsx; `initialCars` prop; `useEffect` forçando 3 carros removido |
| Build  | ✅ | `npm run build` |
| Testes | ✅ | Fluxo compareList → lastViewed → fallback CAR_DB[0] verificado manualmente |
| Commit | ✅ | `b0a96ed` (agrupado com S6.2-A) |

**Notas:** Opção B foi superseded pela Opção C no mesmo sprint (S6.2-A). Código B permanece como fallback de aviso multi-veículo.

---

## Sprint 6.2 — Simulador: transparência metodológica + consumo per-car · 17/03/2026

### [S6.2-A] Badge row + colapsável metodológico + Opção C (⚙ por card)

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | Badge row dinâmico por tab; colapsável "Como este cálculo funciona"; IIFE por card com sliders + step buttons + indicador azul; estado migrado para arrays `(number\|null)[]` |
| Build  | ✅ | `npm run build` — sem erros |
| Testes | ⚠️ | Testes manuais OK; erro TS `idx not defined` em `handleExportTCO` descoberto só na sessão seguinte (ver S6.2-FIX) |
| Commit | ✅ | `b0a96ed` |

---

### [S6.2-B] Aviso de customização ativa no colapsável

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | Bloco azul no colapsável listando carros com consumo customizado |
| Build  | ✅ | `npm run build` |
| Testes | ✅ | Testado com 1 e 3 carros customizados simultaneamente |
| Commit | ✅ | `d793875` |

---

### [S6.2-C] Aviso de preço ajustado (⚠ ANP/ANEEL) no colapsável

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | IIFE substituiu bloco estático em 2 ocorrências (`replace_all: true`); `⚠ usando R$ X,XX /L (ajustado)` em amarelo quando slider ≠ referência por estado |
| Build  | ✅ | `npm run build` |
| Testes | ✅ | Alteração do slider verificada; troca de estado com auto-preenchimento verificada |
| Commit | ✅ | `dac325e` |

---

### [S6.2-FIX] Fix `idx not defined` em handleExportTCO

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `forEach(car =>` trocado para `forEach((car, carI) =>` com `origIdx = selectedCars.indexOf(car)` para mapear slot correto |
| Build  | ✅ | `npm run build` — erro TS eliminado |
| Testes | ✅ | `npx tsc --noEmit` sem erros no arquivo |
| Commit | ✅ | `a336b34` |

**Notas:** Este erro impedia o HMR do Vite de recarregar o módulo, fazendo os controles ⚙ não aparecerem no browser mesmo com o código presente no arquivo.

---

## Sprint 7 — Community & Monetização · 19/03/2026

### [S7-A] Sugerir EV via GitHub Issues · 19/03/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | Template `.github/ISSUE_TEMPLATE/sugestao-ev.yml` com campos obrigatórios (marca, modelo, preço, autonomia, categoria, fonte) + observações opcional. Botão header migrado de modal local para `<a>` externo apontando para `issues/new?template=sugestao-ev.yml`. Ícone `Plus` → `Lightbulb`. Removido código morto: `AddVehicleModal`, `SuccessModal`, `userCars`, `handleAddCar`. |
| Build  | ✅ | `npm run build` — 6.24s, sem erros |
| Testes | ✅ | 76/76 passando |
| Commit | ✅ | `496a97c` |

**Notas:** Decisão arquitetural — contribuições de usuários passam pelo crivo do mantenedor via issue; só entram no catálogo oficial após validação e execução da skill `/add-vehicle`.

---

### [S7-A3] Botão Sugerir EV → roteamento GitHub vs Consultor IA · 20/03/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | Botão `<a>` do header convertido para `<button>` + dropdown com 2 opções: "Tenho conta no GitHub" (abre Issues) e "Não tenho — usar o Consultor IA" (abre chat e dispara chip automaticamente). `ChatWidget` recebeu props `triggerSuggest` e `onTriggerSuggestHandled`. `useEffect` no widget abre o chat e envia `t('chat.chipSuggestEVMsg')` via `handleChipClick` com delay 600ms (aguarda session init). Novas chaves i18n `addVehicle.menuPrompt/menuGithub/menuChat` em PT-BR e EN. |
| Build  | ✅ | `npm run build` — 6.35s, sem erros |
| Testes | ✅ | 76/76 passando |
| Commit | ✅ | `0240b8b` |

---

### [S7-A2] Fluxo de sugestão de EV via Consultor IA · 20/03/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | Chip `💡 Sugerir um EV` adicionado aos chips iniciais (PT-BR + EN). System prompt expandido com regras 14/15: fluxo conversacional de coleta (marca, modelo, preço, autonomia, categoria, fonte, observações). Guard rails: verificação de duplicata no catálogo, limites de preço (R$30k–5M) e autonomia (50–2000 km), rejeição de HTML/injeção. Marcador `SUGGEST_EV_READY` detectado no cliente, sanitizado e convertido em URL pré-preenchida do GitHub Issues. Botão "Enviar sugestão no GitHub" (verde-esmeralda) aparece após confirmação. Reset do `suggestData` em todos os pontos de reset do chat. |
| Build  | ✅ | `npm run build` — sem erros |
| Testes | ✅ | 76/76 passando |
| Commit | ✅ | `ecf2133` |

**Notas:** Complemento ao S7-A (botão de issue no header). O fluxo guiado pelo chat reduz fricção para usuários que não sabem como preencher uma issue manualmente.

---

### [S7-B] Suzuki e-Vitara adicionado ao catálogo · 19/03/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | Nova entrada `Suzuki e-Vitara` em `CAR_DB` (SUV AWD, 184 cv / 31,2 kgfm, 61 kWh, 293 km PBEV, R$ 269.990). `BRAND_URLS` + nova marca Suzuki (`suzukiveiculos.com.br`). README atualizado: 87 veículos, 27 marcas. Imagem local `e-vitara.jpg`. |
| Build  | ✅ | `npm run build` — sem erros |
| Testes | ✅ | Veículo visível no catálogo; filtros SUV e AWD funcionando |
| Commit | ✅ | `66b9c90` |

**Notas:** Primeira entrada da marca Suzuki no catálogo. Adicionado via issue #2 da comunidade.

---

### [S7-C] BYD Dolphin Mini GL adicionado ao catálogo · 20/03/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | Nova entrada `BYD Dolphin Mini GL` em `CAR_DB` (Urbano FWD, 75 cv / 13,8 kgfm, LFP 30,08 kWh, 224 km PBEV, R$ 118.990). Imagem via CDN BYD Brasil (`byd-dolphin-mini-gl.jpg`). README atualizado: 88 veículos, 27 marcas. Fix subsequente adicionou `power` e `torque` ausentes no commit inicial. |
| Build  | ✅ | `npm run build` — sem erros |
| Testes | ✅ | Veículo visível; filtros Urbano e FWD funcionando |
| Commit | ✅ | `f2e780c` + `b871050` (fix potência/torque) |

**Notas:** Adicionado via issue #3 da comunidade. Fix de potência/torque necessário pois campos foram omitidos no commit inicial.

---

### [S7-D] fix(tco): IPVA combustão — alíquota real por estado · 24/03/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | Substituído `STANDARD_COMBUSTION_IPVA_RATE` (SP 4% fixo) por `ipvaStateInfo.standardRate` em 3 locais: `tco.ts` (ipvaComb), `SavingsSimulatorModal.tsx` (annualIpvaCombustion), `CarDetailsModal.tsx` (combustionIpva). Corrigidas 11 alíquotas `standardRate` em `ipvaByState.ts`: AC 3→2%, BA 3→2,5%, ES 4→2%, GO 3→3,75%, MS 3,5→3%, PA 3→2,5%, PB 3→2,5%, PE 3→2,4%, PR 3,5→1,9%, SC 3→2%, TO 3→2%. |
| Build  | ✅ | `npm run build` — sem erros |
| Testes | ✅ | 76 testes passando |
| Commit | ✅ | `6875100` |

**Notas:** Maior erro encontrado: ES tinha 4% (= SP) mas real é 2% — 2pp de diferença. PR alinhado a 1,9% (sem benefício EV em 2026 — bevRate = standardRate). Bug existia desde a implementação inicial do TCO; afetava qualquer estado diferente de SP.

---

### [S7-E] feat(tco): análise patrimonial de revenda · 24/03/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `TCOResult` ganha `residualValueEV` (62% do preço), `residualValueComb` (72%) e `netAdvantageEV` (economia operacional − perda extra de depreciação). `SavingsSimulatorModal`: segunda linha de tiles com residual EV (azul), residual combustão (cinza) e resultado líquido total (verde/amarelo/vermelho). Tooltip ⓘ com metodologia. i18n PT-BR e EN atualizados. |
| Build  | ✅ | `npm run build` — sem erros |
| Testes | ✅ | 76 testes passando |
| Commit | ✅ | `ba70928` |

**Notas:** netAdvantageEV positivo = EV vence mesmo incluindo depreciação mais rápida. Tile muda de cor dinamicamente: verde (EV vence), amarelo (margem < R$5k), vermelho (combustão vence no total). Limiar de -5000 escolhido para evitar vermelho em empates técnicos.

---

### [S7-F] feat: histórico de preços + badges de variação · 25/03/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `src/constants/priceHistory.ts`: snapshot 2026-03 com 88 veículos. `getPriceDelta()` / `getLastSnapshot()` utilitários. Badge ↓/↑ em `CarCard` (inline ao preço) e `CarDetailsModal` (tile de preço com tooltip de data). Nenhum badge exibido agora (preços coincidem com snapshot) — badges aparecerão quando preços mudarem. |
| Build  | ✅ | `npm run build` — sem erros |
| Testes | ✅ | 76 testes passando |
| Commit | ✅ | `8424d3b` |

**Notas:** Para registrar novo snapshot: adicionar `{ date: 'YYYY-MM', price: NNN }` ao array do modelo em `priceHistory.ts`. Apenas os carros com mudança de preço precisam de nova entrada. Badge verde = queda, laranja = alta.

---

### [S7-G] fix(tco): layout mobile, moeda única, nota IPVA dinâmica · 25/03/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | Tiles row 1: `grid-cols-2 sm:grid-cols-4` (sem flex-wrap). Tiles row 2 (residual): `grid-cols-2 sm:grid-cols-3` com `col-span-2 sm:col-span-1` no tile líquido. Removido toggle R$/USD (`currency` state, `currencySymbol`, `handleCurrencyChange`). `fmtBRL` removido; valores de tiles e tabela usam `fmtNum` (sem R$), labels fornecem contexto. Nota IPVA no colapsável agora dinâmica: exibe alíquotas reais do estado selecionado (EV isento vs % + combustão %). |
| Build  | ✅ | `npm run build` — sem erros |
| Testes | ✅ | 76 testes passando |
| Commit | ✅ | `47ad605` `029d28e` `f448a77` |

**Notas:** Toggle de moeda removido porque a taxa de câmbio hardcoded era imprecisa e o público-alvo é 100% brasileiro. Nota IPVA era hardcoded "SP 4%" mesmo após a implementação multi-estado.

---

### [S7-H] feat(ci): automação mensal — ANP + PBEV + lembrete · 25/03/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `.github/scripts/update-anp-prices.mjs`: busca CSV ANP no dados.gov.br, calcula médias gasolina/etanol por estado, atualiza `fuelPricesByState.ts` e abre PR se valores mudarem (threshold 0,01 R$/L). `.github/scripts/check-pbev-update.mjs`: scraping de 3 URLs do INMETRO/PBEV, detecta versão mais nova que `PBEV 2026_27_FEV-REV05` e abre issue com instruções pdfplumber. `.github/workflows/monthly-maintenance.yml` atualizado: 3 jobs (`update-fuel-prices`, `check-pbev`, `create-maintenance-issue`), `continue-on-error` nos jobs de dados. Workflow de lembrete anterior (`0c1d8a8`) integrado ao mesmo fluxo. |
| Build  | ✅ | Node.js scripts — sem compilação necessária |
| Testes | — | Scripts testados localmente; CI rodará no dia 1 de cada mês |
| Commit | ✅ | `0c1d8a8` `10ba38b` |

**Notas:** `update-anp-prices.mjs` usa exit 1 (bloqueia job, marcado `continue-on-error`). `check-pbev-update.mjs` usa exit 0 (não crítico — sites de governo instáveis). PR de preços ANP sempre passa por revisão humana antes do merge.

---

### [S7-I] feat(comparison): recomendação inteligente de 3º carro · 25/03/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `getRecommendations()` em `ComparisonModal.tsx`: score ponderado (preço 50%, autonomia 30%, categoria 15%) sobre todo o `CAR_DB`. Com 2 carros na comparação, o slot vazio exibe o melhor candidato com badge "Sugestão", botão ↻ (percorre top 5) e botão "+ Adicionar à comparação". Com 1 carro mantém placeholder genérico. Novas props `allCars` e `onAdd` em `ComparisonModalProps`. i18n PT-BR e EN atualizados. |
| Build  | ✅ | `npm run build` — sem erros |
| Testes | ✅ | 76/76 passando |
| Commit | ✅ | `a94229c` |

**Notas:** Score favorece carros no ponto médio entre os dois comparados — útil para indecisos. Botão ↻ cicla entre as 5 sugestões em loop. Nenhum dado de uso coletado; recomendação é puramente determinística (sem ML).

---

## Sprint 8 — SEO A1 · 26/03/2026

### [S8-A] feat(seo): meta tags dinâmicas, JSON-LD enriquecido, sitemap · 26/03/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `index.html`: domínio `guiapbev.cloud`, contagem 86→88, `<link rel="canonical">`. `react-helmet-async` instalado: `<Helmet>` em `App.tsx` atualiza `<title>`, description e OG/Twitter quando carro está aberto no modal — melhora compartilhamento social. JSON-LD `ItemList` enriquecido: cada `ListItem` expõe `Product` com `brand`, `offers.price`, `priceCurrency`. `public/sitemap.xml` (URL canônica) e `public/robots.txt` criados. Item 11 (Analytics) marcado ✅ — Plausible já estava implementado desde S6. |
| Build  | ✅ | `npm run build` — sem erros |
| Testes | ✅ | 76/76 passando |
| Commit | ✅ | `872f37d` |

**Notas:** SEO A2 (rotas individuais por carro com `react-router-dom` + `vite-plugin-prerender`) fica como sprint futura — alto impacto mas requer refatoração estrutural. A1 já melhora rich snippets, compartilhamento social e sinaliza ao Google a estrutura do catálogo via dados estruturados.

---

### [S8-C] fix(tco): custos de manutenção calibrados com dados reais BR 2025 · 27/03/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `tco.ts`: valores EV reduzidos 30–36% (Urbano 900→600, Compacto 1100→700, SUV 1800→1200, Sedan 1400→900, Luxo 3500→2800, Comercial 2500→2000). Combustão ajustada onde necessário (Urbano 1800→1400, Compacto 2200→1500, SUV 3200→2800, Luxo 5000→5500, Comercial 4000→4500). Disclaimer TCO expandido com exemplos por categoria e fonte. `maintNote` i18n PT-BR e EN atualizados. |
| Build  | ✅ | `npm run build` — sem erros |
| Testes | ✅ | 76/76 passando |
| Commit | ✅ | `60f58a8` |

**Notas:** Pesquisa baseada em planos oficiais BYD Brasil (Dolphin Mini, Dolphin, Seal, Song Plus EV), Volvo EX40 e dados de combustão (VW Polo, Jeep Compass, Mercedes Classe C/GLC). Intervalos mantidos (EV 20.000 km / Comb 10.000 km). Ratios EV vs. combustão continuam no intervalo 30–50% conforme literatura de mercado.

---

### [S8-D] feat(ux): barra de filtros ativos com chips + Limpar tudo · 27/03/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | Barra aparece abaixo da busca quando qualquer filtro está ativo (`hasActiveFilters`). Chips: marcas (azul), categorias, preço máximo, autonomia mínima, novidades, query de busca. Botão "Limpar tudo" (vermelho) chama `handleResetFilters`. i18n PT-BR e EN com 5 novas chaves em `filterMobile`. |
| Build  | ✅ | `npm run build` — sem erros |
| Testes | ✅ | 76/76 passando |
| Commit | ✅ | `f13e260` |

---

### [S8-E] fix(search): Fuse.js threshold 0.35→0.2, filtro por score · 27/03/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `threshold` reduzido de 0.35 para 0.2 em `useSearch.ts`. Adicionado `.filter(r => r.score < 0.2)` explícito nos resultados. Corrige falsos positivos — ex.: "ORA" retornava 21 resultados por subsequência fuzzy em vez dos GWM Ora. |
| Build  | ✅ | `npm run build` — sem erros |
| Testes | ✅ | 76/76 passando |
| Commit | ✅ | `a236311` |

---

### [S8-B] fix(i18n): aba "Economia Mensal" → "Economia Mensal/Anual" · 27/03/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `savingsTab` em `pt-BR.json` e `en.json` atualizados |
| Build  | ✅ | `npm run build` — sem erros |
| Testes | ✅ | 76/76 passando |
| Commit | ✅ | `26ce60d` |

---

### [S8-F] feat(data+ui): garantia e carregamento AC/DC nos detalhes do veículo · 27/03/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `types.ts`: 4 campos opcionais adicionados (`warrantyYears`, `warrantyBatteryYears`, `chargeAC`, `chargeDC`). `constants.ts`: todos 88 veículos populados via script `add_warranty_charging.cjs` (dados por marca: BYD 5+8a, BMW 5+8a, Mercedes 3+10a, Kia/MG 7+7a etc.; velocidades extraídas das features strings). `CarDetailsModal.tsx`: novo bloco "Garantia / Carregamento" após tile de bateria — garantia do veículo + bateria em anos; AC kW (branco) + DC kW (cyan). i18n: 6 novas chaves em `details.*` em pt-BR e en. |
| Build  | ✅ | `npm run build` — 76/76 testes passando |
| Testes | ✅ | 76/76 passando |
| Commit | ✅ | `483b719` |

**Notas:** Dados de garantia baseados em políticas oficiais por marca no Brasil. Dados de carga AC/DC extraídos das features strings já existentes em `CAR_DB`. DC em cyan (#00b4ff) para destaque visual na velocidade de recarga rápida.

---

### [S8-G] feat(ui): tempo estimado de carregamento no modal de detalhes · 27/03/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `calcChargeTime()` em `CarDetailsModal.tsx`: AC 0→100% = `bateria/kW/0.88`; DC 10→80% = `bateria×0.7/kW/0.65×60min`. Tile "Carregamento" reformulado: AC e DC em linhas separadas, tempo estimado à direita (AC branco, DC cyan). Nota disclaimer "AC 0→100% · DC 10→80% (estimativa)" em 9px. i18n: 2 novas chaves em PT-BR e EN. |
| Build  | ✅ | `npm run build` — sem erros |
| Testes | ✅ | 76/76 passando |
| Commit | ✅ | `5c314ca` |

**Notas:** Fórmula validada: BMW iX3 ~7h30/~32min (oficial 7.5h/34min ✓), Ioniq 5 ~20min (oficial 18min ✓), Megane E-Tech ~3h/~30min (oficial 3h/34min ✓). Fator 0.65 de potência média DC considera curva de taper do BMS acima de 60% SOC em sistemas 400V; carros 800V (Taycan, Macan, EV9) terão estimativa um pouco conservadora.

---

## Sprint 9 — Infraestrutura de Recarga · 01/04/2026

### [S9-ABC] feat(sprint9): filtro DC + dados ANEEL + mapa Leaflet · 01/04/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | **S9-A** — `fastChargeOnly: boolean` adicionado a `FilterState` (types.ts), `useCarFilter` e `Sidebar` (toggle ⚡ Recarga Rápida DC); filtro `car.chargeDC != null` em App.tsx; chip na barra de filtros ativos; traduções PT/EN. **S9-B** — `src/data/eletropostos.ts`: snapshot ANEEL dadosabertos.gov.br mar/2026, 27 estados com total AC+DC e contagem DC, centroides geográficos, totalizadores Brasil. **S9-C** — `ChargingMapModal.tsx`: react-leaflet instalado (leaflet + react-leaflet + @types/leaflet); tiles CartoDB Dark Matter; `CircleMarker` por estado com raio/opacidade proporcionais ao volume; popup com contagem DC; label UF via `divIcon`; barra de stats (total e DC Brasil); botão "Mapa EV" no header desktop; CSS Leaflet via `@import "leaflet/dist/leaflet.css"` em index.css. |
| Build  | ✅ | `npm run build` — 14.4s, sem erros TypeScript; chunk size warning benigno (Leaflet ~150kB split separado) |
| Testes | ✅ | 76 testes passando (8 suites) |
| Commit | ✅ | `cf773f9` |

**Notas:** Dados ANEEL são snapshot estático (não chamada API em runtime) para evitar CORS e dependência de disponibilidade do portal. Ícone default do Leaflet corrigido via `L.Icon.Default.mergeOptions` (Vite quebra `_getIconUrl`). Mapa abre apenas no desktop via botão no header.

---

### [S8-H] feat(seo): SEO A2 — rotas individuais por veículo · 31/03/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `react-router-dom` v7.13.2 instalado. `src/utils/slug.ts`: `toSlug()` (normaliza acentos, espaços → hífens), `findCarBySlug()`, `getCarUrl()`. `src/pages/CarDetailPage.tsx`: página completa `/carro/:slug` com hero (imagem + range bar + preço + delta histórico), specs grid, garantia/carregamento, PBE, IPVA interativo por estado, features list, CTAs marca + seguro, SEO full (Helmet title/desc/OG/twitter, JSON-LD Product, canonical). `public/404.html`: redirect hack GitHub Pages SPA (encode `/?/path`). `src/index.tsx`: `BrowserRouter` + decode do redirect; fix double-slash (`'/' + decoded` → `decoded`). `src/App.tsx`: `<Routes>` com `/carro/:slug` → `CarDetailPage` e `*` → catálogo. |
| Build  | ✅ | `npm run build` — sem erros TypeScript |
| Testes | ✅ | Build limpo; fluxo manual: `/carro/byd-seal` resolve corretamente |
| Commit | ✅ | `12d0b68` |

**Notas:** `vite.config.ts` já usava `base: '/'` (domínio customizado `guiapbev.cloud`), então `BrowserRouter` sem `basename` está correto. `CarDetailPage` reutiliza `calcChargeTime`, `IPVA_BY_STATE`, `getPriceDelta`, `track` e demais utilitários já existentes — sem duplicação. Próximo passo natural: gerar sitemap dinâmico com todas as URLs `/carro/:slug` para acelerar indexação.

---

### [S9-FIX] fix(map): race condition + expansão dataset 159 estações · 01/04/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | **Race condition**: `mapReady: boolean` state adicionado a `ChargingMapModal`; `setMapReady(true)` chamado após `mapInstanceRef.current = map` dentro do `import('leaflet').then()`; guard `if (!mapReady \|\| !map) return` no segundo useEffect; `mapReady` adicionado às dependências do efeito de marcadores — marcadores agora aparecem ao primeiro abrir o mapa. **Dataset**: `eletropostosData.ts` expandido de 97 → 159 estações; 7 novos operadores (BMW Charging, Mercedes EQ, CPFL Energia, Neoenergia, Copel EV, ChargeHouse, Porsche); cobertura estendida a todos os 27 estados e corredores das rodovias Bandeirantes, Anhanguera, Fernão Dias, Dutra, Régis Bittencourt, Castelo Branco e BR-101. |
| Build  | ✅ | `npm run build` — 12.3s, sem erros TypeScript |
| Testes | ✅ | Build limpo; mapa abre com todos os marcadores visíveis imediatamente |
| Commit | ✅ | `f7dc248` |

**Notas:** A causa raiz era `import('leaflet')` ser assíncrono — o segundo useEffect disparava antes de `mapInstanceRef.current` ser populado, retornava cedo e nunca adicionava os marcadores. O `mapReady` flag garante que o efeito de marcadores re-execute exatamente uma vez após o mapa estar pronto.

---

### [S11-E] feat(planner): tempo de recarga por parada + timeout ORS · 22/04/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `calcStopChargeMinutes()`: helper puro que calcula tempo de carga da parada com melhor carregador disponível vs. limite DC do carro. Header de cada `ChargingStopCard` exibe "⚡ ~X min". `RouteStats`: novo stat "Recarga total" (soma de todas as paradas); "Tempo est." → "Condução". `orsService`: AbortController 15s — resolve spinner infinito quando ORS não responde. `useORSRoute`: rate limit 20 → 40 req/hora (ORS free tier real = 500/dia) |
| Build  | ✅ | `npm run build` — sem erros TS, 106 testes passando |
| Testes | ✅ | Testado manualmente; rota SP→RJ exibindo tempo de carga por parada |
| Commit | ✅ | `c92cc20` |

---

## Sprint 11 — EV Route Planner · 17/04/2026

### [S11-A] feat(route-planner): planejador de rota EV completo · 17/04/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | Novos arquivos: `types/routePlanner.ts`, `utils/routeGeometry.ts`, `services/{nominatim,ors,ocm}Service.ts`, `hooks/{useNominatimAutocomplete,useORSRoute,useRoutePlanner}.ts`, `components/RoutePlannerModal.tsx`. Algoritmo guloso: projeta eletropostos na polyline ORS → para no mais distante alcançável (elimina paradas sem carregador). Condições de viagem (temp × relevo × condução). Bidirecional mapa↔painel. Tempo/kWh por parada. Status via OCM. |
| Build  | ✅ | `npm run build` — sem erros TS, 106 testes passando |
| Testes | ✅ | 30 testes em `routeGeometry.test.ts` (haversine, segmentação, projeção, guloso, gaps de cobertura); testado manualmente rota SP→RJ e SP→BH |
| Commit | ✅ | `45c7d35` |

**Notas:** Algoritmo antigo colocava paradas em pontos matemáticos arbitrários → muitos "Nenhum eletroposto DC". Novo algoritmo projeta os 159 eletropostos do dataset sobre a polyline e usa greedy furthest-reachable — paradas sempre em eletropostos reais. Gaps reais de cobertura (interior do nordeste, trechos isolados) ainda aparecem com aviso honesto. `gmapsUrl` corrigida para formato `?q=loc:lat,lng` (pin exato).

---

### [S11-B] feat(route-planner): marcadores numerados no mapa · 19/04/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | Marcadores numerados (1, 2, 3…) para cada parada no mapa — identifica visualmente a sequência da rota |
| Build  | ✅ | `npm run build` — sem erros TS |
| Testes | ✅ | Testado manualmente |
| Commit | ✅ | `c6f4a58` |

---

### [S11-C] feat(planner): kWh/100km exibido e editável · 19/04/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | kWh/100km do veículo exibido no painel e editável pelo usuário; fator 0.93 (usável vs. bruto); alterar o consumo reseta `customRangeKm`; kWh de chegada calculado por trecho real (não % global fixo) |
| Build  | ✅ | `npm run build` — sem erros TS |
| Testes | ✅ | Testado manualmente SP→RJ com consumos ajustados |
| Commit | ✅ | `508be7f` |

---

### [S11-D] feat(planner): melhorias UX — display de paradas, mobile, cidades · 20/04/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | Display de paradas simplificado ("Chega X% · Y kWh · Sai Z%"); scroll mobile corrigido (body como coluna única, botão Calcular sempre acessível); botão Mapa EV removido do menu mobile; seletor de cidades com 27 estados + ~120 municípios, match por nome/sigla/parcial, agrupado por UF |
| Build  | ✅ | `npm run build` — sem erros TS |
| Testes | ✅ | Testado em viewport 375px; seletor de cidades validado com "SP", "São Paulo", "Rio" |
| Commit | ✅ | `a571aea` |

---

### [S11-F] feat(planner): calcMinDepartSOC — recarga mínima necessária por trecho · 23/04/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `calcMinDepartSOC()`: SoC mínimo de saída baseado no próximo trecho — elimina recargas absurdas ("8 min") quando veículo já tem carga suficiente. Paradas onde chegada ≥ mínimo exibem "sem recarga necessária" em cinza. `totalChargeMin` ignora essas paradas. `stop.position` = ponto da polilinha (marcador na rota, não no eletroposto). Score do algoritmo guloso: `routeDistKm − lateralDistKm × 2`. |
| Build  | ✅ | `npm run build` — sem erros TS, 106 testes passando |
| Testes | ✅ | Rota SP→RJ testada: paradas com bateria suficiente exibem estado muted; total de recarga corrigido |
| Commit | ✅ | `fe0e7f9` |

**Notas:** O problema raiz era `departurePct = departPct` (80%) fixo para toda parada. A nova lógica calcula `min(departPct, arrivePct + nextKm × consumptionRatePerKm)`, carregando apenas o necessário.

---

### [S11-G] feat(planner): fontes externas — OCM discovery + OSM/Overpass · 23/04/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `fetchDcChargers` (OCM, `compact=false`): descobre eletropostos DC na bbox da rota; IDs +100.000. `fetchOsmChargers` (Overpass, gratuito sem chave): filtra `socket:ccs2/chademo/tesla_supercharger/gb_t`; IDs +200.000; timeout 15s; falha silenciosa. `mergeChargerSources`: deduplicação por proximidade 200m. Threshold DC: 50 kW → 30 kW. Cache `_ocmPoiCache`: populado em `fetchDcChargers`, consumido sincronamente por `matchStatusFromOcmCache` no modal — elimina segunda chamada OCM (resolvia erros 403). OCM + OSM em `Promise.allSettled` paralelo. |
| Build  | ✅ | `npm run build` — sem erros TS, 106 testes passando |
| Testes | ✅ | Rota SP→RJ: +40 eletropostos vs. base estática; sem dupla chamada OCM confirmado via DevTools Network |
| Commit | ✅ | `eab27e4` |

**Notas:** Segunda chamada OCM (`fetchChargersStatus`) causava 403 pois a chave gratuita tem limite de requisições. Solução: `fetchDcChargers` com `compact=false` já retorna `StatusType` — cachear e reutilizar de forma síncrona elimina a segunda chamada completamente.

---

### [S11-H] feat(planner): SOC tracking real + recarga mínima útil + overhead de parada · 27/04/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | Refactor completo de `buildChargingStops`: rastreamento real de SoC entre paradas (`currentSocPct` decresce segmento a segmento). `arrivalSocPct` / `departureSocPct` embutidos em `ChargingStop`. Look-ahead via `greedyBest(best.routeDistKm, effectiveRangeKm)` → `minDepartSoc(nextSegmentKm)`. Pass-through quando chegada ≥ mínimo necessário. Option A: `minUsefulSocDelta = ceil(chargeDC × 20min / battery_usable)` — delta pequeno → expande para `departPct` (elimina top-ups de 8 min). Option C: `STOP_OVERHEAD_MIN = 8` exibido por parada ("+8min setup") e somado ao total em `RouteStats`. `minUsefulSocDelta` computado em `useRoutePlanner` com `useMemo`, passado como param extra para `buildChargingStops`. |
| Build  | ✅ | `npm run build` — sem erros TS, 108 testes passando |
| Testes | ✅ | Todos os testes `buildChargingStops` verificam `arrivalSocPct`/`departureSocPct`; test "só cria parada onde carrega" passa com Option A ativa |
| Commit | ✅ | `4121d15` |

**Notas:** Causa raiz das paradas de 8 min: algoritmo anterior assumia `departPct=80%` em toda parada, calculava delta mínimo certo, mas o look-ahead usava alcance fixo em vez de SoC real — gerava deltas tiny quando dois chargers estavam próximos. Option A soluciona ao garantir que qualquer parada que vale a pena parar carregue pelo menos 20 min de energia.

---

## Sprint 10 — SEO & Tráfego · 03/04/2026

### [S10-A] feat(seo): sitemap.xml dinâmico com 88 rotas · 03/04/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `generate-sitemap.ts` na raiz: lê `CAR_DB`, aplica `toSlug(brand, model)` inline, gera `public/sitemap.xml` com 88 rotas `/carro/:slug` + `/` + `/privacidade`; `lastmod` = data do build (ISO); `priority` 1.0 / 0.8 / 0.3 por tipo de rota. `tsx` instalado como devDependency. `package.json` build atualizado: `tsx generate-sitemap.ts && vite build`. |
| Build  | ✅ | `npm run build` — script roda antes do Vite, sitemap gerado e copiado para `dist/` automaticamente |
| Testes | ✅ | Output verificado: 88 veículos + 2 rotas estáticas; URLs corretas; `robots.txt` já aponta para sitemap |
| Commit | ✅ | `ae85b0b` |

**Notas:** A pasta `scripts/` estava no `.gitignore` (scripts de uso único anteriores). Script movido para a raiz do projeto. Próximo passo: submeter `https://guiapbev.cloud/sitemap.xml` no Google Search Console para acelerar indexação das 88 páginas individuais.

---

### [S10-B] feat(seo): páginas de comparação + GA4 + Search Console/Bing · 04/04/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `CompareDetailPage.tsx`: rota `/comparar/:slugA/:slugB`; tabela side-by-side com 10 métricas (preço, autonomia, potência, torque, bateria, AC, DC, garantia veículo/bateria, tração, PBE); destaque verde `#00e5a0` no vencedor por linha; links para fichas individuais; seção "outros comparativos" com 6 sugestões da mesma categoria. SEO: Helmet title/desc/OG/canonical, JSON-LD `ItemList`. `generate-sitemap.ts` expandido: +922 comparativos de pares mesma categoria (priority 0.6) → sitemap total: 1012 URLs. `App.tsx`: rota `/comparar/:slugA/:slugB` adicionada. GA4 `G-VNKWH74PL8` adicionado ao `index.html`. |
| Build  | ✅ | `npm run build` — 9.2s, sem erros TypeScript |
| Testes | ✅ | Build limpo; rota `/comparar/byd-seal/volvo-ex30` resolve corretamente |
| Commit | ✅ | `a9fdfc3` |

**Notas:** Sitemap submetido manualmente no Google Search Console e Bing Webmaster Tools. GA4 verificado em tempo real. 922 comparativos indexáveis = 922 novas oportunidades de entrada orgânica por buscas tipo "BYD Seal vs Volvo EX30".

---

## Sprint 13 — Manutenção mensal jun/2026 · 01/06/2026

### [S13-A] chore(data): tarifas ANEEL B1 + GAC Aion UT · 01/06/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `electricityPricesByState.ts`: 6 estados atualizados (reajustes ANEEL abr/2026). `constants.ts`: +GAC Aion UT Premium (R$139.990, 253 km, 44,12 kWh) + Elite (R$159.990, 310 km, 60 kWh, ADAS L2, teto solar, bancos ventilados, carregador indução, faróis inteligentes); +BYD Sealion 7 (R$339.990, 360 km, AWD 531 cv, 82,5 kWh, DC 150 kW, V2L). Preços BYD corrigidos: Dolphin Plus 184k→179,8k · Seal 249,9k→269,9k · Tan 529,8k→536,8k · Han 539,8k→559,8k. Dolphin Special Edition 300→272 km. Badge Novo: Aion UT Premium/Elite + Sealion 7. `README.md`: 97→100 veículos. |
| Build  | ✅ | `npm run build` — 6s, sem erros |
| Testes | ✅ | 108/108 passando |
| Commit | ✅ | `bd6b52a` · `5146ece` |

**Notas:** MG4 Urban e ORA 5 identificados mas aguardam PBEV homologado + preço oficial (jul/26). Lotus Eletre/Emeya: entregas ago/26, reavaliar em jul/26. Trendseg: verificação manual do painel pendente.

### [S13-B] feat(images): imagens oficiais MG Motor · 02/06/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | 6 imagens substituídas por fotos oficiais de `mgmotoroficial.com.br`. MG4 Comfort (branco, plataforma luxo), MG4 Luxury (teal wide landscape), MG4 XPower (verde, pista), MGS5 Comfort (cinza, perfil lateral + carregador), MGS5 Luxury (cinza escuro, 3/4 frontal premium), Cyberster (vermelho, vista aérea capota aberta). `constants.ts`: 6 caminhos `.jpg → .webp`. |
| Build  | ✅ | `npm run build` — sem erros |
| Testes | ✅ | 108/108 passando |
| Commit | ✅ | `f3484aa` |

---

## Sprint 12 — Manutenção de dados · 08/05/2026

### [S12-A] fix(data): GAC Aion Y Elite + sitemap lastmod · 08/05/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `constants.ts`: GAC Aion Y Elite — `power` 136→204 cv, `price` 184.900→187.990. `priceHistory.ts`: snapshot 2026-05 adicionado. `sitemap.xml`: `lastmod` atualizado para 2026-05-08 em todas as 1012 URLs. |
| Build  | ✅ | `npm run build` — sem erros |
| Testes | ✅ | 108/108 passando |
| Commit | ✅ | `a502030` (dados) · `abd909b` (sitemap) |

---

### [S12-B] feat(data): +6 veículos comerciais da tabela PBEV 2026_27 · 08/05/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | Adicionados ao `CAR_DB`: **Farizon V6E** (81 kWh LFP, 136 cv, R$260k), **Farizon SuperVan SV** (82,9 kWh, 231 cv, R$425k), **Foton eWonder** (41,86 kWh, 102 cv, R$235,9k), **Foton eView Grand** (77,28 kWh, 184 cv, R$299,9k), **JAC E-JV5.5** (50,2 kWh, 204 cv, R$314,9k), **Mercedes-Benz eSprinter 320** (113 kWh, 204 cv, R$482,9k). Dados de autonomia do PBEV 2026_27; preços e specs confirmados via sites oficiais. `BRAND_URLS`: 2 novas marcas (Farizon, Foton). `priceHistory.ts`: 6 snapshots 2026-05. `README.md`: contagem atualizada 89→96 veículos, 27→29 marcas. Imagens baixadas para `public/car-images/`. |
| Build  | ✅ | `npm run build` — sem erros TS, 11.5s |
| Testes | ✅ | 108/108 passando |
| Commit | ✅ | — |

**Notas:** Política "um modelo por família" aplicada — sem variantes de trim duplicadas. Farizon é braço comercial do Grupo Geely (controlador da Volvo e Zeekr). Foton V6E/eWonder/eView são os primeiros veículos comerciais 100% elétricos da marca no Brasil (lançamento mar/2026). Mercedes eSprinter 320 é o único premium desse lote: PBTC 3,5 t, categoria B, 113 kWh, DC 115 kW.

---
