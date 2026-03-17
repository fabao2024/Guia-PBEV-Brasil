# CLAUDE.md — Guia PBEV Brasil

## Project Overview
Progressive Web App (PWA) for the Brazilian Electric Vehicle market. Interactive catalog of 86 BEVs with AI chatbot (Gemini), bilingual UI (PT-BR/EN), comparison, favorites, and smart filters.

## Tech Stack
- **Framework**: React 19 + TypeScript (strict, ES2022)
- **Build**: Vite 6 — base path `/Guia-PBEV-Brasil/` for GitHub Pages
- **Styling**: Tailwind CSS 4 + PostCSS + Autoprefixer
- **AI**: Google Generative AI SDK (`gemini-2.5-flash-lite`)
- **i18n**: i18next + react-i18next (PT-BR default, EN)
- **Testing**: Vitest 4 + Testing Library + happy-dom
- **Icons**: lucide-react

## Commands
```bash
npm run dev          # Dev server (port 3000)
npm run build        # Production build (~4s)
npm run test:run     # Run all 70 tests once
npm run test         # Watch mode
npm run test:coverage # Coverage report (v8)
npm run preview      # Preview production build
```

## Project Structure
```
src/
├── components/          # React components
│   ├── App.tsx          # Main layout, state orchestration
│   ├── CarCard.tsx      # Vehicle card with compare/favorite
│   ├── CarDetailsModal.tsx  # Full vehicle details popup
│   ├── ChatWidget.tsx   # AI chatbot + API key setup screen
│   ├── ComparisonModal.tsx  # Side-by-side comparison (max 3)
│   ├── LanguageToggle.tsx   # PT/EN toggle button
│   ├── Sidebar.tsx      # Filters: price, range, category, brand
│   ├── AdvancedFiltersModal.tsx # Full-screen filter panel (brand, price, range, traction, category)
│   └── SavingsSimulatorModal.tsx # Annual savings calculator vs. gasoline; sliders for km/yr, gas price, AC/DC charging rates + DC%, blended rate calc (default export — unlike others)
├── hooks/
│   ├── useCarFilter.ts  # Filter state (price, range, categories, brands)
│   ├── useCompare.ts    # Comparison list (max 3 cars)
│   ├── useFavorites.ts  # Favorites with localStorage persistence
│   └── useRateLimit.ts  # Sliding window rate limiter (10 req/60s)
├── i18n/
│   ├── index.ts         # i18next config, language persistence
│   └── locales/
│       ├── pt-BR.json   # Portuguese translations (~145 keys)
│       └── en.json      # English translations (~145 keys)
├── utils/
│   └── sanitize.ts      # Input sanitization, XSS & prompt injection detection
├── constants.ts         # CAR_DB (73 vehicles), BRAND_URLS (26 brands)
├── types.ts             # Car, FilterState, ChatMessage interfaces
├── index.tsx            # React root + i18n import
└── index.css            # Global styles
```

## Key Patterns & Conventions

### i18n
- All user-facing strings use `t('namespace.key')` from `useTranslation()`
- Translation keys organized by component: `header.*`, `sidebar.*`, `card.*`, `details.*`, `chat.*`, `comparison.*`, `empty.*`, `footer.*`, `simulator.*`, `advancedFilters.*`
- Arrays (feature lists) use `t('key', { returnObjects: true }) as string[]`
- Category translation: `t(\`categories.${car.cat}\`)` — maps data values (Urbano, Compacto, SUV, Sedan, Luxo, Comercial) to display labels
- Language saved to `localStorage('lang')`, defaults to `pt-BR`

### Images
- Local images in `public/car-images/` (90 optimized files)
- Path format in data: `/car-images/filename.jpg`
- At render time, prepend `import.meta.env.BASE_URL`: `${import.meta.env.BASE_URL}${car.img.substring(1)}`
- This is required for GitHub Pages where base path is `/Guia-PBEV-Brasil/`
- After downloading: always run `file` to verify format — browsers save AVIF/WebP with `.jpg` extension; rename and update `img` in constants.ts
- Windows Explorer saves may have spaces in filenames — check with `ls | grep " "` and rename before committing
- **Wikimedia 429/403**: use `images.weserv.nl/?url=upload.wikimedia.org/...&w=800&output=jpg` as proxy

### Image CDN Sources
- **BMW**: `bmw.scene7.com/is/image/BMW/...?fmt=webp` or `prod.cosy.bmw.cloud/connext-bmw/cosySec?...`
- **Audi**: `emea-dam.audi.com/adobe/assets/urn:aaid:aem:.../as/file.jpg?width=1440`
- **BYD Brazil**: `byd.com/content/dam/byd-site/br/product/{model}/...`
- **Renault Brazil**: `cdn.group.renault.com/ren/br/...`
- **GAC Brazil**: `br-www-resouce-cdn.gacgroup.com/static/BR/...`
- **Zeekr Brazil**: scrape `zeekrlife.com/pt-br/models/{model}` → URLs at `datocms-assets.com/146515/...`
- **Mercedes EU CDN** and **Ford Brazil CDN**: geo-block/403 all non-browser requests — user must save manually via browser

### AI Chatbot (ChatWidget.tsx)
- API key resolution: `import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini-api-key')`
- On localhost: uses `.env.local` key automatically
- On GitHub Pages: shows setup screen for users to paste their own free Gemini key
- Chat session resets when language or API key changes
- System prompt is bilingual — switches based on `i18n.language`
- `buildCarSummary(lang)` injects full vehicle database into the prompt

### Security
- `sanitizeChatInput()`: strips HTML, trims, enforces 1000 char limit
- `validateChatInput()`: min 2 chars, max 1000, detects 12 prompt injection patterns
- Rate limiting via `useRateLimit` hook (default 10 req/60s)
- react-markdown for safe rendering of AI responses

### Data
- `CAR_DB` in `constants.ts`: 86 Car objects with model, brand, price, range, cat, img, power?, torque?, traction?
- `traction` values: `'FWD' | 'RWD' | 'AWD'` (optional; bulk-assigned via one-off `add_traction.js` script)
- `BRAND_URLS`: maps brand names to official Brazilian websites
- Categories: `Urbano`, `Compacto`, `SUV`, `Sedan`, `Luxo`, `Comercial`
- Prices in BRL (R$), range in km (PBEV/Inmetro certified)

## Testing
- Tests live in `__tests__/` folders next to source files
- Setup file: `src/test/setup.ts` (mocks: matchMedia, IntersectionObserver, localStorage cleanup)
- i18n mock: tests mock `react-i18next` with passthrough `t(key)` function
- 7 test suites, 70 tests total

## Deployment
- **GitHub Pages**: automated via `.github/workflows/deploy.yml` on push to `main`
- **Docker/Cloud Run**: `Dockerfile` + `nginx.conf` available
- No `VITE_ENABLE_AI` flag — chatbot always renders (setup screen handles missing key)

## Environment Variables
```env
VITE_GEMINI_API_KEY=your_key   # Optional on GitHub Pages (users provide their own)
```

## Workflow Rules
- **Before starting any task**, read `ROADMAP.md` and check:
  1. Is this already built? (✅ in status table or sprint) — if yes, say so and do not duplicate.
  2. Is this a variation of something already built? — if yes, treat it as an enhancement to the existing item, not a new one.
  3. Is this genuinely new? — if yes, add it to the backlog or current sprint before building.
- **After completing any task that changes code**, update both files automatically (no need to be asked):
  - `ROADMAP.md`: mark items ✅, add a `> Resumo técnico` block to the current sprint, update the status table if applicable.
  - `DEVLOG.md`: append a new entry under the current sprint using the template below. Always fill all 4 rows (Dev / Build / Testes / Commit). Use ✅ / ⚠️ / ❌ / — per the legend in DEVLOG.md.

### DEVLOG entry template
```markdown
### [SX.Y-ID] Short description · DD/MM/YYYY

| Etapa  | Status | Detalhe |
|--------|--------|---------|
| Dev    | ✅ | What was built / changed |
| Build  | ✅ | `npm run build` result |
| Testes | ✅ | Manual or automated — what was verified |
| Commit | ✅ | `<hash>` |

**Notas:** (optional — gotchas, follow-ups, decisions)
```

## Gotchas
- Windows bash paths: use `/c/Users/...` not `C:\Users\...`
- GitHub Pages base path: always use `import.meta.env.BASE_URL` for asset URLs
- `car.cat` stores Portuguese category names — always translate with `t(\`categories.${car.cat}\`)`
- `.env.local` is gitignored (pattern `*.local`) — rename to `.env.local.bak` to test the API key setup screen locally
- Brand/accent color is `#00b4ff` (neon cyan, RGB `0,180,255`) — use for interactive highlights and hover states
- Use `.custom-scrollbar-dark` class on scrollable containers for consistent dark-mode scrollbars
- `SavingsSimulatorModal` uses `export default` — all other components use named exports
- One-off Node.js scripts at project root (`add_traction.js`, `replace.js`) used for bulk data edits; safe to delete after use
- PBEV reference table at project root: `Tabela PBEV 2026_27_FEV-REV05 (2).pdf` — 146 EVs; read with `pdfplumber` (`pip install pdfplumber`); filter col 5 case-insensitive for `'elétrico'`
