<div align="center">
<img width="1200" alt="Guia PBEV Banner" src="public/repo-banner.png" />
</div>

# Guia PBEV 2025 - Catalog & AI Assistant

Progressive Web App (PWA compliant) developed for the Brazilian automotive market, focused on Battery Electric Vehicles (BEV) from the 2025 Brazilian Vehicle Labeling Program (PBEV). The project combines a high-performance interactive catalog with an LLM-based virtual assistant.

## 🚀 Architecture & Design System

The project adopts a **Client-Side Rendering (CSR)** architecture optimized for speed and SEO-friendliness (via structured metadata).

- **Local First Asset Strategy**: To ensure reliability and performance (LCP), all vehicle images are served locally via the `public/car-images` directory. This eliminates unstable external CDN dependencies and prevents Hotlink Block (403) issues.
- **Hybrid Image Loading**: Intelligent components (`CarCard.tsx`) detect image origin:
  - **Local**: Direct loading (Zero-Latency) via Vite static server.
  - **External**: Fallback with optimization proxy (`weserv.nl`) for on-the-fly resizing and WebP conversion.
- **State Management**: Lightweight state management via custom React Hooks (`useFilters`, `useFavorites`) persisting data in `localStorage`.

## 🛠️ Tech Stack

### Core
- **Runtime**: Node.js (v18+)
- **Framework**: React 19 (Functional Components + Hooks)
- **Language**: TypeScript 5.0 (Strict Typing)
- **Build Tool**: Vite 5 (ESBuild)

### UI/UX
- **Styling**: Tailwind CSS 3.4 (Utility-first)
- **Icons**: Lucide React
- **Animations**: CSS Transitions & Transform (Hardware Accelerated)

### Artificial Intelligence
- **Engine**: Google Gemini 2.5 Flash (Latest)
- **Integration**: Google Generative AI SDK (`@google/generative-ai`)
- **Features**: Context-aware Chatbot with catalog knowledge (`CAR_DB`).

## 📂 Project Structure

```
/
├── public/
├── scripts/           # Diagnostic tools (list_models.js)
│   └── car-images/    # Immutable asset repository (JPEG/WebP/AVIF)
├── src/
│   ├── components/    # Autonomous UI Components (CarCard, Modal, ChatWidget)
│   ├── hooks/         # Business Logic (useComparison, useChat)
│   ├── types/         # Interface Definitions (Car, FilterState)
│   ├── constants.ts   # Single Source of Truth (Database JSON Mock)
│   ├── App.tsx        # Entry Point & Layout Composition
│   └── main.tsx       # React DOM Hydration
├── download_final.ps1 # Automation Script (PowerShell) for asset download
└── vite.config.ts     # Bundler Configuration
```

## ⚡ Installation and Execution

### Prerequisites
- Node.js & npm/yarn/pnpm
- PowerShell (for maintenance scripts)

### Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the project root:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

3. **Populate Image Bank (Optional):**
   If local images are missing, execute the automation script:
   ```powershell
   ./download_final.ps1
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Access via: `http://localhost:5173`

## 🔧 Catalog Maintenance

To add new cars:
1. Add JSON entry in `src/constants.ts`.
2. Save vehicle image in `public/car-images/` (prefer WebP/JPG < 100KB).
3. Reference local path in `img` property (e.g., `/car-images/new-car.jpg`).

---
**Status**: Production (v1.2.0)
**License**: MIT
