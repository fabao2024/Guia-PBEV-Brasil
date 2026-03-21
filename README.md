<div align="center">
<img width="1200" alt="Guia PBEV Banner" src="public/repo-banner.png" />
</div>

# Guia PBEV Brasil — Catálogo Oficial de Elétricos & IA

**[🇺🇸 English](#-english) | [🇧🇷 Português](#-português)**

> Site oficial: **[guiapbev.cloud](https://guiapbev.cloud)**

---

## 🇧🇷 Português

### Visão Geral

Progressive Web App (PWA) para o mercado de veículos elétricos (BEV) no Brasil. Catálogo interativo com dados oficiais PBEV/INMETRO, assistente IA especializado (Gemini), simulador de economia e calculadora de TCO.

### Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 📋 Catálogo | 88 modelos BEV com filtros por preço, autonomia, categoria, marca e tração |
| 🔍 Busca full-text | Busca instantânea por modelo, marca ou categoria (Fuse.js, tolerante a erros) |
| ⚖️ Comparação | Comparativo lado a lado de até 3 veículos |
| 💰 Simulador de Economia | Calcula economia mensal vs. combustão com IPVA real por estado |
| 📊 TCO 4 anos | Custo total de propriedade: energia, seguro, manutenção, IPVA e depreciação |
| 🤖 Assistente IA | Chat especializado em EVs com dados PBEV (Gemini 2.5 Flash Lite) |
| 🏆 Quiz de Recomendação | Recomenda o EV ideal por perfil — 100% offline, sem chave de API |
| 🏅 Certificação PBE | Rating PBE/INMETRO (A–E) e consumo em MJ/km por modelo |
| 🧾 IPVA 2026 | Calculadora de IPVA nos 27 estados com isenções para EVs |
| 📱 PWA | Instalável no Android e iOS, funciona como app nativo |
| 🌐 Bilíngue | Interface completa em PT-BR e EN com toggle e persistência |
| ❤️ Favoritos | Lista de favoritos com persistência em localStorage |

### Stack Tecnológica

- **Framework**: React 19 + TypeScript (strict, ES2022)
- **Build**: Vite 6 — deploy automático via GitHub Actions
- **Estilos**: Tailwind CSS 4
- **IA**: Google Generative AI SDK (`gemini-2.5-flash-lite`)
- **i18n**: i18next + react-i18next (PT-BR padrão, EN)
- **Testes**: Vitest 4 + Testing Library + happy-dom (70 testes)
- **Segurança**: Sanitização XSS, rate limiting, detecção de prompt injection (12 padrões)

### Instalação e Execução Local

**Pré-requisitos:** Node.js 18+, npm, Git

```bash
# 1. Clonar o repositório
git clone https://github.com/fabao2024/Guia-PBEV-Brasil.git
cd Guia-PBEV-Brasil

# 2. Instalar dependências
npm install

# 3. Configurar chave de API (opcional — só necessária para o chat IA)
echo "VITE_GEMINI_API_KEY=sua_chave_aqui" > .env.local

# 4. Iniciar servidor de desenvolvimento
npm run dev
# Acesse: http://localhost:3000
```

> **Sem chave de API:** o catálogo, simulador, TCO e quiz funcionam normalmente. Apenas o chat IA requer a chave (usuário pode inserir a própria no site).

### Comandos Disponíveis

```bash
npm run dev           # Servidor local (porta 3000)
npm run build         # Build de produção
npm run test:run      # Rodar todos os 70 testes
npm run test          # Modo watch
npm run test:coverage # Relatório de cobertura
npm run preview       # Preview do build de produção
```

### Chave Gemini no Site Público

No [guiapbev.cloud](https://guiapbev.cloud), usuários inserem sua própria chave gratuita:

1. Clique em **Consultor IA** (canto inferior direito)
2. Clique em **"Obter Chave Gratuita"** → [Google AI Studio](https://aistudio.google.com/app/apikey)
3. Crie uma chave, cole no campo e clique em **Salvar**

> A chave fica armazenada **apenas no seu navegador** (localStorage) — nunca é enviada a nenhum servidor nosso.

### Métricas Atuais

- **89 veículos** BEV cadastrados (27 marcas)
- **54 modelos** com certificação PBE/INMETRO oficial
- **27 estados** com dados de IPVA 2026 e tarifas ANP/ANEEL
- **70 testes** automatizados em 7 suítes
- **Build**: ~5s (Vite/ESBuild)

### Deploy

O deploy é automático via GitHub Actions a cada push na branch `main`. Para detalhes de infraestrutura (Docker, Cloud Run), ver [DEPLOY.md](DEPLOY.md).

### Licença

[Creative Commons BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) — uso não-comercial permitido com atribuição. Uso comercial requer autorização prévia.

---

## 🇺🇸 English

### Overview

Progressive Web App (PWA) for the Brazilian Electric Vehicle (BEV) market. Interactive catalog with official PBEV/INMETRO data, specialized AI assistant (Gemini), savings simulator and TCO calculator.

### Features

| Feature | Description |
|---|---|
| 📋 Catalog | 89 BEV models with filters by price, range, category, brand and drivetrain |
| 🔍 Full-text Search | Instant search by model, brand or category (Fuse.js, typo-tolerant) |
| ⚖️ Comparison | Side-by-side comparison of up to 3 vehicles |
| 💰 Savings Simulator | Monthly savings vs. combustion with real state IPVA tax |
| 📊 4-year TCO | Total cost of ownership: energy, insurance, maintenance, IPVA and depreciation |
| 🤖 AI Assistant | EV-specialized chat with PBEV data (Gemini 2.5 Flash Lite) |
| 🏆 Recommendation Quiz | Recommends the ideal EV by profile — 100% offline, no API key needed |
| 🏅 PBE Certification | PBE/INMETRO rating (A–E) and energy consumption in MJ/km per model |
| 🧾 IPVA 2026 | Vehicle tax calculator across all 27 Brazilian states with EV exemptions |
| 📱 PWA | Installable on Android and iOS, works as a native app |
| 🌐 Bilingual | Full PT-BR and EN interface with toggle and persistence |
| ❤️ Favorites | Favorites list with localStorage persistence |

### Tech Stack

- **Framework**: React 19 + TypeScript (strict, ES2022)
- **Build**: Vite 6 — automated deploy via GitHub Actions
- **Styling**: Tailwind CSS 4
- **AI**: Google Generative AI SDK (`gemini-2.5-flash-lite`)
- **i18n**: i18next + react-i18next (PT-BR default, EN)
- **Testing**: Vitest 4 + Testing Library + happy-dom (70 tests)
- **Security**: XSS sanitization, rate limiting, prompt injection detection (12 patterns)

### Local Setup

**Prerequisites:** Node.js 18+, npm, Git

```bash
# 1. Clone the repository
git clone https://github.com/fabao2024/Guia-PBEV-Brasil.git
cd Guia-PBEV-Brasil

# 2. Install dependencies
npm install

# 3. Configure API key (optional — only needed for AI chat)
echo "VITE_GEMINI_API_KEY=your_key_here" > .env.local

# 4. Start development server
npm run dev
# Open: http://localhost:3000
```

> **Without an API key:** catalog, simulator, TCO and quiz work normally. Only the AI chat requires a key (users can enter their own on the site).

### Available Commands

```bash
npm run dev           # Local server (port 3000)
npm run build         # Production build
npm run test:run      # Run all 70 tests
npm run test          # Watch mode
npm run test:coverage # Coverage report
npm run preview       # Preview production build
```

### Current Metrics

- **89 BEV vehicles** registered (27 brands)
- **54 models** with official PBE/INMETRO certification
- **27 states** with 2026 IPVA data and ANP/ANEEL tariffs
- **70 automated tests** across 7 suites
- **Build time**: ~5s (Vite/ESBuild)

### Deployment

Automated via GitHub Actions on every push to `main`. For infrastructure details (Docker, Cloud Run), see [DEPLOY.md](DEPLOY.md).

### License

[Creative Commons BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) — non-commercial use allowed with attribution. Commercial use requires prior authorization.
