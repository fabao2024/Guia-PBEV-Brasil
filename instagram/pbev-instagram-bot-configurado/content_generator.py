"""Content generation using Google Gemini API for Instagram posts.

Generates captions, hashtags, and content calendar for Guia PBEV Brasil.
Uses the same Gemini model as the EletriBrasil chatbot (gemini-2.5-flash-lite).
"""

import json
import importlib
import logging
import random
import re
import unicodedata
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from google import genai
from google.genai import types

from config import get_settings
from cost_tracking import (
    apply_cost_metadata,
    build_text_cost_metadata,
    extract_token_usage,
    log_generation_event,
    merge_cost_metadata,
    rough_token_estimate,
)
from database import get_session, ContentIdea, ScheduledPost
from ev_knowledge import PBEV_SYSTEM_CONTEXT, CONTENT_CATEGORIES, OPTIMAL_POSTING_HOURS
from image_generator import _find_matching_vehicles, generate_and_host_post_image
from market_news import build_market_news_context, collect_market_news, get_previous_month_period, MONTH_NAMES_PT
from schedule_utils import assign_categories_to_slots, get_preferred_posting_hour
import vehicle_catalog as vehicle_catalog_module

logger = logging.getLogger(__name__)

GROUNDED_VEHICLE_CATEGORIES = {"modelo_destaque", "comparativo", "tco_insight"}
AUTO_GENERATED_CATEGORIES = tuple(
    category["id"] for category in CONTENT_CATEGORIES if category["id"] != "noticia_mercado"
)
WEEKLY_POSTING_DAYS = ("monday", "wednesday", "friday", "saturday")
MAX_GENERATION_ATTEMPTS = 3
PRICE_VARIATION_NOTE = (
    "Obs.: preços podem variar conforme políticas internas e comerciais das "
    "montadoras e revendedoras dos veículos."
)
DISALLOWED_VEHICLE_MODEL_TERMS = (
    "kwid e tech",
    "kwid etech",
    "song plus",
    "song pro",
    "song",
)
CONTENT_STOPWORDS = {
    "para", "como", "mais", "menos", "entre", "sobre", "porque", "quando", "onde",
    "essa", "esse", "isso", "esta", "este", "sao", "são", "com", "sem", "dos", "das",
    "uma", "uns", "umas", "que", "seu", "sua", "seus", "suas", "por", "num", "numa",
    "nos", "nas", "the", "and", "from", "with", "your", "you", "are", "from",
}

VEHICLE_CATALOG = vehicle_catalog_module.VEHICLE_CATALOG
format_price_brl = vehicle_catalog_module.format_price_brl
get_random_vehicle_for_category = vehicle_catalog_module.get_random_vehicle_for_category
get_vehicle = vehicle_catalog_module.get_vehicle

HOOK_PATTERNS = [
    "Comece com um número surpreendente (ex: autonomia, preço, economia)",
    "Comece com uma comparação direta (ex: 'X vs Y: qual vale mais?')",
    "Comece com um fato contraintuitivo sobre EVs",
    "Comece com uma pergunta direta e específica (não use 'Você sabia que...')",
    "Comece com um cenário do dia a dia (ex: 'Imagine nunca mais...')",
    "Comece com um dado de mercado recente",
    "Comece com um mito sendo quebrado",
    "Comece com um cálculo concreto de economia",
    "Comece com uma afirmação ousada sobre o futuro",
    "Comece com um comparativo de custo rápido (R$/km)",
]

ENGAGEMENT_CTAS = [
    "Qual EV você escolheria? Comenta aqui 👇",
    "Já dirigiu algum desses? Conte sua experiência",
    "Salva este post pra consultar depois 🔖",
    "Conhece alguém pensando em EV? Marca aqui",
    "Faltou algum modelo? Comenta que a gente avalia",
    "Qual sua maior dúvida sobre EVs? Pergunta aí",
    "Concorda ou discorda? Deixa sua opinião",
    "Compartilha com quem está pesquisando EVs",
]

CONTENT_SYSTEM_PROMPT = """Você é um social media manager especializado em veículos elétricos no Brasil.
Crie conteúdo para o Instagram do Guia PBEV Brasil (@guiapbevbrasil).

Regras:
- Português brasileiro, tom informativo mas acessível
- Legendas entre 60-120 palavras (curtas e diretas, máxima retenção)
- Use emojis com moderação (⚡🔋🚗🇧🇷💰)
- Hashtags: 15-20 por post, mix de alto volume e nicho
- Primeira linha DEVE ser um hook forte. VARIE o estilo do hook a cada post. NUNCA repita "Você sabia que..." ou "Você já parou para pensar..."
- Quebre o texto em parágrafos curtos (1-2 linhas)
- Quando o post citar preço, valor, faixa de preço, "a partir de", "custa" ou R$ relacionado a veículo, inclua a observação: "Obs.: preços podem variar conforme políticas internas e comerciais das montadoras e revendedoras dos veículos."

CTA de engajamento (OBRIGATÓRIO em todo post):
- A última linha da legenda DEVE ser uma pergunta ou convite para gerar comentários
- Varie entre: perguntas de opinião, pedir pra salvar, pedir pra compartilhar, pedir experiência
- Evite repetir o mesmo CTA em posts consecutivos

CTA com link rastreável:
- Cada post DEVE ter exatamente 1 CTA com o link UTM fornecido no campo "cta_url"
- Em posts de feed do Instagram, prefira CTA do tipo "link na bio" ou "acesse o simulador no Guia PBEV".
- Nao dependa de URL clicavel na legenda do feed.
- So inclua URL literal se houver motivo operacional claro; por padrao, nao escreva "Acesse: {cta_url}" na legenda.
- Para posts sobre TCO e comparativos, direcione ao simulador.
- Não prometa "guia completo", "artigo", "manual", "matéria" ou "passo a passo" se o cta_url não for claramente uma página de conteúdo específica.
- Se o cta_url apontar para home ou simulador, descreva isso com precisão: "veja no site" ou "simule no simulador".

Responda SEMPRE em JSON válido, sem markdown e sem backticks.
"""


def get_client() -> genai.Client:
    """Retorna client Gemini configurado."""
    settings = get_settings()
    return genai.Client(api_key=settings.gemini_api_key)


def _gen_config(max_tokens: int = 4096) -> types.GenerateContentConfig:
    """Configuração padrão para geração de conteúdo."""
    return types.GenerateContentConfig(
        system_instruction=CONTENT_SYSTEM_PROMPT,
        temperature=0.7,
        max_output_tokens=max_tokens,
        response_mime_type="application/json",
    )


def _parse_response(text: str) -> dict:
    """Limpa e parseia resposta JSON do Gemini."""
    clean = text.strip()
    if clean.startswith("```"):
        clean = clean.split("\n", 1)[-1]
    if clean.endswith("```"):
        clean = clean.rsplit("```", 1)[0]
    clean = clean.strip()
    return json.loads(clean)


def sync_vehicle_catalog(local_repo_path: str | None = None) -> bool:
    """Atualiza vehicle_catalog.py da fonte e recarrega o modulo em memoria.

    Falhas de rede/parsing nao devem derrubar a geracao de posts.
    """
    global vehicle_catalog_module, VEHICLE_CATALOG, format_price_brl
    global get_random_vehicle_for_category, get_vehicle

    try:
        import sync_catalog

        ts_content = sync_catalog.fetch_constants_ts(local_repo_path)
        vehicles = sync_catalog.parse_vehicles(ts_content)
        if not vehicles:
            raise RuntimeError("catalog sync returned no vehicles")

        catalog_py = sync_catalog.generate_catalog_py(vehicles)
        sync_catalog.OUTPUT_FILE.write_text(catalog_py, encoding="utf-8")

        importlib.invalidate_caches()
        vehicle_catalog_module = importlib.reload(vehicle_catalog_module)
        VEHICLE_CATALOG = vehicle_catalog_module.VEHICLE_CATALOG
        format_price_brl = vehicle_catalog_module.format_price_brl
        get_random_vehicle_for_category = vehicle_catalog_module.get_random_vehicle_for_category
        get_vehicle = vehicle_catalog_module.get_vehicle
        logger.info(f"Catalogo sincronizado: {len(VEHICLE_CATALOG)} veiculos.")
        return True
    except Exception as e:
        logger.warning(f"Falha ao sincronizar catalogo; usando snapshot local: {e}")
        return False


def _catalog_vehicle_lines(vehicle: dict) -> list[str]:
    return [
        f"- Marca: {vehicle['brand']}",
        f"- Modelo: {vehicle['model']}",
        f"- Categoria no catalogo: {vehicle['cat']}",
        f"- Preco no catalogo: {format_price_brl(vehicle['price'])}",
        f"- Autonomia no catalogo: {vehicle['range']} km",
        f"- Potencia no catalogo: {vehicle.get('power', '?')} cv",
        f"- Bateria no catalogo: {vehicle.get('battery', '?')} kWh",
    ]


def _vehicle_key(vehicle: dict) -> str:
    return f"{vehicle['brand']}::{vehicle['model']}"


def _is_disallowed_vehicle(vehicle: dict) -> bool:
    model = _normalize_text(vehicle.get("model", ""))
    return any(term in model for term in DISALLOWED_VEHICLE_MODEL_TERMS)


def _vehicle_image_slug(vehicle: dict) -> str:
    return (vehicle.get("img") or "").rsplit(".", 1)[0].replace(" ", "-").lower()


def _vehicle_output_slug(vehicle: dict) -> str:
    return f"{vehicle['brand']}-{vehicle['model']}".lower().replace(" ", "-")


def _post_uses_vehicle_image(post: ScheduledPost, vehicle: dict) -> bool:
    image_ref = f"{post.image_path or ''} {post.image_url or ''}".replace("\\", "/").lower()
    if not image_ref:
        return False

    image_slug = _vehicle_image_slug(vehicle)
    output_slug = _vehicle_output_slug(vehicle)
    return bool(
        (image_slug and image_slug in image_ref)
        or (output_slug and output_slug in image_ref)
    )


def _normalize_text(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value or "")
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", " ", ascii_only.lower()).strip()


def _headline_from_caption(caption: str) -> str:
    first_line = (caption or "").splitlines()[0].strip()
    return first_line or (caption or "").strip()


def _caption_mentions_vehicle_price(caption: str) -> bool:
    original = caption or ""
    normalized = _normalize_text(caption)
    if not normalized:
        return False

    if re.search(r"\bR\$\s*\d", original, flags=re.IGNORECASE):
        return True

    price_indicators = (
        r"\bprecos?\b",
        r"\bvalores?\b",
        r"\bcusta\b",
        r"\bcustam\b",
        r"\bpartir de\b",
        r"\bfaixa de preco\b",
        r"\bpreco de compra\b",
        r"\bmais barato\b",
    )
    return any(re.search(pattern, normalized) for pattern in price_indicators)


def _ensure_price_variation_note(caption: str) -> str:
    caption = (caption or "").strip()
    if not caption:
        return caption

    normalized_caption = _normalize_text(caption)
    normalized_note = _normalize_text(PRICE_VARIATION_NOTE)
    if normalized_note in normalized_caption:
        return caption

    if not _caption_mentions_vehicle_price(caption):
        return caption

    return f"{caption}\n\n{PRICE_VARIATION_NOTE}"


def _append_unique(values: list[str], value: str, limit: int = 5):
    if not value or value in values:
        return
    values.append(value)
    if len(values) > limit:
        del values[0]


def _load_content_memory(include_pending: bool = True) -> dict:
    """Carrega memoria recente de posts publicados/pendentes para evitar repeticao."""
    session = get_session()
    posts = session.query(ScheduledPost).order_by(ScheduledPost.created_at).all()

    memory = {
        "vehicle_keys": set(),
        "vehicle_image_slugs": set(),
        "vehicle_names": [],
        "headline_samples_by_category": {},
        "recent_captions": [],
    }

    for post in posts:
        if not include_pending and not post.published:
            continue

        category = post.category or "geral"
        samples = memory["headline_samples_by_category"].setdefault(category, [])
        headline = _headline_from_caption(post.caption or "")
        _append_unique(samples, headline)
        memory["recent_captions"].append({
            "category": category,
            "caption": post.caption or "",
            "headline": headline,
        })

        for vehicle in _find_matching_vehicles(post.caption or "", limit=3):
            key = _vehicle_key(vehicle)
            memory["vehicle_keys"].add(key)
            image_slug = _vehicle_image_slug(vehicle)
            if image_slug:
                memory["vehicle_image_slugs"].add(image_slug)
            _append_unique(memory["vehicle_names"], f"{vehicle['brand']} {vehicle['model']}", limit=12)

        for vehicle in VEHICLE_CATALOG:
            if not _post_uses_vehicle_image(post, vehicle):
                continue
            memory["vehicle_keys"].add(_vehicle_key(vehicle))
            image_slug = _vehicle_image_slug(vehicle)
            if image_slug:
                memory["vehicle_image_slugs"].add(image_slug)
            _append_unique(memory["vehicle_names"], f"{vehicle['brand']} {vehicle['model']}", limit=12)

    session.close()
    return memory


def _category_candidates(category: str) -> list[dict]:
    category_filters = {
        "modelo_destaque": {},
        "comparativo": {},
        "dica_ev": {},
        "tco_insight": {"max_price": 250000},
        "noticia_mercado": {},
    }
    filters = category_filters.get(category, {})
    candidates = [vehicle for vehicle in VEHICLE_CATALOG if not _is_disallowed_vehicle(vehicle)]
    if "max_price" in filters:
        candidates = [vehicle for vehicle in candidates if vehicle["price"] <= filters["max_price"]]
    return candidates


def _is_vehicle_banned(
    vehicle: dict,
    banned_vehicle_keys: set[str],
    banned_image_slugs: set[str] | None = None,
) -> bool:
    image_slug = _vehicle_image_slug(vehicle)
    return (
        _vehicle_key(vehicle) in banned_vehicle_keys
        or bool(image_slug and image_slug in (banned_image_slugs or set()))
    )


def _pick_unused_vehicle_for_category(
    category: str,
    banned_vehicle_keys: set[str],
    banned_image_slugs: set[str] | None = None,
) -> dict | None:
    candidates = [
        vehicle for vehicle in _category_candidates(category)
        if not _is_vehicle_banned(vehicle, banned_vehicle_keys, banned_image_slugs)
    ]
    return random.choice(candidates) if candidates else None


def _pick_any_unused_vehicle(
    excluded: set[str],
    banned_image_slugs: set[str] | None = None,
) -> dict | None:
    candidates = [
        vehicle for vehicle in VEHICLE_CATALOG
        if not _is_disallowed_vehicle(vehicle)
        and not _is_vehicle_banned(vehicle, excluded, banned_image_slugs)
    ]
    return random.choice(candidates) if candidates else None


def _pick_related_vehicle(
    base_vehicle: dict,
    excluded: set[str] | None = None,
    banned_image_slugs: set[str] | None = None,
) -> dict | None:
    excluded = excluded or set()
    same_category = [
        vehicle for vehicle in VEHICLE_CATALOG
        if vehicle["cat"] == base_vehicle["cat"]
        and not _is_disallowed_vehicle(vehicle)
        and not _is_vehicle_banned(vehicle, excluded, banned_image_slugs)
    ]
    if same_category:
        same_category.sort(key=lambda vehicle: abs(vehicle["price"] - base_vehicle["price"]))
        return same_category[0]

    return _pick_any_unused_vehicle(excluded, banned_image_slugs)


def _resolve_source_vehicles(category: str, topic: str | None = None, memory: dict | None = None) -> list[dict]:
    banned_vehicle_keys = set((memory or {}).get("vehicle_keys", set()))
    banned_image_slugs = set((memory or {}).get("vehicle_image_slugs", set()))

    if category == "comparativo":
        explicit_comparison = _resolve_comparison_topic_vehicles(topic)
        if topic and explicit_comparison:
            if len(explicit_comparison) >= 2:
                return explicit_comparison[:2]
            return []
        if topic and _has_comparison_separator(topic):
            return []

        matched = [
            vehicle for vehicle in (_find_matching_vehicles(topic or "", limit=2) if topic else [])
            if not _is_disallowed_vehicle(vehicle)
            and not _is_vehicle_banned(vehicle, banned_vehicle_keys, banned_image_slugs)
        ]
        if len(matched) >= 2:
            return matched[:2]

        if len(matched) == 1:
            first = matched[0]
            excluded = {f"{first['brand']}::{first['model']}"}
            second = _pick_related_vehicle(
                first,
                excluded=excluded | banned_vehicle_keys,
                banned_image_slugs=banned_image_slugs,
            )
            return [first, second] if second else []

        first = _pick_unused_vehicle_for_category(category, banned_vehicle_keys, banned_image_slugs)
        if not first:
            return []

        excluded = {f"{first['brand']}::{first['model']}"}
        second = _pick_related_vehicle(
            first,
            excluded=excluded | banned_vehicle_keys,
            banned_image_slugs=banned_image_slugs,
        )
        return [vehicle for vehicle in [first, second] if vehicle]

    matched = [
        vehicle for vehicle in (_find_matching_vehicles(topic or "", limit=2) if topic else [])
        if not _is_disallowed_vehicle(vehicle)
        and not _is_vehicle_banned(vehicle, banned_vehicle_keys, banned_image_slugs)
    ]
    if matched:
        return matched[:1]

    if topic:
        vehicle = get_vehicle(topic)
        if (
            vehicle
            and not _is_disallowed_vehicle(vehicle)
            and not _is_vehicle_banned(vehicle, banned_vehicle_keys, banned_image_slugs)
        ):
            return [vehicle]
        if category in GROUNDED_VEHICLE_CATEGORIES:
            return []

    if category in GROUNDED_VEHICLE_CATEGORIES:
        vehicle = _pick_unused_vehicle_for_category(category, banned_vehicle_keys, banned_image_slugs)
        if vehicle:
            return [vehicle]

    return []


def _has_comparison_separator(topic: str | None) -> bool:
    if not topic:
        return False

    normalized_topic = re.sub(r"\s+", " ", topic).strip().lower()
    return any(separator in normalized_topic for separator in [" vs ", " versus ", " contra ", " x "])


def _resolve_comparison_topic_vehicles(topic: str | None) -> list[dict]:
    """Resolve comparativo explicitamente por lado para evitar alias genericos dominarem o match."""
    if not topic or not _has_comparison_separator(topic):
        return []

    normalized_topic = re.sub(r"\s+", " ", topic).strip()
    separators = [" vs ", " versus ", " contra ", " x "]

    left = right = None
    topic_lower = normalized_topic.lower()
    for separator in separators:
        idx = topic_lower.find(separator)
        if idx != -1:
            left = normalized_topic[:idx].strip(" -–—:,.;")
            right = normalized_topic[idx + len(separator):].strip(" -–—:,.;")
            break

    if not left or not right:
        return []

    resolved: list[dict] = []
    seen = set()
    for fragment in [left, right]:
        matches = _find_matching_vehicles(fragment, limit=1)
        if not matches:
            continue
        vehicle = matches[0]
        key = _vehicle_key(vehicle)
        if key in seen:
            continue
        resolved.append(vehicle)
        seen.add(key)

    return resolved


def _build_source_context(category: str, source_vehicles: list[dict]) -> str:
    if not source_vehicles:
        return ""

    blocks = []
    for index, vehicle in enumerate(source_vehicles, start=1):
        blocks.append(
            "\n".join(
                [f"VEICULO {index} - fonte: catalogo do Guia PBEV / guiapbev.cloud"]
                + _catalog_vehicle_lines(vehicle)
            )
        )

    rules = [
        "REGRAS DE FATO:",
        "- Quando citar modelo, versao, preco, autonomia, potencia, bateria ou categoria, use somente os dados do bloco DADOS_FONTE.",
        "- Nao invente numeros, versoes, equipamentos ou comparacoes fora do que estiver em DADOS_FONTE.",
        "- Se faltar um dado para sustentar uma afirmacao, prefira nao afirmar.",
    ]

    if category == "comparativo":
        rules.append("- No comparativo, compare apenas os veiculos listados em DADOS_FONTE.")

    if category == "tco_insight":
        rules.extend([
            "- Em TCO, use DADOS_FONTE para qualquer atributo tecnico do carro e evite custos numericos nao fornecidos.",
            "- O simulador TCO do Guia PBEV considera horizonte fixo de 4 anos.",
            "- Quando citar periodo, horizonte de analise, economia acumulada, payback ou comparacao de custo, use sempre 4 anos.",
            "- Nunca mencione 1, 3 ou 5 anos em posts de TCO, a menos que isso esteja explicitamente fora do contexto do simulador.",
        ])

    return "\n\nDADOS_FONTE:\n" + "\n\n".join(blocks) + "\n\n" + "\n".join(rules)


def _build_market_snapshot_context() -> str:
    """Gera contexto factual do mercado a partir do catalogo local."""
    if not VEHICLE_CATALOG:
        return ""

    total_models = len(VEHICLE_CATALOG)
    brands = sorted({vehicle["brand"] for vehicle in VEHICLE_CATALOG})
    total_brands = len(brands)

    category_counts = {}
    brand_counts = {}
    for vehicle in VEHICLE_CATALOG:
        category_counts[vehicle["cat"]] = category_counts.get(vehicle["cat"], 0) + 1
        brand_counts[vehicle["brand"]] = brand_counts.get(vehicle["brand"], 0) + 1

    top_categories = sorted(category_counts.items(), key=lambda item: item[1], reverse=True)[:3]
    top_brands = sorted(brand_counts.items(), key=lambda item: item[1], reverse=True)[:5]
    cheapest = min(VEHICLE_CATALOG, key=lambda vehicle: vehicle["price"])
    longest_range = max(VEHICLE_CATALOG, key=lambda vehicle: vehicle["range"])

    lines = [
        "DADOS_FONTE_MERCADO:",
        f"- Modelos homologados no catalogo atual: {total_models}",
        f"- Marcas presentes no catalogo atual: {total_brands}",
        f"- Faixa de preco do catalogo: {format_price_brl(min(v['price'] for v in VEHICLE_CATALOG))} ate {format_price_brl(max(v['price'] for v in VEHICLE_CATALOG))}",
        f"- Modelo de entrada no catalogo: {cheapest['brand']} {cheapest['model']} por {format_price_brl(cheapest['price'])}",
        f"- Maior autonomia no catalogo: {longest_range['brand']} {longest_range['model']} com {longest_range['range']} km",
        "- Categorias com mais modelos no catalogo:",
    ]
    lines.extend(f"  - {category}: {count}" for category, count in top_categories)
    lines.append("- Marcas com mais modelos no catalogo:")
    lines.extend(f"  - {brand}: {count}" for brand, count in top_brands)
    lines.extend([
        "REGRAS_FATUAIS_NOTICIA_MERCADO:",
        "- Use esses dados como base principal para noticia_mercado.",
        "- Nao invente numeros de vendas, emplacamentos, market share, rede de recarga ou crescimento anual se esses dados nao estiverem explicitamente fornecidos.",
        "- Se quiser falar de tendencia, descreva tendencia observavel a partir do catalogo, como variedade de modelos, faixas de preco, marcas presentes ou categorias em destaque.",
        "- Se citar um numero, ele deve vir dos dados acima.",
    ])
    return "\n".join(lines)


def _build_generation_prompt(
    category: str,
    category_desc: str,
    cta_url: str,
    topic: str | None = None,
    day: str | None = None,
    hour: int | None = None,
    analytics_context: str = "",
    source_vehicles: list[dict] | None = None,
) -> str:
    schedule_line = ""
    if day is not None and hour is not None:
        schedule_line = f"Dia/Horario: {day} as {hour}h\n"
    current_date = datetime.now(ZoneInfo(get_settings().posting_timezone)).date()

    topic_line = f"Topico especifico: {topic}\n" if topic else ""
    source_context = _build_source_context(category, source_vehicles or [])
    market_context = ""
    if category == "noticia_mercado":
        market_context = "\n\n" + _build_market_snapshot_context()
    repetition_context = ""
    if analytics_context.startswith("\nANGULOS_RECENTES"):
        repetition_context = analytics_context
        analytics_context = ""
    cta_guidance = ""
    if "/comparador" in cta_url:
        cta_guidance = (
            "\nORIENTACAO DE CTA:\n"
            "- O link leva ao comparador.\n"
            "- Use CTA compativel com comparar modelos, versões ou custos lado a lado.\n"
            "- Em vez de URL literal, prefira 'compare no link da bio' ou 'veja o comparador no Guia PBEV'.\n"
            "- Nao chame isso de guia completo ou artigo."
        )
    elif "/simulador-tco" in cta_url:
        if category == "comparativo":
            cta_guidance = (
                "\nORIENTACAO DE CTA:\n"
                "- O link leva ao simulador TCO.\n"
                "- Use CTA compativel com comparar o custo total dos veiculos no simulador.\n"
                "- Em vez de URL literal, prefira 'compare os custos no simulador pelo link da bio'.\n"
                "- Nao mencione comparador e nao chame isso de guia completo ou artigo."
            )
        else:
            cta_guidance = (
                "\nORIENTACAO DE CTA:\n"
                "- O link leva ao simulador TCO.\n"
                "- Use CTA compatível com simular custos, economia, recarga ou uso do veículo.\n"
                "- Em vez de URL literal, prefira 'simule no link da bio' ou 'acesse o simulador no Guia PBEV'.\n"
                "- Nao chame isso de guia completo ou artigo."
            )
    else:
        cta_guidance = (
            "\nORIENTACAO DE CTA:\n"
            "- O link leva para a home do site.\n"
            "- Use CTA generico como ver no site, explorar o catalogo ou acessar a plataforma, preferindo 'link na bio'.\n"
            "- Nao chame isso de guia completo, artigo, manual ou pagina especifica."
        )
    factuality_rules = (
        "\nREGRAS GERAIS DE FATO:\n"
        f"- Data atual da geracao: {current_date.isoformat()}.\n"
        f"- Estamos em {current_date.year}; trate {current_date.year} como o ano corrente em hooks, CTAs, conclusoes e descricoes do mercado atual.\n"
        f"- Ao falar do mercado atual, catalogo atual, precos atuais, modelos que valem a pena hoje, lancamentos ou disponibilidade, use {current_date.year} como referencia ou evite citar ano.\n"
        f"- Nao escreva hooks ou frases de atualidade com qualquer ano anterior a {current_date.year}, incluindo 'em 2024', 'em 2025', 'ano passado' ou equivalentes.\n"
        "- Anos antigos so podem aparecer em noticia_mercado quando forem uma comparacao historica explicitamente sustentada por fonte; fora disso, evite anos antigos.\n"
        "- Se nao houver DADOS_FONTE, evite citar modelo, versao, preco, autonomia, potencia ou bateria especificos.\n"
        "- Se houver DADOS_FONTE, use apenas os veiculos e numeros fornecidos ali."
    )

    hook_style = random.choice(HOOK_PATTERNS)
    engagement_cta = random.choice(ENGAGEMENT_CTAS)
    return f"""Gere UM post de Instagram para o Guia PBEV Brasil.

Categoria: {category_desc}
CTA URL rastreavel: {cta_url}
{schedule_line}{topic_line}{analytics_context}{source_context}{market_context}{repetition_context}{cta_guidance}{factuality_rules}
Escolha um angulo relevante dentro da categoria e crie um post completo.

DIRETRIZES DE GANCHO E ENGajamento:
- Hook: {hook_style}
- CTA de engajamento (ultima linha da legenda): {engagement_cta}

Responda em JSON:
{{
  "caption": "...",
  "hashtags": "#tag1 #tag2 ...",
  "image_prompt": "descricao curta da imagem ideal para o post",
  "hook": "primeira linha impactante"
}}
"""


def _build_recent_avoidance_context(category: str, memory: dict | None = None) -> str:
    if not memory:
        return ""

    recent_headlines = (memory.get("headline_samples_by_category") or {}).get(category, [])
    recent_vehicle_names = memory.get("vehicle_names", [])
    lines = []

    if recent_headlines:
        lines.append("\nANGULOS_RECENTES_JA_USADOS_NESTA_CATEGORIA:")
        for headline in recent_headlines[-5:]:
            lines.append(f"- {headline}")
        lines.append("- Gere um angulo claramente diferente dos itens acima.")

    if category in GROUNDED_VEHICLE_CATEGORIES and recent_vehicle_names:
        lines.append("VEICULOS_JA_EXPLORADOS_RECENTEMENTE:")
        for name in recent_vehicle_names[-8:]:
            lines.append(f"- {name}")
        lines.append("- Prefira outro modelo se houver alternativa no catalogo.")

    recent_captions = memory.get("recent_captions", [])
    if recent_captions:
        lines.append("CONTEUDOS_RECENTES_JA_USADOS:")
        for entry in recent_captions[-6:]:
            lines.append(f"- [{entry['category']}] {entry['headline']}")
        lines.append("- Nao repita o mesmo gancho, a mesma tese central ou a mesma estrutura argumentativa.")

    return ("\n" + "\n".join(lines)) if lines else ""


def _remember_generated_post(memory: dict, category: str, caption: str, source_vehicles: list[dict] | None = None):
    if memory is None:
        return

    samples = memory["headline_samples_by_category"].setdefault(category, [])
    _append_unique(samples, _headline_from_caption(caption))
    memory.setdefault("recent_captions", []).append({
        "category": category,
        "caption": caption,
        "headline": _headline_from_caption(caption),
    })
    if len(memory["recent_captions"]) > 24:
        del memory["recent_captions"][:-24]

    for vehicle in source_vehicles or []:
        memory["vehicle_keys"].add(_vehicle_key(vehicle))
        image_slug = _vehicle_image_slug(vehicle)
        if image_slug:
            memory.setdefault("vehicle_image_slugs", set()).add(image_slug)
        _append_unique(memory["vehicle_names"], f"{vehicle['brand']} {vehicle['model']}", limit=12)


def _content_tokens(text: str) -> set[str]:
    normalized = _normalize_text(text)
    return {
        token for token in normalized.split()
        if len(token) >= 4 and token not in CONTENT_STOPWORDS and not token.isdigit()
    }


def _content_similarity(left: str, right: str) -> float:
    left_tokens = _content_tokens(left)
    right_tokens = _content_tokens(right)
    if not left_tokens or not right_tokens:
        return 0.0
    intersection = len(left_tokens & right_tokens)
    union = len(left_tokens | right_tokens)
    return intersection / union if union else 0.0


def _is_repeated_content(caption: str, category: str, memory: dict | None = None) -> bool:
    if not memory:
        return False

    headline = _headline_from_caption(caption)
    normalized_headline = _normalize_text(headline)
    for entry in memory.get("recent_captions", []):
        existing_caption = entry.get("caption", "")
        existing_headline = entry.get("headline", "")
        if normalized_headline and normalized_headline == _normalize_text(existing_headline):
            return True

        similarity = _content_similarity(caption, existing_caption)
        if similarity >= 0.78:
            return True
        if entry.get("category") == category and similarity >= 0.62:
            return True

    return False


def _validate_temporal_references(
    caption: str,
    category: str,
    current_date: date | None = None,
) -> None:
    """Reject captions that frame old temporal references as current information."""
    current_date = current_date or datetime.now(ZoneInfo(get_settings().posting_timezone)).date()
    current_year = current_date.year
    caption = caption or ""
    normalized = _normalize_text(caption)

    years = {int(year) for year in re.findall(r"(?<!\d)(20\d{2})(?!\d)", caption)}
    stale_years = sorted(year for year in years if year < current_year)

    if category != "noticia_mercado" and stale_years:
        raise ValueError(
            f"generated caption contains stale calendar year(s): {', '.join(map(str, stale_years))}"
        )

    if category == "noticia_mercado" and any(year < current_year - 1 for year in years):
        raise ValueError("market news caption contains an unsupported old calendar year")

    stale_relative_terms = [
        "ano passado",
        "no ano passado",
        "mercado do ano passado",
        "dados do ano passado",
    ]
    if category != "noticia_mercado":
        for term in stale_relative_terms:
            if term in normalized:
                raise ValueError(f"generated caption contains stale temporal reference: {term}")


def generate_weekly_content(target_date: datetime | None = None) -> list[dict]:
    """Gera conteúdo para uma semana inteira.

    Returns:
        Lista de dicts com caption, hashtags, category, scheduled_at, image_prompt.
    """
    settings = get_settings()
    tz = ZoneInfo(settings.posting_timezone)
    start_date = target_date or datetime.now(tz)
    sync_vehicle_catalog()

    weekly_slots = _build_weekly_slots(start_date, tz)
    memory = _load_content_memory(include_pending=True)

    # Adiciona URL rastreável para cada slot
    from analytics import get_cta_url
    for i, slot in enumerate(weekly_slots):
        slot["cta_url"] = get_cta_url(category=slot["category"], post_id=i)

    # Tenta puxar insights do Plausible (não-bloqueante)
    analytics_context = ""
    try:
        import asyncio
        from analytics import get_content_insights
        insights = asyncio.run(get_content_insights())
        if insights.get("recommendation"):
            analytics_context = f"""

INSIGHTS DO ANALYTICS (últimos 30 dias):
{insights['recommendation']}
Use esses dados para priorizar temas e CTAs.
"""
    except Exception as e:
        logger.debug(f"Analytics indisponível, gerando sem insights: {e}")

    client = get_client()

    posts = []
    for i, slot in enumerate(weekly_slots):
        cat_info = next((c for c in CONTENT_CATEGORIES if c["id"] == slot["category"]), None)
        cat_desc = json.dumps(cat_info, ensure_ascii=False) if cat_info else slot["category"]

        source_vehicles = _resolve_source_vehicles(slot["category"], memory=memory)
        if slot["category"] in GROUNDED_VEHICLE_CATEGORIES and not source_vehicles:
            logger.warning(
                f"  Slot {i+1} ({slot['day']} {slot['hour']}h) ignorado: sem veiculos ineditos disponiveis para {slot['category']}."
            )
            continue
        slot_generated = False
        for attempt in range(1, MAX_GENERATION_ATTEMPTS + 1):
            repetition_context = _build_recent_avoidance_context(slot["category"], memory)
            retry_context = ""
            if attempt > 1:
                retry_context = (
                    "\nREJEICAO_DA_TENTATIVA_ANTERIOR:\n"
                    "- O texto anterior ficou parecido demais com posts ja existentes.\n"
                    "- Gere um angulo novo, com hook, tese central e desenvolvimento claramente diferentes.\n"
                    "- Nao repita a mesma estrutura, a mesma promessa e os mesmos exemplos.\n"
                )
            prompt = _build_generation_prompt(
                category=slot["category"],
                category_desc=cat_desc,
                cta_url=slot.get("cta_url", settings.public_site_base_url),
                day=slot["day"],
                hour=slot["hour"],
                analytics_context=analytics_context + repetition_context + retry_context,
                source_vehicles=source_vehicles,
            )

            try:
                response = client.models.generate_content(
                    model=settings.gemini_model,
                    contents=prompt,
                    config=_gen_config(max_tokens=2048),
                )
                post = _parse_response(response.text)
                post["caption"] = _ensure_price_variation_note(post.get("caption", ""))
                _validate_temporal_references(post["caption"], slot["category"])
                if _is_repeated_content(post["caption"], slot["category"], memory):
                    raise ValueError("generated content is too similar to recent posts")

                text_cost_meta = build_text_cost_metadata(
                    model=settings.gemini_model,
                    prompt_text=prompt,
                    response_text=response.text,
                    response=response,
                )
                usage = extract_token_usage(response, prompt_text=prompt, response_text=response.text)
                log_generation_event(
                    event_type="text",
                    provider="gemini",
                    model=settings.gemini_model,
                    category=slot["category"],
                    source="weekly_queue",
                    status="success",
                    input_tokens=usage["input_tokens"],
                    output_tokens=usage["output_tokens"],
                    total_tokens=usage["total_tokens"],
                    estimated_cost_usd=text_cost_meta.get("text_cost_usd"),
                    cost_source=text_cost_meta.get("text_cost_source"),
                    prompt_excerpt=prompt,
                    response_excerpt=response.text,
                )
                posts.append({
                    "caption": post["caption"],
                    "hashtags": post["hashtags"],
                    "category": slot["category"],
                    "scheduled_at": slot["datetime"],
                    "image_prompt": post.get("image_prompt", ""),
                    "source_vehicles": source_vehicles,
                    "text_cost_meta": text_cost_meta,
                })
                _remember_generated_post(memory, slot["category"], post["caption"], source_vehicles)
                logger.info(f"  Post {i+1}/{len(weekly_slots)} gerado: {slot['day']} {slot['hour']}h")
                slot_generated = True
                break
            except Exception as e:
                prompt_tokens = rough_token_estimate(prompt)
                log_generation_event(
                    event_type="text",
                    provider="gemini",
                    model=settings.gemini_model,
                    category=slot["category"],
                    source="weekly_queue",
                    status="failed",
                    input_tokens=prompt_tokens,
                    output_tokens=0,
                    total_tokens=prompt_tokens,
                    estimated_cost_usd=None,
                    cost_source="failed_unknown",
                    prompt_excerpt=prompt,
                    error_message=str(e),
                )
                if attempt < MAX_GENERATION_ATTEMPTS:
                    logger.warning(
                        f"  Tentativa {attempt}/{MAX_GENERATION_ATTEMPTS} rejeitada no slot {i+1} ({slot['day']} {slot['hour']}h): {e}"
                    )
                else:
                    logger.warning(f"  Falha no slot {i+1} ({slot['day']} {slot['hour']}h): {e}")

        if not slot_generated:
            continue

    logger.info(f"✅ Gerados {len(posts)} posts para a semana de {start_date.date()}")
    return posts


def generate_single_post(
    category: str,
    topic: str | None = None,
    sync_catalog_first: bool = True,
    generation_source: str = "single_post",
) -> dict:
    """Gera um único post sobre um tópico específico."""
    client = get_client()
    from analytics import get_cta_url
    if sync_catalog_first:
        sync_vehicle_catalog()

    cat_info = next((c for c in CONTENT_CATEGORIES if c["id"] == category), None)
    cat_desc = json.dumps(cat_info, ensure_ascii=False) if cat_info else category
    memory = _load_content_memory(include_pending=True)
    source_vehicles = _resolve_source_vehicles(category, topic, memory=memory)
    if category in GROUNDED_VEHICLE_CATEGORIES and not source_vehicles:
        raise ValueError(f"Nao ha veiculos ineditos disponiveis para gerar um post de {category}.")
    for attempt in range(1, MAX_GENERATION_ATTEMPTS + 1):
        repetition_context = _build_recent_avoidance_context(category, memory)
        retry_context = ""
        if attempt > 1:
            retry_context = (
                "\nREJEICAO_DA_TENTATIVA_ANTERIOR:\n"
                "- O texto anterior ficou parecido demais com posts ja existentes.\n"
                "- Gere uma abordagem nova, com hook e desenvolvimento diferentes.\n"
            )
        prompt = _build_generation_prompt(
            category=category,
            category_desc=cat_desc,
            cta_url=get_cta_url(category=category, post_id=random.randint(1000, 9999)),
            topic=topic,
            analytics_context=repetition_context + retry_context,
            source_vehicles=source_vehicles,
        )

        try:
            response = client.models.generate_content(
                model=get_settings().gemini_model,
                contents=prompt,
                config=_gen_config(max_tokens=2048),
            )
            post = _parse_response(response.text)
            post["caption"] = _ensure_price_variation_note(post.get("caption", ""))
            _validate_temporal_references(post["caption"], category)
            if _is_repeated_content(post["caption"], category, memory):
                raise ValueError("generated content is too similar to recent posts")

            text_cost_meta = build_text_cost_metadata(
                model=get_settings().gemini_model,
                prompt_text=prompt,
                response_text=response.text,
                response=response,
            )
            usage = extract_token_usage(response, prompt_text=prompt, response_text=response.text)
            log_generation_event(
                event_type="text",
                provider="gemini",
                model=get_settings().gemini_model,
                category=category,
                source=generation_source,
                status="success",
                input_tokens=usage["input_tokens"],
                output_tokens=usage["output_tokens"],
                total_tokens=usage["total_tokens"],
                estimated_cost_usd=text_cost_meta.get("text_cost_usd"),
                cost_source=text_cost_meta.get("text_cost_source"),
                prompt_excerpt=prompt,
                response_excerpt=response.text,
            )
            break
        except Exception as e:
            prompt_tokens = rough_token_estimate(prompt)
            log_generation_event(
                event_type="text",
                provider="gemini",
                model=get_settings().gemini_model,
                category=category,
                source=generation_source,
                status="failed",
                input_tokens=prompt_tokens,
                output_tokens=0,
                total_tokens=prompt_tokens,
                estimated_cost_usd=None,
                cost_source="failed_unknown",
                prompt_excerpt=prompt,
                error_message=str(e),
            )
            if attempt < MAX_GENERATION_ATTEMPTS:
                logger.warning(f"Tentativa {attempt}/{MAX_GENERATION_ATTEMPTS} rejeitada em [{category}]: {e}")
                continue
            raise
    post["category"] = category
    post["source_vehicles"] = source_vehicles
    post["text_cost_meta"] = text_cost_meta
    return post


def generate_monthly_market_news_post(target_date: datetime | None = None) -> dict:
    """Generate one monthly noticia_mercado post grounded in recent market sources."""
    settings = get_settings()
    tz = ZoneInfo(settings.posting_timezone)
    scheduled_at = target_date or datetime.now(tz).replace(hour=10, minute=0, second=0, microsecond=0)
    if scheduled_at < datetime.now(tz):
        scheduled_at = scheduled_at + timedelta(days=1)

    target_year, target_month = get_previous_month_period(scheduled_at)
    news_items = collect_market_news(
        max_items=5,
        days_back=130,
        target_year=target_year,
        target_month=target_month,
    )

    if not news_items:
        raise ValueError(
            f"Nao encontrei fontes de mercado para {MONTH_NAMES_PT[target_month]} de {target_year}; "
            "geracao abortada para evitar publicar dados de outro mes."
        )
    market_context = build_market_news_context(
        news_items,
        target_year=target_year,
        target_month=target_month,
    )
    topic = (
        f"Panorama do mercado brasileiro de veiculos eletrificados em {MONTH_NAMES_PT[target_month]} de {target_year}. "
        "Baseie o post nos resultados desse mes de emplacamentos, participacao de mercado, "
        "BEV/PHEV/HEV e sinais de crescimento citados nas fontes coletadas."
    )
    source_note = (
        "\n\nCONTEXTO_DE_MERCADO_COLETADO:\n"
        f"{market_context}\n\n"
        "REGRAS ESPECIFICAS PARA NOTICIA_MERCADO:\n"
        "- Use apenas numeros, percentuais e comparacoes que aparecam nas fontes acima.\n"
        f"- O periodo analisado e {MONTH_NAMES_PT[target_month]} de {target_year}; nao use dados de outro mes.\n"
        "- Se a fonte nao trouxer um dado, nao estime e nao complete por conta propria.\n"
        "- Prefira formular como panorama do mes, nao como breaking news.\n"
        "- Mencione a origem dos dados no texto de forma natural, por exemplo 'segundo a ABVE'.\n"
        "- Nao coloque links literais das fontes na legenda; use o CTA do Guia PBEV."
    )

    post = generate_single_post(
        category="noticia_mercado",
        topic=topic + source_note,
        sync_catalog_first=False,
        generation_source="monthly_market_news",
    )
    post["scheduled_at"] = scheduled_at.isoformat()
    post["market_news_sources"] = [item.__dict__ for item in news_items]
    return post


def save_posts_to_queue(posts: list[dict]) -> int:
    """Salva posts gerados na fila de publicação."""
    session = get_session()
    count = 0
    existing_posts = session.query(ScheduledPost).all()
    existing_signatures = {
        (
            _normalize_text(_headline_from_caption(existing.caption or "")),
            existing.category or "geral",
        )
        for existing in existing_posts
        if _headline_from_caption(existing.caption or "")
    }
    for post in posts:
        post["caption"] = _ensure_price_variation_note(post.get("caption", ""))
        scheduled_at = post["scheduled_at"]
        if isinstance(scheduled_at, str):
            scheduled_at = datetime.fromisoformat(scheduled_at)

        category = post.get("category", "geral")
        signature = (
            _normalize_text(_headline_from_caption(post.get("caption", ""))),
            category,
        )
        if signature[0] and signature in existing_signatures:
            logger.warning(
                "Post [%s] ignorado: chamada ja existe na fila/historico: %s",
                category,
                _headline_from_caption(post.get("caption", ""))[:120],
            )
            continue

        image_url = post.get("image_url")
        image_path = post.get("image_path")

        if not image_url:
            try:
                image_path, image_url, image_cost_meta = generate_and_host_post_image(
                    caption=post["caption"],
                    category=category,
                    subtitle=post.get("image_prompt", ""),
                    source_vehicles=post.get("source_vehicles"),
                    generation_source="queue_save",
                    return_metadata=True,
                )
            except Exception as e:
                logger.warning(f"Falha ao gerar imagem para post [{post.get('category', 'geral')}]: {e}")
                image_cost_meta = {}
        else:
            image_cost_meta = {}

        scheduled = ScheduledPost(
            caption=post["caption"],
            hashtags=post.get("hashtags", ""),
            image_url=image_url,
            image_path=image_path,
            scheduled_at=scheduled_at,
            category=category,
            post_type="image",
        )
        apply_cost_metadata(
            scheduled,
            merge_cost_metadata(
                text_meta=post.get("text_cost_meta"),
                image_meta=image_cost_meta,
            ),
        )
        session.add(scheduled)
        existing_signatures.add(signature)
        count += 1
    session.commit()
    session.close()
    logger.info(f"✅ {count} posts salvos na fila.")
    return count


def _get_weekly_occupied_dates(start: datetime) -> set[date]:
    """Return dates already occupied by scheduled posts from the starting day onward."""
    session = get_session()
    occupied = {
        post.scheduled_at.date()
        for post in session.query(ScheduledPost)
        .filter(
            ScheduledPost.scheduled_at != None,
            ScheduledPost.scheduled_at >= start,
        )
        .all()
        if post.scheduled_at
    }
    session.close()
    return occupied


def _build_weekly_slots(start: datetime, tz: ZoneInfo) -> list[dict]:
    """Build the next weekly cadence: 3 weekdays plus 1 Saturday."""
    day_names = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    categories_cycle = list(AUTO_GENERATED_CATEGORIES)
    target_days = set(WEEKLY_POSTING_DAYS)
    occupied_dates = _get_weekly_occupied_dates(start)

    slot_datetimes: list[datetime] = []
    cursor = start
    while len(slot_datetimes) < len(categories_cycle):
        day_name = day_names[cursor.weekday()]
        if day_name in target_days and cursor.date() not in occupied_dates:
            slot_dt = cursor.replace(
                hour=get_preferred_posting_hour(cursor, fallback_hour=cursor.hour),
                minute=0,
                second=0,
                microsecond=0,
            )
            if slot_dt >= start:
                slot_datetimes.append(slot_dt)
                occupied_dates.add(slot_dt.date())
        cursor = (cursor + timedelta(days=1)).replace(hour=start.hour, minute=start.minute, second=0, microsecond=0)

    slots = []
    for slot_dt in slot_datetimes:
        slots.append({
            "datetime": slot_dt,
            "day": day_names[slot_dt.weekday()],
            "hour": slot_dt.hour,
        })

    planned_categories = [
        categories_cycle[index % len(categories_cycle)]
        for index in range(len(slots))
    ]
    assigned_categories = assign_categories_to_slots(
        [slot["datetime"] for slot in slots],
        planned_categories,
    )

    for slot, category in zip(slots, assigned_categories):
        slot["category"] = category
        slot["datetime"] = slot["datetime"].isoformat()

    return slots
