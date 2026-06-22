"""Renovacao automatica do token Meta e sync do Page Access Token.

Uso:
    python refresh_token.py
    python refresh_token.py --check
    python refresh_token.py --sync-page-token
"""

import argparse
import logging
import os
import sys
from datetime import datetime
from pathlib import Path

import httpx

from config import get_settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

GRAPH_API = "https://graph.facebook.com/v21.0"


def check_token_validity() -> dict:
    """Verifica validade do META_ACCESS_TOKEN atual."""
    settings = get_settings()

    with httpx.Client(timeout=15) as client:
        resp = client.get(
            f"{GRAPH_API}/debug_token",
            params={
                "input_token": settings.meta_access_token,
                "access_token": f"{settings.meta_app_id}|{settings.meta_app_secret}",
            },
        )

    if resp.status_code != 200:
        logger.error("Erro ao verificar token: %s", resp.text)
        return {"valid": False, "error": resp.text}

    data = resp.json().get("data", {})
    is_valid = data.get("is_valid", False)
    expires_at = data.get("expires_at", 0)

    if expires_at > 0:
        expiry = datetime.fromtimestamp(expires_at)
        days_left = (expiry - datetime.now()).days
    else:
        expiry = None
        days_left = -1

    return {
        "valid": is_valid,
        "expires_at": expiry,
        "days_left": days_left,
        "scopes": data.get("scopes", []),
        "app_id": data.get("app_id"),
    }


def refresh_token() -> str | None:
    """Troca META_ACCESS_TOKEN por um novo token de longa duracao."""
    settings = get_settings()

    with httpx.Client(timeout=15) as client:
        resp = client.get(
            f"{GRAPH_API}/oauth/access_token",
            params={
                "grant_type": "fb_exchange_token",
                "client_id": settings.meta_app_id,
                "client_secret": settings.meta_app_secret,
                "fb_exchange_token": settings.meta_access_token,
            },
        )

    if resp.status_code != 200:
        logger.error("Erro ao renovar token: %s", resp.text)
        return None

    data = resp.json()
    new_token = data.get("access_token")
    if not new_token:
        logger.error("Resposta sem token: %s", data)
        return None

    return new_token


def get_page_access_token(user_access_token: str) -> tuple[str, str, str] | None:
    """Deriva FACEBOOK_PAGE_ACCESS_TOKEN via /me/accounts."""
    settings = get_settings()

    with httpx.Client(timeout=15) as client:
        resp = client.get(
            f"{GRAPH_API}/me/accounts",
            params={
                "fields": "id,name,access_token,tasks",
                "access_token": user_access_token,
            },
        )

    if resp.status_code != 200:
        logger.error("Erro ao buscar pages em /me/accounts: %s", resp.text)
        return None

    pages = resp.json().get("data", [])
    if not pages:
        logger.error("Nenhuma page encontrada para o user token informado.")
        return None

    page = next((item for item in pages if item.get("id") == settings.facebook_page_id), None)
    if not page:
        logger.error(
            "FACEBOOK_PAGE_ID=%s nao apareceu em /me/accounts. Pages retornadas: %s",
            settings.facebook_page_id,
            [item.get("id") for item in pages],
        )
        return None

    page_token = page.get("access_token")
    if not page_token:
        logger.error("A page %s nao retornou access_token em /me/accounts.", settings.facebook_page_id)
        return None

    return page["id"], page.get("name", ""), page_token


def verify_page_access_token(page_access_token: str) -> dict:
    """Verifica se o page token consegue acessar a page alvo."""
    settings = get_settings()

    with httpx.Client(timeout=15) as client:
        resp = client.get(
            f"{GRAPH_API}/{settings.facebook_page_id}",
            params={
                "fields": "id,name",
                "access_token": page_access_token,
            },
        )

    if resp.status_code != 200:
        return {"valid": False, "error": resp.text}

    data = resp.json()
    return {"valid": True, "id": data.get("id"), "name": data.get("name")}


def check_page_access_token() -> dict:
    """Verifica o FACEBOOK_PAGE_ACCESS_TOKEN atual."""
    settings = get_settings()
    if not settings.facebook_page_access_token:
        return {"valid": False, "error": "FACEBOOK_PAGE_ACCESS_TOKEN nao configurado"}

    verification = verify_page_access_token(settings.facebook_page_access_token)
    if not verification.get("valid"):
        return verification

    derived = get_page_access_token(settings.meta_access_token)
    if not derived:
        return {
            "valid": True,
            "id": verification.get("id"),
            "name": verification.get("name"),
            "matches_meta_token": None,
        }

    _page_id, _page_name, derived_token = derived
    current_token = settings.facebook_page_access_token
    return {
        "valid": True,
        "id": verification.get("id"),
        "name": verification.get("name"),
        "matches_meta_token": current_token == derived_token,
    }


def update_env_value(key: str, new_value: str) -> bool:
    """Atualiza uma chave no .env."""
    env_path = Path(__file__).parent / ".env"

    if not env_path.exists():
        logger.error(".env nao encontrado")
        return False

    content = env_path.read_text(encoding="utf-8")
    lines = content.split("\n")
    updated = False

    for i, line in enumerate(lines):
        if line.startswith(f"{key}="):
            old_value = line.split("=", 1)[1]
            lines[i] = f"{key}={new_value}"
            updated = True
            old_tail = old_value[-8:] if old_value else ""
            new_tail = new_value[-8:] if new_value else ""
            logger.info("%s atualizado: ...%s -> ...%s", key, old_tail, new_tail)
            break

    if updated:
        env_path.write_text("\n".join(lines), encoding="utf-8")
        return True

    logger.error("%s nao encontrado no .env", key)
    return False


def sync_page_token_from_current_user_token() -> int:
    """Atualiza FACEBOOK_PAGE_ACCESS_TOKEN a partir do META_ACCESS_TOKEN atual."""
    settings = get_settings()
    result = get_page_access_token(settings.meta_access_token)
    if not result:
        print("Falha ao derivar Page Access Token via /me/accounts.")
        return 1

    page_id, page_name, page_token = result
    verification = verify_page_access_token(page_token)
    if not verification.get("valid"):
        print("Page Access Token derivado, mas a validacao falhou.")
        print(verification.get("error"))
        return 1

    if update_env_value("FACEBOOK_PAGE_ACCESS_TOKEN", page_token):
        print("Page Access Token atualizado no .env.")
        print(f"Page: {page_name or page_id}")
        print("Reinicie o servico: sudo systemctl restart pbev-instagram-bot")
        return 0

    print("Falha ao atualizar FACEBOOK_PAGE_ACCESS_TOKEN no .env.")
    return 1


def main():
    parser = argparse.ArgumentParser(description="Renovar token Meta e sync do Page Access Token")
    parser.add_argument("--check", action="store_true", help="Apenas verificar validade")
    parser.add_argument(
        "--sync-page-token",
        action="store_true",
        help="Deriva e atualiza FACEBOOK_PAGE_ACCESS_TOKEN via /me/accounts",
    )
    args = parser.parse_args()

    info = check_token_validity()
    page_info = check_page_access_token()

    if args.check:
        print("\nStatus do token Meta:")
        print(f"  Valido: {'Sim' if info['valid'] else 'Nao'}")
        if info.get("expires_at"):
            print(f"  Expira em: {info['expires_at'].strftime('%d/%m/%Y %H:%M')}")
            print(f"  Dias restantes: {info['days_left']}")
        print(f"  Permissoes: {', '.join(info.get('scopes', []))}")
        print("\nStatus do token da pagina:")
        print(f"  Valido: {'Sim' if page_info.get('valid') else 'Nao'}")
        if page_info.get("name"):
            print(f"  Page: {page_info['name']} ({page_info.get('id')})")
        if page_info.get("matches_meta_token") is True:
            print("  Alinhado ao META_ACCESS_TOKEN atual: Sim")
        elif page_info.get("matches_meta_token") is False:
            print("  Alinhado ao META_ACCESS_TOKEN atual: Nao")
        if page_info.get("error"):
            print(f"  Erro: {page_info['error']}")
        return

    if args.sync_page_token:
        sys.exit(sync_page_token_from_current_user_token())

    if info["valid"] and info.get("days_left", 0) > 15:
        logger.info("Token ainda valido por %s dias.", info["days_left"])
        confirm = input("Renovar mesmo assim? (s/n) ").strip().lower()
        if confirm != "s":
            print("Cancelado.")
            return

    print("\nRenovando token...")
    new_token = refresh_token()
    if not new_token:
        print("Falha ao renovar. Verifique APP_ID e APP_SECRET no .env.")
        sys.exit(1)

    os.environ["META_ACCESS_TOKEN"] = new_token

    if update_env_value("META_ACCESS_TOKEN", new_token):
        print("META_ACCESS_TOKEN renovado e .env atualizado.")
        print("Agora rode: python refresh_token.py --sync-page-token")
        print("Depois reinicie: sudo systemctl restart pbev-instagram-bot")
    else:
        print("Novo token gerado mas .env nao foi atualizado.")
        print(f"Token: {new_token[:20]}...{new_token[-8:]}")
        print("Atualize manualmente no .env")


if __name__ == "__main__":
    main()
