---
name: pbev-visual-director
description: Use when improving image generation, deciding when to use real vehicle photos versus AI backgrounds, tuning visual prompts, or refining Instagram post composition for Guia PBEV Brasil. Trigger on requests like "melhore a arte", "ajuste a imagem", "a imagem ficou ruim", "quero usar foto real do carro", or "melhore o prompt visual".
---

# PBEV Visual Director

Use this skill for visual quality work in the Instagram bot.

Common triggers:
- "melhore a arte"
- "ajuste a imagem"
- "essa imagem ficou ruim"
- "quero usar a foto real do carro"
- "melhore o prompt visual"
- "deixe a peça mais premium"

Primary files:
- `image_generator.py`
- `vehicle_catalog.py`
- `config.py`

Core rules:
- Prefer real vehicle photos from the catalog whenever a recognized vehicle exists and a valid image is available.
- Only use AI-generated backgrounds for `dica_ev`, `tco_insight`, and `noticia_mercado`.
- Keep visible text under local control. AI should generate background/context, not embedded typography.
- For feed posts, optimize for editorial quality, clean hierarchy, strong contrast, and Brazilian context.
- Avoid oversized text blocks that hide the background image.
- When the prompt is about a specific car, verify whether the catalog photo path works before touching the AI path.

Monthly market analysis visual rule:
- After the first week of each month, the previous-month market-analysis post must be visual and data-led, not a generic AI background.
- Use a carousel when possible: slide 1 with market KPIs, slide 2 with ranked EV models and real catalog photos, slide 3 with brand/ranking insight and practical takeaway.
- Keep all visible numbers/text rendered locally by Pillow/templates; do not ask AI to embed the typography.
- Use real vehicle images from `vehicle_catalog.py` for ranked models whenever available; if an exact model is missing, use the closest catalog variant only when it is clearly the same family and label the public-facing name accurately.

Workflow:
1. Inspect `generate_and_host_post_image()` in `image_generator.py`.
2. Check whether the post resolves `source_vehicles`.
3. If a vehicle is found, preserve the catalog-photo path unless the user explicitly wants a different visual treatment.
4. If no vehicle is found and the category allows AI, tune `build_ai_image_prompt()`, `derive_visual_brief()`, and the local overlay layout.
5. Keep fallback behavior intact: AI failure must not block image generation.

Prompt guidance:
- Favor prompts that describe scene, lighting, composition, and mood.
- Explicitly forbid visible text in the generated image.
- Keep the Brazilian context explicit.
- For home charging scenes, avoid generic US or European architecture cues.

Validation:
- Run a local syntax check after edits.
- Generate one sample image before changing queue behavior.
- If testing on VPS, use a single post preview before regenerating multiple posts.
