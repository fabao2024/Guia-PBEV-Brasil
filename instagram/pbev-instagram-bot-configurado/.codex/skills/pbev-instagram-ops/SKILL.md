---
name: pbev-instagram-ops
description: Use when operating or debugging the Instagram bot in production, including queue refreshes, previews, republishing, token checks, and VPS manual sync workflows. Trigger on requests like "reagende a fila", "quero preview", "corrija o token", "suba na VPS", or "o deploy não puxou o código".
---

# PBEV Instagram Ops

Use this skill for operational work on the bot.

Common triggers:
- "reagende a fila"
- "quero preview"
- "corrija o token"
- "suba na VPS"
- "o deploy nao puxou o codigo"
- "como operar isso em producao"

Primary files:
- `manage_queue.py`
- `refresh_token.py`
- `publish.py`
- `main.py`
- `README.md`
- `QUICKSTART.md`

Core rules:
- VPS is often a manual-copy deployment, not a Git checkout.
- Prefer preview before publication.
- Regenerate queue items only when the new behavior must be applied to existing pending posts.
- After changing Meta tokens, restart the service.
- After renewing `META_ACCESS_TOKEN`, sync the page token via `refresh_token.py --sync-page-token`.

Operational workflows:

Monthly market analysis:
1. Run/create the previous-month market post only after the first week of the month; the scheduler should target day 8 or later.
2. Before publishing, preview the carousel slides and check that the media itself contains the main KPIs and ranked vehicle images.
3. Publish as carousel when the post is an analysis/ranking; register it in `ScheduledPost` with category `noticia_mercado` and `post_type="carousel"`.
4. Recheck recent media via Graph API or `manage_queue.py --list --all` after publication.

Preview:
1. Use `python manage_queue.py --preview <id>`.
2. Open the generated `/preview/<id>` URL.

Queue refresh:
1. Use `python manage_queue.py --refresh-pending --start-at "<YYYY-MM-DD HH:MM>" --interval-hours <n>`.
2. Recheck with `python manage_queue.py --list`.

Token health:
1. Use `python refresh_token.py --check`.
2. If needed, run `python refresh_token.py`.
3. Then run `python refresh_token.py --sync-page-token`.
4. Restart the service.

Manual VPS sync:
1. Copy only the changed files with `scp`.
2. Run `python -m py_compile` on changed Python files.
3. Restart with `systemctl restart pbev-instagram-bot`.

Validation:
- `journalctl -u pbev-instagram-bot -f`
- `curl http://127.0.0.1:8001/health`
- `python manage_queue.py --list`

Do not:
- Assume `deploy.sh` fetches new code.
- Assume feed URLs are clickable.
- Revert unrelated VPS state unless explicitly requested.
