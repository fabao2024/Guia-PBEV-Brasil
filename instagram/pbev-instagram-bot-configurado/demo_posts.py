"""
Demo: exemplos reais do que o PBEV Instagram Bot gera para cada categoria.

Cada post segue as regras do sistema:
- Hook forte na primeira linha
- Legendas 150-300 palavras em PT-BR
- 15-20 hashtags (mix alto volume + nicho)
- 1 CTA com link UTM rastreável
- Emojis com moderação
"""

import json
from datetime import datetime, timedelta

DEMO_POSTS = [
    # ─────────────────────────────────────────
    # CATEGORIA 1: Modelo em Destaque (2x/semana)
    # ─────────────────────────────────────────
    {
        "category": "modelo_destaque",
        "frequency": "2x por semana",
        "scheduled_at": "Segunda 07:00",
        "caption": """Você sabia que o carro elétrico mais barato do Brasil custa menos que um Onix? 🤯

O BYD Dolphin Mini chegou ao mercado brasileiro a partir de R$ 115.800 e está mudando completamente o jogo da eletromobilidade no país.

Com 130 km de autonomia real (WLTP), ele é perfeito para o uso urbano do dia a dia — ida ao trabalho, escola, mercado. E o melhor: custa cerca de R$ 35 por mês para carregar em casa.

⚡ Principais specs:
→ Motor: 75 cv / 135 Nm
→ Bateria: 38,4 kWh (Blade LFP)
→ Recarga rápida: 30-80% em 35 min (CCS2)
→ Porta-malas: 326 litros
→ Garantia da bateria: 8 anos

O que muita gente não sabe é que a bateria Blade da BYD é uma das mais seguras do mundo — ela passou no teste de penetração por prego sem pegar fogo.

Quer comparar o custo real do Dolphin Mini com seu carro a gasolina? Use nosso Simulador TCO 👇

🔗 guiapbev.cloud/simulador-tco?utm_source=instagram&utm_medium=post&utm_campaign=modelo_destaque&utm_content=post_1""",
        "hashtags": "#BYDDolphinMini #CarroEletrico #VeiculoEletrico #MobilidadeEletrica #BYDBrasil #EVBrasil #DolphinMini #CarroEletricoBrasil #Eletromobilidade #BYD #AutomovelEletrico #CarroEletricoparaTodos #EletricoAcessivel #ZeroEmissao #GuiaPBEV #TransicaoEnergetica #FuturoEletrico #EnergiaLimpa",
        "image_prompt": "BYD Dolphin Mini branco em cenário urbano brasileiro, visual clean, destaque nos specs",
        "image_type": "Feed 1080x1080 — fundo escuro, headline 'DOLPHIN MINI', badge 'MODELO', specs em destaque"
    },

    {
        "category": "modelo_destaque",
        "frequency": "2x por semana",
        "scheduled_at": "Quinta 12:00",
        "caption": """R$ 0 de IPVA, R$ 35/mês de "combustível" e manutenção 40% mais barata. Esse é o GWM Ora 03. ⚡

A GWM trouxe pro Brasil um dos elétricos com melhor custo-benefício do mercado. O Ora 03 (antigo Good Cat) combina design que chama atenção com tecnologia de verdade.

São 400 km de autonomia WLTP — suficiente pra ir de São Paulo a Campinas e voltar sem recarregar. E com recarga rápida CCS2, em 30 minutos você vai de 20% a 80%.

⚡ O que se destaca:
→ Autonomia: 400 km (WLTP)
→ Motor: 171 cv / 250 Nm
→ Bateria: 63 kWh
→ Tela central: 10,25"
→ Assistente de condução L2

Um ponto que poucas pessoas consideram: o custo de manutenção. Sem troca de óleo, sem filtros de combustível, sem correia dentada. Em 5 anos, a economia na manutenção sozinha já paga a diferença de preço.

Compare o Ora 03 com outros modelos no nosso comparador 👇

🔗 guiapbev.cloud/comparador?utm_source=instagram&utm_medium=post&utm_campaign=modelo_destaque&utm_content=post_2""",
        "hashtags": "#GWMOra03 #GWMBrasil #Ora03 #CarroEletrico #VeiculoEletrico #EVBrasil #MobilidadeEletrica #400kmAutonomia #CarroEletricoBrasil #Eletromobilidade #GoodCat #AutomovelEletrico #TransicaoEnergetica #ZeroEmissao #FuturoEletrico #GuiaPBEV #EnergiaLimpa #SustentabilidadeAutomotiva",
        "image_prompt": "GWM Ora 03 skin retro, destaque autonomia 400km",
        "image_type": "Feed 1080x1080 — fundo escuro, headline 'ORA 03', dados de autonomia"
    },

    # ─────────────────────────────────────────
    # CATEGORIA 2: Comparativo (1x/semana)
    # ─────────────────────────────────────────
    {
        "category": "comparativo",
        "frequency": "1x por semana",
        "scheduled_at": "Terça 18:00",
        "caption": """BYD Dolphin vs Renault Kwid E-Tech: qual elétrico popular compensa mais? ⚡🔋

Com dois dos elétricos mais acessíveis do Brasil lado a lado, a dúvida é real. Vamos aos números:

📊 BYD Dolphin (R$ 149.800)
→ Autonomia: 340 km WLTP
→ Motor: 95 cv
→ Bateria: 44,9 kWh
→ Recarga rápida: sim (CCS2)
→ Porta-malas: 345L

📊 Renault Kwid E-Tech (R$ 119.990)
→ Autonomia: 185 km WLTP
→ Motor: 65 cv
→ Bateria: 26,8 kWh
→ Recarga rápida: não
→ Porta-malas: 290L

O Kwid E-Tech custa R$ 30 mil a menos, mas a bateria menor e sem recarga rápida limitam bastante o uso. Se você roda mais de 100 km por dia ou faz viagens frequentes, o Dolphin compensa no médio prazo.

Agora, se seu uso é 100% urbano e curto, o Kwid E-Tech entrega o essencial por um preço agressivo.

Faça a simulação completa de custo no nosso TCO Simulator — ele calcula combustível, manutenção, IPVA e depreciação em 5 anos 👇

🔗 guiapbev.cloud/simulador-tco?utm_source=instagram&utm_medium=post&utm_campaign=comparativo&utm_content=post_3""",
        "hashtags": "#BYDDolphin #RenaultKwid #KwidETech #ComparativoEV #CarroEletrico #EVBrasil #MobilidadeEletrica #QualComprarEletrico #EletricoPopular #CarroEletricoBrasil #Eletromobilidade #TCO #CustoTotalPropriedade #GuiaPBEV #VeiculoEletrico #AutomovelEletrico #TransicaoEnergetica #FuturoEletrico",
        "image_prompt": "Split image BYD Dolphin vs Renault Kwid E-Tech, specs side by side",
        "image_type": "Feed 1080x1080 — layout VS com specs lado a lado, cores contrastantes"
    },

    # ─────────────────────────────────────────
    # CATEGORIA 3: Dica sobre EVs (2x/semana)
    # ─────────────────────────────────────────
    {
        "category": "dica_ev",
        "frequency": "2x por semana",
        "scheduled_at": "Quarta 08:00",
        "caption": """"Carro elétrico não anda na chuva." Já ouviu isso? Hora de acabar com esse mito. 🌧️⚡

Um dos medos mais comuns de quem considera um EV é a segurança com água. A verdade é que carros elétricos são MAIS seguros na chuva do que os a combustão. Aqui vai o porquê:

1️⃣ Baterias são seladas com classificação IP67 — isso significa que podem ficar submersas em 1 metro de água por 30 minutos sem infiltração.

2️⃣ O sistema elétrico opera em corrente contínua de alta voltagem com múltiplas camadas de isolamento. Se qualquer anomalia for detectada, o BMS (Battery Management System) desliga tudo em milissegundos.

3️⃣ Sem motor a combustão = sem risco de "calar" em enchente. O motor elétrico não precisa de ar para funcionar.

4️⃣ Conectores de recarga (Tipo 2, CCS2) são projetados para uso externo sob chuva. Os pinos só energizam quando há comunicação segura com o veículo.

⚠️ Claro: nenhum carro — elétrico ou não — deve entrar em alagamento profundo. Mas o EV tem vantagem estrutural aqui.

Tem mais dúvidas sobre EVs? Nosso Consultor EletriBrasil responde tudo 👇

🔗 guiapbev.cloud?utm_source=instagram&utm_medium=post&utm_campaign=dica_ev&utm_content=post_4""",
        "hashtags": "#DicaEV #CarroEletrico #MitosEV #VeiculoEletrico #SegurancaEV #EVnaChuva #MobilidadeEletrica #BateriaCarro #IP67 #CarroEletricoBrasil #EVBrasil #Eletromobilidade #TransicaoEnergetica #GuiaPBEV #FuturoEletrico #AutomovelEletrico #EnergiaLimpa #SustentabilidadeAutomotiva",
        "image_prompt": "Visual de carro elétrico sob chuva, destaque em segurança IP67",
        "image_type": "Feed 1080x1080 — fundo verde PBEV, headline 'MITOS EV', badge 'DICA'"
    },

    {
        "category": "dica_ev",
        "frequency": "2x por semana",
        "scheduled_at": "Sábado 10:00",
        "caption": """Carregar seu carro elétrico em casa custa menos que seu Netflix. Sério. ⚡💰

Vamos fazer a conta juntos:

Um EV médio consome cerca de 15 kWh para rodar 100 km. Se você roda 1.000 km por mês (média do brasileiro), são 150 kWh.

Na tarifa residencial de SP (~R$ 0,75/kWh com impostos), isso dá:
→ 150 kWh × R$ 0,75 = R$ 112,50 por mês

Agora compara com gasolina:
→ 1.000 km ÷ 12 km/l (média) = 83 litros
→ 83L × R$ 6,20 = R$ 514,60 por mês

📊 Economia mensal: R$ 402,10
📊 Economia anual: R$ 4.825,20

E tem mais: se você carregar no horário de tarifa branca (madrugada), o custo cai mais 30%. Alguns estados oferecem tarifa EV especial.

A dica de ouro: programe a recarga para iniciar às 23h. A maioria dos EVs permite agendar pelo app. Bateria cheia quando você acorda, pelo menor custo possível.

Quer calcular com seus números reais? Nosso Simulador TCO faz a conta personalizada 👇

🔗 guiapbev.cloud/simulador-tco?utm_source=instagram&utm_medium=post&utm_campaign=dica_ev&utm_content=post_5""",
        "hashtags": "#RecargaEmCasa #CustoEV #CarroEletrico #EconomiaEV #VeiculoEletrico #RecargaEletrica #TarifaBranca #MobilidadeEletrica #EVBrasil #CarroEletricoBrasil #Eletromobilidade #CombustivelEletrico #EnergiaResidencial #GuiaPBEV #FuturoEletrico #EnergiaLimpa #TransicaoEnergetica #CustoKm",
        "image_prompt": "Infográfico comparando custo mensal EV vs gasolina, visual impactante",
        "image_type": "Feed 1080x1080 — fundo escuro, headline 'R$ 112 vs R$ 514', dados de economia"
    },

    # ─────────────────────────────────────────
    # CATEGORIA 4: Insight de TCO (1x/semana)
    # ─────────────────────────────────────────
    {
        "category": "tco_insight",
        "frequency": "1x por semana",
        "scheduled_at": "Sexta 13:00",
        "caption": """Em 5 anos, um carro elétrico pode ser R$ 45 mil mais barato que um a combustão. Os números que ninguém te mostra. 📊⚡

Todo mundo olha só o preço de compra. Mas o custo TOTAL de ter um carro vai muito além. Veja o TCO (Total Cost of Ownership) real:

📊 EV (ex: BYD Dolphin) em 5 anos:
→ Combustível: R$ 6.750 (eletricidade)
→ Manutenção: R$ 8.400
→ IPVA: R$ 0 (SP) a R$ 3.200
→ Seguro: R$ 18.000
→ Total operacional: ~R$ 33.150

📊 Combustão (ex: Corolla) em 5 anos:
→ Combustível: R$ 30.876 (gasolina)
→ Manutenção: R$ 14.200
→ IPVA: R$ 15.800
→ Seguro: R$ 22.000
→ Total operacional: ~R$ 82.876

💰 Diferença: R$ 49.726 em 5 anos

Isso sem contar a valorização — elétricos usados estão segurando preço melhor que combustão no mercado brasileiro, especialmente BYD e GWM.

O ponto de break-even geralmente acontece entre o 2º e 3º ano. Depois disso, é só economia.

Simule com seus números reais no nosso calculador 👇

🔗 guiapbev.cloud/simulador-tco?utm_source=instagram&utm_medium=post&utm_campaign=tco_insight&utm_content=post_6""",
        "hashtags": "#TCO #CustoTotalPropriedade #CarroEletrico #EconomiaEV #VeiculoEletrico #MobilidadeEletrica #EVvsCombustao #CustoReal #FinancasAutomotivas #ROI #EVBrasil #CarroEletricoBrasil #Eletromobilidade #GuiaPBEV #FuturoEletrico #InvestimentoEV #TransicaoEnergetica #BreakEven",
        "image_prompt": "Gráfico TCO comparativo 5 anos, visual financeiro impactante",
        "image_type": "Feed 1080x1080 — fundo escuro, headline 'R$ 49 MIL DE ECONOMIA', badge 'TCO'"
    },

    # ─────────────────────────────────────────
    # CATEGORIA 5: Notícia do Mercado (1x/semana)
    # ─────────────────────────────────────────
    {
        "category": "noticia_mercado",
        "frequency": "1x por semana",
        "scheduled_at": "Segunda 19:00",
        "caption": """O Brasil emplacou mais carros elétricos em 2025 do que nos 5 anos anteriores somados. E 2026 promete ainda mais. 🇧🇷⚡

Os números são impressionantes: mais de 180 mil veículos eletrificados foram vendidos no Brasil em 2025, um crescimento de 67% sobre 2024. Os elétricos puros (BEV) representaram 42% desse total.

O que está impulsionando:
→ Novos modelos abaixo de R$ 150 mil (BYD Dolphin Mini, Kwid E-Tech)
→ Expansão da rede de recarga — mais de 8.000 pontos públicos
→ Isenção ou redução de IPVA em 12 estados
→ Financiamento com taxas diferenciadas em alguns bancos

Para 2026, pelo menos 15 novos modelos estão confirmados para o mercado brasileiro, incluindo opções da BYD, GWM, Chery, Volvo e Hyundai na faixa entre R$ 120 mil e R$ 300 mil.

O mercado de usados também está esquentando — já existem mais de 3.000 EVs no mercado secundário, com preços a partir de R$ 85 mil.

Acompanhe todos os 86 modelos homologados no Brasil no nosso catálogo atualizado 👇

🔗 guiapbev.cloud?utm_source=instagram&utm_medium=post&utm_campaign=noticia_mercado&utm_content=post_7""",
        "hashtags": "#MercadoEV #CarroEletricoBrasil #VendasEV #Eletromobilidade #VeiculoEletrico #MobilidadeEletrica #EVBrasil #CrescimentoEV #IndustriaAutomotiva #NovosModelos #TransicaoEnergetica #FuturoEletrico #GuiaPBEV #AutomovelEletrico #RecargaPublica #IPVA #EnergiaLimpa #MercadoAutomotivo",
        "image_prompt": "Gráfico de crescimento vendas EV Brasil, visual impactante",
        "image_type": "Feed 1080x1080 — fundo azul, headline 'RECORDE DE VENDAS', badge 'NEWS'"
    },
]


def display_weekly_calendar():
    """Mostra o calendário semanal completo."""
    print("=" * 70)
    print("  GUIA PBEV BRASIL — Calendário Semanal de Posts")
    print("  Pipeline: Gemini API → Pillow → Meta Graph API → Instagram")
    print("=" * 70)

    for i, post in enumerate(DEMO_POSTS, 1):
        print(f"\n{'━' * 70}")
        print(f"  POST {i}/7 — {post['category'].upper().replace('_', ' ')}")
        print(f"  Frequência: {post['frequency']}  |  Horário: {post['scheduled_at']}")
        print(f"  Imagem: {post['image_type']}")
        print(f"{'━' * 70}")
        
        caption = post['caption']
        # Mostra hook (primeira linha)
        hook = caption.split('\n')[0]
        print(f"\n  🪝 HOOK: {hook}")
        
        # Mostra caption completa
        print(f"\n  📝 LEGENDA COMPLETA:")
        for line in caption.split('\n'):
            print(f"  {line}")
        
        # Contagem
        words = len(caption.split())
        chars = len(caption)
        print(f"\n  📊 {words} palavras | {chars} caracteres")
        
        # Hashtags
        tags = post['hashtags'].split()
        print(f"\n  #️⃣  HASHTAGS ({len(tags)}):")
        print(f"  {post['hashtags']}")

        # UTM
        import re
        utm_match = re.search(r'guiapbev\.cloud\S+', caption)
        if utm_match:
            print(f"\n  🔗 UTM LINK: {utm_match.group()}")
        
        print()


def display_summary():
    """Resumo da semana."""
    print("\n" + "=" * 70)
    print("  RESUMO SEMANAL")
    print("=" * 70)
    
    categories = {}
    for post in DEMO_POSTS:
        cat = post['category']
        if cat not in categories:
            categories[cat] = 0
        categories[cat] += 1
    
    print(f"\n  Total de posts: {len(DEMO_POSTS)} por semana")
    print(f"  Frequência:")
    
    cat_names = {
        "modelo_destaque": "Modelo em Destaque",
        "comparativo": "Comparativo VS",
        "dica_ev": "Dica sobre EVs",
        "tco_insight": "Insight de TCO",
        "noticia_mercado": "Notícia do Mercado",
    }
    
    for cat, count in categories.items():
        print(f"    {cat_names.get(cat, cat)}: {count}x/semana")
    
    print(f"\n  Destinos dos CTAs:")
    print(f"    → guiapbev.cloud/simulador-tco  (TCO + comparativos + dicas custo)")
    print(f"    → guiapbev.cloud/comparador     (posts comparativos)")
    print(f"    → guiapbev.cloud                (catálogo + consultor IA)")
    
    print(f"\n  Rastreamento:")
    print(f"    → Cada post tem UTM único")
    print(f"    → Plausible CE captura automaticamente")
    print(f"    → Analytics alimenta o próximo ciclo de geração")
    print(f"\n" + "=" * 70)


if __name__ == "__main__":
    display_weekly_calendar()
    display_summary()
