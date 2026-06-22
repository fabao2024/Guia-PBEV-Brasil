"""Instagram publisher via Meta Graph API.

Handles image upload and post publishing for Instagram Business accounts.

Fluxo da API:
1. POST /ig-user/media -> cria container de midia (image_url + caption)
2. POST /ig-user/media_publish -> publica o container
"""

import asyncio
import logging
from urllib.parse import urlparse, urlunparse

import httpx

from config import get_settings

logger = logging.getLogger(__name__)

GRAPH_API_BASE = "https://graph.facebook.com/v21.0"
INSTAGRAM_CAPTION_LIMIT = 2200


class DMDeliveryDisabled(RuntimeError):
    """Raised when DM delivery is blocked by auth/permission issues."""


def _raise_meta_error(resp: httpx.Response, action: str):
    """Raise a readable error that includes Meta's response body."""
    try:
        details = resp.json()
    except Exception:
        details = resp.text

    raise RuntimeError(f"{action} falhou: HTTP {resp.status_code} - {details}")


def _extract_meta_error(resp: httpx.Response) -> dict:
    try:
        payload = resp.json()
    except Exception:
        return {}
    return payload.get("error") or {}


def _validate_media_payload(image_url: str, full_caption: str):
    """Valida payload antes da chamada para a Meta."""
    if not image_url:
        raise ValueError("image_url obrigatoria para publicacao")

    parsed = urlparse(image_url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError(f"image_url invalida: {image_url}")

    if len(full_caption) > INSTAGRAM_CAPTION_LIMIT:
        raise ValueError(
            f"legenda excede o limite do Instagram: {len(full_caption)} > {INSTAGRAM_CAPTION_LIMIT}"
        )


def _is_media_fetch_error(resp: httpx.Response) -> bool:
    error = _extract_meta_error(resp)
    return (
        str(error.get("code", "")) == "9004"
        and str(error.get("error_subcode", "")) == "2207052"
    )


def _replace_media_host(image_url: str, base_url: str) -> str:
    parsed_image = urlparse(image_url)
    parsed_base = urlparse(base_url)
    if not parsed_base.scheme or not parsed_base.netloc:
        return image_url
    return urlunparse(
        (
            parsed_base.scheme,
            parsed_base.netloc,
            parsed_image.path,
            "",
            parsed_image.query,
            "",
        )
    )


class InstagramPublisher:
    """Publica posts no Instagram via Meta Graph API."""

    def __init__(self):
        self.settings = get_settings()
        self.access_token = self.settings.meta_access_token
        self.ig_account_id = self.settings.instagram_business_account_id
        self.page_access_token = self.settings.facebook_page_access_token

    @property
    def _base_params(self) -> dict:
        return {"access_token": self.access_token}

    def _media_url_candidates(self, image_url: str) -> list[str]:
        candidates = [image_url]
        fallback_base = self.settings.image_fallback_base_url
        if fallback_base:
            fallback_url = _replace_media_host(image_url, fallback_base)
            if fallback_url not in candidates:
                candidates.append(fallback_url)
        return candidates

    async def publish_image_post(
        self,
        image_url: str,
        caption: str,
        hashtags: str = "",
    ) -> dict:
        """Publica um post de imagem no Instagram com fallback opcional de host."""
        full_caption = f"{caption}\n\n{hashtags}".strip()
        _validate_media_payload(image_url, full_caption)
        image_urls = self._media_url_candidates(image_url)

        async with httpx.AsyncClient(timeout=60) as client:
            container_id = None
            last_error: httpx.Response | None = None

            for attempt_index, candidate_url in enumerate(image_urls, start=1):
                logger.info(
                    "Criando container IG: host=%s caption_len=%s tentativa=%s/%s",
                    urlparse(candidate_url).netloc,
                    len(full_caption),
                    attempt_index,
                    len(image_urls),
                )
                container_response = await client.post(
                    f"{GRAPH_API_BASE}/{self.ig_account_id}/media",
                    data={
                        **self._base_params,
                        "image_url": candidate_url,
                        "caption": full_caption,
                    },
                )
                if not container_response.is_error:
                    container_id = container_response.json()["id"]
                    logger.info("Container criado: %s", container_id)
                    break

                last_error = container_response
                if _is_media_fetch_error(container_response) and attempt_index < len(image_urls):
                    logger.warning(
                        "Meta rejeitou a midia no host %s; tentando fallback %s",
                        urlparse(candidate_url).netloc,
                        urlparse(image_urls[attempt_index]).netloc,
                    )
                    continue
                _raise_meta_error(container_response, "Criacao do container de midia")

            if not container_id and last_error is not None:
                _raise_meta_error(last_error, "Criacao do container de midia")

            await self._wait_for_container(client, container_id)

            publish_response = await client.post(
                f"{GRAPH_API_BASE}/{self.ig_account_id}/media_publish",
                data={
                    **self._base_params,
                    "creation_id": container_id,
                },
            )
            if publish_response.is_error:
                _raise_meta_error(publish_response, f"Publicacao do container {container_id}")
            media_id = publish_response.json()["id"]

            logger.info("Post publicado! Media ID: %s", media_id)
            return {"media_id": media_id, "status": "published"}

    async def publish_carousel_post(
        self,
        image_urls: list[str],
        caption: str,
        hashtags: str = "",
    ) -> dict:
        """Publica um carousel (multiplas imagens)."""
        full_caption = f"{caption}\n\n{hashtags}".strip()
        if len(full_caption) > INSTAGRAM_CAPTION_LIMIT:
            raise ValueError(
                f"legenda excede o limite do Instagram: {len(full_caption)} > {INSTAGRAM_CAPTION_LIMIT}"
            )

        async with httpx.AsyncClient(timeout=120) as client:
            children_ids = []
            for url in image_urls:
                _validate_media_payload(url, "")
                resp = await client.post(
                    f"{GRAPH_API_BASE}/{self.ig_account_id}/media",
                    data={
                        **self._base_params,
                        "image_url": url,
                        "is_carousel_item": "true",
                    },
                )
                if resp.is_error:
                    _raise_meta_error(resp, f"Criacao de item do carousel para {url}")
                child_id = resp.json()["id"]
                children_ids.append(child_id)
                await self._wait_for_container(client, child_id)

            carousel_resp = await client.post(
                f"{GRAPH_API_BASE}/{self.ig_account_id}/media",
                data={
                    **self._base_params,
                    "media_type": "CAROUSEL",
                    "caption": full_caption,
                    "children": ",".join(children_ids),
                },
            )
            if carousel_resp.is_error:
                _raise_meta_error(carousel_resp, "Criacao do container de carousel")
            carousel_id = carousel_resp.json()["id"]
            await self._wait_for_container(client, carousel_id)

            pub_resp = await client.post(
                f"{GRAPH_API_BASE}/{self.ig_account_id}/media_publish",
                data={
                    **self._base_params,
                    "creation_id": carousel_id,
                },
            )
            if pub_resp.is_error:
                _raise_meta_error(pub_resp, f"Publicacao do carousel {carousel_id}")
            media_id = pub_resp.json()["id"]

            logger.info("Carousel publicado! Media ID: %s (%s imagens)", media_id, len(image_urls))
            return {"media_id": media_id, "status": "published", "images": len(image_urls)}

    async def reply_to_comment(self, comment_id: str, message: str) -> dict:
        """Responde a um comentario no Instagram."""
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{GRAPH_API_BASE}/{comment_id}/replies",
                data={
                    **self._base_params,
                    "message": message,
                },
            )
            if resp.is_error:
                _raise_meta_error(resp, f"Resposta ao comentario {comment_id}")
            return resp.json()

    async def delete_comment(self, comment_id: str) -> dict:
        """Remove um comentario ou reply pelo ID no Graph API."""
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.delete(
                f"{GRAPH_API_BASE}/{comment_id}",
                params=self._base_params,
            )
            if resp.is_error:
                resp = await client.post(
                    f"{GRAPH_API_BASE}/{comment_id}",
                    data={
                        **self._base_params,
                        "method": "delete",
                    },
                )
            if resp.is_error:
                _raise_meta_error(resp, f"Remocao do comentario {comment_id}")
            if not resp.text.strip():
                return {"success": True}
            try:
                return resp.json()
            except Exception:
                return {"success": True, "raw": resp.text}

    async def list_media_comments(self, media_id: str, limit: int = 50) -> list[dict]:
        """Lista comentarios de uma midia para localizar comentarios antigos."""
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                f"{GRAPH_API_BASE}/{media_id}/comments",
                params={
                    **self._base_params,
                    "fields": "id,text,from{id,username},timestamp",
                    "limit": limit,
                },
            )
            if resp.is_error:
                _raise_meta_error(resp, f"Listagem de comentarios da midia {media_id}")
            return resp.json().get("data", [])

    async def list_comment_replies(self, comment_id: str, limit: int = 50) -> list[dict]:
        """Lista replies de um comentario para localizar respostas ja enviadas."""
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                f"{GRAPH_API_BASE}/{comment_id}/replies",
                params={
                    **self._base_params,
                    "fields": "id,text,from{id,username},timestamp",
                    "limit": limit,
                },
            )
            if resp.is_error:
                _raise_meta_error(resp, f"Listagem de replies do comentario {comment_id}")
            return resp.json().get("data", [])

    async def send_dm(self, recipient_id: str, message: str) -> dict:
        """Envia DM via Instagram Messaging API."""
        if not self.page_access_token:
            raise DMDeliveryDisabled(
                "FACEBOOK_PAGE_ACCESS_TOKEN nao configurado. "
                "DMs exigem um Page Access Token separado do token de publicacao."
            )

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{GRAPH_API_BASE}/{self.settings.facebook_page_id}/messages",
                params={"access_token": self.page_access_token},
                json={
                    "recipient": {"id": recipient_id},
                    "message": {"text": message},
                },
            )
            if resp.is_error:
                error = _extract_meta_error(resp)
                code = str(error.get("code", ""))
                subcode = str(error.get("error_subcode", ""))
                if (
                    code == "190"
                    or subcode in {"463", "467"}
                    or code == "10"
                    or (code == "200" and subcode == "2534048")
                ):
                    raise DMDeliveryDisabled(
                        f"Envio de DM desabilitado por erro de autenticacao/permissao: HTTP {resp.status_code} - {error}"
                    )
                _raise_meta_error(resp, f"Envio de DM para {recipient_id}")
            return resp.json()

    async def _wait_for_container(
        self, client: httpx.AsyncClient, container_id: str, max_retries: int = 10
    ):
        """Poll container status ate estar pronto."""
        for i in range(max_retries):
            resp = await client.get(
                f"{GRAPH_API_BASE}/{container_id}",
                params={**self._base_params, "fields": "status_code"},
            )
            if resp.is_error:
                _raise_meta_error(resp, f"Consulta de status do container {container_id}")
            data = resp.json()
            status = data.get("status_code")

            if status == "FINISHED":
                return
            if status == "ERROR":
                raise RuntimeError(f"Container {container_id} falhou: {data}")

            wait_time = min(2 ** i, 30)
            logger.debug("Container %s status=%s, aguardando %ss...", container_id, status, wait_time)
            await asyncio.sleep(wait_time)

        raise TimeoutError(f"Container {container_id} nao ficou pronto em {max_retries} tentativas")
