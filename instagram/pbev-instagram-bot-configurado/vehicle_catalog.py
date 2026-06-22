"""Catálogo de veículos — AUTO-GERADO por sync_catalog.py

NÃO EDITE MANUALMENTE. Rode sync_catalog.py para atualizar.

Fonte: https://github.com/fabao2024/Guia-PBEV-Brasil/blob/main/src/constants.ts
Última sync: 2026-06-04 11:55:05
Veículos: 97 | Marcas: 30 | Faixa: R$99,990–R$1,321,950
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
    # === URBANO ===
    {        "model": "Kwid E-Tech", "brand": "Renault", "price": 99990, "range": 180, "cat": "Urbano", "img": "renault-kwid-e-tech-2026-diagonal-dianteira.avif", "power": 65, "battery": 26.8},
    {        "model": "Dolphin Mini GL", "brand": "BYD", "price": 118990, "range": 224, "cat": "Urbano", "img": "byd-dolphin-mini-gl.jpg", "power": 75, "battery": 30.08},
    {        "model": "E-JS1", "brand": "JAC", "price": 119900, "range": 181, "cat": "Urbano", "img": "e-js1.png", "power": 62, "battery": 30.2},
    {        "model": "iCar EQ", "brand": "CAOA Chery", "price": 119990, "range": 197, "cat": "Urbano", "img": "chery-icar.webp", "power": 61, "battery": 30.8},
    {        "model": "Dolphin Mini GS", "brand": "BYD", "price": 119990, "range": 280, "cat": "Urbano", "img": "Dolphin-mini.png", "power": 75, "battery": 38.0},
    {        "model": "Spark EUV", "brand": "Chevrolet", "price": 144990, "range": 258, "cat": "Urbano", "img": "Spark EUV.avif", "power": 102, "battery": 42.0},
    {        "model": "Dolphin GS", "brand": "BYD", "price": 149990, "range": 291, "cat": "Urbano", "img": "dolphin-gs.jpg", "power": 95, "battery": 44.9},

    # === COMPACTO ===
    {        "model": "EX2 Max", "brand": "Geely", "price": 135100, "range": 289, "cat": "Compacto", "img": "geely-ex2-max.jpg", "power": 116, "battery": 39.4},
    {        "model": "Aion UT Premium", "brand": "GAC", "price": 139990, "range": 253, "cat": "Compacto", "img": "gac-aion-ut.jpg", "power": 204, "battery": 44.12},
    {        "model": "Aya Luxury", "brand": "Neta", "price": 149900, "range": 263, "cat": "Compacto", "img": "neta-aya.avif", "power": 95, "battery": 40.7},
    {        "model": "Ora 03 Skin BEV48", "brand": "GWM", "price": 154000, "range": 232, "cat": "Compacto", "img": "ora 03 skin bev48.webp", "power": 171, "battery": 48.0},
    {        "model": "Aion UT Elite", "brand": "GAC", "price": 159990, "range": 310, "cat": "Compacto", "img": "gac-aion-ut-elite.jpg", "power": 204, "battery": 60.0},
    {        "model": "Dolphin Special Edition", "brand": "BYD", "price": 159990, "range": 272, "cat": "Compacto", "img": "dolphin-special-edition.webp", "power": 177, "battery": 45.12},
    {        "model": "MG4 Comfort", "brand": "MG Motor", "price": 164600, "range": 364, "cat": "Compacto", "img": "mg4-comfort.webp", "power": 190, "battery": 64.0},
    {        "model": "Ora 03 Skin BEV58", "brand": "GWM", "price": 169000, "range": 315, "cat": "Compacto", "img": "gwm-ora-skin-bev58.jpg", "power": 171, "battery": 58.0},
    {        "model": "Dolphin Plus", "brand": "BYD", "price": 179800, "range": 330, "cat": "Compacto", "img": "dolphin-plus.jpg", "power": 204, "battery": 60.4},
    {        "model": "Ora 03 GT BEV63", "brand": "GWM", "price": 189000, "range": 295, "cat": "Compacto", "img": "ora 03 GT BEV63.webp", "power": 171, "battery": 63.0},
    {        "model": "MG4 Luxury", "brand": "MG Motor", "price": 189800, "range": 364, "cat": "Compacto", "img": "mg4-luxury.webp", "power": 190, "battery": 64.0},
    {        "model": "500e Icon", "brand": "Fiat", "price": 214990, "range": 227, "cat": "Compacto", "img": "500e.webp", "power": 118, "battery": 42.0},
    {        "model": "MG4 XPower", "brand": "MG Motor", "price": 229800, "range": 279, "cat": "Compacto", "img": "mg4-xpower.webp", "power": 435, "battery": 64.0},
    {        "model": "Cooper E", "brand": "Mini", "price": 260990, "range": 246, "cat": "Compacto", "img": "cooper e.avif", "power": 184, "battery": 40.7},
    {        "model": "Aceman SE", "brand": "Mini", "price": 304990, "range": 270, "cat": "Compacto", "img": "mini-aceman.jpg", "power": 218, "battery": 54.2},
    {        "model": "JCW-E", "brand": "Mini", "price": 330990, "range": 306, "cat": "Compacto", "img": "mini-jcw-e.jpg", "power": 258, "battery": 54.2},

    # === SEDAN ===
    {        "model": "Aion ES", "brand": "GAC", "price": 170990, "range": 314, "cat": "Sedan", "img": "aion-es.jpg", "power": 136, "battery": 55.0},
    {        "model": "E-J7", "brand": "JAC", "price": 259900, "range": 249, "cat": "Sedan", "img": "jac-ej7.jpg", "power": 193, "battery": 50.0},
    {        "model": "Seal AWD", "brand": "BYD", "price": 269990, "range": 372, "cat": "Sedan", "img": "seal.jpg", "power": 531, "battery": 82.5},
    {        "model": "EQE 350", "brand": "Mercedes-Benz", "price": 649900, "range": 421, "cat": "Sedan", "img": "eqe-350.jpg", "power": 320, "battery": 96.0},

    # === SUV ===
    {        "model": "Yuan Pro", "brand": "BYD", "price": 182900, "range": 250, "cat": "SUV", "img": "yuan-pro.jpg", "power": 177, "battery": 45.0},
    {        "model": "B10 BEV", "brand": "Leapmotor", "price": 182990, "range": 288, "cat": "SUV", "img": "leapmotor-b10.jpg", "power": 218, "battery": 56.2},
    {        "model": "Aion Y Elite", "brand": "GAC", "price": 187990, "range": 318, "cat": "SUV", "img": "aion-y.webp", "power": 204, "battery": 63.2},
    {        "model": "MGS5 Comfort", "brand": "MG Motor", "price": 195800, "range": 351, "cat": "SUV", "img": "mgs5-comfort.webp", "power": 204, "battery": 64.0},
    {        "model": "Captiva EV", "brand": "Chevrolet", "price": 199990, "range": 304, "cat": "SUV", "img": "captiva-ev.jpg", "power": 201, "battery": 60.0},
    {        "model": "C10 BEV", "brand": "Leapmotor", "price": 204990, "range": 338, "cat": "SUV", "img": "leapmotor-c10.jpg", "power": 218, "battery": 69.9},
    {        "model": "Omoda E5", "brand": "Omoda", "price": 209990, "range": 345, "cat": "SUV", "img": "omoda-5.jpg", "power": 204, "battery": 61.0},
    {        "model": "Neta X 500", "brand": "Neta", "price": 214900, "range": 317, "cat": "SUV", "img": "neta-x.jpg", "power": 163, "battery": 52.0},
    {        "model": "EX5 Max", "brand": "Geely", "price": 215800, "range": 349, "cat": "SUV", "img": "ex5-max.jpg", "power": 218, "battery": 60.1},
    {        "model": "Aion V Elite", "brand": "GAC", "price": 219000, "range": 389, "cat": "SUV", "img": "aion-v.jpg", "power": 204, "battery": 75.0},
    {        "model": "MGS5 Luxury", "brand": "MG Motor", "price": 219800, "range": 351, "cat": "SUV", "img": "mgs5-luxury.webp", "power": 204, "battery": 64.0},
    {        "model": "Yuan Plus", "brand": "BYD", "price": 229800, "range": 294, "cat": "SUV", "img": "yuan-plus.jpg", "power": 204, "battery": 60.5},
    {        "model": "EX30 Plus", "brand": "Volvo", "price": 239950, "range": 250, "cat": "SUV", "img": "ex30.jpg", "power": 272, "battery": 51.0},
    {        "model": "E-JS4", "brand": "JAC", "price": 254900, "range": 307, "cat": "SUV", "img": "e-js4.png", "power": 150, "battery": 55.0},
    {        "model": "Yuan Plus AWD", "brand": "BYD", "price": 269990, "range": 350, "cat": "SUV", "img": "byd-yuan-plus-awd.jpg", "power": 449, "battery": 74.88},
    {        "model": "e-Vitara", "brand": "Suzuki", "price": 269990, "range": 293, "cat": "SUV", "img": "e-vitara.jpg", "power": 184},
    {        "model": "Zeekr X", "brand": "Zeekr", "price": 272000, "range": 332, "cat": "SUV", "img": "zeekr-x.webp", "power": 272, "battery": 66.0},
    {        "model": "Megane E-Tech", "brand": "Renault", "price": 279900, "range": 337, "cat": "SUV", "img": "megane-etech.webp", "power": 220, "battery": 60.0},
    {        "model": "EX30 Ultra", "brand": "Volvo", "price": 309950, "range": 316, "cat": "SUV", "img": "volvo-ex30-ultra.jpg", "power": 428, "battery": 69.0},
    {        "model": "ID.4", "brand": "Volkswagen", "price": 320000, "range": 370, "cat": "SUV", "img": "id4.jpg", "power": 204, "battery": 77.0},
    {        "model": "Sealion 7", "brand": "BYD", "price": 339990, "range": 360, "cat": "SUV", "img": "byd-sealion-7.jpg", "power": 531, "battery": 82.5},
    {        "model": "Countryman SE", "brand": "Mini", "price": 340990, "range": 320, "cat": "SUV", "img": "countryman-se.jpg", "power": 306, "battery": 64.6},
    {        "model": "EX40 (XC40)", "brand": "Volvo", "price": 342950, "range": 385, "cat": "SUV", "img": "ex40.jpg", "power": 238, "battery": 69.0},
    {        "model": "Equinox EV", "brand": "Chevrolet", "price": 349990, "range": 443, "cat": "SUV", "img": "equinox-ev.jpg", "power": 292, "battery": 85.0},
    {        "model": "Ariya", "brand": "Nissan", "price": 350000, "range": 400, "cat": "SUV", "img": "ariya.jpg", "power": 242, "battery": 87.0},
    {        "model": "EC40 (C40)", "brand": "Volvo", "price": 359950, "range": 385, "cat": "SUV", "img": "ec40.jpg", "power": 238, "battery": 69.0},
    {        "model": "iX1 eDrive20", "brand": "BMW", "price": 359950, "range": 345, "cat": "SUV", "img": "ix1.jpg", "power": 204, "battery": 64.7},
    {        "model": "EV5 Land", "brand": "Kia", "price": 389990, "range": 402, "cat": "SUV", "img": "ev5.jpg", "power": 217, "battery": 88.0},
    {        "model": "Ioniq 5", "brand": "Hyundai", "price": 394990, "range": 374, "cat": "SUV", "img": "ioniq-5.jpg", "power": 325, "battery": 72.6},
    {        "model": "7X", "brand": "Zeekr", "price": 448000, "range": 423, "cat": "SUV", "img": "zeekr-7x.png", "power": 646, "battery": 100.0},
    {        "model": "iX2 xDrive30", "brand": "BMW", "price": 495950, "range": 327, "cat": "SUV", "img": "bmw-ix2.jpg", "power": 313, "battery": 64.8},
    {        "model": "EX90 Twin", "brand": "Volvo", "price": 849990, "range": 459, "cat": "SUV", "img": "volvo-ex90.jpg", "power": 408, "battery": 111.0},

    # === LUXO ===
    {        "model": "Hyptec HT", "brand": "GAC", "price": 359990, "range": 431, "cat": "Luxo", "img": "hyptec-ht.jpg", "power": 340, "battery": 80.0},
    {        "model": "EQA 250", "brand": "Mercedes-Benz", "price": 369900, "range": 370, "cat": "Luxo", "img": "eqa-250.jpg", "power": 190, "battery": 66.5},
    {        "model": "EQB 250", "brand": "Mercedes-Benz", "price": 399900, "range": 376, "cat": "Luxo", "img": "eqb-250.jpg", "power": 190, "battery": 70.5},
    {        "model": "001 Premium", "brand": "Zeekr", "price": 428000, "range": 426, "cat": "Luxo", "img": "zeekr-001.webp", "power": 544, "battery": 100.0},
    {        "model": "i4 eDrive35", "brand": "BMW", "price": 449950, "range": 422, "cat": "Luxo", "img": "bmw-i4-edrive35.webp", "power": 286, "battery": 70.0},
    {        "model": "Mustang Mach-E", "brand": "Ford", "price": 486000, "range": 379, "cat": "Luxo", "img": "mach-e.jpg", "power": 487, "battery": 91.0},
    {        "model": "Blazer EV RS", "brand": "Chevrolet", "price": 489000, "range": 483, "cat": "Luxo", "img": "blazer-ev.jpg", "power": 347, "battery": 85.0},
    {        "model": "Cyberster", "brand": "MG Motor", "price": 499800, "range": 342, "cat": "Luxo", "img": "cyberster.webp", "power": 510, "battery": 77.0},
    {        "model": "iX3", "brand": "BMW", "price": 500950, "range": 381, "cat": "Luxo", "img": "ix3.jpg", "power": 286, "battery": 74.0},
    {        "model": "Q6 e-tron", "brand": "Audi", "price": 529990, "range": 411, "cat": "Luxo", "img": "audi-q6-etron.jpg", "power": 299, "battery": 94.9},
    {        "model": "Tan EV", "brand": "BYD", "price": 536800, "range": 430, "cat": "Luxo", "img": "tan-ev.jpg", "power": 517, "battery": 108.8},
    {        "model": "Han EV", "brand": "BYD", "price": 559800, "range": 349, "cat": "Luxo", "img": "han-ev.jpg", "power": 517, "battery": 85.4},
    {        "model": "Macan EV", "brand": "Porsche", "price": 560000, "range": 443, "cat": "Luxo", "img": "macan-ev.jpg", "power": 408, "battery": 100.0},
    {        "model": "Q6 Sportback e-tron", "brand": "Audi", "price": 569990, "range": 427, "cat": "Luxo", "img": "audi-q6-sportback.jpg", "power": 299, "battery": 94.9},
    {        "model": "A6 Sportback e-tron", "brand": "Audi", "price": 649990, "range": 445, "cat": "Luxo", "img": "audi-a6-etron.png", "power": 367, "battery": 94.9},
    {        "model": "SQ6 Sportback e-tron", "brand": "Audi", "price": 684990, "range": 428, "cat": "Luxo", "img": "audi-sq6-sportback.png", "power": 367, "battery": 100.0},
    {        "model": "EQE 300 SUV", "brand": "Mercedes-Benz", "price": 698900, "range": 367, "cat": "Luxo", "img": "eqe-suv.webp", "power": 245, "battery": 90.0},
    {        "model": "Q8 e-tron", "brand": "Audi", "price": 699000, "range": 332, "cat": "Luxo", "img": "q8-etron.jpg", "power": 408, "battery": 106.0},
    {        "model": "iX xDrive40", "brand": "BMW", "price": 699950, "range": 329, "cat": "Luxo", "img": "ix.jpg", "power": 326, "battery": 71.0},
    {        "model": "EV9 GT-Line", "brand": "Kia", "price": 749990, "range": 434, "cat": "Luxo", "img": "ev9.jpg", "power": 384, "battery": 99.8},
    {        "model": "e-tron GT", "brand": "Audi", "price": 769990, "range": 318, "cat": "Luxo", "img": "etron-gt.jpg", "power": 530, "battery": 93.4},
    {        "model": "i5 M60", "brand": "BMW", "price": 794950, "range": 393, "cat": "Luxo", "img": "bmw-i5-m60.webp", "power": 601, "battery": 84.0},
    {        "model": "Cayenne EV", "brand": "Porsche", "price": 900000, "range": 493, "cat": "Luxo", "img": "cayenne-ev.jpg", "power": 435, "battery": 113.2},
    {        "model": "Taycan 4S", "brand": "Porsche", "price": 980000, "range": 415, "cat": "Luxo", "img": "porsche-taycan.jpeg", "power": 598, "battery": 105.0},
    {        "model": "i7 xDrive60", "brand": "BMW", "price": 1321950, "range": 467, "cat": "Luxo", "img": "i7.jpg", "power": 544, "battery": 101.7},

    # === COMERCIAL ===
    {        "model": "eT3", "brand": "BYD", "price": 229990, "range": 170, "cat": "Comercial", "img": "et3.jpg", "power": 136, "battery": 50.3},
    {        "model": "eWonder", "brand": "Foton", "price": 235900, "range": 189, "cat": "Comercial", "img": "foton-ewonder.jpg", "power": 102, "battery": 41.86},
    {        "model": "Kangoo E-Tech", "brand": "Renault", "price": 259000, "range": 210, "cat": "Comercial", "img": "kangoo-etech.webp", "power": 120, "battery": 45.0},
    {        "model": "V6E", "brand": "Farizon", "price": 260000, "range": 156, "cat": "Comercial", "img": "farizon-v6e.webp", "power": 136, "battery": 81.0},
    {        "model": "eView Grand", "brand": "Foton", "price": 299900, "range": 162, "cat": "Comercial", "img": "foton-eview-grand.jpg", "power": 184, "battery": 77.28},
    {        "model": "E-JV5.5", "brand": "JAC", "price": 314900, "range": 260, "cat": "Comercial", "img": "jac-ejv55.png", "power": 204, "battery": 50.2},
    {        "model": "e-Expert", "brand": "Peugeot", "price": 329990, "range": 330, "cat": "Comercial", "img": "e-expert.jpg", "power": 136, "battery": 75.0},
    {        "model": "e-Scudo", "brand": "Fiat", "price": 329990, "range": 289, "cat": "Comercial", "img": "e-scudo.jpg", "power": 136, "battery": 75.0},
    {        "model": "e-Jumpy", "brand": "Citroen", "price": 329990, "range": 330, "cat": "Comercial", "img": "e-jumpy.jpg", "power": 136, "battery": 75.0},
    {        "model": "ID.Buzz", "brand": "Volkswagen", "price": 340000, "range": 341, "cat": "Comercial", "img": "idbuzz.jpg", "power": 204, "battery": 77.0},
    {        "model": "SuperVan SV", "brand": "Farizon", "price": 425000, "range": 239, "cat": "Comercial", "img": "farizon-sv.webp", "power": 231, "battery": 82.9},
    {        "model": "eSprinter 320", "brand": "Mercedes-Benz", "price": 482900, "range": 206, "cat": "Comercial", "img": "mercedes-esprinter.png", "power": 204, "battery": 113.0},
    {        "model": "e-Transit", "brand": "Ford", "price": 542000, "range": 203, "cat": "Comercial", "img": "etransit.avif", "power": 198, "battery": 68.0},

]


def get_vehicle(model_name: str) -> dict | None:
    """Busca veículo pelo nome (busca parcial, case-insensitive)."""
    name_lower = model_name.lower()
    for v in VEHICLE_CATALOG:
        if name_lower in v["model"].lower() or name_lower in f"{v['brand']} {v['model']}".lower():
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
        return f"{GITHUB_IMAGE_BASE}/{encoded}"
    return f"{SITE_IMAGE_BASE}/{encoded}"


def get_random_vehicle_for_category(category_id: str) -> dict | None:
    """Seleciona veículo aleatório para uma categoria de conteúdo."""
    category_filters = {
        "modelo_destaque": {},
        "comparativo": {},
        "dica_ev": {},
        "tco_insight": {"max_price": 250000},
        "noticia_mercado": {},
    }
    filters = category_filters.get(category_id, {})
    candidates = VEHICLE_CATALOG
    if "max_price" in filters:
        candidates = [v for v in candidates if v["price"] <= filters["max_price"]]
    return random.choice(candidates) if candidates else None


def format_price_brl(price: int) -> str:
    """Formata preço em BRL."""
    return f"R$ {price:,.0f}".replace(",", ".")


def get_specs_summary(vehicle: dict) -> str:
    """Gera resumo de specs para caption do Instagram."""
    return (
        f"⚡ {vehicle['brand']} {vehicle['model']}\n"
        f"→ Preço: {format_price_brl(vehicle['price'])}\n"
        f"→ Autonomia: {vehicle['range']} km WLTP\n"
        f"→ Motor: {vehicle.get('power', '?')} cv\n"
        f"→ Bateria: {vehicle.get('battery', '?')} kWh\n"
        f"→ Categoria: {vehicle['cat']}"
    )
