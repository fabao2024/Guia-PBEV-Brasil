#!/bin/bash
# ============================================================
# PBEV Instagram Bot — Guia de Deploy Completo (VPS Ubuntu)
# ============================================================
#
# Este script valida e configura tudo no seu VPS.
# Rode com: sudo bash setup_check.sh
#
# Ele NÃO faz alterações destrutivas — apenas verifica e
# instala o que falta.

set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'
BOLD='\033[1m'

APP_DIR="/opt/pbev-instagram-bot"
IMAGES_DIR="/var/www/pbev-images"

ok()   { echo -e "  ${GREEN}✅ $1${NC}"; }
fail() { echo -e "  ${RED}❌ $1${NC}"; }
warn() { echo -e "  ${YELLOW}⚠️  $1${NC}"; }
step() { echo -e "\n${BOLD}[$1/8] $2${NC}"; }

ERRORS=0

# ─────────────────────────────────────────────
step 1 "Verificando sistema operacional"
# ─────────────────────────────────────────────
if grep -q "Ubuntu" /etc/os-release 2>/dev/null; then
    VERSION=$(grep VERSION_ID /etc/os-release | cut -d'"' -f2)
    ok "Ubuntu $VERSION detectado"
else
    fail "Sistema não é Ubuntu"
    ERRORS=$((ERRORS+1))
fi

# ─────────────────────────────────────────────
step 2 "Verificando Python 3.11+"
# ─────────────────────────────────────────────
if command -v python3 &>/dev/null; then
    PY_VERSION=$(python3 --version | awk '{print $2}')
    PY_MAJOR=$(echo "$PY_VERSION" | cut -d. -f1)
    PY_MINOR=$(echo "$PY_VERSION" | cut -d. -f2)
    if [ "$PY_MAJOR" -ge 3 ] && [ "$PY_MINOR" -ge 11 ]; then
        ok "Python $PY_VERSION"
    else
        warn "Python $PY_VERSION (recomendado 3.11+, mas funciona com 3.10)"
    fi
else
    fail "Python 3 não encontrado"
    echo "     Instale com: sudo apt install python3.11 python3.11-venv"
    ERRORS=$((ERRORS+1))
fi

# ─────────────────────────────────────────────
step 3 "Verificando dependências do sistema"
# ─────────────────────────────────────────────
DEPS=("nginx" "certbot" "pip3")
MISSING=()

for dep in "${DEPS[@]}"; do
    if command -v "$dep" &>/dev/null; then
        ok "$dep instalado"
    else
        fail "$dep não encontrado"
        MISSING+=("$dep")
    fi
done

# Libs para Pillow (geração de imagens)
for lib in libjpeg-dev libpng-dev libfreetype6-dev; do
    if dpkg -s "$lib" &>/dev/null 2>&1; then
        ok "$lib instalado"
    else
        warn "$lib faltando (necessário para geração de imagens)"
        MISSING+=("$lib")
    fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
    echo ""
    echo "  Instale com:"
    echo "  sudo apt update && sudo apt install -y ${MISSING[*]}"
    ERRORS=$((ERRORS+1))
fi

# ─────────────────────────────────────────────
step 4 "Verificando estrutura do projeto"
# ─────────────────────────────────────────────
if [ -d "$APP_DIR" ]; then
    ok "Diretório $APP_DIR existe"
else
    warn "$APP_DIR não existe — extraia o tar.gz aqui"
    echo "     sudo mkdir -p $APP_DIR"
    echo "     sudo tar xzf pbev-instagram-bot.tar.gz -C /opt/ --strip-components=1"
fi

REQUIRED_FILES=(
    "main.py" "config.py" "database.py" "publisher.py"
    "auto_responder.py" "content_generator.py" "image_generator.py"
    "scheduler.py" "ev_knowledge.py" "requirements.txt"
)

for f in "${REQUIRED_FILES[@]}"; do
    if [ -f "$APP_DIR/$f" ]; then
        ok "$f"
    else
        fail "$f faltando"
        ERRORS=$((ERRORS+1))
    fi
done

# ─────────────────────────────────────────────
step 5 "Verificando .env"
# ─────────────────────────────────────────────
if [ -f "$APP_DIR/.env" ]; then
    ok ".env existe"

    # Checa variáveis críticas
    for var in GEMINI_API_KEY META_ACCESS_TOKEN INSTAGRAM_BUSINESS_ACCOUNT_ID; do
        val=$(grep "^$var=" "$APP_DIR/.env" 2>/dev/null | cut -d'=' -f2-)
        if [ -n "$val" ] && [ "$val" != "your_"* ] && [ "$val" != "sk-ant-..." ]; then
            ok "$var configurado"
        else
            fail "$var não configurado"
            ERRORS=$((ERRORS+1))
        fi
    done
else
    fail ".env não encontrado"
    echo "     cp $APP_DIR/.env.example $APP_DIR/.env"
    echo "     nano $APP_DIR/.env"
    ERRORS=$((ERRORS+1))
fi

# ─────────────────────────────────────────────
step 6 "Verificando virtualenv e dependências Python"
# ─────────────────────────────────────────────
VENV="$APP_DIR/venv"
if [ -d "$VENV" ]; then
    ok "Virtualenv existe"
    
    # Testa imports críticos
    "$VENV/bin/python" -c "import fastapi; from google import genai; import apscheduler; import PIL" 2>/dev/null
    if [ $? -eq 0 ]; then
        ok "Dependências Python OK (fastapi, google-genai, apscheduler, Pillow)"
    else
        warn "Dependências incompletas — rode: source $VENV/bin/activate && pip install -r requirements.txt"
        ERRORS=$((ERRORS+1))
    fi
else
    warn "Virtualenv não existe"
    echo "     python3 -m venv $VENV"
    echo "     source $VENV/bin/activate"
    echo "     pip install -r $APP_DIR/requirements.txt"
    ERRORS=$((ERRORS+1))
fi

# ─────────────────────────────────────────────
step 7 "Verificando Nginx e HTTPS"
# ─────────────────────────────────────────────
if [ -f /etc/nginx/sites-enabled/pbev-instagram-bot ]; then
    ok "Site Nginx habilitado"
else
    warn "Site Nginx não habilitado"
    echo "     sudo cp $APP_DIR/nginx/pbev-instagram-bot.conf /etc/nginx/sites-available/"
    echo "     sudo ln -s /etc/nginx/sites-available/pbev-instagram-bot /etc/nginx/sites-enabled/"
fi

if nginx -t 2>/dev/null; then
    ok "Nginx config válida"
else
    warn "Nginx config inválida — verifique /etc/nginx/sites-available/pbev-instagram-bot"
fi

# Checa se tem certificado SSL
if [ -d /etc/letsencrypt/live/ ]; then
    CERTS=$(ls /etc/letsencrypt/live/ 2>/dev/null | head -1)
    if [ -n "$CERTS" ]; then
        ok "Certificado SSL encontrado ($CERTS)"
    else
        warn "Sem certificado SSL — rode: sudo certbot --nginx"
    fi
else
    warn "Certbot não configurado — Meta Webhooks exigem HTTPS"
    echo "     sudo certbot --nginx -d seudominio.com"
fi

# Diretório de imagens
if [ -d "$IMAGES_DIR" ]; then
    ok "Diretório de imagens $IMAGES_DIR existe"
else
    warn "$IMAGES_DIR não existe"
    echo "     sudo mkdir -p $IMAGES_DIR && sudo chown www-data:www-data $IMAGES_DIR"
fi

# ─────────────────────────────────────────────
step 8 "Verificando serviço systemd"
# ─────────────────────────────────────────────
if [ -f /etc/systemd/system/pbev-instagram-bot.service ]; then
    ok "Service file instalado"

    if systemctl is-active --quiet pbev-instagram-bot; then
        ok "Serviço RODANDO ✨"
    elif systemctl is-enabled --quiet pbev-instagram-bot; then
        warn "Serviço habilitado mas não rodando"
        echo "     sudo systemctl start pbev-instagram-bot"
        echo "     sudo journalctl -u pbev-instagram-bot -f"
    else
        warn "Serviço não habilitado"
        echo "     sudo systemctl enable --now pbev-instagram-bot"
    fi
else
    warn "Service file não instalado"
    echo "     sudo cp $APP_DIR/pbev-instagram-bot.service /etc/systemd/system/"
    echo "     sudo systemctl daemon-reload"
fi

# ─────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}${BOLD}✅ Tudo pronto! Nenhum erro encontrado.${NC}"
    echo ""
    echo "  Próximo passo: python publish.py --test"
else
    echo -e "${RED}${BOLD}❌ $ERRORS problema(s) encontrado(s).${NC}"
    echo ""
    echo "  Resolva os itens acima e rode este script novamente."
fi
echo "════════════════════════════════════════"
