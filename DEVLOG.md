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

### [S8-B] fix(i18n): aba "Economia Mensal" → "Economia Mensal/Anual" · 27/03/2026

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | `savingsTab` em `pt-BR.json` e `en.json` atualizados |
| Build  | ✅ | `npm run build` — sem erros |
| Testes | ✅ | 76/76 passando |
| Commit | ✅ | `26ce60d` |

---
