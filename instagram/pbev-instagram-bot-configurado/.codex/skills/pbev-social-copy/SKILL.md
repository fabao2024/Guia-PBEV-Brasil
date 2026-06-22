---
name: pbev-social-copy
description: Use when improving Instagram captions, CTA wording, category-specific post behavior, or Portuguese copy quality for Guia PBEV Brasil social posts. Trigger on requests like "melhore a legenda", "ajuste o CTA", "reescreva o post", or "deixe o texto mais natural/comercial".
---

# PBEV Social Copy

Use this skill for caption and publishing-copy work.

Common triggers:
- "melhore a legenda"
- "ajuste o CTA"
- "reescreva o post"
- "deixe o texto mais natural"
- "deixe mais comercial"
- "corrija a copy"

Primary files:
- `content_generator.py`
- `analytics.py`
- `ev_knowledge.py`

Core rules:
- Write in PT-BR.
- First line must be a strong hook.
- Keep the tone technical-accessible, not hype-heavy.
- Use one CTA only.
- In Instagram feed, prefer `link na bio` over literal URLs.
- Never promise a guide, article, manual, or full walkthrough unless the destination page truly matches that promise.
- For TCO/cost questions, prefer the simulator.
- For comparisons, prefer the comparator.

Category guidance:
- `modelo_destaque`: use grounded model facts from the catalog.
- `comparativo`: compare only the resolved models.
- `dica_ev`: practical and educational tone.
- `tco_insight`: emphasize economics and decision support without inventing hard numbers.
- `noticia_mercado`: trend/news tone, but keep it factual and operationally safe.

Monthly market analysis:
- At the beginning of each month, after the first week, create the market-analysis post for the previous month.
- The analyzed month must be explicit in the hook and hashtags, e.g. `Maio/2026` and `#Maio2026`.
- Use only numbers from current sources for the target month; if the target-month source is unavailable, abort instead of falling back to an older month.
- Prefer a caption that summarizes the data and points users to the carousel visuals; do not leave key numbers only in the caption.
- Include one CTA only, usually `link da bio` / Guia PBEV.

Workflow:
1. Review `CONTENT_SYSTEM_PROMPT`.
2. Review `_build_generation_prompt()` and destination-specific CTA logic.
3. Confirm landing-page mapping in `analytics.py`.
4. If editing prompts, preserve valid JSON output requirements.
5. Keep copy constraints aligned with Instagram feed behavior.

Validation:
- Generate one sample post for the target category.
- Check caption length, CTA coherence, and hashtag mix.
- If the output references a vehicle, verify that facts match `vehicle_catalog.py`.
