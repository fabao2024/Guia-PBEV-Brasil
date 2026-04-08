# Guia PBEV Brasil - Instagram Automation Bot

Automation bot for the Guia PBEV Brasil Instagram account.

It covers:
- post generation with Gemini
- queueing and scheduling with SQLite + APScheduler
- automatic publishing via Meta Graph API
- automatic replies via webhook
- branded image generation using catalog data
- HTML post preview before publishing
- AI image fallback for posts without a vehicle photo
- DM assistant based on the same Guia PBEV Brasil catalog

## How the project works

```text
1. The bot generates caption + hashtags
2. It generates or updates the post image
3. It allows browser preview before publishing
4. It saves everything in the SQLite queue
5. The scheduler checks the queue every 5 minutes
6. It only publishes posts that have a public image available
```

## Current content flow state

- `modelo_destaque`, `comparativo`, and `tco_insight` use synchronized catalog data from the `Guia-PBEV-Brasil` project
- before generating or regenerating those posts, the bot tries to sync `src/constants.ts` and update `vehicle_catalog.py`
- `comparativo` supports real photos of both vehicles when catalog images are available
- posts without a vehicle photo only try to generate an AI background in `dica_ev`, `tco_insight`, and `noticia_mercado`
- when a real vehicle photo is available in the catalog, it takes priority and AI is skipped
- AVIF images from the catalog are now converted to JPEG through `pillow-avif-plugin`
- feed CTAs were adjusted to "link in bio" and do not depend on clickable URLs in the caption
- `noticia_mercado` is still available for manual use, but it was removed from the weekly automatic generation flow

## Requirements

1. Instagram Business account connected to a Facebook Page
2. Meta app with permissions:
- `instagram_basic`
- `instagram_content_publish`
- `instagram_manage_comments`
- `instagram_manage_messages`
- `pages_show_list`
- `pages_read_engagement`
3. Google Gemini API key
4. Ubuntu VPS with Python 3.11+
5. Domain with HTTPS for webhook and public images

## Local or VPS setup

```bash
cd /opt
git clone <repo-url> pbev-instagram-bot
cd pbev-instagram-bot

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
python -c "from database import init_db; init_db()"
python publish.py --test
```

## Important variables

- `HOST=0.0.0.0`
- `PORT=8001`
- `PUBLIC_SITE_URL=https://guiapbev.cloud`
- `IMAGE_BASE_URL=https://bot.your-domain.com`
- `WEBHOOK_URL=https://bot.your-domain.com/webhook`
- `META_ACCESS_TOKEN=<publishing_token>`
- `FACEBOOK_PAGE_ACCESS_TOKEN=<page_access_token>`
- `ENABLE_AI_IMAGE_GENERATION=true`
- `IMAGE_GENERATION_PROVIDER=gemini`
- `IMAGE_GENERATION_MODEL=gemini-3.1-flash-image-preview`
- `IMAGE_GENERATION_SIZE=1280x1280`

Notes:
- `PUBLIC_SITE_URL` should point to the site tracked in Plausible
- `IMAGE_BASE_URL` should point to the host serving `/ig-images/`
- `IMAGE_FALLBACK_URL` is optional and can point to an alternate host serving the same `/ig-images/...` path; the publisher will try that host automatically if Meta rejects the main URL with a media fetch error
- `SITE_URL` remains as a legacy compatibility variable
- DMs use `FACEBOOK_PAGE_ACCESS_TOKEN`; post publishing uses `META_ACCESS_TOKEN`
- for DMs, the ideal setup is to store a real Page Access Token returned by `/me/accounts`, not a short-lived token from Graph API Explorer
- for AI image generation, `gemini` is still the default provider; to test Z.AI, use `IMAGE_GENERATION_PROVIDER=zai`, `IMAGE_GENERATION_MODEL=glm-image`, and set `ZAI_API_KEY`

## Direct messages and comments

- the webhook receives DMs at `/webhook`
- comment replies use `META_ACCESS_TOKEN`
- DM replies use `FACEBOOK_PAGE_ACCESS_TOKEN`
- the page token must be obtained via `GET /me/accounts?fields=id,name,access_token`
- use the returned `access_token` for the page whose `id` matches `FACEBOOK_PAGE_ID`
- the bot ignores messages sent by itself to avoid self-reply loops
- if the DM token expires within a few hours, you likely saved a temporary token instead of the final page token
- the helper `python refresh_token.py --sync-page-token` derives and updates `FACEBOOK_PAGE_ACCESS_TOKEN` automatically from `META_ACCESS_TOKEN`
- the auto-responder uses the local catalog as its main knowledge base, mirroring the EletriBrasil consultant style from the site

## Daily operations

```bash
# Run API + scheduler
python main.py

# Test the Meta connection
python publish.py --test

# Generate and publish 1 manual post
python publish.py --generate-and-post modelo_destaque --topic "BYD Dolphin Mini"

# Generate the week's content and save it
python generate_content.py --days 7 --save

# Open the HTML preview of a post
python manage_queue.py --preview 7
```

## Post queue

```bash
# List pending posts
python manage_queue.py --list

# List pending + published posts
python manage_queue.py --list --all

# View stats
python manage_queue.py --stats

# Reschedule
python manage_queue.py --reschedule 5 "2026-04-01 10:00"

# Reapply current fixes to all pending posts and redistribute the schedule
python manage_queue.py --refresh-pending --start-at "2026-04-02 09:00" --interval-hours 24

# Remove 1 post
python manage_queue.py --delete 5
```

Important rule:
- the scheduler only publishes posts with `image_url`
- a post without an image stays pending in the queue
- if you generate images for overdue posts, they may publish on the next 5-minute cycle

## Image commands

```bash
# Generate missing images for pending posts
python manage_queue.py --generate-images

# Browser preview
python manage_queue.py --preview 5

# Publish a queued post manually
python publish.py --post 5
```

Notes:
- for feed posts, prefer a `link in bio` CTA; Instagram does not treat caption URLs as a reliable click flow
- if the real car photo comes from the catalog as `.avif`, the bot converts it to `.jpg` before assembling the final artwork

## Regenerating grounded posts

Grounded categories:
- `modelo_destaque`
- `comparativo`
- `tco_insight`

Commands:

```bash
# Regenerate all pending grounded categories
python manage_queue.py --reset-grounded-posts

# Regenerate one specific post
python manage_queue.py --reset-post 7

# Regenerate a comparison while preserving an explicit topic
python manage_queue.py --reset-post 7 --topic "GWM Ora 03 Skin BEV48 vs BYD Dolphin GS"
```

## Catalog sync

Manual:

```bash
python sync_catalog.py
```

Automatic:
- `generate_weekly_content()` tries to sync the catalog before weekly generation
- `generate_single_post()` tries to sync before generating or regenerating a post

If sync fails:
- the bot keeps using the current local snapshot in `vehicle_catalog.py`

## VPS and deploy

The project runs well on a VPS with:
- Python app on port `8001`
- Nginx proxying to `127.0.0.1:8001`
- Nginx serving `/ig-images/` from `/var/www/pbev-images`
- `systemd` using `pbev-instagram-bot.service`

The current `deploy.sh` script is a safe updater for an existing VPS. It:
- updates dependencies
- ensures directories and permissions
- updates `systemd`
- validates the existing Nginx setup without overwriting the vhost
- restarts the bot and tests local health

## Troubleshooting

- DM failing with `(#190) This method must be called with a Page Access Token`:
  use `FACEBOOK_PAGE_ACCESS_TOKEN` extracted from `/me/accounts?fields=id,name,access_token`
- DM failing with `code 190 / subcode 463` a few hours later:
  the value saved in `FACEBOOK_PAGE_ACCESS_TOKEN` is probably not the final page token; redo the long-lived user token -> `/me/accounts` -> page token flow
- DMs failing while posts still work:
  check `python refresh_token.py --check` and, if needed, run `python refresh_token.py --sync-page-token`
- DM failing with `(#230) Requires pages_messaging permission` for your own IG:
  confirm that the updated `main.py` is ignoring messages sent by the bot itself
- post repeating in the queue:
  check SQLite permissions; `attempt to write a readonly database` prevents marking `published=True`
- post did not publish on time:
  check whether it had `image_url`; without an image it never enters the publishing filter
- caption URL not clickable:
  expected on Instagram feed; use a `link in bio` CTA
- Plausible shows no Instagram traffic:
  `PUBLIC_SITE_URL` should point to `guiapbev.cloud` and `IMAGE_BASE_URL` to `bot.guiapbev.cloud`
- `/me/accounts` returns empty in Graph API Explorer:
  re-grant the app in `Business Integrations` and select the `Guia PBEV Brasil` page

## Health and logs

```bash
# Local health
curl http://127.0.0.1:8001/health

# Public health
curl https://bot.your-domain.com/health

# Bot logs
journalctl -u pbev-instagram-bot -f
```

## Meta tokens

```bash
# Check publishing token and page token
python refresh_token.py --check

# Renew META_ACCESS_TOKEN
python refresh_token.py

# Sync FACEBOOK_PAGE_ACCESS_TOKEN with the current Meta token
python refresh_token.py --sync-page-token

# After any token change
systemctl restart pbev-instagram-bot
```

Note:
- the ideal check state is `Status do token Meta: Valido: Sim` and `Status do token da pagina: Valido: Sim`
- if the check shows `Alinhado ao META_ACCESS_TOKEN atual: Nao`, it may still work, but syncing is recommended

## Private repo

Before the first push to GitHub, review:
- `PRIVATE_REPO.md`

It covers:
- what can and cannot go to git
- how to check whether this directory is nested inside a larger repo
- how to create a standalone private repo with SSH push

## Internal project skills

This repository may also contain local Codex skills in `.codex/skills/`.

Usage:
- they provide operational and editorial context for AI-assisted development
- they help standardize image direction, copywriting, DM replies, and bot operations

Important:
- these skills are not part of the bot runtime
- by themselves, they do not change production API behavior
- they do not need to be copied to the VPS for the bot to work
- only copy `.codex/skills/` to another environment if you want to reuse the same Codex development context

Current skills:
- `pbev-visual-director`: use for art direction, weak images, visual prompts, real car photos, and composition
- `pbev-social-copy`: use for captions, CTAs, post tone, and PT-BR copy
- `pbev-dm-consultor`: use for DMs, comments, EletriBrasil persona, catalog grounding, and dedupe
- `pbev-instagram-ops`: use for preview, queue work, republishing, tokens, VPS, and daily operations

## Main structure

```text
pbev-instagram-bot/
|-- main.py
|-- config.py
|-- database.py
|-- content_generator.py
|-- image_generator.py
|-- publisher.py
|-- publish.py
|-- manage_queue.py
|-- scheduler.py
|-- sync_catalog.py
|-- vehicle_catalog.py
|-- auto_responder.py
|-- analytics.py
|-- deploy.sh
|-- pbev-instagram-bot.service
|-- README.md
|-- QUICKSTART.md
```
