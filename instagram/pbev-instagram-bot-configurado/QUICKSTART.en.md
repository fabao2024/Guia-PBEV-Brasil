# Quick Start - Ubuntu VPS

Short guide to deploy, validate, and operate the bot on an Ubuntu VPS.

## 1. Upload the project

```bash
scp pbev-instagram-bot.tar.gz user@your-vps:/tmp/

sudo mkdir -p /opt/pbev-instagram-bot
cd /opt
sudo tar xzf /tmp/pbev-instagram-bot.tar.gz --strip-components=1 -C pbev-instagram-bot
sudo chown -R $USER:$USER /opt/pbev-instagram-bot
cd /opt/pbev-instagram-bot
```

## 2. Run the setup check

```bash
sudo bash setup_check.sh
```

## 3. Create `.env`

```bash
cp .env.example .env
nano .env
```

Fill at least:
- `GEMINI_API_KEY`
- `META_ACCESS_TOKEN`
- `INSTAGRAM_BUSINESS_ACCOUNT_ID`
- `FACEBOOK_PAGE_ID`
- `FACEBOOK_PAGE_ACCESS_TOKEN`
- `PUBLIC_SITE_URL`
- `IMAGE_BASE_URL`
- `WEBHOOK_URL`

Expected production values:

```env
HOST=0.0.0.0
PORT=8001
PUBLIC_SITE_URL=https://guiapbev.cloud
IMAGE_BASE_URL=https://bot.your-domain.com
WEBHOOK_URL=https://bot.your-domain.com/webhook
ENABLE_AI_IMAGE_GENERATION=true
IMAGE_GENERATION_PROVIDER=gemini
IMAGE_GENERATION_MODEL=gemini-3.1-flash-image-preview
IMAGE_GENERATION_SIZE=1280x1280
```

Notes:
- `META_ACCESS_TOKEN` is used to publish posts
- `FACEBOOK_PAGE_ACCESS_TOKEN` is used to reply to DMs
- the page token must be obtained via `GET /me/accounts?fields=id,name,access_token`
- if that token expires in a few hours, you probably saved a temporary token instead of the final page token
- after renewing or replacing `META_ACCESS_TOKEN`, run `python refresh_token.py --sync-page-token`
- to test Z.AI as the background image generator, fill `ZAI_API_KEY` and switch to `IMAGE_GENERATION_PROVIDER=zai`
- a good baseline for Z.AI is `IMAGE_GENERATION_MODEL=glm-image`

## 4. Python setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 5. Initialize the database and test Meta

```bash
python -c "from database import init_db; init_db()"
python publish.py --test
```

If `--test` passes, the token and IG account are OK.

For DMs, also confirm:
- `FACEBOOK_PAGE_ID`
- `FACEBOOK_PAGE_ACCESS_TOKEN`
- `instagram_manage_messages` permission

## 6. Configure Nginx and HTTPS

Use the bot vhost pointing to `127.0.0.1:8001`.

General steps:

```bash
sudo cp nginx/pbev-instagram-bot.conf /etc/nginx/sites-available/pbev-instagram-bot
sudo ln -s /etc/nginx/sites-available/pbev-instagram-bot /etc/nginx/sites-enabled/pbev-instagram-bot
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d bot.your-domain.com
```

Note:
- do not place `limit_req_zone` inside the site file
- that directive can only exist in the `http` context of `nginx.conf`

## 7. Start the bot

```bash
python main.py
```

Or with `systemd`:

```bash
sudo cp pbev-instagram-bot.service /etc/systemd/system/pbev-instagram-bot.service
sudo systemctl daemon-reload
sudo systemctl enable --now pbev-instagram-bot
```

## 8. Validate health

```bash
curl http://127.0.0.1:8001/health
curl https://bot.your-domain.com/health
systemctl status pbev-instagram-bot --no-pager
```

## 9. Generate and review the queue

```bash
python generate_content.py --days 7 --save
python manage_queue.py --stats
python manage_queue.py --list
python manage_queue.py --list --all
```

Reminder:
- the scheduler only publishes posts with images
- if a post has no `image_url`, it stays stuck in the queue
- if a post is already overdue and you generate its image later, it may publish on the next cycle

## 10. Daily commands

```bash
# Full pipeline test
python publish.py --generate-and-post modelo_destaque --topic "BYD Dolphin Mini"

# Publish a queued post
python publish.py --post 5

# View queue
python manage_queue.py --list

# View pending + published
python manage_queue.py --list --all

# Stats
python manage_queue.py --stats

# HTML preview of a post
python manage_queue.py --preview 5

# Generate missing images
python manage_queue.py --generate-images

# Reapply current fixes to pending posts and reschedule
python manage_queue.py --refresh-pending --start-at "2026-04-02 09:00" --interval-hours 24

# Reschedule
python manage_queue.py --reschedule 5 "2026-04-01 10:00"

# Delete a post
python manage_queue.py --delete 5
```

## 11. Catalog-grounded posts

Categories using catalog data:
- `modelo_destaque`
- `comparativo`
- `tco_insight`

Commands:

```bash
# Regenerate all pending posts in those categories
python manage_queue.py --reset-grounded-posts

# Regenerate one post
python manage_queue.py --reset-post 7

# Regenerate a comparison with an explicit topic
python manage_queue.py --reset-post 7 --topic "GWM Ora 03 Skin BEV48 vs BYD Dolphin GS"
```

## 12. Catalog sync

Manual:

```bash
python sync_catalog.py
```

Automatic:
- the bot tries to sync the catalog before generating the week
- it also tries to sync before generating or regenerating an individual post

If sync fails:
- it keeps using the current local snapshot

## 13. Images and CTA

- when the post mentions a recognized vehicle, the bot tries to use the real catalog photo
- `.avif` catalog images are converted through `pillow-avif-plugin`
- if there is no vehicle photo, the bot only tries to generate an AI background in `dica_ev`, `tco_insight`, and `noticia_mercado`
- when a real car photo exists in the catalog, it takes priority and AI is skipped
- for feed posts, prefer a `link in bio` CTA; caption URLs are not a reliable Instagram click flow

## 14. Safe VPS update

The current `deploy.sh` is no longer a fresh machine bootstrap.
It is now a safe updater for an existing VPS.

Usage:

```bash
cd /opt/pbev-instagram-bot
chmod +x deploy.sh
sudo ./deploy.sh
```

It:
- updates dependencies
- ensures directories and permissions
- updates `systemd`
- validates Nginx without overwriting the existing vhost
- restarts the bot and tests local health

## 15. Logs

```bash
journalctl -u pbev-instagram-bot -f
```

## 16. Meta tokens

```bash
# Check both token statuses
python refresh_token.py --check

# Renew META_ACCESS_TOKEN
python refresh_token.py

# Sync FACEBOOK_PAGE_ACCESS_TOKEN from the current Meta token
python refresh_token.py --sync-page-token

# Restart after any change
sudo systemctl restart pbev-instagram-bot
```

Quick read:
- `Status do token Meta: Valido: Sim` indicates publishing should work
- `Status do token da pagina: Valido: Sim` indicates DMs should work
- `Alinhado ao META_ACCESS_TOKEN atual: Nao` is not an immediate error, but syncing is recommended

## 17. Common cases

- error `(#190) This method must be called with a Page Access Token`:
  the value in `FACEBOOK_PAGE_ACCESS_TOKEN` is not a valid page token
- error `code 190 / subcode 463` in DMs:
  the saved token expired; this usually means the value in `FACEBOOK_PAGE_ACCESS_TOKEN` is not the final page token obtained from `/me/accounts`
- error `attempt to write a readonly database`:
  the bot published, but failed to mark the item as published; this can cause duplication
- DM replies work and then fail with `(#230) Requires pages_messaging permission`:
  the webhook is receiving the bot's own message; keep `main.py` updated so it ignores its own sender
- post preview:
  use `python manage_queue.py --preview ID` and open the returned URL in a browser
