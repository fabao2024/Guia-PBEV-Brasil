"""Estimativa de custo por post para modelos de texto e imagem."""

from __future__ import annotations

import math
from datetime import datetime


TEXT_PRICING_USD_PER_MILLION = {
    "gemini-2.5-flash-lite": {"input": 0.10, "output": 0.40},
}

IMAGE_PRICING_USD_PER_IMAGE = {
    "imagen-4.0-ultra-generate-001": 0.06,
}


def _match_text_pricing(model: str) -> dict[str, float] | None:
    normalized = (model or "").strip().lower()
    for key, pricing in TEXT_PRICING_USD_PER_MILLION.items():
        if normalized == key or normalized.startswith(f"{key}-"):
            return pricing
    return None


def _match_image_pricing(model: str) -> float | None:
    normalized = (model or "").strip().lower()
    for key, pricing in IMAGE_PRICING_USD_PER_IMAGE.items():
        if normalized == key or normalized.startswith(f"{key}-"):
            return pricing
    return None


def rough_token_estimate(text: str) -> int:
    clean = (text or "").strip()
    if not clean:
        return 0
    return max(1, math.ceil(len(clean) / 4))


def extract_token_usage(response, prompt_text: str = "", response_text: str = "") -> dict[str, int | str]:
    usage = getattr(response, "usage_metadata", None)
    input_tokens = getattr(usage, "prompt_token_count", None) or getattr(usage, "input_token_count", None)
    output_tokens = getattr(usage, "candidates_token_count", None) or getattr(usage, "output_token_count", None)
    total_tokens = getattr(usage, "total_token_count", None)

    if input_tokens is None:
        input_tokens = rough_token_estimate(prompt_text)
    if output_tokens is None:
        output_tokens = rough_token_estimate(response_text)
    if total_tokens is None:
        total_tokens = input_tokens + output_tokens

    source = "api_usage" if usage is not None else "estimated_chars"
    return {
        "input_tokens": int(input_tokens or 0),
        "output_tokens": int(output_tokens or 0),
        "total_tokens": int(total_tokens or 0),
        "source": source,
    }


def estimate_text_cost_usd(model: str, input_tokens: int, output_tokens: int) -> float | None:
    pricing = _match_text_pricing(model)
    if not pricing:
        return None
    return (
        (max(input_tokens, 0) / 1_000_000) * pricing["input"]
        + (max(output_tokens, 0) / 1_000_000) * pricing["output"]
    )


def estimate_image_cost_usd(provider: str, model: str, ai_image_used: bool) -> float | None:
    if not ai_image_used:
        return 0.0
    return _match_image_pricing(model)


def build_text_cost_metadata(model: str, prompt_text: str, response_text: str, response) -> dict:
    usage = extract_token_usage(response, prompt_text=prompt_text, response_text=response_text)
    return {
        "text_provider": "gemini",
        "text_model": model,
        "text_input_tokens": usage["input_tokens"],
        "text_output_tokens": usage["output_tokens"],
        "text_total_tokens": usage["total_tokens"],
        "text_cost_source": usage["source"],
        "text_cost_usd": estimate_text_cost_usd(
            model=model,
            input_tokens=usage["input_tokens"],
            output_tokens=usage["output_tokens"],
        ),
    }


def build_image_cost_metadata(provider: str, model: str, ai_image_used: bool) -> dict:
    cost = estimate_image_cost_usd(provider=provider, model=model, ai_image_used=ai_image_used)
    if ai_image_used:
        source = "fixed_pricing_per_image" if cost is not None else "unknown_pricing"
    else:
        source = "not_applicable"
    return {
        "image_provider": provider,
        "image_model": model,
        "ai_image_used": ai_image_used,
        "image_cost_source": source,
        "image_cost_usd": cost,
    }


def merge_cost_metadata(text_meta: dict | None = None, image_meta: dict | None = None) -> dict:
    text_meta = text_meta or {}
    image_meta = image_meta or {}
    text_cost = text_meta.get("text_cost_usd")
    image_cost = image_meta.get("image_cost_usd")
    total_cost = None if text_cost is None or image_cost is None else float(text_cost) + float(image_cost)
    return {
        **text_meta,
        **image_meta,
        "total_cost_usd": total_cost,
        "cost_estimate_complete": total_cost is not None,
        "cost_updated_at": datetime.utcnow(),
    }


def apply_cost_metadata(target, metadata: dict):
    for key, value in (metadata or {}).items():
        if hasattr(target, key):
            setattr(target, key, value)


def usd_to_brl(usd_value: float | None, fx_rate: float) -> float | None:
    if usd_value is None:
        return None
    return usd_value * fx_rate


def _clip_text(text: str | None, max_chars: int = 500) -> str | None:
    clean = (text or "").strip()
    if not clean:
        return None
    if len(clean) <= max_chars:
        return clean
    return clean[: max_chars - 3].rstrip() + "..."


def log_generation_event(
    *,
    event_type: str,
    provider: str,
    model: str,
    category: str | None = None,
    source: str | None = None,
    status: str = "success",
    scheduled_post_id: int | None = None,
    input_tokens: int | None = None,
    output_tokens: int | None = None,
    total_tokens: int | None = None,
    estimated_cost_usd: float | None = None,
    cost_source: str | None = None,
    prompt_excerpt: str | None = None,
    response_excerpt: str | None = None,
    error_message: str | None = None,
):
    from database import GenerationEvent, get_session

    session = get_session()
    event = GenerationEvent(
        scheduled_post_id=scheduled_post_id,
        event_type=event_type,
        provider=provider,
        model=model,
        category=category,
        source=source,
        status=status,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        total_tokens=total_tokens,
        estimated_cost_usd=estimated_cost_usd,
        cost_source=cost_source,
        prompt_excerpt=_clip_text(prompt_excerpt),
        response_excerpt=_clip_text(response_excerpt),
        error_message=_clip_text(error_message),
    )
    session.add(event)
    session.commit()
    session.close()
