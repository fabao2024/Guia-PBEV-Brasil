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
