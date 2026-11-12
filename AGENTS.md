# AGENTS.md · Guia PBEV Brasil

Public frontend of `guiapbev.cloud`, deployed to GitHub Pages. Read `CLAUDE.md` for canonical development rules and `ROADMAP.md` before changes; use TDD for functional changes.

## Hard constraints

- Public repo only: no admin dashboards, personal/partner data, private matching rules, credentials, IPs, personal paths, cron jobs or infra runbooks — not in code, not in `ROADMAP.md`/`DEVLOG.md`, not in commit messages.
- Every `VITE_*` value is bundled into the browser. Never store secrets in it; `npm run build` ends with a secrets scanner over `dist/` that fails the build on credential-like content (see `tools/check-dist-secrets.mjs`).
- Personal-data forms require explicit consent and a versioned public API contract; backend implementation stays outside this repo.

## Commands

- Use Node 22 and `npm ci` to match CI; README's Node 18 prerequisite is stale.
- `npm run test:run` — full suite; `npm run test` for watch mode. Focus a file with `npm run test:run -- src/__tests__/constants.test.ts`; append `-t "test name"` to filter tests.
- `npx tsc --noEmit` — separate typecheck; the build does not run it. There is no `typecheck` or `lint` script; don't guess either command.
- `npm run build` — chained: `tsx generate-sitemap.ts && vite build && node tools/create-static-route-pages.mjs && node tools/check-dist-secrets.mjs`. Run tests + build before committing.
- `npm run dev` uses port 3000.

## Generated files — never hand-edit

- `generate-sitemap.ts` generates committed `public/data/cars.json` and `public/sitemap.xml` from `CAR_DB`, and updates catalog/brand metrics in `README.md`. Builds refresh JSON timestamps and sitemap dates; inspect diffs and restore only incidental changes you introduced, preserving pre-existing work.
- `tools/create-static-route-pages.mjs` generates `/parceiros/`, `/metodologia/`, and one `/carro/<slug>/` page per vehicle. Comparison routes remain client-only; do not add them to the sitemap without a matching static-page loop and verified direct HTTP fallback.
- `/interesse/` is generated only when `VITE_ENABLE_LEAD_CAPTURE=true`. Keep the flag consistent in `generate-sitemap.ts`, `tools/create-static-route-pages.mjs`, and `src/config/leadCapture.ts`; the Node build scripts read the process environment, not Vite's `.env` loader.

## Catalog data

- Source of truth is `CAR_DB` in `src/constants.ts` plus `src/constants/` (state IPVA, fuel/electricity prices, price history, `catalogEvidence.ts`), not the generated JSON.
- `src/__tests__/constants.test.ts` validates CAR_DB invariants; a sloppy catalog edit breaks tests before it breaks the build.
- Per-field provenance lives in `.github/data/catalog-provenance.json` and is validated against `public/data/cars.json` by `node .github/scripts/check-catalog-provenance.mjs` (run it after `npm run build`). Catalog updates recorded in `DEVLOG.md` always include this check.
- `.claude/commands/add-vehicle.md` documents the add-vehicle workflow (CAR_DB entry, `BRAND_URLS`, image in `public/car-images/` following the mandatory photo standard, i18n category keys, README metrics, tests, build).
- For image changes, use official manufacturer photography matching the vehicle version; follow the photo standard in that workflow. With Pillow 12.3.0 and WebP support, run `python tools/generate-car-images.py`, then the same command with `--check`. This is separate from `npm run build`; generated WebP assets, `public/car-images/optimized/manifest.json`, and `src/utils/carImageManifest.ts` are committed, not hand-edited.
- README feature/test counts can drift; only catalog/brand metrics are updated by the generator. Do not copy counts into instructions.

## Repo layout gotchas

- Root `scripts/`, `docs/internal/`, `tools/internal/`, `*.private.md`, `*.internal.md`, `.env*` and `.maintenance-results/` are gitignored local material — files placed there are invisible to git. Don't put public code in `scripts/`.
- `@` alias resolves to `src/` (set in `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`).
- Routing uses `BrowserRouter` in `src/index.tsx` and routes in `src/App.tsx`. Preserve the GitHub Pages path/query restoration in `src/index.tsx` when changing routing.
- Vitest uses globals and happy-dom; `src/test/setup.ts` clears localStorage/sessionStorage after each test and installs `matchMedia`/`IntersectionObserver` mocks.
- External APIs (Nominatim, OCM, ORS, Overpass, leads API) are thin public HTTP contracts in `src/services/` and `src/utils/leads.ts`; keep server-side logic out of this repo.

## Git / deploy

- `main` is the public source of truth and auto-deploys. Before pushing: `git pull --rebase origin main`; no force push or merge commits on `main`; push right after each approved commit.
- CI (`.github/workflows/deploy.yml`) runs `npm ci` → `test:run` → `build`, then asserts `dist/` contains `index.html`, `404.html`, `parceiros/index.html`, `sitemap.xml`, `data/cars.json` and a `CNAME` reading `guiapbev.cloud`.
- `.github/workflows/monthly-maintenance.yml` runs fail-closed data collectors (ANP prices, PBEV update, ANEEL tariffs, EV news, brand links, provenance) — their failure means the data needs attention, not a workflow retry.
