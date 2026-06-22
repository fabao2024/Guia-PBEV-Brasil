#!/usr/bin/env python3
"""Sync script — extrai dados de veículos do repo Guia-PBEV-Brasil.

Puxa src/constants.ts do repo principal e gera vehicle_catalog.py atualizado.
Roda via GitHub Actions (semanal) ou manualmente.

Uso:
    python sync_catalog.py                    # Baixa do GitHub e gera
    python sync_catalog.py --local /path/to   # Usa cópia local do repo
    python sync_catalog.py --dry-run          # Mostra sem salvar
"""

import argparse
import json
import logging
import re
import sys
from datetime import datetime
from pathlib import Path

import httpx

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

REPO_RAW_BASE = "https://raw.githubusercontent.com/fabao2024/Guia-PBEV-Brasil/main"
CONSTANTS_PATH = "src/constants.ts"
OUTPUT_FILE = Path(__file__).parent / "vehicle_catalog.py"


def fetch_constants_ts(local_path: str | None = None) -> str:
    """Baixa ou lê o constants.ts."""
    if local_path:
        path = Path(local_path) / CONSTANTS_PATH
        if not path.exists():
            logger.error(f"Arquivo não encontrado: {path}")
            sys.exit(1)
        logger.info(f"📂 Lendo de {path}")
        return path.read_text(encoding="utf-8")

    url = f"{REPO_RAW_BASE}/{CONSTANTS_PATH}"
    logger.info(f"🌐 Baixando {url}")
    resp = httpx.get(url, timeout=30, follow_redirects=True)
    resp.raise_for_status()
    return resp.text


def parse_vehicles(ts_content: str) -> list[dict]:
    """Extrai veículos do TypeScript usando regex.

    Parseia blocos tipo:
        { model: "Dolphin Mini GS", brand: "BYD", price: 119990, range: 280, cat: "Urbano",
          img: "/car-images/Dolphin-mini.png",
          power: 75, torque: 13.8, traction: 'FWD', battery: 38, ... }
    """
    vehicles = []

    # Encontra o array CARS (ou similar)
    # Padrão: blocos { model: "...", ... } dentro de arrays
    block_pattern = re.compile(
        r'\{\s*'
        r'model:\s*["\']([^"\']+)["\'].*?'
        r'brand:\s*["\']([^"\']+)["\'].*?'
        r'price:\s*(\d+).*?'
        r'range:\s*(\d+).*?'
        r'cat:\s*["\']([^"\']+)["\'].*?'
        r'img:\s*["\']([^"\']+)["\']',
        re.DOTALL
    )

    power_pattern = re.compile(r'power:\s*(\d+)')
    battery_pattern = re.compile(r'battery:\s*([\d.]+)')
    torque_pattern = re.compile(r'torque:\s*([\d.]+)')
    traction_pattern = re.compile(r"traction:\s*['\"](\w+)['\"]")
    discontinued_pattern = re.compile(r'discontinued:\s*true')

    # Divide em blocos individuais de objetos
    # Procura cada { ... } que contém model:
    obj_pattern = re.compile(r'\{[^{}]*model:\s*["\'][^"\']+["\'][^{}]*\}', re.DOTALL)

    for match in obj_pattern.finditer(ts_content):
        block = match.group()

        # Pula modelos descontinuados
        if discontinued_pattern.search(block):
            continue

        main = block_pattern.search(block)
        if not main:
            continue

        model, brand, price, range_km, cat, img = main.groups()

        # Limpa o path da imagem
        img = img.replace("/car-images/", "")

        vehicle = {
            "model": model,
            "brand": brand,
            "price": int(price),
            "range": int(range_km),
            "cat": cat,
            "img": img,
        }

        # Campos opcionais
        power_m = power_pattern.search(block)
        if power_m:
            vehicle["power"] = int(power_m.group(1))

        battery_m = battery_pattern.search(block)
        if battery_m:
            vehicle["battery"] = float(battery_m.group(1))

        torque_m = torque_pattern.search(block)
        if torque_m:
            vehicle["torque"] = float(torque_m.group(1))

        traction_m = traction_pattern.search(block)
        if traction_m:
            vehicle["traction"] = traction_m.group(1)

        vehicles.append(vehicle)

    return vehicles


def count_images(ts_content: str) -> int:
    """Conta imagens únicas referenciadas."""
    imgs = re.findall(r'img:\s*["\']([^"\']+)["\']', ts_content)
    return len(set(imgs))


def generate_catalog_py(vehicles: list[dict]) -> str:
    """Gera o conteúdo do vehicle_catalog.py."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Agrupa por categoria
    categories = {}
    for v in vehicles:
        cat = v["cat"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(v)

    # Gera entries formatadas
    entries_lines = []
    for cat, cat_vehicles in categories.items():
        entries_lines.append(f"    # === {cat.upper()} ===")
        for v in sorted(cat_vehicles, key=lambda x: x["price"]):
            parts = [
                f'        "model": "{v["model"]}"',
                f'"brand": "{v["brand"]}"',
                f'"price": {v["price"]}',
                f'"range": {v["range"]}',
                f'"cat": "{v["cat"]}"',
                f'"img": "{v["img"]}"',
            ]
            if "power" in v:
                parts.append(f'"power": {v["power"]}')
            if "battery" in v:
                parts.append(f'"battery": {v["battery"]}')
            entry = ", ".join(parts)
            entries_lines.append(f"    {{{entry}}},")
        entries_lines.append("")

    entries_block = "\n".join(entries_lines)

    # Stats
    brands = sorted(set(v["brand"] for v in vehicles))
    price_min = min(v["price"] for v in vehicles)
    price_max = max(v["price"] for v in vehicles)

    return f'''"""Catálogo de veículos — AUTO-GERADO por sync_catalog.py

NÃO EDITE MANUALMENTE. Rode sync_catalog.py para atualizar.

Fonte: https://github.com/fabao2024/Guia-PBEV-Brasil/blob/main/src/constants.ts
Última sync: {now}
Veículos: {len(vehicles)} | Marcas: {len(brands)} | Faixa: R${price_min:,}–R${price_max:,}
"""

import logging
import random
from pathlib import Path
from io import BytesIO
from urllib.parse import quote

logger = logging.getLogger(__name__)

# Base URLs para as imagens dos veículos
SITE_IMAGE_BASE = "https://guiapbev.cloud/car-images"
GITHUB_IMAGE_BASE = "https://raw.githubusercontent.com/fabao2024/Guia-PBEV-Brasil/main/public/car-images"

VEHICLE_CATALOG = [
{entries_block}
]


def get_vehicle(model_name: str) -> dict | None:
    """Busca veículo pelo nome (busca parcial, case-insensitive)."""
    name_lower = model_name.lower()
    for v in VEHICLE_CATALOG:
        if name_lower in v["model"].lower() or name_lower in f"{{v[\'brand\']}} {{v[\'model\']}}".lower():
            return v
    return None


def get_vehicles_by_category(category: str) -> list[dict]:
    """Lista veículos por categoria."""
    return [v for v in VEHICLE_CATALOG if v["cat"].lower() == category.lower()]


def get_vehicles_by_brand(brand: str) -> list[dict]:
    """Lista veículos por marca."""
    return [v for v in VEHICLE_CATALOG if v["brand"].lower() == brand.lower()]


def get_vehicles_by_price_range(min_price: int = 0, max_price: int = 999999) -> list[dict]:
    """Lista veículos por faixa de preço."""
    return [v for v in VEHICLE_CATALOG if min_price <= v["price"] <= max_price]


def get_image_url(vehicle: dict, source: str = "site") -> str:
    """Retorna URL pública da imagem do veículo."""
    filename = vehicle["img"]
    encoded = quote(filename)
    if source == "github":
        return f"{{GITHUB_IMAGE_BASE}}/{{encoded}}"
    return f"{{SITE_IMAGE_BASE}}/{{encoded}}"


def get_random_vehicle_for_category(category_id: str) -> dict | None:
    """Seleciona veículo aleatório para uma categoria de conteúdo."""
    category_filters = {{
        "modelo_destaque": {{}},
        "comparativo": {{}},
        "dica_ev": {{}},
        "tco_insight": {{"max_price": 250000}},
        "noticia_mercado": {{}},
    }}
    filters = category_filters.get(category_id, {{}})
    candidates = VEHICLE_CATALOG
    if "max_price" in filters:
        candidates = [v for v in candidates if v["price"] <= filters["max_price"]]
    return random.choice(candidates) if candidates else None


def format_price_brl(price: int) -> str:
    """Formata preço em BRL."""
    return f"R$ {{price:,.0f}}".replace(",", ".")


def get_specs_summary(vehicle: dict) -> str:
    """Gera resumo de specs para caption do Instagram."""
    return (
        f"⚡ {{vehicle[\'brand\']}} {{vehicle[\'model\']}}\\n"
        f"→ Preço: {{format_price_brl(vehicle[\'price\'])}}\\n"
        f"→ Autonomia: {{vehicle[\'range\']}} km WLTP\\n"
        f"→ Motor: {{vehicle.get(\'power\', \'?\')}} cv\\n"
        f"→ Bateria: {{vehicle.get(\'battery\', \'?\')}} kWh\\n"
        f"→ Categoria: {{vehicle[\'cat\']}}"
    )
'''


def main():
    parser = argparse.ArgumentParser(description="Sync catálogo de veículos do Guia PBEV")
    parser.add_argument("--local", type=str, help="Caminho local do repo Guia-PBEV-Brasil")
    parser.add_argument("--dry-run", action="store_true", help="Apenas mostrar, não salvar")
    parser.add_argument("--output", type=str, help="Caminho de saída (default: vehicle_catalog.py)")
    args = parser.parse_args()

    # 1. Buscar constants.ts
    ts_content = fetch_constants_ts(args.local)

    # 2. Parsear veículos
    vehicles = parse_vehicles(ts_content)
    n_images = count_images(ts_content)

    if not vehicles:
        logger.error("❌ Nenhum veículo encontrado no constants.ts")
        sys.exit(1)

    # Stats
    brands = sorted(set(v["brand"] for v in vehicles))
    cats = sorted(set(v["cat"] for v in vehicles))
    logger.info(f"📊 Encontrados: {len(vehicles)} veículos, {len(brands)} marcas, {n_images} imagens")
    logger.info(f"📊 Categorias: {', '.join(cats)}")
    logger.info(f"📊 Marcas: {', '.join(brands)}")

    # 3. Gerar Python
    catalog_py = generate_catalog_py(vehicles)

    if args.dry_run:
        print("\n--- vehicle_catalog.py (preview) ---\n")
        # Mostra apenas os primeiros 80 linhas
        lines = catalog_py.split("\n")
        for line in lines[:80]:
            print(line)
        if len(lines) > 80:
            print(f"\n... ({len(lines) - 80} linhas restantes)")
        print(f"\n✅ {len(vehicles)} veículos seriam escritos.")
        return

    # 4. Salvar
    output = Path(args.output) if args.output else OUTPUT_FILE
    output.write_text(catalog_py, encoding="utf-8")
    logger.info(f"✅ {output} gerado com {len(vehicles)} veículos")


if __name__ == "__main__":
    main()
