"""Image generator for Instagram posts.

Cria imagens branded usando templates Pillow com a identidade visual do Guia PBEV.
Suporta 3 formatos: feed (1080x1080), story (1080x1920), carousel (1080x1080).

Estratégia: templates com backgrounds de cor sólida + texto overlay.
Para imagens de veículos, usa fotos do catálogo ou URLs externas.
"""

import os
import re
import logging
import unicodedata
from pathlib import Path
from io import BytesIO
from typing import Literal

import httpx
from PIL import Image, ImageDraw, ImageFont, ImageOps
from config import get_settings
from cost_tracking import build_image_cost_metadata, log_generation_event

try:
    import pillow_avif  # noqa: F401
except ImportError:
    pillow_avif = None

logger = logging.getLogger(__name__)

# --- Brand Identity ---
BRAND_COLORS = {
    "primary": "#0D9F6E",       # Verde elétrico
    "primary_dark": "#057A55",
    "secondary": "#1E40AF",     # Azul profundo
    "accent": "#F59E0B",        # Amarelo energia
    "dark_bg": "#111827",       # Fundo escuro
    "light_bg": "#F9FAFB",
    "white": "#FFFFFF",
    "text_dark": "#1F2937",
    "text_light": "#F3F4F6",
    "text_muted": "#9CA3AF",
}

# Categorias → paletas de cor
CATEGORY_PALETTES = {
    "modelo_destaque": {"bg": "#111827", "accent": "#0D9F6E", "text": "#FFFFFF"},
    "comparativo":     {"bg": "#1E3A5F", "accent": "#F59E0B", "text": "#FFFFFF"},
    "dica_ev":         {"bg": "#0D9F6E", "accent": "#FFFFFF", "text": "#FFFFFF"},
    "tco_insight":     {"bg": "#111827", "accent": "#F59E0B", "text": "#FFFFFF"},
    "noticia_mercado": {"bg": "#1E40AF", "accent": "#0D9F6E", "text": "#FFFFFF"},
    "geral":           {"bg": "#111827", "accent": "#0D9F6E", "text": "#FFFFFF"},
}

ASSETS_DIR = Path(__file__).parent / "assets"
OUTPUT_DIR = Path(__file__).parent / "generated_images"
AI_IMAGE_CATEGORIES = {"dica_ev", "tco_insight", "noticia_mercado"}
VEHICLE_PHOTO_CATEGORIES = {"modelo_destaque", "comparativo", "tco_insight"}

# Instagram dimensions
SIZES = {
    "feed": (1080, 1080),
    "story": (1080, 1920),
    "carousel": (1080, 1080),
}


def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def ensure_dirs():
    ASSETS_DIR.mkdir(exist_ok=True)
    OUTPUT_DIR.mkdir(exist_ok=True)
    (ASSETS_DIR / "fonts").mkdir(exist_ok=True)
    (ASSETS_DIR / "logos").mkdir(exist_ok=True)
    (ASSETS_DIR / "vehicles").mkdir(exist_ok=True)


def get_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    """Carrega fonte. Fallback para default se não houver custom."""
    font_dir = ASSETS_DIR / "fonts"

    # Tenta carregar fontes customizadas (coloque .ttf em assets/fonts/)
    candidates = [
        font_dir / ("Montserrat-Bold.ttf" if bold else "Montserrat-Regular.ttf"),
        font_dir / ("Inter-Bold.ttf" if bold else "Inter-Regular.ttf"),
    ]

    for path in candidates:
        if path.exists():
            return ImageFont.truetype(str(path), size)

    # Fallback: fonte default do sistema
    try:
        system_candidates = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
            "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        ]
        for candidate in system_candidates:
            if os.path.exists(candidate):
                return ImageFont.truetype(candidate, size)
    except OSError:
        pass
    return ImageFont.load_default()


def wrap_text(text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    """Quebra texto em linhas que cabem na largura máxima."""
    words = text.split()
    lines = []
    current_line = ""

    for word in words:
        test_line = f"{current_line} {word}".strip()
        bbox = font.getbbox(test_line)
        if bbox[2] - bbox[0] <= max_width:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line)
            current_line = word

    if current_line:
        lines.append(current_line)

    return lines


def mix_rgb(color_a: tuple[int, int, int], color_b: tuple[int, int, int], ratio: float) -> tuple[int, int, int]:
    ratio = max(0.0, min(1.0, ratio))
    return tuple(int(a + ((b - a) * ratio)) for a, b in zip(color_a, color_b))


def is_light_color(color: tuple[int, int, int]) -> bool:
    return ((color[0] * 0.299) + (color[1] * 0.587) + (color[2] * 0.114)) >= 186


def clamp_text(text: str, max_chars: int) -> str:
    clean = re.sub(r"\s+", " ", (text or "")).strip()
    if len(clean) <= max_chars:
        return clean
    return clean[: max_chars - 1].rstrip(" ,.;:") + "…"


def shorten_comparison_label(text: str) -> str:
    """Abrevia nomes longos para o layout do comparativo."""
    compact = re.sub(r"\s+", " ", (text or "")).strip()
    replacements = [
        ("Mercedes-Benz", "Mercedes"),
        ("MG Motor", "MG"),
        ("Volkswagen", "VW"),
        ("Chevrolet", "Chevy"),
        ("CAOA Chery", "CAOA"),
        ("Special Edition", "Spec. Ed."),
        ("Sportback", "Sportbk."),
        ("Countryman", "Country."),
    ]

    for source, target in replacements:
        compact = compact.replace(source, target)

    compact = re.sub(r"\bBEV\s+(\d+)\b", r"BEV\1", compact, flags=re.IGNORECASE)
    compact = re.sub(r"\s+", " ", compact).strip()
    return compact


def split_comparison_brand_model(text: str) -> tuple[str, str]:
    """Separa marca e modelo para um layout mais limpo no comparativo."""
    label = re.sub(r"\s+", " ", (text or "")).strip()
    try:
        from vehicle_catalog import VEHICLE_CATALOG

        brands = sorted({v["brand"] for v in VEHICLE_CATALOG}, key=len, reverse=True)
        for brand in brands:
            if label.lower().startswith(brand.lower() + " "):
                model = label[len(brand):].strip()
                return brand, model
            if label.lower() == brand.lower():
                return brand, ""
    except Exception:
        pass

    parts = label.split(" ", 1)
    if len(parts) == 2:
        return parts[0], parts[1]
    return label, ""


def derive_visual_brief(headline: str, subtitle: str, category: str) -> tuple[str, str, str]:
    """Converte caption/subtitle em uma headline curta, resumo e tema visual."""
    text = f"{headline} {subtitle}".strip()
    normalized = _normalize_text(text)
    upper_text = (headline or subtitle or "").upper()

    if category == "dica_ev" and any(token in normalized for token in ["frenagem", "regenerativa", "regenera"]):
        return (
            "FRENAGEM REGENERATIVA",
            "Recupere energia nas desaceleracoes.",
            "battery",
        )
    if "recarga" in normalized and "casa" in normalized:
        return (
            "RECARGA EM CASA",
            "Mais controle de custo, conveniencia diaria e bateria pronta pela manha.",
            "home_charge",
        )
    if "recarga" in normalized or "carreg" in normalized:
        return (
            "RECARGA INTELIGENTE",
            "Entenda como carregar melhor, com mais seguranca e menos atrito na rotina.",
            "charging",
        )
    if any(token in normalized for token in ["econom", "custo", "tco", "preco"]):
        return (
            "ECONOMIA NO EV",
            "Um resumo pratico para enxergar custo, retorno e decisao com mais clareza.",
            "savings",
        )
    if any(token in normalized for token in ["bateria", "autonomia"]):
        return (
            "BATERIA E AUTONOMIA",
            "Leitura rapida para entender eficiencia, alcance e uso no dia a dia.",
            "battery",
        )
    if category == "noticia_mercado":
        model_count_match = re.search(r"(\d+)\s+MODELOS", upper_text)
        brand_count_match = re.search(r"(\d+)\s+MARCAS", upper_text)
        if model_count_match:
            return (
                f"{model_count_match.group(1)} MODELOS NO BRASIL",
                "Panorama atual do catalogo eletrico brasileiro.",
                "news",
            )
        if brand_count_match:
            return (
                f"{brand_count_match.group(1)} MARCAS EM DESTAQUE",
                "Variedade crescente de marcas no mercado nacional.",
                "news",
            )
        return (
            "MERCADO EM MOVIMENTO",
            "Recorte visual das mudancas no mercado eletrico brasileiro.",
            "news",
        )
    if category == "dica_ev":
        return (
            clamp_text(headline, 28).upper(),
            clamp_text(subtitle or headline, 78),
            "tips",
        )

    words = clamp_text(headline, 44).upper()
    summary = clamp_text(subtitle or headline, 95)
    return words, summary, "generic"


def build_image_subtitle(caption: str, subtitle: str) -> str:
    """Monta um resumo curto para uso visual na arte."""
    clean_subtitle = clamp_text(subtitle, 110)
    if clean_subtitle:
        return clean_subtitle

    paragraphs = [part.strip() for part in (caption or "").splitlines() if part.strip()]
    if len(paragraphs) >= 2:
        return clamp_text(paragraphs[1], 110)
    if paragraphs:
        return clamp_text(paragraphs[0], 110)
    return ""


def build_ai_image_prompt(headline: str, subtitle: str, category: str) -> str:
    """Cria prompt em ingles para modelos de imagem."""
    brief_headline, brief_summary, theme = derive_visual_brief(headline, subtitle, category)

    theme_prompts = {
        "home_charge": "A tasteful Brazilian home charging scene with a premium wallbox in a modern garage or covered driveway, warm ambient lighting, subtle electric mobility cues, no identifiable car brand.",
        "charging": "A sophisticated electric charging scene, premium charging equipment, clean architecture, subtle energy flow details, modern Brazilian urban setting, no identifiable car brand.",
        "savings": "A polished editorial scene about savings and smart energy use, premium lifestyle atmosphere, elegant financial cues, clean composition, no charts or readable text.",
        "battery": "A modern technology scene about battery performance and energy storage, premium materials, clean lighting, subtle futuristic details, no readable interface text.",
        "news": "A premium editorial photo-illustration about electric mobility trends in Brazil, dynamic newsroom-meets-tech aesthetic, cinematic lighting, no readable text.",
        "tips": "A premium editorial lifestyle image about practical electric mobility tips in Brazil, modern home and technology context, clean composition, no readable text.",
        "generic": "A premium editorial illustration for electric mobility in Brazil, sophisticated lighting, clean modern composition, no readable text.",
    }

    style = {
        "dica_ev": "Editorial advertising photography with realistic lighting, premium product-shot feel, Instagram-ready composition.",
        "tco_insight": "High-end editorial illustration with premium finance-meets-tech mood, realistic materials, sophisticated lighting.",
        "noticia_mercado": "Magazine-quality editorial key visual, dynamic but clean, premium color grading.",
        "geral": "Polished editorial campaign image with modern sustainable mobility atmosphere.",
    }.get(category, "Premium editorial image with realistic lighting and clean composition.")

    return (
        "Create a premium square Instagram image for a Brazilian electric mobility brand. "
        f"Main idea: {brief_headline}. "
        f"Supporting context: {brief_summary}. "
        f"Scene: {theme_prompts.get(theme, theme_prompts['generic'])} "
        f"Style: {style} "
        "Important constraints: absolutely no visible text anywhere in the image. "
        "No typography, no letters, no words, no slogans, no labels, no signage, no numbers, no symbols, "
        "no captions, no logos, no watermarks, no UI, no infographic labels, no brand names, "
        "no car manufacturer badges. "
        "The image must feel native to Brazil, not generic US or European advertising. "
        "Keep it visually striking, polished, modern, and highly shareable."
    )


def _save_generated_pil_image(image: Image.Image, category: str) -> Path:
    from datetime import datetime

    ensure_dirs()
    fitted = ImageOps.fit(image.convert("RGB"), SIZES["feed"], method=Image.LANCZOS)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = OUTPUT_DIR / f"pbev_ai_{category}_feed_{ts}.jpg"
    fitted.save(output_path, "JPEG", quality=95)
    return output_path


def _extract_image_from_gemini_response(response) -> Image.Image | None:
    parts = getattr(response, "parts", None)
    if not parts:
        candidates = getattr(response, "candidates", None) or []
        if candidates:
            content = getattr(candidates[0], "content", None)
            parts = getattr(content, "parts", None)

    for part in parts or []:
        if getattr(part, "inline_data", None) is not None and hasattr(part, "as_image"):
            try:
                return part.as_image()
            except Exception:
                data = getattr(part.inline_data, "data", None)
                if data:
                    return Image.open(BytesIO(data))
    return None


def _image_provider_ready(settings) -> bool:
    provider = (settings.image_generation_provider or "gemini").strip().lower()
    if provider == "zai":
        return bool(settings.zai_api_key)
    return bool(settings.gemini_api_key)


def _raise_zai_error(response: httpx.Response) -> None:
    try:
        payload = response.json()
    except Exception:
        payload = response.text
    raise RuntimeError(f"Z.AI image generation failed: HTTP {response.status_code} - {payload}")


def _generate_zai_image(prompt: str, model: str, size: str) -> Image.Image:
    settings = get_settings()
    if not settings.zai_api_key:
        raise RuntimeError("ZAI_API_KEY nao configurada")

    with httpx.Client(timeout=120.0) as client:
        response = client.post(
            "https://api.z.ai/api/paas/v4/images/generations",
            headers={
                "Authorization": f"Bearer {settings.zai_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "prompt": prompt,
                "size": size,
            },
        )
        if response.status_code >= 400:
            _raise_zai_error(response)

        payload = response.json()
        data = payload.get("data") or []
        if not data:
            raise RuntimeError(f"Z.AI image generation returned no data: {payload}")

        image_url = data[0].get("url")
        if not image_url:
            b64_json = data[0].get("b64_json")
            if b64_json:
                import base64

                return Image.open(BytesIO(base64.b64decode(b64_json)))
            raise RuntimeError(f"Z.AI image generation returned no image URL: {payload}")

        image_response = client.get(image_url)
        if image_response.status_code >= 400:
            _raise_zai_error(image_response)
        return Image.open(BytesIO(image_response.content))


def generate_ai_post_image(headline: str, subtitle: str, category: str = "geral") -> Path:
    """Gera imagem com modelo de IA para posts sem foto de veiculo.

    Preferimos o modelo configurado em env. Se a API ou o modelo falharem,
    o chamador decide o fallback.
    """
    settings = get_settings()
    prompt = build_ai_image_prompt(headline, subtitle, category)
    provider = (settings.image_generation_provider or "gemini").strip().lower()
    model = settings.image_generation_model

    if provider == "zai":
        image = _generate_zai_image(prompt=prompt, model=model, size=settings.image_generation_size)
        return ImageGenerator().create_post_image(
            headline=headline,
            subtitle=subtitle,
            category=category,
            background_image=image,
        )

    from google import genai

    client = genai.Client(api_key=settings.gemini_api_key)

    if model.startswith("imagen-"):
        from google.genai import types

        response = client.models.generate_images(
            model=model,
            prompt=prompt,
            config=types.GenerateImagesConfig(number_of_images=1, aspect_ratio="1:1"),
        )
        generated = response.generated_images[0].image
        image = Image.open(BytesIO(generated.image_bytes))
        return ImageGenerator().create_post_image(
            headline=headline,
            subtitle=subtitle,
            category=category,
            background_image=image,
        )

    response = client.models.generate_content(
        model=model,
        contents=[prompt],
    )
    image = _extract_image_from_gemini_response(response)
    if image is None:
        raise RuntimeError(f"modelo {model} nao retornou imagem utilizavel")
    return ImageGenerator().create_post_image(
        headline=headline,
        subtitle=subtitle,
        category=category,
        background_image=image,
    )


class ImageGenerator:
    """Gerador de imagens para posts do Instagram."""

    def __init__(self):
        ensure_dirs()

    def _create_background(self, width: int, height: int, palette: dict) -> Image.Image:
        bg = hex_to_rgb(palette["bg"])
        accent = hex_to_rgb(palette["accent"])
        base = Image.new("RGBA", (width, height), bg + (255,))
        draw = ImageDraw.Draw(base, "RGBA")

        for y in range(height):
            ratio = y / max(height - 1, 1)
            color = mix_rgb(bg, accent, 0.18 * ratio)
            draw.line([(0, y), (width, y)], fill=color + (255,))

        draw.ellipse((width - 360, -120, width + 180, 360), fill=accent + (38,))
        draw.ellipse((-140, height - 320, 260, height + 60), fill=accent + (22,))
        draw.rounded_rectangle((60, 120, width - 60, height - 120), radius=42, outline=accent + (48,), width=2)

        stripe_color = mix_rgb(bg, accent, 0.45)
        for offset in range(0, width + height, 48):
            draw.line(
                [(max(width - offset, 0), 0), (min(width, width + height - offset), min(height, offset))],
                fill=stripe_color + (10,),
                width=3,
            )

        return base

    def _fit_font_and_lines(
        self,
        text: str,
        max_width: int,
        max_lines: int,
        initial_size: int = 74,
        min_size: int = 38,
        max_height: int | None = None,
        line_gap: int = 10,
    ) -> tuple[ImageFont.FreeTypeFont, list[str]]:
        text = clamp_text(text, 64)
        for size in range(initial_size, min_size - 1, -2):
            font = get_font(size, bold=True)
            lines = wrap_text(text, font, max_width)
            if len(lines) <= max_lines and (
                max_height is None or self._text_block_height(font, lines, line_gap) <= max_height
            ):
                return font, lines
        font = get_font(min_size, bold=True)
        return font, wrap_text(text, font, max_width)[:max_lines]

    @staticmethod
    def _text_block_height(font: ImageFont.FreeTypeFont, lines: list[str], line_gap: int) -> int:
        if not lines:
            return 0
        heights = [font.getbbox(line)[3] - font.getbbox(line)[1] for line in lines]
        return sum(heights) + (line_gap * (len(lines) - 1))

    @staticmethod
    def _clamp_for_box(text: str, max_chars: int) -> str:
        clean = re.sub(r"\s+", " ", (text or "")).strip()
        if len(clean) <= max_chars:
            return clean
        return clean[: max(0, max_chars - 3)].rstrip(" ,.;:") + "..."

    def _fit_body_text(
        self,
        text: str,
        max_width: int,
        max_lines: int,
        initial_size: int,
        min_size: int,
        max_height: int,
        max_chars: int,
        line_gap: int,
    ) -> tuple[ImageFont.FreeTypeFont, list[str]]:
        for size in range(initial_size, min_size - 1, -1):
            font = get_font(size, bold=False)
            for chars in range(max_chars, 24, -4):
                candidate = self._clamp_for_box(text, chars)
                lines = wrap_text(candidate, font, max_width)
                if len(lines) <= max_lines and self._text_block_height(font, lines, line_gap) <= max_height:
                    return font, lines

        font = get_font(min_size, bold=False)
        candidate = self._clamp_for_box(text, 28)
        return font, wrap_text(candidate, font, max_width)[:max_lines]

    def _fit_comparison_label(
        self,
        text: str,
        max_width: int,
        max_lines: int = 2,
    ) -> tuple[ImageFont.FreeTypeFont, list[str]]:
        candidates = [
            shorten_comparison_label(text).upper(),
            clamp_text(shorten_comparison_label(text).upper(), 30),
            clamp_text(shorten_comparison_label(text).upper(), 24),
        ]

        seen: set[str] = set()
        for candidate in candidates:
            if not candidate or candidate in seen:
                continue
            seen.add(candidate)
            for size in range(32, 19, -2):
                font = get_font(size, bold=True)
                lines = wrap_text(candidate, font, max_width)
                if len(lines) <= max_lines:
                    return font, lines

        fallback = clamp_text(shorten_comparison_label(text).upper(), 22)
        font = get_font(20, bold=True)
        return font, wrap_text(fallback, font, max_width)[:max_lines]

    def _draw_comparison_label(
        self,
        draw: ImageDraw.Draw,
        text: str,
        box: tuple[int, int, int, int],
        fill: tuple[int, int, int],
    ):
        left, top, right, bottom = box
        brand, model = split_comparison_brand_model(text)
        brand = shorten_comparison_label(brand).upper()
        model = shorten_comparison_label(model).upper() if model else brand

        brand_font = get_font(22, bold=True)
        brand_bbox = brand_font.getbbox(brand)
        brand_width = brand_bbox[2] - brand_bbox[0]
        brand_x = left + max(((right - left) - brand_width) // 2, 0)
        draw.text((brand_x, top), brand, fill=(245, 158, 11), font=brand_font)

        font, lines = self._fit_comparison_label(model, max_width=right - left, max_lines=2)
        line_heights = [(font.getbbox(line)[3] - font.getbbox(line)[1]) for line in lines]
        total_height = sum(line_heights) + (8 * (len(lines) - 1))
        y = top + 28 + max((((bottom - top) - 28) - total_height) // 2, 0)

        for line, line_height in zip(lines, line_heights):
            bbox = font.getbbox(line)
            line_width = bbox[2] - bbox[0]
            x = left + max(((right - left) - line_width) // 2, 0)
            draw.text((x, y), line, fill=fill, font=font)
            y += line_height + 8

    def _draw_theme_illustration(
        self,
        draw: ImageDraw.Draw,
        box: tuple[int, int, int, int],
        theme: str,
        accent: tuple[int, int, int],
        text_color: tuple[int, int, int],
    ):
        left, top, right, bottom = box
        draw.rounded_rectangle(box, radius=30, fill=(255, 255, 255, 26), outline=accent + (90,), width=3)

        cx = (left + right) // 2
        cy = (top + bottom) // 2
        line_rgb = hex_to_rgb(BRAND_COLORS["dark_bg"]) if is_light_color(accent) else accent
        line = line_rgb + (255,)
        soft = (255, 255, 255, 54)
        white = text_color + (255,)

        if theme in {"charging", "home_charge"}:
            draw.rounded_rectangle((cx - 78, cy - 68, cx + 28, cy + 70), radius=22, fill=soft, outline=line, width=6)
            draw.rectangle((cx - 54, cy - 38, cx + 4, cy + 22), fill=None, outline=line, width=5)
            draw.line((cx - 26, cy + 74, cx - 26, cy + 108), fill=line, width=6)
            draw.line((cx - 2, cy + 74, cx - 2, cy + 108), fill=line, width=6)
            draw.line((cx + 28, cy - 4, cx + 90, cy - 4), fill=line, width=6)
            draw.arc((cx + 54, cy - 44, cx + 122, cy + 24), start=270, end=90, fill=line, width=6)
            draw.line((cx + 122, cy - 10, cx + 122, cy + 34), fill=line, width=6)
            draw.line((cx + 110, cy + 34, cx + 134, cy + 34), fill=line, width=6)
            draw.polygon(
                [(cx - 12, cy - 12), (cx + 16, cy - 12), (cx - 2, cy + 18), (cx + 20, cy + 18), (cx - 18, cy + 56)],
                fill=white,
            )
            if theme == "home_charge":
                roof_y = top + 34
                draw.polygon([(left + 42, roof_y + 34), (left + 104, roof_y - 8), (left + 166, roof_y + 34)], fill=soft, outline=line)
                draw.rounded_rectangle((left + 56, roof_y + 34, left + 152, roof_y + 118), radius=18, fill=(0, 0, 0, 0), outline=line, width=5)
        elif theme == "savings":
            draw.ellipse((cx - 108, cy - 32, cx - 8, cy + 52), fill=soft, outline=line, width=6)
            draw.ellipse((cx - 48, cy - 70, cx + 52, cy + 14), fill=soft, outline=line, width=6)
            draw.ellipse((cx + 8, cy - 10, cx + 108, cy + 74), fill=soft, outline=line, width=6)
            draw.text((cx - 18, cy - 34), "R$", fill=white, font=get_font(38, bold=True))
            draw.polygon([(right - 118, top + 92), (right - 66, top + 92), (right - 98, top + 152), (right - 54, top + 152), (right - 126, top + 236)], fill=white)
        elif theme == "battery":
            draw.rounded_rectangle((cx - 112, cy - 44, cx + 92, cy + 58), radius=24, fill=soft, outline=line, width=6)
            draw.rounded_rectangle((cx + 92, cy - 12, cx + 122, cy + 26), radius=8, fill=soft, outline=line, width=6)
            for index, x in enumerate(range(cx - 90, cx + 55, 48)):
                alpha = 230 if index < 3 else 110
                draw.rounded_rectangle((x, cy - 22, x + 30, cy + 36), radius=8, fill=accent + (alpha,))
        else:
            draw.ellipse((cx - 118, cy - 118, cx + 118, cy + 118), fill=soft, outline=line, width=6)
            draw.polygon([(cx, cy - 86), (cx + 30, cy - 8), (cx + 8, cy - 8), (cx + 52, cy + 86), (cx - 18, cy + 6), (cx + 4, cy + 6)], fill=white)
            draw.arc((cx - 138, cy - 138, cx + 138, cy + 138), start=24, end=160, fill=line, width=6)

    def _draw_info_card(
        self,
        draw: ImageDraw.Draw,
        summary: str,
        box: tuple[int, int, int, int],
        accent: tuple[int, int, int],
        text_color: tuple[int, int, int],
    ):
        left, top, right, bottom = box
        draw.rounded_rectangle(box, radius=26, fill=(8, 14, 25, 150), outline=accent + (70,), width=2)
        label_font = get_font(18, bold=True)
        muted = hex_to_rgb(BRAND_COLORS["text_muted"]) + (255,)

        draw.text((left + 26, top + 22), "RESUMO RAPIDO", fill=accent + (255,), font=label_font)
        body_area_height = (bottom - 82) - (top + 58)
        lines: list[str] = []
        body_font = get_font(24, bold=False)
        line_gap = 8
        for size in range(24, 15, -1):
            body_font = get_font(size, bold=False)
            candidate_lines = wrap_text(clamp_text(summary, 86), body_font, (right - left) - 52)[:4]
            block_height = self._text_block_height(body_font, candidate_lines, line_gap)
            if block_height <= body_area_height:
                lines = candidate_lines
                break
        if not lines:
            lines = wrap_text(clamp_text(summary, 64), body_font, (right - left) - 52)[:3]

        y = top + 58
        for line in lines:
            draw.text((left + 26, y), line, fill=text_color + (255,), font=body_font)
            line_height = body_font.getbbox(line)[3] - body_font.getbbox(line)[1]
            y += line_height + line_gap

        pill_top = bottom - 64
        draw.rounded_rectangle((left + 24, pill_top, left + 214, pill_top + 36), radius=18, fill=accent + (255,))
        draw.text((left + 42, pill_top + 7), "Leia no Guia PBEV", fill=hex_to_rgb(BRAND_COLORS["dark_bg"]) + (255,), font=get_font(16, bold=True))
        draw.text((right - 130, bottom - 54), "guia pratico", fill=muted, font=get_font(18, bold=False))

    def create_post_image(
        self,
        headline: str,
        subtitle: str = "",
        category: str = "geral",
        post_format: Literal["feed", "story", "carousel"] = "feed",
        vehicle_image_path: str | None = None,
        background_image: Image.Image | None = None,
        output_filename: str | None = None,
    ) -> Path:
        """Cria imagem branded mais editorial para posts sem foto."""
        width, height = SIZES[post_format]
        palette = CATEGORY_PALETTES.get(category, CATEGORY_PALETTES["geral"])

        compact_layout = background_image is not None
        if background_image is not None:
            img = ImageOps.fit(background_image.convert("RGBA"), (width, height), method=Image.LANCZOS)
            overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
            overlay_draw = ImageDraw.Draw(overlay, "RGBA")
            overlay_draw.rectangle((0, 0, int(width * 0.36), height), fill=(4, 9, 15, 172))
            overlay_draw.rectangle((0, 0, width, 120), fill=(4, 9, 15, 86))
            overlay_draw.rectangle((0, int(height * 0.82), width, height), fill=(4, 9, 15, 72))
            for x in range(int(width * 0.36), int(width * 0.74), 8):
                alpha = int(max(0, 172 * (1 - ((x - (width * 0.36)) / max(width * 0.38, 1)))))
                overlay_draw.line((x, 0, x, height), fill=(4, 9, 15, alpha), width=8)
            img = Image.alpha_composite(img, overlay)
        else:
            img = self._create_background(width, height, palette)
        draw = ImageDraw.Draw(img, "RGBA")
        padding = 72 if post_format == "feed" else 84
        accent_color = hex_to_rgb(palette["accent"])
        text_color = hex_to_rgb(palette["text"])
        muted_color = hex_to_rgb(BRAND_COLORS["text_muted"])

        if vehicle_image_path and os.path.exists(vehicle_image_path):
            base_rgb = img.convert("RGB")
            self._overlay_vehicle(base_rgb, vehicle_image_path, post_format)
            img = base_rgb.convert("RGBA")
            draw = ImageDraw.Draw(img, "RGBA")

        brief_headline, brief_summary, theme = derive_visual_brief(headline, subtitle, category)

        logo_font = get_font(28 if post_format == "feed" else 30, bold=True)
        draw.text((padding, 62), "GUIA PBEV BRASIL", fill=text_color + (255,), font=logo_font)
        draw.line((padding, 100, padding + 210, 100), fill=accent_color + (255,), width=3)

        eyebrow = {
            "dica_ev": "DICA PRATICA",
            "tco_insight": "CUSTO E USO",
            "noticia_mercado": "MERCADO",
            "geral": "CONTEUDO PBEV",
        }.get(category, category.replace("_", " ").upper())
        draw.text((padding, 148), eyebrow, fill=accent_color + (255,), font=get_font(20, bold=True))

        headline_width = 420 if compact_layout and post_format != "story" else 560 if post_format != "story" else width - (padding * 2)
        headline_box_bottom = 442 if compact_layout and post_format != "story" else 574 if post_format != "story" else 760
        if compact_layout and category == "noticia_mercado" and post_format != "story":
            headline_box_bottom = 456
        headline_box_top = 188 if post_format != "story" else 284
        headline_y = 220 if post_format != "story" else 320
        headline_line_gap = 8 if compact_layout else 10

        draw.rounded_rectangle(
            (
                padding - 24,
                headline_box_top,
                padding + headline_width + 24,
                headline_box_bottom,
            ),
            radius=34,
            fill=(8, 14, 25, 64 if compact_layout else 72),
            outline=(255, 255, 255, 28),
            width=2,
        )
        headline_font, headline_lines = self._fit_font_and_lines(
            brief_headline,
            max_width=headline_width,
            max_lines=3 if compact_layout and post_format != "story" else 4 if post_format != "story" else 5,
            initial_size=62 if compact_layout and post_format != "story" else 72 if post_format != "story" else 68,
            min_size=34 if compact_layout else 38,
            max_height=headline_box_bottom - headline_y - 22,
            line_gap=headline_line_gap,
        )

        y_cursor = headline_y
        for line in headline_lines:
            draw.text((padding, y_cursor), line, fill=text_color + (255,), font=headline_font)
            line_height = headline_font.getbbox(line)[3] - headline_font.getbbox(line)[1]
            y_cursor += line_height + headline_line_gap

        body_font_size = 22 if compact_layout and post_format != "story" else 28 if post_format != "story" else 30
        body_max_chars = 90 if compact_layout else 120
        body_max_lines = 2 if compact_layout else 3
        body_spacing = 28 if compact_layout else 36
        if compact_layout and category == "noticia_mercado" and post_format != "story":
            body_font_size = 19
            body_max_chars = 58
            body_max_lines = 1
            body_spacing = 24

        y_cursor += 16 if compact_layout else 22
        body_available_height = max(0, headline_box_bottom - y_cursor - 24)
        body_font, body_lines = self._fit_body_text(
            brief_summary,
            max_width=headline_width - 18,
            max_lines=body_max_lines,
            initial_size=body_font_size,
            min_size=15 if compact_layout else 20,
            max_height=body_available_height,
            max_chars=body_max_chars,
            line_gap=8 if compact_layout else 10,
        )
        for line in body_lines:
            draw.text((padding, y_cursor), line, fill=muted_color + (255,), font=body_font)
            line_height = body_font.getbbox(line)[3] - body_font.getbbox(line)[1]
            y_cursor += line_height + (8 if compact_layout else 10)

        illustration_box = (
            width - 338 if compact_layout else width - 388,
            128 if compact_layout else 142,
            width - 72,
            404 if compact_layout and post_format != "story" else 486 if post_format != "story" else 560,
        )
        self._draw_theme_illustration(draw, illustration_box, theme, accent_color, text_color)

        if not compact_layout:
            info_card_box = (
                width - 430,
                560 if post_format != "story" else 700,
                width - 72,
                904 if post_format != "story" else 1070,
            )
            self._draw_info_card(draw, brief_summary, info_card_box, accent_color, text_color)

        footer_y = height - 138 if post_format != "story" else height - 178
        draw.text((padding, footer_y), "guiapbev.cloud", fill=text_color + (255,), font=get_font(24, bold=True))
        draw.text((padding, footer_y + 34), "@guiapbevbrasil", fill=muted_color + (255,), font=get_font(22, bold=False))
        draw.rounded_rectangle((padding, footer_y - 74, padding + 190, footer_y - 34), radius=20, fill=(255, 255, 255, 26))
        draw.text((padding + 22, footer_y - 66), "Link na bio", fill=accent_color + (255,), font=get_font(18, bold=True))

        self._draw_category_badge(img, draw, category, width, padding, accent_color)

        if not output_filename:
            from datetime import datetime
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"pbev_{category}_{post_format}_{ts}.jpg"

        output_path = OUTPUT_DIR / output_filename
        img.convert("RGB").save(output_path, "JPEG", quality=95)
        logger.info(f"🖼️ Imagem gerada: {output_path}")
        return output_path

    def create_comparison_image(
        self,
        model_a: str,
        model_b: str,
        specs_a: dict | None = None,
        specs_b: dict | None = None,
        vehicle_photo_path_a: Path | None = None,
        vehicle_photo_path_b: Path | None = None,
    ) -> Path:
        """Cria imagem comparativa lado a lado."""
        width, height = 1080, 1080
        img = Image.new("RGB", (width, height), hex_to_rgb(BRAND_COLORS["dark_bg"]))
        draw = ImageDraw.Draw(img)

        accent = hex_to_rgb(BRAND_COLORS["accent"])
        green = hex_to_rgb(BRAND_COLORS["primary"])
        white = hex_to_rgb(BRAND_COLORS["white"])
        muted = hex_to_rgb(BRAND_COLORS["text_muted"])

        # Top accent bar
        draw.rectangle([(0, 0), (width, 8)], fill=accent)

        # Header
        header_font = get_font(36, bold=True)
        draw.text((80, 60), "⚡ COMPARATIVO", fill=accent, font=header_font)

        # Divider line (center)
        draw.line([(540, 140), (540, 940)], fill=muted, width=1)
        draw.text((490, 110), "VS", fill=accent, font=get_font(28, bold=True))

        # Vehicle photos
        photo_top = 160
        photo_height = 240
        photo_width = 420
        self._draw_comparison_photo(
            img=img,
            photo_path=vehicle_photo_path_a,
            box=(80, photo_top, 80 + photo_width, photo_top + photo_height),
            placeholder_label=model_a,
        )
        self._draw_comparison_photo(
            img=img,
            photo_path=vehicle_photo_path_b,
            box=(580, photo_top, 580 + photo_width, photo_top + photo_height),
            placeholder_label=model_b,
        )

        # Model names
        self._draw_comparison_label(
            draw=draw,
            text=model_a,
            box=(80, 416, 500, 504),
            fill=green,
        )
        self._draw_comparison_label(
            draw=draw,
            text=model_b,
            box=(580, 416, 1000, 504),
            fill=green,
        )

        # Specs comparison
        if specs_a and specs_b:
            spec_font = get_font(24, bold=False)
            label_font = get_font(20, bold=False)
            y = 520

            for key in specs_a:
                if key in specs_b:
                    # Label
                    draw.text((80, y), key, fill=muted, font=label_font)
                    draw.text((580, y), key, fill=muted, font=label_font)
                    y += 28

                    # Values
                    draw.text((80, y), str(specs_a[key]), fill=white, font=spec_font)
                    draw.text((580, y), str(specs_b[key]), fill=white, font=spec_font)
                    y += 50

        # Footer
        footer_font = get_font(22, bold=False)
        draw.text((80, 980), "guiapbev.cloud/simulador-tco", fill=green, font=footer_font)

        from datetime import datetime
        ts = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        output_path = OUTPUT_DIR / f"pbev_comparativo_{ts}.jpg"
        img.save(output_path, "JPEG", quality=95)
        logger.info(f"🖼️ Comparativo gerado: {output_path}")
        return output_path

    def _draw_comparison_photo(
        self,
        img: Image.Image,
        photo_path: Path | None,
        box: tuple[int, int, int, int],
        placeholder_label: str,
    ):
        """Desenha foto do veículo no box do comparativo, com fallback textual."""
        draw = ImageDraw.Draw(img)
        left, top, right, bottom = box
        box_width = right - left
        box_height = bottom - top

        if photo_path and photo_path.exists():
            try:
                photo = Image.open(photo_path).convert("RGB")
                ratio = max(box_width / photo.width, box_height / photo.height)
                new_w = int(photo.width * ratio)
                new_h = int(photo.height * ratio)
                photo = photo.resize((new_w, new_h), Image.LANCZOS)

                crop_left = max((new_w - box_width) // 2, 0)
                crop_top = max((new_h - box_height) // 2, 0)
                photo = photo.crop((crop_left, crop_top, crop_left + box_width, crop_top + box_height))
                img.paste(photo, (left, top))
            except Exception as e:
                logger.warning(f"⚠️ Falha ao renderizar foto no comparativo: {e}")
                draw.rounded_rectangle(box, radius=18, fill=hex_to_rgb("#172033"))
        else:
            draw.rounded_rectangle(box, radius=18, fill=hex_to_rgb("#172033"))

        draw.rounded_rectangle(box, radius=18, outline=hex_to_rgb(BRAND_COLORS["primary"]), width=2)

        if not photo_path or not photo_path.exists():
            label_font = get_font(22, bold=True)
            muted = hex_to_rgb(BRAND_COLORS["text_muted"])
            lines = wrap_text(placeholder_label.upper(), label_font, box_width - 40)[:3]
            y = top + (box_height // 2) - (len(lines) * 18)
            for line in lines:
                draw.text((left + 20, y), line, fill=muted, font=label_font)
                y += 36

    def _draw_accent_corner(self, draw: ImageDraw.Draw, width: int, height: int,
                            accent_color: tuple):
        """Desenha elemento decorativo no canto superior direito."""
        # Triângulo sutil
        draw.polygon(
            [(width - 200, 0), (width, 0), (width, 200)],
            fill=(*accent_color, 30),  # Muito transparente
        )
        # Linhas diagonais
        for i in range(3):
            offset = i * 40
            draw.line(
                [(width - 120 + offset, 0), (width, 120 - offset)],
                fill=(*accent_color, 60),
                width=1,
            )

    def _draw_category_badge(self, img: Image.Image, draw: ImageDraw.Draw, category: str,
                             width: int, padding: int, accent_color: tuple):
        """Desenha logo no canto superior direito; usa badge textual como fallback."""
        logo_path = ASSETS_DIR / "logo-pbev.png"
        if logo_path.exists():
            try:
                logo = Image.open(logo_path).convert("RGBA")
                target_size = 108 if img.height <= img.width else 120
                logo.thumbnail((target_size, target_size), Image.LANCZOS)

                box_w = logo.width + 20
                box_h = logo.height + 20
                x = width - padding - box_w
                y = 42

                draw.rounded_rectangle(
                    [(x, y), (x + box_w, y + box_h)],
                    radius=22,
                    fill=(6, 12, 22, 118),
                    outline=(255, 255, 255, 28),
                    width=2,
                )
                position = (x + (box_w - logo.width) // 2, y + (box_h - logo.height) // 2)
                if img.mode == "RGBA":
                    img.alpha_composite(logo, position)
                else:
                    img.paste(logo, position, logo)
                return
            except Exception as e:
                logger.warning(f"Falha ao renderizar logo da marca; usando badge textual: {e}")
        category_labels = {
            "modelo_destaque": "MODELO",
            "comparativo": "VS",
            "dica_ev": "DICA",
            "tco_insight": "TCO",
            "noticia_mercado": "NEWS",
            "geral": "EV",
        }
        label = category_labels.get(category, "EV")
        badge_font = get_font(18, bold=True)
        bbox = badge_font.getbbox(label)
        badge_w = (bbox[2] - bbox[0]) + 24
        badge_h = (bbox[3] - bbox[1]) + 12

        x = width - padding - badge_w
        y = 60

        draw.rounded_rectangle(
            [(x, y), (x + badge_w, y + badge_h)],
            radius=6,
            fill=accent_color,
        )
        draw.text(
            (x + 12, y + 4),
            label,
            fill=hex_to_rgb(BRAND_COLORS["dark_bg"]),
            font=badge_font,
        )

    def _overlay_vehicle(self, img: Image.Image, vehicle_path: str,
                         post_format: str):
        """Overlay de foto de veículo (com transparência se PNG)."""
        try:
            vehicle = Image.open(vehicle_path)
            width, height = img.size

            if post_format == "story":
                # Story: veículo no meio
                target_w = int(width * 0.85)
                ratio = target_w / vehicle.width
                target_h = int(vehicle.height * ratio)
                vehicle = vehicle.resize((target_w, target_h), Image.LANCZOS)
                x = (width - target_w) // 2
                y = int(height * 0.35)
            else:
                # Feed: veículo na parte inferior
                target_w = int(width * 0.75)
                ratio = target_w / vehicle.width
                target_h = int(vehicle.height * ratio)
                vehicle = vehicle.resize((target_w, target_h), Image.LANCZOS)
                x = (width - target_w) // 2
                y = height - target_h - 160

            if vehicle.mode == "RGBA":
                img.paste(vehicle, (x, y), vehicle)
            else:
                img.paste(vehicle, (x, y))

        except Exception as e:
            logger.warning(f"⚠️ Não foi possível carregar imagem do veículo: {e}")


# --- Vehicle photo from catalog ---

async def download_vehicle_photo(vehicle: dict, cache_dir: Path | None = None) -> Path | None:
    """Baixa a foto real do veículo do guiapbev.cloud ou GitHub.

    Converte automaticamente avif/webp para JPEG (Meta API só aceita JPEG/PNG).
    Usa cache local para evitar downloads repetidos.

    Args:
        vehicle: Dict do veículo (do vehicle_catalog.VEHICLE_CATALOG).
        cache_dir: Diretório para cache das imagens.

    Returns:
        Path do arquivo JPEG local, ou None se falhar.
    """
    import httpx
    from vehicle_catalog import get_image_url

    if cache_dir is None:
        cache_dir = ASSETS_DIR / "vehicles"
    cache_dir.mkdir(parents=True, exist_ok=True)

    # Nome normalizado para cache (sempre .jpg)
    slug = vehicle["img"].rsplit(".", 1)[0]
    slug = slug.replace(" ", "-").lower()
    cached_path = cache_dir / f"{slug}.jpg"

    # Se já tem cache, retorna direto
    if cached_path.exists() and cached_path.stat().st_size > 1000:
        logger.debug(f"📸 Cache hit: {cached_path}")
        return cached_path

    # Tenta baixar do site primeiro, fallback pro GitHub
    for source in ["site", "github"]:
        url = get_image_url(vehicle, source=source)
        try:
            async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    # Converte para JPEG via Pillow (suporta avif, webp, png)
                    img = Image.open(BytesIO(resp.content))
                    img = img.convert("RGB")

                    # Redimensiona para 1080px de largura (mantém proporção)
                    if img.width > 1080:
                        ratio = 1080 / img.width
                        new_h = int(img.height * ratio)
                        img = img.resize((1080, new_h), Image.LANCZOS)

                    img.save(cached_path, "JPEG", quality=90)
                    logger.info(f"📸 Foto baixada ({source}): {vehicle['brand']} {vehicle['model']}")
                    return cached_path

        except Exception as e:
            logger.warning(f"⚠️ Falha ao baixar de {source}: {e}")
            continue

    logger.error(f"❌ Não foi possível baixar foto de {vehicle['brand']} {vehicle['model']}")
    return None


def download_vehicle_photo_sync(vehicle: dict, cache_dir: Path | None = None) -> Path | None:
    """Versão síncrona do download da foto do veículo."""
    import httpx
    from vehicle_catalog import get_image_url

    if cache_dir is None:
        cache_dir = ASSETS_DIR / "vehicles"
    cache_dir.mkdir(parents=True, exist_ok=True)

    slug = vehicle["img"].rsplit(".", 1)[0]
    slug = slug.replace(" ", "-").lower()
    cached_path = cache_dir / f"{slug}.jpg"

    if cached_path.exists() and cached_path.stat().st_size > 1000:
        logger.debug(f"📸 Cache hit: {cached_path}")
        return cached_path

    for source in ["site", "github"]:
        url = get_image_url(vehicle, source=source)
        try:
            with httpx.Client(timeout=30, follow_redirects=True) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    img = Image.open(BytesIO(resp.content))
                    img = img.convert("RGB")

                    if img.width > 1080:
                        ratio = 1080 / img.width
                        new_h = int(img.height * ratio)
                        img = img.resize((1080, new_h), Image.LANCZOS)

                    img.save(cached_path, "JPEG", quality=90)
                    logger.info(f"📸 Foto baixada ({source}): {vehicle['brand']} {vehicle['model']}")
                    return cached_path
        except Exception as e:
            logger.warning(f"⚠️ Falha ao baixar de {source}: {e}")
            continue

    logger.error(f"❌ Não foi possível baixar foto de {vehicle['brand']} {vehicle['model']}")
    return None


def _normalize_text(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text or "")
    normalized = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    normalized = normalized.lower()
    normalized = re.sub(r"[^\w\s]+", " ", normalized)
    return re.sub(r"\s+", " ", normalized).strip()


def _vehicle_match_tokens(vehicle: dict) -> list[str]:
    """Gera aliases de busca para o veículo."""
    brand = _normalize_text(vehicle["brand"])
    model = _normalize_text(vehicle["model"])
    aliases = {
        f"{brand} {model}".strip(),
        model,
    }

    trim_suffixes = {
        "gl", "gs", "gt", "gts", "plus", "premium", "comfort", "luxury",
        "elite", "land", "awd", "icon", "xpower", "skin", "rs", "se",
        "sedan", "suv", "bev48", "bev58", "bev63", "bev", "dm", "dm i",
        "dm-i", "ev", "e", "xdrive30", "xdrive40", "edrive20", "edrive35",
    }
    model_words = model.split()

    while model_words and model_words[-1] in trim_suffixes:
        model_words.pop()
        if model_words:
            base_model = " ".join(model_words)
            aliases.add(base_model)
            aliases.add(f"{brand} {base_model}".strip())

    return [alias for alias in aliases if alias]


def _find_matching_vehicles(text: str, limit: int = 2) -> list[dict]:
    """Tenta identificar veículos mencionados no texto."""
    from vehicle_catalog import VEHICLE_CATALOG

    haystack = f" {_normalize_text(text)} "
    matches: list[tuple[int, dict]] = []

    for vehicle in VEHICLE_CATALOG:
        best_len = 0

        for token in _vehicle_match_tokens(vehicle):
            if token and f" {token} " in haystack:
                best_len = max(best_len, len(token))

        if best_len:
            matches.append((best_len, vehicle))

    matches.sort(key=lambda item: item[0], reverse=True)

    unique: list[dict] = []
    seen = set()
    for _, vehicle in matches:
        key = f"{vehicle['brand']}::{vehicle['model']}"
        if key not in seen:
            unique.append(vehicle)
            seen.add(key)
        if len(unique) >= limit:
            break

    return unique


def create_vehicle_post_image(
    vehicle: dict,
    vehicle_photo_path: Path | None = None,
    category: str = "modelo_destaque",
    post_format: str = "feed",
    headline_override: str | None = None,
    highlight_badge: str | None = None,
    highlight_note: str | None = None,
) -> Path:
    """Cria imagem completa para post usando foto REAL do catálogo + template branded.

    Combina:
    1. Template branded (fundo, cores, tipografia Guia PBEV)
    2. Foto real do veículo (do guiapbev.cloud)
    3. Specs overlay (preço, autonomia, potência)
    4. Badge de categoria + CTA

    Args:
        vehicle: Dict do veículo (do vehicle_catalog.VEHICLE_CATALOG).
        vehicle_photo_path: Foto já baixada (ou None para template sem foto).
        category: Categoria do post.
        post_format: "feed" (1080x1080) ou "story" (1080x1920).

    Returns:
        Path da imagem JPEG gerada.
    """
    from vehicle_catalog import format_price_brl

    gen = ImageGenerator()
    width, height = SIZES.get(post_format, (1080, 1080))
    palette = CATEGORY_PALETTES.get(category, CATEGORY_PALETTES["geral"])

    img = Image.new("RGB", (width, height), hex_to_rgb(palette["bg"]))
    draw = ImageDraw.Draw(img)
    padding = 80
    content_width = width - (padding * 2)
    accent = hex_to_rgb(palette["accent"])
    text_color = hex_to_rgb(palette["text"])
    muted = hex_to_rgb(BRAND_COLORS["text_muted"])

    # --- Foto do veículo (parte superior/central) ---
    if vehicle_photo_path and vehicle_photo_path.exists():
        photo = Image.open(vehicle_photo_path).convert("RGB")

        # Crop para preencher a parte superior (16:9 → square crop)
        target_h = int(height * 0.5)  # Metade superior
        ratio = max(width / photo.width, target_h / photo.height)
        new_w = int(photo.width * ratio)
        new_h = int(photo.height * ratio)
        photo = photo.resize((new_w, new_h), Image.LANCZOS)

        # Centraliza e cropa
        left = (new_w - width) // 2
        top = (new_h - target_h) // 2
        photo = photo.crop((left, top, left + width, top + target_h))

        # Aplica overlay gradiente escuro na base (pra texto ficar legível)
        overlay = Image.new("RGBA", (width, target_h), (0, 0, 0, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        for y in range(target_h):
            alpha = int(180 * (y / target_h) ** 1.5)  # Gradiente de cima (claro) pra baixo (escuro)
            overlay_draw.line([(0, y), (width, y)], fill=(0, 0, 0, alpha))

        photo_rgba = photo.convert("RGBA")
        photo_rgba = Image.alpha_composite(photo_rgba, overlay)
        img.paste(photo_rgba.convert("RGB"), (0, 0))

        text_start_y = target_h + 30
    else:
        text_start_y = 200

    # --- Accent bar topo ---
    draw.rectangle([(0, 0), (width, 6)], fill=accent)

    # --- Logo PBEV ---
    logo_font = get_font(24, bold=True)
    draw.text((padding, 20), "⚡ GUIA PBEV BRASIL", fill=accent, font=logo_font)

    # --- Badge categoria ---
    gen._draw_category_badge(img, draw, category, width, padding, accent)

    if highlight_badge:
        badge_x = padding
        badge_y = 66
        badge_w = 250
        badge_h = 64
        draw.rounded_rectangle(
            (badge_x, badge_y, badge_x + badge_w, badge_y + badge_h),
            radius=18,
            fill=accent,
        )
        badge_font = get_font(30, bold=True)
        badge_text = highlight_badge.strip().upper()[:18]
        badge_bbox = badge_font.getbbox(badge_text)
        badge_text_w = badge_bbox[2] - badge_bbox[0]
        badge_text_h = badge_bbox[3] - badge_bbox[1]
        draw.text(
            (badge_x + (badge_w - badge_text_w) / 2, badge_y + ((badge_h - badge_text_h) / 2) - 4),
            badge_text,
            fill=hex_to_rgb(BRAND_COLORS["white"]),
            font=badge_font,
        )

        if highlight_note:
            note_font = get_font(22, bold=True)
            note_y = badge_y + badge_h + 14
            draw.text(
                (badge_x, note_y),
                highlight_note.strip()[:30].upper(),
                fill=hex_to_rgb(BRAND_COLORS["white"]),
                font=note_font,
            )

    # --- Nome do modelo (grande) ---
    model_name = (headline_override or f"{vehicle['brand']} {vehicle['model']}").upper()
    title_font = get_font(48, bold=True)
    draw.text((padding, text_start_y), model_name, fill=text_color, font=title_font)

    # --- Preço ---
    price_y = text_start_y + 60
    price_font = get_font(36, bold=True)
    price_text = format_price_brl(vehicle["price"])
    draw.text((padding, price_y), price_text, fill=accent, font=price_font)

    # --- Specs grid (2 colunas) ---
    specs_y = price_y + 60
    spec_font = get_font(24, bold=False)
    spec_label_font = get_font(18, bold=False)

    specs = [
        ("Autonomia", f"{vehicle['range']} km"),
        ("Potência", f"{vehicle.get('power', '?')} cv"),
        ("Bateria", f"{vehicle.get('battery', '?')} kWh"),
        ("Categoria", vehicle["cat"]),
    ]

    col_width = content_width // 2
    for i, (label, value) in enumerate(specs):
        col = i % 2
        row = i // 2
        x = padding + (col * col_width)
        y = specs_y + (row * 60)

        draw.text((x, y), label, fill=muted, font=spec_label_font)
        draw.text((x, y + 22), value, fill=text_color, font=spec_font)

    # --- Footer ---
    footer_y = height - 100
    footer_font = get_font(22, bold=False)
    draw.text((padding, footer_y), "guiapbev.cloud", fill=accent, font=footer_font)
    draw.text((padding, footer_y + 30), "@guiapbevbrasil", fill=muted, font=get_font(18, bold=False))

    # --- Linha separadora acima do footer ---
    draw.line([(padding, footer_y - 16), (width - padding, footer_y - 16)], fill=(*accent, 80), width=1)

    # --- Save ---
    from datetime import datetime
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    slug = f"{vehicle['brand']}-{vehicle['model']}".lower().replace(" ", "-")
    output_path = OUTPUT_DIR / f"pbev_{slug}_{ts}.jpg"
    img.save(output_path, "JPEG", quality=95)
    logger.info(f"🖼️ Post image gerada: {output_path}")
    return output_path


# --- Image hosting helper ---

async def upload_image_to_hosting(image_path: Path) -> str:
    """Faz upload da imagem para um serviço de hosting e retorna URL pública.

    A Meta Graph API precisa de uma URL pública para a imagem.
    Opções de hosting:
    1. Imgur API (gratuito, sem auth para uploads anônimos)
    2. Cloudinary (free tier generoso)
    3. Seu próprio VPS servindo estáticos via Nginx

    Este exemplo usa o próprio VPS como host estático.
    """
    import shutil

    # Copia para diretório servido pelo Nginx
    static_dir = Path("/var/www/pbev-images")
    static_dir.mkdir(parents=True, exist_ok=True)

    dest = static_dir / image_path.name
    shutil.copy2(image_path, dest)

    # Retorna URL pública (configure no Nginx)
    from config import get_settings
    settings = get_settings()
    base_url = settings.image_host_base_url

    # Assumindo que Nginx serve /var/www/pbev-images em /ig-images/
    return f"{base_url}/ig-images/{image_path.name}"


def upload_image_to_hosting_sync(image_path: Path) -> str:
    """Versão síncrona do upload para uso em jobs e scripts locais."""
    import shutil

    static_dir = Path("/var/www/pbev-images")
    static_dir.mkdir(parents=True, exist_ok=True)

    dest = static_dir / image_path.name
    shutil.copy2(image_path, dest)

    from config import get_settings
    settings = get_settings()
    base_url = settings.image_host_base_url

    return f"{base_url}/ig-images/{image_path.name}"


def generate_and_host_post_image(
    caption: str,
    category: str = "geral",
    subtitle: str = "",
    source_vehicles: list[dict] | None = None,
    generation_source: str = "post_image",
    return_metadata: bool = False,
) -> tuple[str, str] | tuple[str, str, dict]:
    """Gera uma imagem contextual e retorna path local + URL pública."""
    headline = caption.splitlines()[0].strip() if caption else ""
    headline = re.sub(r"[^\w\s\-\?\!\.,:]+", "", headline, flags=re.UNICODE)
    headline = re.sub(r"\s+", " ", headline).strip()

    if not headline:
        headline = category.replace("_", " ").upper()

    visual_subtitle = build_image_subtitle(caption, subtitle)

    text_context = " ".join(part for part in [caption, visual_subtitle] if part)
    vehicles = list(source_vehicles or []) if category in VEHICLE_PHOTO_CATEGORIES else []
    if not vehicles and category in VEHICLE_PHOTO_CATEGORIES:
        vehicles = _find_matching_vehicles(text_context, limit=2)
    img_gen = ImageGenerator()

    if category == "comparativo" and len(vehicles) >= 2:
        image_meta = build_image_cost_metadata(
            provider="catalog",
            model="catalog_comparison",
            ai_image_used=False,
        )
        from vehicle_catalog import format_price_brl

        specs_a = {
            "Preço": format_price_brl(vehicles[0]["price"]),
            "Autonomia": f"{vehicles[0]['range']} km",
            "Potência": f"{vehicles[0].get('power', '?')} cv",
        }
        specs_b = {
            "Preço": format_price_brl(vehicles[1]["price"]),
            "Autonomia": f"{vehicles[1]['range']} km",
            "Potência": f"{vehicles[1].get('power', '?')} cv",
        }
        vehicle_photo_path_a = download_vehicle_photo_sync(vehicles[0])
        vehicle_photo_path_b = download_vehicle_photo_sync(vehicles[1])
        image_path = img_gen.create_comparison_image(
            model_a=f"{vehicles[0]['brand']} {vehicles[0]['model']}",
            model_b=f"{vehicles[1]['brand']} {vehicles[1]['model']}",
            specs_a=specs_a,
            specs_b=specs_b,
            vehicle_photo_path_a=vehicle_photo_path_a,
            vehicle_photo_path_b=vehicle_photo_path_b,
        )
    elif vehicles:
        image_meta = build_image_cost_metadata(
            provider="catalog",
            model="catalog_photo",
            ai_image_used=False,
        )
        vehicle = vehicles[0]
        vehicle_photo_path = download_vehicle_photo_sync(vehicle)
        image_path = create_vehicle_post_image(
            vehicle=vehicle,
            vehicle_photo_path=vehicle_photo_path,
            category=category,
            post_format="feed",
        )
    else:
        settings = get_settings()
        should_try_ai = (
            settings.enable_ai_image_generation
            and category in AI_IMAGE_CATEGORIES
            and _image_provider_ready(settings)
        )
        if should_try_ai:
            try:
                image_path = generate_ai_post_image(
                    headline=headline[:60],
                    subtitle=visual_subtitle[:120],
                    category=category,
                )
                image_meta = build_image_cost_metadata(
                    provider=(settings.image_generation_provider or "gemini").strip().lower(),
                    model=settings.image_generation_model,
                    ai_image_used=True,
                )
                log_generation_event(
                    event_type="image",
                    provider=image_meta["image_provider"],
                    model=image_meta["image_model"],
                    category=category,
                    source=generation_source,
                    status="success",
                    estimated_cost_usd=image_meta.get("image_cost_usd"),
                    cost_source=image_meta.get("image_cost_source"),
                    prompt_excerpt=build_ai_image_prompt(headline[:60], visual_subtitle[:120], category),
                )
            except Exception as e:
                logger.warning(f"⚠️ Falha na geração de imagem por IA; usando template local: {e}")
                failed_image_meta = build_image_cost_metadata(
                    provider=(settings.image_generation_provider or "gemini").strip().lower(),
                    model=settings.image_generation_model,
                    ai_image_used=True,
                )
                log_generation_event(
                    event_type="image",
                    provider=failed_image_meta["image_provider"],
                    model=failed_image_meta["image_model"],
                    category=category,
                    source=generation_source,
                    status="failed",
                    estimated_cost_usd=failed_image_meta.get("image_cost_usd"),
                    cost_source=failed_image_meta.get("image_cost_source"),
                    prompt_excerpt=build_ai_image_prompt(headline[:60], visual_subtitle[:120], category),
                    error_message=str(e),
                )
                image_path = img_gen.create_post_image(
                    headline=headline[:60],
                    subtitle=visual_subtitle[:120],
                    category=category,
                )
                image_meta = build_image_cost_metadata(
                    provider="local",
                    model="template_fallback",
                    ai_image_used=False,
                )
        else:
            image_path = img_gen.create_post_image(
                headline=headline[:60],
                subtitle=visual_subtitle[:120],
                category=category,
            )
            image_meta = build_image_cost_metadata(
                provider="local",
                model="template",
                ai_image_used=False,
            )

    image_url = upload_image_to_hosting_sync(image_path)
    if return_metadata:
        return str(image_path), image_url, image_meta
    return str(image_path), image_url
