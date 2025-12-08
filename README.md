<div align="center">
<img width="1200" alt="Guia PBEV Banner" src="public/repo-banner.png" />
</div>

# Guia PBEV 2025 - Catálogo & Assistente IA

Aplicação web progressiva (PWA compliant) desenvolvida para o mercado automotivo brasileiro, focada em veículos elétricos (BEV) do Programa Brasileiro de Etiquetagem Veicular 2025. O projeto combina um catálogo interativo de alta performance com um assistente virtual baseado em LLM.

## 🚀 Arquitetura & Design System

O projeto adota uma arquitetura **Client-Side Rendering (CSR)** otimizada para velocidade e SEO-friendly (via metadados estruturados).

- **Local First Asset Strategy**: Para garantir confiabilidade e performance (LCP), todas as imagens dos veículos são servidas localmente via diretório `public/car-images`. Isso elimina dependências de CDNs externas instáveis e evita problemas de Hotlink Block (403).
- **Hybrid Image Loading**: Componentes inteligentes (`CarCard.tsx`) detectam a origem da imagem:
  - **Local**: Carregamento direto (Zero-Latency) via servidor estático do Vite.
  - **External**: Fallback com proxy de otimização (`weserv.nl`) para redimensionamento e conversão para WebP on-the-fly.
- **State Management**: Gerenciamento de estado leve via React Hooks customizados (`useFilters`, `useFavorites`) persistindo dados em `localStorage`.

## 🛠️ Stack Tecnológica

### Core
- **Runtime**: Node.js (v18+)
- **Framework**: React 19 (Functional Components + Hooks)
- **Language**: TypeScript 5.0 (Strict Typing)
- **Build Tool**: Vite 5 (ESBuild)

### UI/UX
- **Styling**: Tailwind CSS 3.4 (Utility-first)
- **Icons**: Lucide React
- **Animations**: CSS Transitions & Transform (Hardware Accelerated)

### Inteligência Artificial
- **Engine**: Google Gemini 2.5 Flash (Latest)
- **Integration**: Google Generative AI SDK (`@google/generative-ai`)
- **Features**: Context-aware Chatbot com conhecimento do catálogo (`CAR_DB`).

## 📂 Estrutura do Projeto

```
/
├── public/
├── scripts/           # Ferramentas de diagnóstico (list_models.js)
│   └── car-images/    # Repositório imutável de assets (JPEG/WebP/AVIF)
├── src/
│   ├── components/    # Componentes UI Autônomos (CarCard, Modal, ChatWidget)
│   ├── hooks/         # Lógica de Negócio (useComparison, useChat)
│   ├── types/         # Definições de Interfaces (Car, FilterState)
│   ├── constants.ts   # Single Source of Truth (Database JSON Mock)
│   ├── App.tsx        # Entry Point & Layout Composition
│   └── main.tsx       # React DOM Hydration
├── download_final.ps1 # Script de Automação (PowerShell) para download de assets
└── vite.config.ts     # Configuração do Bundler
```

## ⚡ Instalação e Execução

### Pré-requisitos
- Node.js & npm/yarn/pnpm
- PowerShell (para scripts de manutenção)

### Setup Inicial

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   VITE_GEMINI_API_KEY=sua_chave_api_aqui
   ```

3. **Popule o Banco de Imagens (Opcional):**
   Caso as imagens locais não estejam presentes, execute o script de automação:
   ```powershell
   ./download_final.ps1
   ```

4. **Inicie o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse via: `http://localhost:5173`

## 🔧 Manutenção do Catálogo

Para adicionar novos carros:
1. Adicione a entrada JSON em `src/constants.ts`.
2. Salve a imagem do veículo em `public/car-images/` (preferencia WebP/JPG < 100KB).
3. Referencie o caminho local na propriedade `img` (ex: `/car-images/novo-carro.jpg`).

---
**Status**: Produção (v1.2.0)
**License**: MIT
