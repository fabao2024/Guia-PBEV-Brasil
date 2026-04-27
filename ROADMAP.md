# Roadmap — Guia PBEV Brasil

> Documento vivo. Atualizado em março/2026.

## Status

| # | Ideia | Categoria | Esforço | Impacto | Status |
|---|-------|-----------|---------|---------|--------|
| 1 | Quiz "Qual EV é pra mim?" integrado ao chat IA | UX | Baixo | Alto | ✅ Concluído |
| 2 | Exibir certificação PBE/Inmetro + calculadora IPVA por estado | Dados | Baixo | Alto | ✅ Concluído |
| 3 | Busca full-text com Fuse.js | Técnico | Baixo | Alto | ✅ Concluído |
| 4 | TCO Calculator (custo total de propriedade) | Feature | Médio | Alto | ✅ Concluído |
| 5 | SEO com pre-rendering (vite-plugin-ssg) | Técnico | Médio | Alto | 🔲 Pendente |
| 6 | EV Route Planner (autonomia + paradas de recarga) | Feature | Alto | Médio | ✅ Concluído |
| 7 | Histórico de preços por modelo | Dados | Médio | Médio | ✅ Concluído |
| 8 | Mapa de infraestrutura de recarga (dados ANEEL) | Dados | Médio | Médio | ✅ Concluído |
| 9 | Recomendação inteligente na comparação | UX | Baixo | Médio | ✅ Concluído |
| 10 | Push notifications para favoritos (preço/novidade) | UX | Alto | Médio | 🔲 Pendente |
| 11 | Analytics sem cookies — Plausible ou Umami | Técnico | Baixo | Médio | ✅ Concluído |
| 12 | Avaliações de donos (rating real-world) | Feature | Alto | Médio | 🔲 Pendente |
| 13 | Sugestão de EV pela comunidade via GitHub Issues | Community | Baixo | Médio | ✅ Concluído |

---

## Detalhes

### 2. Certificação PBE/Inmetro + Calculadora IPVA ✅
- PDF `Tabela PBEV 2026_27_FEV-REV05 (2).pdf` extraído com `pdfplumber` → 54 modelos certificados
- Badge PBE (A–E) e consumo energético (MJ/km) no `CarDetailsModal`
- Calculadora IPVA 2026 com seletor dos 27 estados em `CarDetailsModal` e `SavingsSimulatorModal`
- **Nota:** IPI não consta na tabela PBEV. Para EVs importados, o tributo relevante é o II (Imposto de Importação) — fora do escopo desta tabela
- Diferencial único: nenhum outro site brasileiro brasileiro mostra certificação PBE e IPVA estimado por modelo

### 3. Busca Full-Text (Fuse.js)
- Substituir filtros atuais por busca instantânea (~4KB, sem backend)
- Busca por modelo, marca e categoria simultaneamente
- Resultados com destaque de texto (highlight)

### 4. TCO Calculator
- Expandir o Simulador de Economia: adicionar financiamento, IPVA, seguro, manutenção
- Comparar EV vs. carro equivalente a combustão em 5 anos
- Exportar como PDF ou link compartilhável

### 5. SEO — ✅ A1 + ✅ A2 concluídos

**A1 — concluído (mar/2026):**
- `index.html`: domínio corrigido para `guiapbev.cloud`, contagem atualizada, `<link rel="canonical">`
- `react-helmet-async`: `<title>`, description e OG tags dinâmicos quando modal de carro está aberto
- JSON-LD `ItemList` enriquecido: cada carro expõe `Product` com preço, autonomia e marca
- `public/sitemap.xml` + `public/robots.txt` adicionados
- Plausible Analytics (self-hosted) marcado como ✅ — já implementado desde Sprint 6

**A2 — concluído (31/03/2026):**
- `react-router-dom` v7 instalado; `BrowserRouter` em `index.tsx`
- `src/utils/slug.ts`: `toSlug()`, `findCarBySlug()`, `getCarUrl()`
- `src/pages/CarDetailPage.tsx`: página dedicada `/carro/:slug` com SEO completo (Helmet, JSON-LD Product, OG tags, canonical por modelo), hero, specs, garantia, carregamento, PBE, IPVA interativo, features, CTAs
- `public/404.html`: hack GitHub Pages para SPA routing sem servidor
- Fix double-slash no decode do redirect `/?/path` → `/path`

### 6. EV Route Planner ✅
- Rota ORS + algoritmo guloso furthest-reachable com scoring `routeDistKm − lateralDistKm × 2`
- 160 eletropostos estáticos + descoberta dinâmica via OCM (DC, `compact=false`) e OSM/Overpass (gratuito, sem chave)
- `mergeChargerSources`: deduplicação por proximidade 200m; threshold DC ≥ 30 kW
- `calcMinDepartSOC`: carrega apenas o necessário para chegar ao próximo ponto (elimina paradas de 8 min)
- Paradas "sem recarga necessária" exibidas em cinza quando SoC de chegada já cobre o trecho
- Condições de viagem: temperatura × relevo × estilo de condução
- Cache OCM (`_ocmPoiCache`): status sincronizado sem segunda chamada à API (resolve erros 403)
- Mapa Leaflet com marcadores numerados, polyline da rota, popups de eletroposto

> Resumo técnico Sprint 11 (17–23/04/2026): `RoutePlannerModal`, `routeGeometry`, `ocmService`, `overpassService` (novo), `mergeChargers` (novo), `useRoutePlanner`, `types/routePlanner`. 106 testes passando.

### 7. Histórico de Preços ✅
- `src/constants/priceHistory.ts`: snapshot inicial março/2026 com 88 veículos
- `getPriceDelta()` / `getLastSnapshot()` — utilitários para cálculo de variação
- Badge ↓/↑ inline nos cards (`CarCard`) e no tile de preço do `CarDetailsModal`
- Badge verde = queda, laranja = alta; tooltip com data do snapshot anterior
- Para registrar novo snapshot: adicionar `{ date: 'YYYY-MM', price: NNN }` ao modelo em `priceHistory.ts`

### 7.1 Automação mensal de dados ✅
- `.github/workflows/monthly-maintenance.yml`: 3 jobs executados no dia 1 de cada mês
  - `update-fuel-prices`: atualiza preços ANP via dados.gov.br e abre PR automático se valores mudarem
  - `check-pbev`: detecta nova tabela PBEV no INMETRO e abre issue com link de download
  - `create-maintenance-issue`: checklist de manutenção com resultado dos jobs automáticos

### 8. Mapa de Recarga (ANEEL)
- Dados abertos do cadastro de eletropostos da ANEEL
- Mapa de calor por estado/cidade
- Filtro "tem recarga rápida" cruzado com os carros

### 9. Recomendação na Comparação
- Após comparar 2 carros, sugerir um terceiro por similaridade de preço/autonomia
- "Quem comparou X também viu Y"

### 10. Push Notifications
- Notificar quando favorito tiver mudança de preço ou novo modelo da marca
- Backend leve: Cloudflare Workers + KV (free tier)

### 11. Analytics (LGPD-compliant)
- Plausible ou Umami — sem cookies, sem LGPD headache
- Rastrear: comparações mais feitas, modelos mais vistos, temas do chatbot
- Informa quais veículos adicionar na próxima atualização

### 12. Avaliações de Donos
- Donos submetem nota para autonomia real, recarga e qualidade
- Backend: Firebase ou Supabase (free tier)
- Score agregado exibido nos cards

---

## Monetização

### Fase 1 — Zero custo, receita imediata

**Lead Generation (afiliados de concessionárias)**
- Botão "Quero este carro" já existe — basta adicionar UTM tracking + parceria com concessionárias
- Modelo: comissão por lead qualificado (R$ 50–200 por lead)
- Parceiros naturais: BYD Brasil, Chevrolet, Volvo, Hyundai
- Esforço: baixo — só adicionar parâmetros de rastreamento e firmar contrato

**Google AdSense contextual**
- Anúncios contextualmente relevantes (carregadores, seguros, financiamento EV)
- Inserir em posições estratégicas: entre cards, no rodapé, lateral em desktop
- Receita estimada com 10k visitas/mês: R$ 300–800/mês
- Esforço: muito baixo

**Link de afiliado para seguros EV**
- CTA "Cotar seguro EV" já implementado no `CarDetailsModal` (Sprint 4) ✅
- Afiliado atual: **Trendseg** — cadastro realizado em 12/03/2026, aguardando aprovação e link
- Quando aprovado: substituir `INSURANCE_AFFILIATE_URL` em `src/constants.ts` (1 linha)

**Análise de seguradoras alternativas (26/03/2026):**
- **Porto Seguro**: exige SUSEP — descartada para afiliado. Placeholder no `CarDetailsModal` mantido.
- **Tokio Marine**: exclusivo para corretores SUSEP — descartada
- **Bradesco Seguros**: programa Lomadee pausado; exige R$15k/mês + SUSEP — descartada
- **Youse Negócios** ⭐ — canal B2B2C **sem SUSEP** para plataformas digitais; única seguradora com cobertura explícita de EVs (BYD, GWM); requer CNPJ + negociação comercial. Contato: `youse.com.br/seja-um-parceiro/` · **Ação: fazer pitch como catálogo EV / marketplace digital**
- **Ituran Seguro EV** — produto 100% focado em EVs (rastreador + cobertura FIPE total); sem programa público de afiliado. Potencial para acordo CPL direto · **Ação: outreach comercial**
- **Minuto Seguros / Lomadee** — pausado em mar/2026. Verificar mensalmente: `lomadee.com.br/anunciante/minuto-seguros`
- **Afilio (rede CPA)** — maior rede de afiliados do Brasil; pode ter campanhas ativas de seguro auto não visíveis em buscas · **Ação: cadastrar e verificar dashboard**
- **Pier Seguros** — R$150M+ faturados, crescimento rápido; oficialmente exige SUSEP mas receptivo a canais não tradicionais — contactar diretamente

---

### Fase 2 — Produto freemium

**Plano Premium para compradores**
- Gratuito: catálogo, filtros, comparação de 2 carros
- Premium (R$ 19,90/mês): comparação ilhada de 3+, alertas de preço, TCO Calculator, histórico de preços
- Pagamento via Stripe ou Mercado Pago

**API para terceiros (B2B)**
- Empresas de frota, locadoras, fintechs e seguradoras precisam de dados PBEV estruturados
- Oferecer acesso via API REST com autenticação por chave
- Planos: R$ 299/mês (500 req/dia) até R$ 999/mês (ilimitado)
- Base de dados já existe — só falta o wrapper de API (Cloudflare Workers ou Supabase Edge Functions)

**Newsletter paga — "EletriBrasil Insider"**
- Relatório mensal: novos modelos, variações de preço, tendências de mercado
- Público-alvo: gestores de frota, investidores, jornalistas do setor
- Plataforma: Substack ou Ghost (free tier)
- Preço sugerido: R$ 29/mês ou R$ 249/ano

---

### Fase 3 — Escala e parcerias estratégicas

**Parceria com montadoras (conteúdo patrocinado)**
- Seção "Destaque do Mês" patrocinada por uma marca
- Acesso antecipado a specs de novos modelos em troca de visibilidade
- Formato: banner + card destacado + menção no chat IA

**Relatórios de mercado (B2B)**
- Relatório trimestral de mercado EV brasileiro: tendências, ranking de marcas, variação de preços
- Vendido para consultorias, montadoras, gestoras de investimento
- Preço sugerido: R$ 1.500–5.000 por relatório

**Expansão geográfica**
- Argentina, Chile e Colômbia têm mercados EV em crescimento acelerado
- Replicar o modelo com dados locais (tabelas governamentais equivalentes)
- Mesma base de código, nova instância por país

---

## Escala Técnica

| Ação | Quando | Impacto |
|---|---|---|
| Pre-rendering (SSG) para SEO | Fase 1 | Tráfego orgânico |
| Analytics (Plausible) | Fase 1 | Dados para decisão |
| Backend leve (Supabase free) | Fase 2 | Alertas, reviews, auth |
| App nativo (Capacitor) | Fase 2 | Push notifications reais |
| CDN de imagens (Cloudflare) | Fase 2 | Performance global |
| API pública documentada | Fase 3 | Receita B2B |
| Expansão para outros países | Fase 3 | Escala de mercado |

---

## Metas por fase

| Fase | Prazo | Meta de usuários | Meta de receita |
|---|---|---|---|
| 1 — Tração | 0–6 meses | 5.000 visitas/mês | R$ 500–1.500/mês |
| 2 — Produto | 6–18 meses | 30.000 visitas/mês | R$ 5.000–15.000/mês |
| 3 — Escala | 18–36 meses | 100k+ visitas/mês | R$ 30.000+/mês |

---

## Sprints Semanais

> Cada sprint = 1 semana. Foco em uma entrega concluída por sprint.
> Nota: sprints históricas (-5 a -1) agrupam work sessions da fase pré-lançamento, não necessariamente semanas calendário completas.
> Legenda: ✅ Concluído · 🔄 Em andamento · 🔲 Pendente

---

### Sprint -5 — 08–12/12/2025 ✅
**Tema: Fundação + Deploy**
- ✅ Setup Vite 6 + React 19 + TypeScript + Tailwind CSS 4
- ✅ Catálogo inicial de EVs com imagens locais
- ✅ Integração Gemini 2.5 (chat IA)
- ✅ README bilíngue PT/EN
- ✅ Segurança da API key (.env gitignored)
- ✅ GitHub Pages workflow (deploy automático via Actions)
- ✅ Dockerfile + nginx.conf para Cloud Run
- ✅ Fix base URL de imagens para GitHub Pages (`import.meta.env.BASE_URL`)
- ✅ Documentação de deploy bilíngue (DEPLOY.md)

> **Resumo técnico:** Stack 100% client-side sem backend. Vite 6 como bundler com base path `/Guia-PBEV-Brasil/` para GitHub Pages. Imagens servidas de `public/car-images/` com `import.meta.env.BASE_URL` como prefixo. Deploy automático via GitHub Actions em push para `main`. Containerização opcional com Dockerfile + nginx para Cloud Run.

---

### Sprint -4 — 05–09/02/2026 ✅
**Tema: Especificações técnicas + Qualidade**
- ✅ Potência (cv) e torque (kgfm) adicionados ao catálogo
- ✅ Specs exibidos no `ComparisonModal` e `CarDetailsModal`
- ✅ Infraestrutura de testes (Vitest + Testing Library, 70 testes)
- ✅ i18n PT-BR / EN com toggle e persistência em localStorage
- ✅ Chatbot disponível no GitHub Pages (usuário insere sua própria chave Gemini)
- ✅ Tela de setup de API key com instruções passo a passo
- ✅ Defesas contra prompt injection (12 padrões bilíngues)
- ✅ CLAUDE.md para contexto do projeto

> **Resumo técnico:** i18n com `react-i18next` + `i18next-browser-languagedetector`; chave de idioma persistida em `localStorage('lang')`; chave Gemini resolvida via `import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini-api-key')`. Segurança: `sanitizeChatInput()` (XSS, limite 1000 chars) + `validateChatInput()` (12 padrões de prompt injection). Testes com Vitest 4 + happy-dom, mocks de `matchMedia`, `IntersectionObserver` e `localStorage`.

---

### Sprint -3 — semana de 25/02/2026 ✅
**Tema: UI, segurança avançada e dados**
- ✅ Redesign completo da UI (dark mode, mobile UX, scrollbars)
- ✅ Canary token gerado em runtime para detecção de vazamento de prompt
- ✅ Imagens corrigidas (3 modelos com foto errada)
- ✅ Features detalhadas por modelo para todos os 74 EVs
- ✅ Nova categoria "Urbano" adicionada
- ✅ Redesign do Simulador de Economia (sliders DC%, taxa mista)
- ✅ Adição do GAC Hyptec HT ao catálogo

> **Resumo técnico:** Canary token UUID gerado a cada sessão e injetado no system prompt; se o modelo vazar o token na resposta, é detectado e a mensagem é bloqueada. Simulador redesenhado com slider de `dcPercent` (0–100%) e cálculo de taxa mista: `blendedRate = kwhPrice × (1 - dcPercent/100) + dcKwhPrice × (dcPercent/100)`. UI migrada para Tailwind CSS 4 com scrollbars customizadas via `.custom-scrollbar-dark`.

---

### Sprint -2 — semana de 03/03/2026 ✅
**Tema: Expansão do catálogo e UX**
- ✅ 12 novos EVs adicionados (Neta, Geely, Kia, Chevrolet, Omoda, GAC, Zeekr, GWM)
- ✅ Correção de autonomia em 10 modelos (dados PBEV atualizados)
- ✅ Imagens reais para todos os veículos (sem placeholders)
- ✅ Tração (FWD/RWD/AWD) adicionada a toda a base
- ✅ Botão de compartilhar (Web Share API)
- ✅ Filtro "Novidades" no header
- ✅ Meta tags Open Graph para compartilhamento em redes sociais

> **Resumo técnico:** Tração atribuída em bulk via script Node.js `add_traction.js` (parse + reescrita do `constants.ts`). Compartilhamento via `navigator.share()` com fallback para `navigator.clipboard.writeText()`. Filtro "Novidades" via função `isCarNew(car)` que verifica brand + model name em lista controlada. Open Graph com `<meta property="og:*">` estáticos no `index.html`.

---

### Sprint -1 — semana de 06/03/2026 ✅
**Tema: Engajamento no chat IA**
- ✅ Chips de sugestão no chat (Find EV, Simular, Autonomia)
- ✅ Quiz interativo com opções clicáveis (5 passos)
- ✅ Botão "Refazer o quiz"
- ✅ Mensagem de boas-vindas atualizada (PBEV do INMETRO)
- ✅ Licença CC BY-NC 4.0
- ✅ Otimização do quiz: state machine local + single LLM call
  - Perguntas e opções hardcoded no bundle (zero latência, zero API)
  - Respostas acumuladas localmente via `quizAnswers[]`
  - 1 única chamada ao Gemini no final com prompt agregado
  - Redução de 6 → 1 chamada API por quiz completo
  - Rate limit preservado (1/10 em vez de 6/10 por sessão de quiz)
- ✅ Quiz 100% offline — scoring local sem API
  - Algoritmo de pontuação: autonomia (40%), orçamento (25%), categoria (20%), prioridade (15%)
  - Recomendação gerada instantaneamente do `CAR_DB` sem nenhuma chamada à rede
  - Redução de 1 → 0 chamadas API por quiz (economia total)
- ✅ Quiz acessível sem chave API
  - Tela de setup reformulada: botão "Me ajude a escolher um EV" sempre visível sem scroll
  - Quiz inicia diretamente da tela de setup para usuários sem chave
  - Ao final do quiz sem chave: CTA "Configurar chave para chat completo"
  - Layout compacto (density redesign): icon+título inline, steps `text-xs`, tudo em ~440px
- ✅ Avaliação arquitetural de LLM Router documentada no ROADMAP
  - Decisão: não implementar na Fase 1 (sem backend, custo zero, Gemini já é o melhor free tier PT-BR)
  - Plano para Fase 2: LiteLLM no Cloudflare Worker com routing Groq → Gemini → GPT-4o-mini

---

### Sprint 2 — semana de 10/03/2026 ✅
**Tema: Descoberta e SEO**
- ✅ Busca full-text com Fuse.js (busca por modelo, marca, categoria) — _entregue 09/03/2026_
- ✅ JSON-LD `Product` schema para cada veículo — _entregue 09/03/2026_
- ✅ Meta tags dinâmicas por carro (`<title>`, og:description) — _entregue 09/03/2026_
- ✅ Instalar Plausible Analytics (self-hosted) — _entregue 09/03/2026_

> **Resumo técnico — Plausible Analytics (09/03/2026):**
> Plausible CE v3.2.0 instalado via Docker Compose no VPS Ubuntu 8GB (212.85.0.163).
> Domínio: `analytics.guiapbev.cloud` com SSL via Certbot + Nginx reverse proxy na porta 8000.
> Snippet de tracking adicionado em `index.html`. Dados de visitas disponíveis em tempo real no dashboard.

> **Resumo técnico — Meta Tags Dinâmicas (09/03/2026):**
> Hook `useMeta` criado em `src/hooks/useMeta.ts`: salva os valores originais das meta tags no mount, aplica os do carro selecionado e restaura os originais no unmount.
> Tags atualizadas ao abrir um card: `document.title`, `<meta name="description">`, `og:title`, `og:description`, `og:image`, `og:url`, `twitter:title`, `twitter:description`, `twitter:image`.
> Formato do título: `"BYD Dolphin GS — R$ 149.990 | Guia PBEV Brasil"`. Ao fechar o modal, título e tags voltam ao padrão do catálogo automaticamente.
> `index.html` complementado com `og:image`, `twitter:title`, `twitter:description` e `twitter:image` padrão.

> **Resumo técnico — JSON-LD Product Schema (09/03/2026):**
> Hook `useJsonLd` criado em `src/hooks/useJsonLd.ts`: injeta `<script type="application/ld+json">` no `document.head` via `useEffect` e remove no unmount.
> Dois schemas injetados: `ItemList` na página principal (catálogo completo com todos os modelos, posição e URL da marca) e `Product` no `CarDetailsModal` ao abrir um veículo (name, brand, image, offers com preço em BRL, additionalProperty com potência, autonomia, bateria e tração).
> Google pode indexar JSON-LD gerado por JavaScript (SPA) — impacto imediato no Google Shopping e rich results de produtos.

> **Resumo técnico — Fuse.js Search (09/03/2026):**
> Hook `useSearch` criado em `src/hooks/useSearch.ts` com instância Fuse memoizada.
> Chaves ponderadas: `model` (0,6) · `brand` (0,3) · `cat` (0,1). Threshold 0,35 tolera erros de digitação ("Dolfin" → Dolphin). Debounce 200ms para evitar re-renders por keystroke. Mínimo 2 caracteres para ativar a busca.
> Pipeline: `CAR_DB + userCars → [useSearch] → searchResults → [filtros existentes] → grid`.
> Campo de busca acima do grid com ícone Search (cyan ao focar), botão X (limpar) e contador de resultados. Filtros e busca são independentes — reset de filtros não apaga o termo buscado.
> Biblioteca: `fuse.js` (~4 KB gzip), zero backend.

---

### Sprint 3 — semana de 11/03/2026 ✅
**Tema: Dados exclusivos**
- ✅ Certificação PBE/Inmetro por modelo (54/86 veículos com dados oficiais)
- ✅ Calculadora de IPVA 2026 por estado nos 27 estados brasileiros
- ✅ Badge PBE no `CarDetailsModal` com cor por rating (A=verde → E=vermelho)
- ✅ Seletor de estado no `CarDetailsModal` com IPVA estimado + economia vs. combustível
- ✅ Seletor de estado no `SavingsSimulatorModal` integrado ao cálculo de economia total
- ✅ `localStorage('selectedState')` compartilhado entre os dois modais

> **Resumo técnico — Sprint 3 (11/03/2026):**
> Dados PBE extraídos do PDF `Tabela PBEV 2026_27_FEV-REV05 (2).pdf` via script Python (`pdfplumber`). 54 modelos atualizados com `pbeRating` (A–E), `energyMJkm` e `conpetSeal`. Apenas 2 veículos abaixo de A: Fiat 500e (C, 0,46 MJ/km) e JAC E-JS1 (E, 0,50 MJ/km).
> IPVA implementado via `src/constants/ipvaByState.ts` com dados dos 27 estados (isenção total em RS, DF, MA, PE, RN, PB, SE, AC, TO; SP cobra 4% sem benefício). Lógica de limiar de preço implementada para BA (até R$300k) e PA (até R$150k). IPVA = alíquota × preço FIPE estimado. Economia comparada contra taxa padrão SP de 4%. `calcIpva()` utilitário compartilhado entre `CarDetailsModal` e `SavingsSimulatorModal`.
> Alíquota exibida diretamente nas opções do dropdown em ambos os modais (`SP — São Paulo · 4,0%`). Disclaimer de validade dos dados (`IPVA_DATA_UPDATED`) renderizado abaixo do seletor — atualização futura em uma linha em `ipvaByState.ts`.
> **Nota arquitetural:** IPI não foi incluído — é um imposto industrial que não consta na tabela PBEV. Para EVs importados (maioria do catálogo), o tributo federal relevante é o II (Imposto de Importação), em fase de restauração progressiva até 35% em jul/2026.

---

### Sprint 4 — semana de 12/03/2026 ✅
**Tema: Monetização inicial**
- ✅ UTM tracking no botão "Ver na concessionária" + Plausible custom events
- ✅ CTA "Cotar seguro EV" no `CarDetailsModal`
- ✅ Política de Privacidade criada (`public/privacy.html`) + link no footer
- ✅ Domínio próprio `guiapbev.cloud` configurado (CNAME + DNS Hostinger)
- ✅ Email oficial criado: `guiapbevbrasil@gmail.com`
- ✅ Instagram criado: `@guiapbevbrasil`
- ✅ Cadastro no programa de afiliados Trendseg _(aguardando aprovação e link)_
- 🔲 Ativar link de afiliado Trendseg em `constants.ts` _(aguardando aprovação)_
- 🔲 Aplicar para Google AdSense _(aguardando ~500 visitas/mês de tráfego orgânico)_
- 🔲 Contato com 3 concessionárias para parceria de lead

> **Resumo técnico — UTM + Plausible Events (12/03/2026):**
> Utilitário `src/utils/analytics.ts` criado com função `track(event, props)` — wrapper seguro que só dispara se `window.plausible` estiver disponível (funciona silenciosamente em dev sem Plausible instalado).
> 5 eventos implementados:
> - `Lead Click` → `{model, brand}` — clique no botão "Ver na concessionária" em `CarDetailsModal`; URL appended com UTM (`utm_source=guiapbev&utm_medium=referral&utm_campaign=lead&utm_content={model}`)
> - `Car Details Open` → `{model, brand, category}` — abertura de qualquer card no catálogo (App.tsx)
> - `Comparison Start` → `{models, count}` — clique em "Comparar agora" no compare bar (App.tsx)
> - `Simulator Used` → `{state}` — abertura do `SavingsSimulatorModal` (tracking no mount via useEffect)
> - `Filter Applied` → `{filter_type, value}` — aplicação de filtros de categoria/marca (imediato) e price/range (onMouseUp para evitar flood) em `Sidebar.tsx`
> Dados disponíveis em `analytics.guiapbev.cloud` → seção "Custom Events" do dashboard Plausible.
>
> **Testes — `src/utils/__tests__/analytics.test.ts` (12/03/2026):** 6/6 ✅
> | # | Caso de teste | Status |
> |---|---------------|--------|
> | 1 | Chama `window.plausible` com nome do evento e props quando disponível | ✅ passou |
> | 2 | Chama `window.plausible` sem props quando omitidas | ✅ passou |
> | 3 | Não lança exceção quando `window.plausible` é `undefined` | ✅ passou |
> | 4 | Não lança exceção quando `window.plausible` não é uma função | ✅ passou |
> | 5 | Passa props numéricas corretamente | ✅ passou |
> | 6 | Evento descartado silenciosamente quando Plausible não está carregado | ✅ passou |

> **Resumo técnico — CTA Seguro EV (13/03/2026):**
> Constante `INSURANCE_AFFILIATE_URL` adicionada em `constants.ts` (placeholder Porto Seguro; substituição em uma linha quando vier a URL de afiliado).
> Botão "Cotar seguro EV" adicionado ao `CarDetailsModal` abaixo dos action buttons: estilo verde-esmeralda (`#00e5a0`) para diferenciar do CTA principal azul, ícone `Shield`, abre em nova aba com UTM (`utm_campaign=insurance&utm_content={model}`).
> Evento Plausible `Insurance Quote Click` → `{ model, brand }` disparado no clique.
> Chaves de tradução `details.insuranceBtn` / `details.insuranceTip` adicionadas em pt-BR e EN.
> 76/76 testes passando. Para ativar o afiliado real: trocar `INSURANCE_AFFILIATE_URL` em `constants.ts`.

---

### Sprint 5 — semana de 14/03/2026 ✅
**Tema: TCO Calculator**
- ✅ Expandir Simulador de Economia com IPVA real, seguro sobre valor depreciado e manutenção por km
- ✅ Comparativo EV vs. combustão em **4 anos** com depreciação anual (EV 9,5% · combustão 7,0%)
- ✅ Exportar resultado como imagem (Canvas API nativa — sem dependências externas)
- ✅ Toggle Gasolina / Etanol (+30% consumo volumétrico vs. gasolina) com referência ANP por estado
- ✅ Slider combustível auto-preenchido por estado (ANP) e troca de cor conforme o tipo (laranja/verde)
- ✅ Slider energia AC auto-preenchido por estado com tarifas B1 residencial da ANEEL
- ✅ Custo/km EV e Combustão na aba Economia Mensal com eficiência do modelo (kWh/100km e km/L)
- ✅ Tiles de resumo executivo no TCO: preço, custo EV 4 anos, combustão 4 anos, economia total
- ✅ Fix URL placeholder seguro (Porto Seguro `/seguros/automovel`)

> **Resumo técnico — TCO Calculator (14/03/2026 → 15/03/2026):**
> `src/utils/tco.ts`: `calcTCO()` — depreciação linear por ano (EV 9,5% a.a. · combustão 7,0% a.a.), seguro calculado sobre valor depreciado (3,3% EV · 2,5% combustão), manutenção proporcional ao km rodado por intervalo de revisão (EV: 20.000 km; combustão: 10.000 km). Financiamento removido — TCO foca em custo operacional puro.
> `FuelType = 'gasoline' | 'ethanol'`: etanol consome 30% mais volume (ETHANOL_FACTOR = 1.30) → km/L efetivo = combKmL / 1.30. `costPerKmEV` e `costPerKmComb` calculados sobre o total dos 4 anos.
> `src/constants/fuelPricesByState.ts`: preços médios ANP (fev/2026) para gasolina e etanol nos 27 estados. Slider auto-preenchido via `useEffect([selectedState, fuelType])`. Badge do valor troca de cor: laranja (`#ff8c52`) para gasolina, verde (`#00e5a0`) para etanol. Referência textual exibida abaixo do slider; ajuste manual preservado.
> `src/constants/electricityPricesByState.ts`: tarifas B1 residencial ANEEL (mar/2026), distribuidora principal por estado. Slider AC auto-preenchido via `useEffect([selectedState])`. Referência "sem ICMS · sem bandeira tarifária" exibida abaixo.
> Aba Economia Mensal: tiles custo/km EV (azul) e combustão/etanol (cinza) com eficiência real do modelo (`kWh/100km` · `km/L` efetivo). Aba TCO: tiles de resumo executivo (preço, custo EV 4a, combustão 4a, economia total em verde). Build limpo.

---

### Sprint 6 — semana de 16/03/2026 ✅
**Tema: Mobile UX & PWA**
- ✅ Auditoria completa de mobile UX (10 problemas identificados, priorizados por impacto)
- ✅ Decisão arquitetural: manter site PWA, sem app nativo (Capacitor descartado na Fase 1)
- ✅ `manifest.json` + `icon.svg` — PWA instalável no Android (Chrome) e iOS (Safari)
- ✅ `index.html`: `<link rel="manifest">`, `apple-mobile-web-app-*`, `apple-touch-icon`
- ✅ Touch targets nos cards aumentados para 36×36px mínimo (`p-2`, ícones `w-4 h-4`)
- ✅ `ComparisonModal`: snap scroll horizontal no mobile (`snap-x snap-mandatory`), coluna de labels reduzida (80px), colunas de carros com `min(72vw, 240px)`
- ✅ Sliders da sidebar: track aumentado de `h-1.5` → `h-2` para facilitar o toque
- ✅ Labels dos sliders do simulador reescritos em linguagem clara para o usuário leigo
- ✅ Botão "Site Oficial" (azul) convertido de `<button>` para `<a href>` — navega corretamente para o site da marca com `stopPropagation`
- ✅ Botão `ExternalLink` redundante removido do topo do card
- ✅ Texto "Site Oficial" oculto em mobile portrait (`hidden sm:inline`) — apenas ícone `↗`
- ✅ Preço do card: "R$" movido para o label (`PREÇO · R$`), número em azul sem prefixo — libera espaço horizontal
- ✅ Barra sticky mobile (Filtro + Simulador) recebe fundo sólido `bg-[#0a0a0a]` e `border-b` — cards não aparecem por baixo ao rolar
- ✅ Sliders do simulador substituídos por botões `−`/`+` no mobile — elimina alteração acidental de valores ao rolar a tela
- ✅ Desktop mantém slider com `touch-action: pan-y`
- ✅ Seletor de estado/IPVA movido para o topo do painel de sliders compartilhados (primeira interação do usuário)
- ✅ Fix overlay de todos os modais (`absolute` → `fixed`) — fundo da página não aparece mais ao rolar
- ✅ Título do simulador: "Carro Elétrico vale a pena pra você?" — subtítulo "GUIA PBEV Brasil" só no desktop
- ✅ Aba TCO renomeada para "Custo Total 4 Anos" (sem jargão técnico)
- ✅ Disclaimer da aba Economia Mensal reescrito — explica critério de comparação EV × combustão equivalente por categoria (PBEV 2026/Inmetro)
- ✅ Auditoria de textos e UX — 13 achados, grupo 1 implementado (6 melhorias de copy)
- ✅ Badge "Maior\nEconomia" (era "Best\nSavings" em inglês no PT-BR)
- ✅ Sidebar: "Autonomia (PBEV)" → "Autonomia PBEV — mínimo"
- ✅ Botão CTA: "Site Oficial" → "Ver no Fabricante" em todos os cards e modais
- ✅ ComparisonModal: "Recursos" → "Equipamentos" (padronizado com CarDetailsModal)
- ✅ Dica de scroll do ComparisonModal movida para i18n (PT + EN)
- ✅ Toast global "❤️ Adicionado / Removido dos favoritos" ao favoritar (2,5s, bilíngue)
- ✅ Spinner ao exportar TCO já estava implementado (confirmado)
- ✅ Botão "Novidades" com tooltip explicativo (últimos 12 meses)
- ✅ Chat setup: texto do quiz clarificado como "Assistente de Recomendação (sem IA)"
- ✅ Share "Copiado!" timeout: 2s → 3,5s (mais legível no mobile)
- ✅ FWD/RWD/AWD: tooltip com label em português (CarCard + CarDetailsModal)
- ✅ Bateria kWh: tooltip "Quilowatt-hora — unidade de energia da bateria"
- ✅ Chatbot IA: dados por estado (ANP + ANEEL + IPVA) injetados no system prompt — respostas calibradas por estado quando usuário informa sua localização
- ✅ Chatbot IA: retry automático com backoff exponencial em erros 503/429 (até 3x: 1s/2s/4s) + mensagem amigável ao usuário

> **Resumo técnico — Sprint 6 (16/03/2026):**
> **PWA:** `public/manifest.json` com `display: standalone`, `orientation: portrait-primary`, `start_url` e `scope` para GitHub Pages. Ícone SVG (bolt cyan #00b4ff, fundo #0a0a0a) com `purpose: any/maskable`. Meta tags iOS: `apple-mobile-web-app-capable`, `status-bar-style: black-translucent`, `apple-touch-icon`.
> **Touch targets:** botões do CarCard (`p-1.5` → `p-2`, `min-w/h-[36px]`); ícones `w-3.5` → `w-4`. Botão CTA convertido para `<a>` com `stopPropagation` — resolve bug histórico onde o clique abria o modal em vez do site da marca.
> **ComparisonModal mobile:** `grid-template-columns: 80px repeat(N, minmax(min(72vw,240px),1fr))`, `snap-x snap-mandatory` no container, `snap-start` por coluna. Labels `text-xs` → `text-[9px] sm:text-xs`.
> **Barra sticky mobile:** `bg-[#0a0a0a] -mx-4 px-4 py-2 border-b border-white/5` — cria superfície opaca real, elimina transparência que deixava cards aparecerem por baixo.
> **Sliders simulador mobile:** sliders ocultos (`hidden md:block`) no mobile. Botões `−`/`+` (`md:hidden`) flanqueiam cada badge de valor com step por campo: km ±100, combustível ±0,10, AC/DC ±0,05, %DC ±5. Elimina definitivamente alteração acidental de valores ao rolar. Desktop mantém slider com `touch-action: pan-y`.
> **Seletor de estado reposicionado:** bloco `{/* State selector */}` movido para ser o primeiro filho do container `SHARED SLIDERS` — antes do slider de km/mês. O usuário agora escolhe o estado como primeira ação, disparando auto-preenchimento dos sliders de combustível (ANP) e energia (ANEEL).

---

### Sprint 6.2 — semana de 17/03/2026 ✅
**Tema: Simulador — Transparência metodológica + Consumo per-car**
- ✅ Badge row abaixo das tabs mostrando quais componentes cada aba inclui (Energia/Seguro/Manutenção/IPVA)
- ✅ Colapsável "Como este cálculo funciona" no rodapé — conteúdo dinâmico por aba
- ✅ Aba Mensal: explica que só energia entra no número principal; IPVA exibido separadamente
- ✅ Aba TCO: detalha todos os 5 componentes com fórmulas; sem financiamento
- ✅ Preços de referência ANP/ANEEL por estado no colapsável (dinâmicos, refletem estado selecionado)
- ✅ Tabela de consumos médios PBEV/INMETRO por categoria de veículo em ambas as abas
- ✅ Prefixo "categ." em todas as referências de categoria para evitar confusão com ciclo urbano/rodoviário
- ✅ Opção C: controles ⚙ Personalizar consumo movidos para dentro de cada card de resultado
- ✅ Customização independente por veículo (até 3 carros com valores diferentes)
- ✅ Ponto azul indicador de customização ativa no botão ⚙
- ✅ Estado migrado de escalares para arrays `(number | null)[]` de 3 posições
- ✅ Consistência Mensal ↔ TCO: ambas as abas usam os mesmos valores customizados por slot
- ✅ Reset individual por slot ao trocar de carro; reset de combKmL ao trocar combustível

> **Resumo técnico — Sprint 6.2 (17/03/2026):**
> **Transparência:** badge row gerado dinamicamente por `tab` — aba Mensal mostra Energia ativo (azul) + Seguro/Manutenção riscados + IPVA "separado"; aba TCO mostra todos em verde. Colapsável unificado com `methodologyOpen: boolean` — renderiza conteúdo diferente conforme `tab` ativo. Preços ANP/ANEEL injetados com `getDefaultFuelPrice(selectedState, fuelType)` e `ELECTRICITY_PRICES_BY_STATE[selectedState]`.
> **Opção C (consumo per-car):** estado migrado para `customEvKwh: (number|null)[]` e `customCombKmL: (number|null)[]` + `customOpen: boolean[]`. `getEfficiency(car, idx)` e `effectiveCombKmL(car, idx)` recebem índice — usam `customEvKwh[idx] ?? categoryDefault`. `handleCarSelect` reseta só `n[index]`. `useEffect([fuelType])` reseta `[null,null,null]`. Mini ⚙ colapsável dentro de cada card da aba Mensal com slider + step buttons; aba TCO herda via `calcTCO(..., { customEvKwh: customEvKwh[idx], customCombKmL: customCombKmL[idx] })`.

---

### Sprint 6.1 — semana de 17/03/2026 ✅
**Tema: Simulador — Consumo personalizado + Contexto de seleção**
- ✅ Controles de consumo personalizável (kWh/100km EV e km/L combustão) — Opção B: visível apenas com 1 carro selecionado; aviso com 2–3 carros
- ✅ Slider de combustão posicionado no valor efetivo do combustível selecionado (gasolina ou etanol) — troca automática ao mudar tipo
- ✅ Reset automático do consumo customizado ao trocar tipo de combustível
- ✅ Referência PBEV/INMETRO por categoria exibida abaixo de cada slider (EV e combustão)
- ✅ Badge de valor do slider troca de laranja (gasolina) para verde (etanol)
- ✅ Opção "Selecionar Veículo" habilitada nos dropdowns para permitir esvaziar slots
- ✅ Simulador respeita contexto de seleção ao abrir: compareList > último carro visto > CAR_DB[0] sozinho
- ✅ `lastViewedCar` rastreado em App.tsx — persiste após fechar o CarDetailsModal
- ✅ `initialCars` prop adicionado ao SavingsSimulatorModal; `useEffect` que forçava 3 carros removido

> **Resumo técnico — Sprint 6.1 (17/03/2026):**
> **Consumo personalizado (Opção B):** dois novos sliders aparecem no painel compartilhado quando exatamente 1 carro está selecionado — "Consumo EV" (5–40 kWh/100km) e "Consumo Combustão" (2–25 km/L). Estados `customEvKwh: number | null` e `customCombKmL: number | null` (null = padrão por categoria). `getEfficiency()` usa `customEvKwh ?? default`; `effectiveCombKmL()` usa `customCombKmL ?? (default / ETHANOL_FACTOR se etanol)`. Botão `↺` reseta para o padrão da categoria. Reset automático via `useEffect([fuelType])` para `customCombKmL`.
> **Contexto de seleção:** `lastViewedCar` adicionado ao App.tsx — atualizado via `setLastViewedCar(car)` no mesmo clique que abre o CarDetailsModal; persiste após fechar. Lógica de prioridade em `initialCars`: `compareList.length > 0 ? compareList : lastViewedCar ? [lastViewedCar] : []`. Fallback interno do modal: `CAR_DB[0]` no slot 1 quando `initialCars` é vazio. Slots 2 e 3 ficam vazios se não há carros suficientes.

---

### Sprint 7 — semana de 23/03/2026
**Tema: UX avançado + Expansão do catálogo**
- ✅ Fluxo de sugestão de EV via Consultor IA (chip no chat → coleta guiada → URL pré-preenchida do GitHub Issues)
- ✅ Botão "Sugerir EV" redireciona para Consultor IA se usuário não tem conta GitHub
- ✅ Suzuki e-Vitara adicionado ao catálogo (issue #2 — nova marca)
- ✅ BYD Dolphin Mini GL adicionado ao catálogo (issue #3 — catálogo agora com 88 veículos, 27 marcas)
- ✅ RAG no Consultor IA: query decomposition + metadata filtering client-side
- ✅ UX tipografia: revisão completa de tamanhos de fonte (CarCard, CarDetailsModal, ComparisonModal, SavingsSimulatorModal, ChatWidget, App)
- ✅ Logo corrigido: "PBEV Brasil" → "Guia PBEV Brasil"
- ✅ Destaque invertido: Simulador = botão primário (cyan), Sugerir EV = secundário
- ✅ JAC E-J7 adicionado ao catálogo (issue #5 — 90 veículos, 28 marcas)
- ✅ GitHub Action semanal: processa issues `sugestão-ev` e abre PRs automaticamente
- ✅ fix(tco): IPVA combustão corrigido — usa alíquota real do estado (não mais SP 4% fixo)
- ✅ 11 alíquotas `standardRate` corrigidas em `ipvaByState.ts` (AC, BA, ES, GO, MS, PA, PB, PE, PR, SC, TO)
- ✅ feat(tco): análise patrimonial de revenda — tiles residual EV/combustão + resultado líquido total
- ✅ Recomendação de terceiro carro após comparação
- ✅ Histórico de preços (snapshot mensal em priceHistory.ts)
- ✅ Badge "preço alterado" nos cards (↓ verde / ↑ laranja)

> **Resumo técnico — Sprint 7 (19–24/03/2026):**
> **Suzuki e-Vitara:** primeira entrada da marca Suzuki. SUV AWD 184 cv / 31,2 kgfm, bateria 61 kWh, autonomia 293 km PBEV, R$ 269.990. `BRAND_URLS` atualizado com `suzukiveiculos.com.br`. Imagem local `e-vitara.jpg`.
> **BYD Dolphin Mini GL:** versão GL da linha Dolphin Mini. Urbano FWD, bateria LFP 30,08 kWh, 75 cv / 13,8 kgfm, autonomia 224 km PBEV, R$ 118.990. Imagem via CDN BYD Brasil. Ambas as adições via fluxo de issues — skill `/add-vehicle` utilizada.
> **RAG:** `extractQueryFilters()` → `retrieveRelevantCars()` → `buildRagContext()` injetado silenciosamente em `doSend()`. Client-side puro, sem chamadas extras de API.
> **fix IPVA TCO (24/03/2026):** `STANDARD_COMBUSTION_IPVA_RATE` (SP 4% hardcoded) substituído por `ipvaStateInfo.standardRate` em 3 locais (`tco.ts`, `SavingsSimulatorModal`, `CarDetailsModal`). Adicionalmente, 11 alíquotas corrigidas — maior erro: ES era 4%, real é 2%; PR alinhado a 1,9% (sem benefício EV em 2026). `commit 6875100`.

---

### Sprint 8 — semana de 27/03/2026
**Tema: SEO A1 + UX Quality**
- ✅ SEO A1: meta tags dinâmicas, JSON-LD enriquecido, sitemap, canonical
- ✅ fix(tco): manutenção calibrada com dados reais BR 2025 (BYD oficial)
- ✅ UX: barra de filtros ativos com chips + "Limpar tudo"
- ✅ fix(search): Fuse.js threshold 0.35→0.2, score filter explícito
- ✅ i18n: aba "Economia Mensal" → "Economia Mensal/Anual"
- ✅ feat(data+ui): garantia (anos) e velocidades de carregamento AC/DC em todos os 88 veículos
- ✅ feat(ui): tempo estimado de carregamento AC/DC calculado e exibido no modal de detalhes
- ✅ feat(seo): SEO A2 — rotas individuais `/carro/:slug` com react-router-dom + 404 hack

> **Resumo técnico — Sprint 8 (27/03/2026 – 31/03/2026):**
> Foco em qualidade de dados, UX e SEO. SEO A1 com react-helmet-async, JSON-LD Product enriquecido, sitemap. Manutenção TCO corrigida (BYD plans oficiais). Barra de filtros ativos com chips inline. Fuse.js com threshold mais restrito elimina falsos positivos. Garantia e carregamento: 4 campos novos na interface `Car` populados em todos os 88 carros; exibidos no modal e na página dedicada. Tempo estimado de recarga calculado por fórmula validada. SEO A2: `CarDetailPage.tsx` com rota `/carro/:slug`, JSON-LD Product por modelo, `404.html` hack para GitHub Pages sem servidor — permite indexação individual por modelo ("BYD Seal preço Brasil").

---

### Sprint 9 — semana de 07/04/2026
**Tema: Infraestrutura de recarga**
- ✅ Integrar dados abertos ANEEL (eletropostos)
- ✅ Mapa de calor por estado com Leaflet
- ✅ Filtro "suporta recarga rápida" cruzado com catálogo

> **Resumo técnico — Sprint 9 (01/04/2026):**
> S9-A: `fastChargeOnly` adicionado ao `FilterState`, toggle na sidebar (⚡ Recarga Rápida DC), chip na barra de filtros ativos, lógica `car.chargeDC != null`. S9-B/S9-C: `src/data/eletropostosData.ts` com 159 estações reais curadas (18 operadores: Shell Recharge, Electra, Tupinambá, Tesla, BYD, Zletric, Volvo Cars, WEG, Be Charge, EDP Smart, Itaipu, BMW Charging, Mercedes EQ, CPFL, Neoenergia, Copel EV, ChargeHouse, Porsche); cobertura todos os 27 estados + corredores de rodovias (Bandeirantes, Anhanguera, Fernão Dias, Dutra, Régis). `ChargingMapModal.tsx`: Leaflet dinâmico (import assíncrono), tiles CartoDB Dark Matter, `CircleMarker` por estação individual com raio proporcional à potência DC, popup dark-theme com links Google Maps + PlugShare, filtros de potência mínima e operador, legenda clicável, botão Mapa EV no header e na barra mobile. Bug de race condition corrigido com `mapReady` state — marcadores aparecem ao primeiro abrir.

---

### Sprint 11 — semana de 17/04/2026
**Tema: EV Route Planner**
- ✅ Planejador de rota EV completo — modal full-screen com mapa Leaflet (dark mode)
- ✅ Geocoding via Nominatim (autocomplete, debounce 600ms, countrycodes=br)
- ✅ Roteamento via OpenRouteService (ORS) — chave gratuita, rate limit 20 req/h
- ✅ Algoritmo guloso de paradas: projeta eletropostos na rota, para no mais distante alcançável
- ✅ 159 eletropostos DC ≥ 50 kW no dataset local (`eletropostosData.ts`)
- ✅ Status em tempo real via OpenChargeMap (OCM) — chave opcional
- ✅ Sliders de bateria: saída % / chegada % / autonomia por trecho (editável)
- ✅ Condições de viagem: temperatura × relevo × condução → multiplicador sobre autonomia
- ✅ Tempo estimado de carga por eletroposto (min/max DC do carro vs. potência do posto)
- ✅ kWh a carregar por parada + kWh total consumido na viagem
- ✅ % bateria ao chegar em cada parada e no destino
- ✅ Bidirecional mapa↔painel: clicar marcador → rola card; "ver no mapa" → flyTo + popup
- ✅ Aviso de tapering quando saída > 80% SoC
- ✅ kWh/100km do veículo exibido e editável; fator 0.93 (usável vs. bruto); alteração reseta autonomia
- ✅ kWh de chegada por parada calculado por trecho real (não % global fixo)
- ✅ Display de paradas simplificado: "Chega X% · Y kWh · Sai Z%" + linha de carga limpa
- ✅ Scroll mobile corrigido — body rola como coluna única, botão Calcular sempre acessível
- ✅ Mapa EV removido do menu mobile (permanece no header desktop)
- ✅ Seletor de cidades: 27 estados + ~120 cidades com match por nome, sigla (ex: "SP") ou parcial; agrupado por UF; Nominatim para demais
- ✅ SOC tracking real: `arrivalSocPct` / `departureSocPct` por parada (antes: sempre assumia 80% de saída)
- ✅ Chargers externos: OCM + OSM via `Promise.allSettled` (falha silenciosa); deduplicação por haversine < 200 m
- ✅ Recarga mínima útil: paradas com delta < 20 min de carga são expandidas até `departPct` (evita top-ups de 8 min)
- ✅ Overhead de parada: 8 min por parada (estacionamento, plug, autenticação) incluído no tempo exibido e no total
- ✅ Peugeot e-Expert e Citroën e-Jumpy: autonomia corrigida 258 → 330 km

> **Resumo técnico — Sprint 11 (17–27/04/2026):**
> Novos arquivos: `src/types/routePlanner.ts`, `src/utils/routeGeometry.ts` (haversine, segmentação, projeção gulosa), `src/services/{nominatimService,orsService,ocmService,overpassService}.ts`, `src/hooks/{useNominatimAutocomplete,useORSRoute,useRoutePlanner}.ts`, `src/utils/mergeChargers.ts`, `src/components/RoutePlannerModal.tsx`. Algoritmo central: projeta eletropostos dentro de `radiusKm` da polyline ORS, seleciona o mais distante alcançável (greedy) com rastreamento real de SoC. Look-ahead para calcular `minDepartSoc(nextSegmentKm)`; pass-through quando `arrivalSocPct ≥ departureSocPct`. Option A: `minUsefulSocDelta = ceil(chargeDC × 20min / battery_usable)` — delta menor que esse valor → `departureSocPct = departPct`. Option C: `STOP_OVERHEAD_MIN = 8` adicionado a cada parada e ao total. `consumptionPctPerKm = (departPct − arrivePct) / effectiveRangeKm`. 108 testes passando.

---

### Sprint 10 — semana de 07/04/2026
**Tema: SEO & Tráfego**
- ✅ Sitemap.xml dinâmico gerado em build-time (88 rotas /carro/:slug)
- ✅ Páginas de comparação SEO (/comparar/:slugA/:slugB) — 922 pares
- ✅ Sitemap submetido no Google Search Console e Bing Webmaster Tools
- ✅ Google Analytics 4 integrado (G-VNKWH74PL8)

> **Resumo técnico — Sprint 10 (03/04/2026):**
> `generate-sitemap.ts` na raiz do projeto: lê `CAR_DB`, gera `public/sitemap.xml` com 88 rotas `/carro/:slug` + 2 estáticas (`/` e `/privacidade`), `lastmod` = data do build, `priority` 1.0/0.8/0.3 por tipo. Integrado ao `npm run build` via `tsx generate-sitemap.ts && vite build` — sitemap sempre atualizado a cada deploy. `robots.txt` já existia e aponta para o sitemap.

---

#### Backlog (sem data)
- 🔲 Push notifications para favoritos (Cloudflare Workers)
- 🔲 App nativo via Capacitor _(Fase 2 — junto com backend)_
- 🔲 **White-label / licenciamento para terceiros** _(avaliar viabilidade antes de executar)_
  - Opção A: venda de fork customizado (setup único R$500–1.500 + suporte opcional)
  - Opção B: SaaS — cliente paga mensalidade, dados centralizados pelo criador (mais recorrente, sem transferir código)
  - Riscos: concorrência direta no mesmo mercado, custo de suporte pós-entrega, reputação ligada à qualidade do site do cliente
  - Pré-requisito técnico: `THEME.ts` centralizado + branch `white-label` limpa (estimado ~4h)
  - **Decisão pendente:** comparar ROI vs. plano de monetização atual (afiliados + leads + AdSense)
- 🔲 API pública documentada (B2B)
- 🔲 Newsletter "EletriBrasil Insider" no Substack
- ✅ **EV Route Planner** — concluído Sprint 11
- 🔲 Expansão: Argentina, Chile, Colômbia

---

## LLM Router — Decisão Arquitetural

### Contexto avaliado
O projeto usa Gemini 2.5 Flash Lite com chave fornecida pelo usuário (client-side).
Um LLM router direciona chamadas para diferentes modelos conforme complexidade/custo.

### Modelos avaliados

| Modelo | Input /1M | Latência | PT-BR | Free tier |
|---|---|---|---|---|
| Gemini 2.5 Flash Lite (atual) | $0,075 | ~600ms | ⭐⭐⭐⭐⭐ | ✅ AI Studio |
| Gemini 2.5 Flash | $0,30 | ~700ms | ⭐⭐⭐⭐⭐ | ✅ AI Studio |
| GPT-4o-mini | $0,15 | ~800ms | ⭐⭐⭐⭐⭐ | ❌ |
| Claude Haiku 4.5 | $0,80 | ~500ms | ⭐⭐⭐⭐ | ❌ |
| Groq — Llama 3.1 8B | $0,05 | ~100ms | ⭐⭐⭐ | ✅ generoso |
| Groq — Llama 3.3 70B | $0,59 | ~200ms | ⭐⭐⭐⭐ | ✅ limitado |
| Mistral Small 3.1 | $0,10 | ~500ms | ⭐⭐⭐⭐ | ✅ limitado |

### Decisão por fase

**Fase 1 — ❌ Não implementar**
Justificativas:
- O usuário fornece a própria chave diretamente do browser — não há intermediário para rotear
- Suporte a múltiplos providers exigiria múltiplas chaves do usuário (UX ruim) ou um backend (novo custo)
- Gemini Flash Lite é o melhor modelo free tier com PT-BR nativo — não há ganho real em trocar
- O quiz já foi otimizado para 1 chamada API (de 6 → 1) — principal ineficiência resolvida
- Com < 5.000 visitas/mês o custo é zero; otimizar LLM antes de ter tráfego é engenharia prematura

**Fase 2 — ✅ Implementar junto com o backend**
Quando a monetização exigir um backend (auth premium, push notifications, API B2B), o router entra no mesmo sprint com esforço adicional mínimo.
Stack recomendado: **LiteLLM** no Cloudflare Worker (free até 100k req/dia)

Routing planejado:
```
query simples (spec/preço)   →  Groq Llama 3.1 8B   (~$0,    ~100ms)
quiz / comparação            →  Gemini 2.5 Flash     (~$0,001, ~600ms)
análise complexa / TCO       →  GPT-4o-mini          (~$0,005, ~800ms)
fallback (modelo indisponível) →  próximo na fila     automático
```

Custo estimado com 10.000 conversas/mês: ~R$ 50–150 — absorvível pela receita de leads/AdSense.

**Meio-termo opcional — ⚠️ OpenRouter como 2º provider**
Adicionar OpenRouter como alternativa na tela de configurações do chat.
- Usuário fornece uma chave OpenRouter (free tier disponível)
- Router interno deles faz dispatch entre modelos automaticamente
- Esforço: ~4 horas | Ganho: fallback automático, acesso a modelos abertos
- Prioridade: baixa para Fase 1

### Regra de decisão
> Construa o backend quando a monetização exigir. Adicione o LLM router no mesmo sprint. Não inverta a ordem.
