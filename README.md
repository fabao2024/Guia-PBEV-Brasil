<div align="center">
<img width="1200" alt="Guia PBEV Banner" src="public/repo-banner.png" />
</div>

# Guia PBEV 2025 - EV Catalog & AI Assistant / Catálogo de VEs e Assistente IA

**[🇺🇸 English](#-english-instructions) | [🇧🇷 Português](#-instruções-em-português)**

---

## 🇺🇸 English Instructions

### 1. Project Overview
A Progressive Web App (PWA) for the Brazilian Electric Vehicle market, featuring a high-performance interactive catalog and a specialized LLM-based virtual assistant (Gemini).

### 2. Tools & Prerequisites
To reproduce/run this project, you need the following tools installed on your system:

- **Operating System**: Windows 10/11, macOS, or Linux.
- **Node.js**: Version 18.0 or higher. [Download Here](https://nodejs.org/)
- **Package Manager**: `npm` (included with Node.js) or `pnpm`/`yarn`.
- **Code Editor**: [Visual Studio Code](https://code.visualstudio.com/) (Recommended).
- **Git**: For cloning the repository. [Download Here](https://git-scm.com/)
- **Browser**: Chrome, Edge, or Firefox (latest versions).
- **API Key**: A valid Google Gemini API Key. [Get it here](https://aistudio.google.com/app/apikey)

### 3. Step-by-Step Installation

**Step 1: Get the Code**
Clone the repository to your local machine:
```bash
git clone <repository-url>
cd Guia-PBEV-Brasil
```

**Step 2: Install Dependencies**
Open the folder in your terminal (or VS Code) and run:
```bash
npm install
```

**Step 3: Environment Setup**
Create a file named `.env.local` in the root folder:
```env
VITE_GEMINI_API_KEY=your_api_key_here
```
*Note: Replace `your_api_key_here` with your actual Google Gemini API key.*

**Step 4: Run Tests (Optional)**
```bash
npm run test:run
```

**Step 5: Run Local Server**
Start the development server:
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Technical Stack
- **Framework**: React 19 + TypeScript
- **Build**: Vite 6
- **Styling**: Tailwind CSS 4
- **AI**: Google Gemini SDK (using `gemini-2.5-flash-lite`)
- **i18n**: i18next + react-i18next (Portuguese / English)
- **Testing**: Vitest + Testing Library + happy-dom (57 tests)
- **Security**: Input sanitization, XSS protection (react-markdown), rate limiting, prompt injection detection

### 5. Deployment & Public URL
For detailed deployment instructions, seeing **[DEPLOY.md](DEPLOY.md)**.

**Options:**
1.  **GitHub Pages**: Automated, Free, **Static Only (No AI)**. [Live Demo](https://fabao2024.github.io/Guia-PBEV-Brasil/)
2.  **Google Cloud Run**: Full features (includes AI), Containerized.

**Quick Cloud Run Command:**
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/guia-pbev .
gcloud run deploy guia-pbev --image gcr.io/PROJECT_ID/guia-pbev --platform managed --allow-unauthenticated
```

### 6. Project Metrics
- **Performance**: ~4s build time (Vite/ESBuild)
- **Database**: 73 Vehicles registered (10+ brands)
- **Assets**: 73 Local optimized images (real car photos)
- **AI Model**: Gemini 2.5 Flash Lite (Verified)
- **Tests**: 57 tests across 7 test suites
- **i18n**: 2 languages (PT-BR, EN)

---

## 🇧🇷 Instruções em Português

### 1. Visão Geral
Aplicação Web Progressiva (PWA) desenvolvida para o mercado de carros elétricos (BEV) no Brasil, combinando um catálogo interativo e um assistente virtual especialista (Gemini).

### 2. Ferramentas e Pré-requisitos
Para reproduzir ou executar este projeto, você precisa das seguintes ferramentas instaladas:

- **Sistema Operacional**: Windows 10/11, macOS ou Linux.
- **Node.js**: Versão 18.0 ou superior. [Baixar Aqui](https://nodejs.org/)
- **Gerenciador de Pacotes**: `npm` (vem com Node.js), `pnpm` ou `yarn`.
- **Editor de Código**: [Visual Studio Code](https://code.visualstudio.com/) (Recomendado).
- **Git**: Para clonar o repositório. [Baixar Aqui](https://git-scm.com/)
- **Navegador**: Chrome, Edge ou Firefox (versões recentes).
- **Chave de API**: Uma chave válida do Google Gemini. [Obtenha aqui](https://aistudio.google.com/app/apikey)

### 3. Instalação Passo a Passo

**Passo 1: Baixar o Código**
Clone o repositório em sua máquina:
```bash
git clone <url-do-repositorio>
cd Guia-PBEV-Brasil
```

**Passo 2: Instalar Dependências**
Abra a pasta no terminal (ou VS Code) e execute:
```bash
npm install
```

**Passo 3: Configuração de Ambiente**
Crie um arquivo chamado `.env.local` na raiz do projeto:
```env
VITE_GEMINI_API_KEY=sua_chave_api_aqui
```
*Nota: Substitua `sua_chave_api_aqui` pela chave real que você gerou no Google AI Studio.*

**Passo 4: Executar Testes (Opcional)**
```bash
npm run test:run
```

**Passo 5: Iniciar Servidor Local**
Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
Acesse no seu navegador: `http://localhost:5173`.

### 4. Stack Tecnológica
- **Framework**: React 19 + TypeScript
- **Build**: Vite 6
- **Estilos**: Tailwind CSS 4
- **IA**: Google Gemini SDK (usando `gemini-2.5-flash-lite`)
- **i18n**: i18next + react-i18next (Português / Inglês)
- **Testes**: Vitest + Testing Library + happy-dom (57 testes)
- **Segurança**: Sanitização de input, proteção XSS (react-markdown), rate limiting, detecção de prompt injection

### 5. Deploy & URL Pública
Para instruções detalhadas de deploy, consulte o arquivo **[DEPLOY.md](DEPLOY.md)**.

**Opções:**
1.  **GitHub Pages**: Automatizado, Grátis, **Apenas Estático (Sem IA)**. [Demo em Tempo Real](https://fabao2024.github.io/Guia-PBEV-Brasil/)
2.  **Google Cloud Run**: Completo (inclui IA), Containerizado.

**Comando Rápido Cloud Run:**
```bash
gcloud builds submit --tag gcr.io/ID_DO_PROJETO/guia-pbev .
gcloud run deploy guia-pbev --image gcr.io/ID_DO_PROJETO/guia-pbev --platform managed --allow-unauthenticated
```

### 6. Métricas do Projeto
- **Performance**: Tempo de build de ~4s (Vite/ESBuild)
- **Banco de Dados**: 73 Veículos registrados (10+ marcas)
- **Assets**: 73 Imagens locais otimizadas (fotos reais)
- **Modelo IA**: Gemini 2.5 Flash Lite (Verificado)
- **Testes**: 57 testes em 7 suítes
- **i18n**: 2 idiomas (PT-BR, EN)
