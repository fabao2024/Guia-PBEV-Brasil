"""Market news collection for monthly electrified vehicle posts."""

from __future__ import annotations

import html
import logging
import re
import unicodedata
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from datetime import datetime, timedelta
from html.parser import HTMLParser
from urllib.parse import quote_plus, urljoin, urlparse

import httpx

from config import get_settings

logger = logging.getLogger(__name__)

DEFAULT_MARKET_NEWS_SOURCE_URLS = ("https://abve.org.br/abve-data/noticias/",)

MONTH_NAMES_PT = {
    1: "janeiro",
    2: "fevereiro",
    3: "marco",
    4: "abril",
    5: "maio",
    6: "junho",
    7: "julho",
    8: "agosto",
    9: "setembro",
    10: "outubro",
    11: "novembro",
    12: "dezembro",
}

RELEVANT_TERMS = (
    "eletrificado",
    "eletrificados",
    "elétrico",
    "elétricos",
    "bev",
    "phev",
    "híbrido",
    "hibrido",
    "emplacamento",
    "emplacamentos",
    "market share",
    "participação",
)
EXCLUDED_LINK_TITLES = {
    "abve@",
    "quem somos",
    "conselho diretor",
    "associados",
    "agenda",
    "contato",
    "leia mais",
    "noticias",
    "notícias",
    "eletrificados+mhev",
}


@dataclass
class MarketNewsItem:
    title: str
    url: str
    source: str
    published_at: str | None = None
    excerpt: str = ""


class _LinkExtractor(HTMLParser):
    def __init__(self, base_url: str):
        super().__init__()
        self.base_url = base_url
        self.links: list[tuple[str, str]] = []
        self._current_href: str | None = None
        self._current_text: list[str] = []

    def handle_starttag(self, tag: str, attrs):
        if tag != "a":
            return
        attrs_dict = dict(attrs)
        href = attrs_dict.get("href")
        if href:
            self._current_href = urljoin(self.base_url, href)
            self._current_text = []

    def handle_data(self, data: str):
        if self._current_href:
            self._current_text.append(data)

    def handle_endtag(self, tag: str):
        if tag != "a" or not self._current_href:
            return
        text = _normalize_text(" ".join(self._current_text))
        self.links.append((text, self._current_href))
        self._current_href = None
        self._current_text = []


def get_previous_month_period(reference_date: datetime | None = None) -> tuple[int, int]:
    """Return year/month for the month immediately before reference_date."""
    current = reference_date or datetime.utcnow()
    if current.month == 1:
        return current.year - 1, 12
    return current.year, current.month - 1


def collect_market_news(
    max_items: int = 5,
    days_back: int = 45,
    target_year: int | None = None,
    target_month: int | None = None,
) -> list[MarketNewsItem]:
    """Collect market-result news for the target month/year only."""
    settings = get_settings()
    if target_year is None or target_month is None:
        target_year, target_month = get_previous_month_period()
    source_urls = _get_source_urls(settings.market_news_source_urls, target_year, target_month)
    items: list[MarketNewsItem] = []

    with httpx.Client(timeout=20, follow_redirects=True) as client:
        for source_url in source_urls:
            try:
                response = client.get(source_url, headers={"User-Agent": "GuiaPBEVBot/1.0"})
                response.raise_for_status()
            except Exception as exc:
                logger.warning("Falha ao coletar fonte de mercado %s: %s", source_url, exc)
                continue

            content_type = response.headers.get("content-type", "")
            if _looks_like_feed(source_url, content_type, response.text):
                items.extend(_parse_rss_items(response.text, source_url, max_items=max_items * 2))
            else:
                items.extend(_collect_html_items(client, source_url, response.text, max_items=max_items * 2))

    fresh_items = _dedupe_items(items)
    cutoff = datetime.utcnow() - timedelta(days=days_back)
    filtered = [
        item for item in fresh_items
        if (
            _is_relevant(item)
            and _mentions_target_period(item, target_year, target_month)
            and (_parse_date(item.published_at) is None or _parse_date(item.published_at) >= cutoff)
        )
    ]
    return filtered[:max_items]


def build_market_news_context(
    items: list[MarketNewsItem],
    target_year: int | None = None,
    target_month: int | None = None,
) -> str:
    period_label = ""
    if target_year and target_month:
        period_label = f"{MONTH_NAMES_PT[target_month]}/{target_year}"

    if not items:
        return (
            f"Nenhuma fonte confiavel foi coletada automaticamente para {period_label or 'o periodo alvo'}. "
            "Nao gere post de mercado com dados de outro mes ou de outro ano."
        )

    lines = [
        "FONTES COLETADAS PARA O POST MENSAL DE MERCADO:",
        f"PERIODO_ALVO: {period_label}",
        "Use somente os dados abaixo como base factual. Nao invente numeros ausentes.",
    ]
    for index, item in enumerate(items, start=1):
        lines.extend([
            f"{index}. Titulo: {item.title}",
            f"   Fonte: {item.source}",
            f"   Data: {item.published_at or 'nao informada'}",
            f"   URL: {item.url}",
            f"   Trecho: {item.excerpt[:900]}",
        ])
    return "\n".join(lines)


def _get_source_urls(config_value: str, target_year: int, target_month: int) -> list[str]:
    urls = [
        url.strip()
        for url in (config_value or "").replace("\n", ",").split(",")
        if url.strip()
    ]
    if urls:
        return urls

    month_name = MONTH_NAMES_PT[target_month]
    query = quote_plus(
        f"ABVE eletrificados emplacamentos {month_name} {target_year} Brasil"
    )
    return [
        *DEFAULT_MARKET_NEWS_SOURCE_URLS,
        f"https://news.google.com/rss/search?q={query}&hl=pt-BR&gl=BR&ceid=BR:pt-419",
    ]


def _looks_like_feed(url: str, content_type: str, body: str) -> bool:
    body_start = body.lstrip()[:120].lower()
    return (
        "xml" in content_type
        or "rss" in content_type
        or urlparse(url).path.endswith((".xml", ".rss"))
        or body_start.startswith("<?xml")
        or body_start.startswith("<rss")
        or body_start.startswith("<feed")
    )


def _parse_rss_items(body: str, source_url: str, max_items: int) -> list[MarketNewsItem]:
    try:
        root = ET.fromstring(body)
    except ET.ParseError as exc:
        logger.warning("RSS invalido em %s: %s", source_url, exc)
        return []

    items: list[MarketNewsItem] = []
    for node in root.findall(".//item")[:max_items]:
        title = _node_text(node, "title")
        link = _node_text(node, "link")
        published = _node_text(node, "pubDate") or _node_text(node, "published")
        excerpt = _html_to_text(_node_text(node, "description"))
        if title and link:
            items.append(MarketNewsItem(
                title=_normalize_text(title),
                url=link.strip(),
                source=urlparse(source_url).netloc,
                published_at=_normalize_text(published) if published else None,
                excerpt=excerpt,
            ))
    return items


def _collect_html_items(
    client: httpx.Client,
    source_url: str,
    body: str,
    max_items: int,
) -> list[MarketNewsItem]:
    parser = _LinkExtractor(source_url)
    parser.feed(body)

    candidates = []
    source_host = urlparse(source_url).netloc
    for title, link in parser.links:
        normalized_title = title.casefold().strip()
        if normalized_title in EXCLUDED_LINK_TITLES:
            continue
        if not title or not _is_relevant_text(f"{title} {link}"):
            continue
        if urlparse(link).netloc and urlparse(link).netloc != source_host:
            continue
        candidates.append((title, link))

    items: list[MarketNewsItem] = []
    seen_urls: set[str] = set()
    for title, link in candidates:
        if link in seen_urls:
            continue
        seen_urls.add(link)
        try:
            article_response = client.get(link, headers={"User-Agent": "GuiaPBEVBot/1.0"})
            article_response.raise_for_status()
            article_text = _html_to_text(article_response.text)
        except Exception as exc:
            logger.debug("Falha ao abrir noticia %s: %s", link, exc)
            article_text = ""

        items.append(MarketNewsItem(
            title=title,
            url=link,
            source=source_host,
            published_at=_extract_date_text(article_text),
            excerpt=_summarize_relevant_excerpt(article_text),
        ))
        if len(items) >= max_items:
            break
    return items


def _node_text(node: ET.Element, child_name: str) -> str:
    child = node.find(child_name)
    return child.text or "" if child is not None else ""


def _html_to_text(value: str) -> str:
    value = re.sub(r"(?is)<(script|style).*?>.*?</\1>", " ", value or "")
    value = re.sub(r"(?s)<[^>]+>", " ", value)
    return _normalize_text(html.unescape(value))


def _normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def _summarize_relevant_excerpt(text: str, max_sentences: int = 5) -> str:
    sentences = re.split(r"(?<=[.!?])\s+", _normalize_text(text))
    picked: list[str] = []
    for sentence in sentences:
        normalized = sentence.casefold()
        if "ir para o conteúdo" in normalized or "sobre abve" in normalized:
            continue
        has_market_term = _is_relevant_text(sentence)
        has_number = bool(re.search(r"\d", sentence))
        if has_market_term and (has_number or len(picked) < 2):
            picked.append(sentence)
        if len(picked) >= max_sentences:
            break
    return " ".join(picked)[:1200] or _normalize_text(text)[:1200]


def _is_relevant(item: MarketNewsItem) -> bool:
    return _is_relevant_text(f"{item.title} {item.excerpt}")


def _is_relevant_text(value: str) -> bool:
    normalized = value.casefold()
    return any(term in normalized for term in RELEVANT_TERMS)


def _normalize_for_period(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value or "")
    normalized = "".join(char for char in normalized if not unicodedata.combining(char))
    return re.sub(r"\s+", " ", normalized.casefold())


def _mentions_target_period(item: MarketNewsItem, target_year: int, target_month: int) -> bool:
    text = _normalize_for_period(f"{item.title} {item.excerpt} {item.url}")
    month_name = MONTH_NAMES_PT[target_month]
    has_target_month = bool(re.search(rf"\b{re.escape(month_name)}\b", text))
    has_target_year = str(target_year) in text
    if not (has_target_month and has_target_year):
        return False

    other_months = [
        name for month, name in MONTH_NAMES_PT.items()
        if month != target_month
    ]
    first_month_match = re.search(r"\b(" + "|".join(other_months + [month_name]) + r")\b", text)
    if first_month_match and first_month_match.group(1) != month_name:
        return False

    return True


def _dedupe_items(items: list[MarketNewsItem]) -> list[MarketNewsItem]:
    result: list[MarketNewsItem] = []
    seen: set[str] = set()
    for item in items:
        key = item.url.split("?")[0].rstrip("/") or item.title.casefold()
        if key in seen:
            continue
        seen.add(key)
        result.append(item)
    return result


def _extract_date_text(text: str) -> str | None:
    match = re.search(r"\b\d{1,2}\s+de\s+[a-zç]+(?:\s+de)?\s+\d{4}\b", text, re.IGNORECASE)
    if match:
        return match.group(0)
    match = re.search(r"\b\d{1,2}/\d{1,2}/\d{4}\b", text)
    return match.group(0) if match else None


def _parse_date(value: str | None) -> datetime | None:
    if not value:
        return None
    for fmt in ("%a, %d %b %Y %H:%M:%S %Z", "%d/%m/%Y"):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    return None
