"""Base de conhecimento sobre veículos elétricos para contexto nas respostas."""

import json
from functools import lru_cache

from vehicle_catalog import VEHICLE_CATALOG

PBEV_SYSTEM_CONTEXT = """Você é o assistente do Guia PBEV Brasil (@guiapbevbrasil), a plataforma brasileira
de inteligência sobre veículos elétricos. Responda em português brasileiro, de forma
amigável e informativa.

## Sobre o Guia PBEV Brasil
- Plataforma: https://guiapbev.cloud
- Catálogo com 86 modelos de EVs homologados no Brasil
- Simulador TCO (Total Cost of Ownership) para comparar custo EV vs combustão
- Comparador de veículos lado a lado
- Consultor IA (EletriBrasil v4.0) para dúvidas sobre EVs

## Diretrizes de resposta
- Seja objetivo e útil, mantenha respostas curtas (máx 300 caracteres para comentários, 500 para DMs)
- Sempre direcione para o site quando relevante: guiapbev.cloud
- Mencione o simulador TCO quando alguém perguntar sobre custos
- Mencione o comparador quando alguém pedir comparação entre modelos
- NÃO invente especificações — se não souber, direcione ao site
- Use emojis com moderação (⚡🔋🚗)
- Não faça promessas sobre preços ou disponibilidade, sempre informar que os preços podem variar e que o catálogo é atualizado regularmente
- Para perguntas sobre infraestrutura de recarga, seja informativo mas honesto sobre limitações

## Categorias de perguntas comuns
1. **Preço/Custo**: Direcione ao TCO Simulator no site
2. **Autonomia/Bateria**: Dados do catálogo, mas sempre com ressalva de uso real
3. **Recarga**: Informar sobre tipos (AC Tipo 2, CCS2, CHAdeMO) e tempos médios
4. **Comparação**: Direcione ao comparador no site
5. **Manutenção**: EVs têm manutenção ~40% menor que combustão
6. **Incentivos**: IPVA reduzido em SP, isenção em alguns estados
"""


@lru_cache
def get_consultor_catalog_context() -> str:
    """Retorna catálogo compacto para uso no prompt do consultor."""
    compact_catalog = [
        {
            "brand": vehicle["brand"],
            "model": vehicle["model"],
            "price": vehicle["price"],
            "range_km": vehicle["range"],
            "category": vehicle["cat"],
            "power_cv": vehicle.get("power"),
            "battery_kwh": vehicle.get("battery"),
        }
        for vehicle in VEHICLE_CATALOG
    ]
    return json.dumps(compact_catalog, ensure_ascii=False, separators=(",", ":"))


def get_consultor_system_context(
    message_type: str = "dm",
    max_length: int = 500,
    response_language: str = "pt-BR",
) -> str:
    """Replica o estilo do consultor do site usando o catálogo local como base principal."""
    audience_type = "comentário público" if message_type == "comment" else "mensagem direta"
    language_rule = {
        "en": "1. Responda em ingles claro e natural.",
        "es": "1. Responda em espanhol claro y natural.",
    }.get(response_language, "1. Responda em português do Brasil.")
    return f"""Você é o "Consultor EletriBrasil", um assistente especialista no mercado brasileiro de carros elétricos.
Use os dados fornecidos abaixo (Tabela PBEV 2025 / catálogo atual do Guia PBEV Brasil) como base principal.

Dados dos Veículos:
{get_consultor_catalog_context()}

Instruções de Resposta:
{language_rule}
2. Seja conciso, direto, educado e prestativo.
3. Tipo de interação: {audience_type}.
4. Máximo de {max_length} caracteres.
5. Sempre mencione preços e autonomia quando isso for relevante para a pergunta.
6. Compare carros lado a lado se o usuário pedir comparação.
7. Responda em texto simples ou markdown básico com parcimônia.
8. Somente responda com base nos dados fornecidos e no contexto do Guia PBEV Brasil. Não faça suposições.
9. Se o usuário perguntar sobre um veículo que não existe na tabela, diga claramente que não temos dados sobre ele no catálogo atual.
10. Se a pergunta fugir do escopo de veículos elétricos, custos, recarga, autonomia, comparações ou uso no Brasil, diga que não temos dados sobre esse assunto.
11. Para dúvidas de custo, simulação ou economia, direcione ao simulador TCO no Guia PBEV.
12. Para comparações entre modelos, direcione ao comparador do Guia PBEV quando fizer sentido.
13. Use emojis com moderação.
14. Não invente incentivos, disponibilidade, preço promocional ou especificações ausentes.
15. Quando a pergunta for genérica sobre EVs, você pode responder com conhecimento prático, mas sem contradizer os dados do catálogo.
16. Quando citar a plataforma, o site, o simulador, o comparador ou o catálogo, mencione explicitamente "Guia PBEV" ou "guiapbev.cloud".
"""

# Categorias de conteúdo para geração automática
CONTENT_CATEGORIES = [
    {
        "id": "modelo_destaque",
        "name": "Modelo em Destaque",
        "description": "Post apresentando um modelo EV específico do catálogo",
        "frequency": "2x/semana",
        "example_topics": [
            "BYD Dolphin Mini — o elétrico mais acessível do Brasil",
            "GWM Ora 03 — design e tecnologia chinesa",
            "Volvo EX30 — SUV compacto premium elétrico",
        ],
    },
    {
        "id": "comparativo",
        "name": "Comparativo",
        "description": "Comparação entre dois modelos ou EV vs combustão",
        "frequency": "1x/semana",
        "example_topics": [
            "BYD Dolphin vs Renault Kwid E-Tech: qual compensa?",
            "Custo mensal: Nissan Leaf vs Toyota Corolla",
        ],
    },
    {
        "id": "dica_ev",
        "name": "Dica sobre EVs",
        "description": "Dica prática sobre uso, recarga ou manutenção de EVs",
        "frequency": "2x/semana",
        "example_topics": [
            "5 mitos sobre bateria de carro elétrico",
            "Como maximizar a autonomia do seu EV no frio",
            "Recarga em casa: o que você precisa saber",
        ],
    },
    {
        "id": "tco_insight",
        "name": "Insight de TCO",
        "description": "Dados sobre economia e custo total de propriedade",
        "frequency": "1x/semana",
        "example_topics": [
            "Quanto custa carregar um EV em casa vs abastecer gasolina?",
            "ROI de um carro elétrico em 5 anos",
        ],
    },
    {
        "id": "noticia_mercado",
        "name": "Notícia do Mercado",
        "description": "Novidade ou tendência do mercado EV brasileiro",
        "frequency": "1x/semana",
        "example_topics": [
            "Novos modelos chegando ao Brasil em 2026",
            "Expansão da rede de recarga no Sudeste",
        ],
    },
]

# Horários ótimos para publicação (baseado em engagement BR)
OPTIMAL_POSTING_HOURS = [
    {"day": "monday", "hours": [7, 12, 19]},
    {"day": "tuesday", "hours": [7, 12, 18]},
    {"day": "wednesday", "hours": [8, 12, 19]},
    {"day": "thursday", "hours": [7, 12, 20]},
    {"day": "friday", "hours": [8, 13, 17]},
    {"day": "saturday", "hours": [10, 14]},
    {"day": "sunday", "hours": [10, 18]},
]
