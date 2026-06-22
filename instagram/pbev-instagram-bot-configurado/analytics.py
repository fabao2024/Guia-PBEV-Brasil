"""Plausible Analytics integration for Instagram content optimization.

Conecta com a instância self-hosted em analytics.guiapbev.cloud para:
1. Gerar UTM links rastreáveis em cada post
2. Puxar dados de performance para informar geração de conteúdo
3. Identificar quais categorias/tópicos trazem mais tráfego

Plausible CE API docs: https://plausible.io/docs/stats-api
"""

import logging
from datetime import datetime, timedelta
from urllib.parse import urlencode

import httpx

from config import get_settings

logger = logging.getLogger(__name__)

PLAUSIBLE_BASE = "https://analytics.guiapbev.cloud"


# ──────────────────────────────────────────────
# 1. UTM Link Builder
# ──────────────────────────────────────────────

def build_tracked_url(
    path: str = "/",
    category: str = "geral",
    post_id: int | None = None,
    campaign_name: str | None = None,
) -> str:
    """Gera URL com UTM params para rastreamento no Plausible.

    Exemplo de saída:
        https://guiapbev.cloud/simulador-tco?utm_source=instagram&utm_medium=post
        &utm_campaign=tco_insight&utm_content=post_42

    Args:
        path: Caminho no site (ex: "/", "/simulador-tco").
        category: Categoria do post (vira utm_campaign).
        post_id: ID do post na fila (vira utm_content).
        campaign_name: Override para utm_campaign.
    """
    settings = get_settings()
    base = settings.public_site_base_url

    utm_params = {
        "utm_source": "instagram",
        "utm_medium": "post",
        "utm_campaign": campaign_name or category,
    }

    if post_id:
        utm_params["utm_content"] = f"post_{post_id}"

    url = f"{base}{path}"
    return f"{url}?{urlencode(utm_params)}"


# Mapeamento de categoria → melhor página destino
CATEGORY_LANDING_PAGES = {
    "modelo_destaque": "/",
    "comparativo": "/simulador-tco",
    "dica_ev": "/simulador-tco",
    "tco_insight": "/simulador-tco",
    "noticia_mercado": "/",
    "geral": "/",
}


def get_cta_url(category: str, post_id: int | None = None) -> str:
    """Retorna URL com UTM para o CTA do post, baseado na categoria."""
    path = CATEGORY_LANDING_PAGES.get(category, "/")
    return build_tracked_url(path=path, category=category, post_id=post_id)


# ──────────────────────────────────────────────
# 2. Analytics Data Fetcher
# ──────────────────────────────────────────────

class PlausibleClient:
    """Client para a API do Plausible CE self-hosted."""

    def __init__(self, api_key: str | None = None):
        self.base_url = f"{PLAUSIBLE_BASE}/api/v1/stats"
        self.site_id = "guiapbev.cloud"
        # Plausible CE: API key configurável no painel admin
        # Se não fornecida, algumas rotas podem estar abertas
        self.api_key = api_key
        self.headers = {}
        if api_key:
            self.headers["Authorization"] = f"Bearer {api_key}"

    async def get_top_pages(self, period: str = "30d", limit: int = 10) -> list[dict]:
        """Páginas mais visitadas no período."""
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{self.base_url}/breakdown",
                params={
                    "site_id": self.site_id,
                    "period": period,
                    "property": "event:page",
                    "limit": limit,
                },
                headers=self.headers,
            )
            if resp.status_code == 200:
                return resp.json().get("results", [])
            logger.warning(f"Plausible API error: {resp.status_code}")
            return []

    async def get_utm_performance(self, period: str = "30d") -> list[dict]:
        """Performance por utm_campaign (= categoria de post)."""
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{self.base_url}/breakdown",
                params={
                    "site_id": self.site_id,
                    "period": period,
                    "property": "visit:utm_campaign",
                    "metrics": "visitors,pageviews,bounce_rate,visit_duration",
                    "filters": "visit:utm_source==instagram",
                },
                headers=self.headers,
            )
            if resp.status_code == 200:
                return resp.json().get("results", [])
            logger.warning(f"Plausible API error: {resp.status_code}")
            return []

    async def get_instagram_traffic_summary(self, period: str = "30d") -> dict:
        """Resumo do tráfego vindo do Instagram."""
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{self.base_url}/aggregate",
                params={
                    "site_id": self.site_id,
                    "period": period,
                    "metrics": "visitors,pageviews,bounce_rate,visit_duration",
                    "filters": "visit:utm_source==instagram",
                },
                headers=self.headers,
            )
            if resp.status_code == 200:
                return resp.json().get("results", {})
            logger.warning(f"Plausible API error: {resp.status_code}")
            return {}

    async def get_top_referrers(self, period: str = "30d", limit: int = 5) -> list[dict]:
        """Top fontes de tráfego (para contexto geral)."""
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{self.base_url}/breakdown",
                params={
                    "site_id": self.site_id,
                    "period": period,
                    "property": "visit:source",
                    "limit": limit,
                },
                headers=self.headers,
            )
            if resp.status_code == 200:
                return resp.json().get("results", [])
            return []


# ──────────────────────────────────────────────
# 3. Content Intelligence
# ──────────────────────────────────────────────

async def get_content_insights(api_key: str | None = None) -> dict:
    """Puxa insights do Plausible para informar a geração de conteúdo.

    Retorna dict com:
    - best_categories: categorias de post com melhor performance
    - top_pages: páginas mais visitadas (indica interesse do público)
    - ig_traffic: resumo do tráfego vindo do Instagram
    - recommendation: sugestão textual para o gerador de conteúdo
    """
    if not api_key:
        settings = get_settings()
        api_key = settings.plausible_api_key or None

    client = PlausibleClient(api_key=api_key)

    utm_data = await client.get_utm_performance()
    top_pages = await client.get_top_pages(limit=5)
    ig_summary = await client.get_instagram_traffic_summary()

    # Rankeia categorias por visitors
    best_categories = sorted(
        utm_data,
        key=lambda x: x.get("visitors", 0),
        reverse=True,
    )

    # Gera recomendação textual
    recommendation = _build_recommendation(best_categories, top_pages, ig_summary)

    return {
        "best_categories": best_categories,
        "top_pages": top_pages,
        "ig_traffic": ig_summary,
        "recommendation": recommendation,
    }


def _build_recommendation(
    categories: list[dict],
    pages: list[dict],
    ig_summary: dict,
) -> str:
    """Gera recomendação textual para o prompt de geração de conteúdo."""
    lines = []

    if categories:
        top = categories[0]
        lines.append(
            f"A categoria '{top.get('utm_campaign', '?')}' trouxe mais visitantes "
            f"({top.get('visitors', 0)}) nos últimos 30 dias. Priorize esse tipo de conteúdo."
        )

    if categories and len(categories) > 1:
        worst = categories[-1]
        lines.append(
            f"A categoria '{worst.get('utm_campaign', '?')}' teve menor engajamento. "
            f"Considere mudar a abordagem ou reduzir frequência."
        )

    if pages:
        popular = [p.get("page", "/") for p in pages[:3]]
        page_names = {
            "/simulador-tco": "Simulador TCO",
            "/comparador": "Comparador",
            "/": "Home / Catálogo",
        }
        named = [page_names.get(p, p) for p in popular]
        lines.append(f"Páginas mais visitadas: {', '.join(named)}. Direcione CTAs para essas páginas.")

    ig_visitors = ig_summary.get("visitors", {}).get("value", 0)
    if ig_visitors:
        lines.append(f"Instagram trouxe {ig_visitors} visitantes nos últimos 30 dias.")

    return "\n".join(lines) if lines else "Sem dados suficientes ainda. Continue postando para acumular analytics."
