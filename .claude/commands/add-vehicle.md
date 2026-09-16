# Add Vehicle to Catalog

Add a new electric vehicle to the PBEV 2025 catalog. The user will provide the vehicle details as: $ARGUMENTS

## Steps

1. **Parse vehicle info** from the user input. Required fields:
   - `model` (string) — e.g. "Model Y"
   - `brand` (string) — e.g. "Tesla"
   - `price` (number) — in BRL, e.g. 299990
   - `range` (number) — PBEV range in km, e.g. 455
   - `cat` (string) — one of: `Compacto`, `SUV`, `Sedan`, `Luxo`, `Comercial`
   - `img` (string) — local path like `/car-images/model-y.jpg`
   - `power` (number, optional) — in cv
   - `torque` (number, optional) — in kgfm
   - Dimensions (optional, all integers): `lengthMm`, `widthMm` (without mirrors),
     `heightMm`, `wheelbaseMm`, `groundClearanceMm` (unladen, mm), `weightKg` (curb weight),
     `trunkLiters` (VDA). Only add from official sources (manufacturer site or press
     release) and record provenance in `.github/data/catalog-provenance.json`
     (fields `dimensions`, `trunk`, `weight`).

   If any required field is missing, ask the user before proceeding.

2. **Add to `src/constants.ts`**:
   - Insert the new `Car` object into `CAR_DB` array, grouped with the same brand
   - If the brand is new, also add an entry to `BRAND_URLS` with the official Brazilian website

3. **Add car image** (photo standard — mandatory for every new model/brand):
    - Source: official manufacturer only — brand site/CMS/DAM, official spec
      sheet or catalog, dealer-network release. Never aggregators, press
      renders of unknown origin, or AI/upscaled images.
    - Framing: whole vehicle, preferably front 3/4. No people, no
      landscape-dominant lifestyle, no event/stage, no detail close-ups
      (grille, headlight), no interiors.
    - Real photography over 360-viewer/CGI frames (precedent: Haval H6 GT,
      PHEV19, Wey 07 hero shots).
    - Version correctness: fascia/plate must match the version (e.g. Haval
      H6 PHEV19 ≠ PHEV35). One distinct photo per version preferred (Haval
      H6 precedent); one photo per model acceptable when versions differ
      only in equipment (Omoda 7 / Jaecoo 7 precedent).
    - Quality: sharp, larger side preferably ≥1440px. Inspect visually and
      reject transparency halos/jagged cutout edges and small-in-frame cars.
    - Files: save under the final filename in `public/car-images/` keeping
      the original format; when replacing, reuse the same filename to avoid
      `constants.ts` churn. No crop, upscale, logo or text added.
    - Pipeline: run `tools/generate-car-images.py` (Pillow pinned) and
      `... --check` must pass. Never hand-edit
      `public/car-images/optimized/manifest.json` or
      `src/utils/carImageManifest.ts`; delete obsolete
      `optimized/<name>-*.webp` variants when a replacement drops below the
      200 kB threshold.
    - If the user provides an image file that fails this standard, say so
      and fetch an official one instead of using a placeholder silently.
    - If no image is provided and none is found officially, note it as a
      TODO and use a placeholder path.

4. **Update category translation** (if needed):
   - Check `src/i18n/locales/en.json` and `pt-BR.json` — if the category key doesn't exist in `categories`, add it

5. **Update README.md metrics**:
   - Update the vehicle count in both EN and PT sections (Section 7 / Métricas)
   - Update the image count if a new image was added
   - Update brand count if a new brand was added

6. **Run verification**:
   - Run `npm run test:run` — all tests must pass (constants.test.ts validates CAR_DB structure)
   - Run `npm run build` — must succeed

7. **Report** what was added and any TODOs (missing image, etc.)
