#!/bin/bash
# Safe update script for the production VPS.
#
# Usage:
#   chmod +x deploy.sh
#   sudo ./deploy.sh
#
# What it does:
# 1. Validates the app directory and required files
# 2. Updates the virtualenv dependencies
# 3. Ensures runtime directories and permissions
# 4. Updates the systemd unit
# 5. Validates the current Nginx config without overwriting it
# 6. Restarts the bot and validates the local health endpoint

set -euo pipefail

APP_DIR="/opt/pbev-instagram-bot"
VENV_DIR="$APP_DIR/venv"
IMAGES_DIR="/var/www/pbev-images"
SERVICE_NAME="pbev-instagram-bot"
SERVICE_FILE="$APP_DIR/pbev-instagram-bot.service"
NGINX_TARGET="/etc/nginx/sites-available/pbev-instagram-bot"

if [ "$#" -ne 0 ]; then
    echo "Usage: sudo ./deploy.sh"
    exit 1
fi

if [ "${EUID}" -ne 0 ]; then
    echo "Run this script as root: sudo ./deploy.sh"
    exit 1
fi

echo "Updating PBEV Instagram Bot"
echo "==========================="

if [ ! -d "$APP_DIR" ]; then
    echo "App directory not found: $APP_DIR"
    exit 1
fi

for path in "$APP_DIR/requirements.txt" "$APP_DIR/main.py" "$SERVICE_FILE"; do
    if [ ! -f "$path" ]; then
        echo "Required file not found: $path"
        exit 1
    fi
done

echo ""
echo "1/6 Validating Python environment..."
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
fi
source "$VENV_DIR/bin/activate"
python -m pip install --upgrade pip
python -m pip install -r "$APP_DIR/requirements.txt"
echo "Python dependencies updated."

echo ""
echo "2/6 Validating application config..."
if [ ! -f "$APP_DIR/.env" ]; then
    echo "Missing $APP_DIR/.env"
    echo "Create it from .env.example before running this update."
    exit 1
fi

echo ""
echo "3/6 Ensuring writable directories..."
mkdir -p "$APP_DIR/assets/fonts"
mkdir -p "$APP_DIR/assets/logos"
mkdir -p "$APP_DIR/assets/vehicles"
mkdir -p "$APP_DIR/generated_images"
mkdir -p "$IMAGES_DIR"
chown -R ubuntu:ubuntu "$APP_DIR"
chown -R www-data:www-data "$IMAGES_DIR"
chmod 755 "$IMAGES_DIR"
chmod g+w "$IMAGES_DIR"
usermod -aG www-data ubuntu 2>/dev/null || true

echo ""
echo "4/6 Updating systemd unit..."
cp "$SERVICE_FILE" /etc/systemd/system/"$SERVICE_NAME".service
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"

echo ""
echo "5/6 Handling Nginx..."
if [ -f "$NGINX_TARGET" ]; then
    nginx -t
    systemctl reload nginx
    echo "Existing Nginx config validated and reloaded."
else
    echo "Nginx vhost file not found at $NGINX_TARGET."
    echo "Install it manually from $APP_DIR/nginx/pbev-instagram-bot.conf if this is a new server."
fi

echo ""
echo "6/6 Restarting service and checking health..."
systemctl restart "$SERVICE_NAME"
sleep 2
systemctl --no-pager --full status "$SERVICE_NAME"
curl --fail --silent --show-error --max-time 10 http://127.0.0.1:8001/health

echo ""
echo "==========================="
echo "Update completed."
echo ""
echo "Useful checks:"
echo "  systemctl status $SERVICE_NAME --no-pager"
echo "  journalctl -u $SERVICE_NAME -n 100 --no-pager"
echo "  curl -sS https://bot.guiapbev.cloud/health"
