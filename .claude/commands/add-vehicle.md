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

   If any required field is missing, ask the user before proceeding.

2. **Add to `src/constants.ts`**:
   - Insert the new `Car` object into `CAR_DB` array, grouped with the same brand
   - If the brand is new, also add an entry to `BRAND_URLS` with the official Brazilian website

3. **Add car image**:
   - If the user provides an image file, copy it to `public/car-images/`
   - If no image is provided, note it as a TODO and use a placeholder path

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
