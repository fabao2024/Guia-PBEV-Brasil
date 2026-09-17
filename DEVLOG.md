# Guia PBEV Brasil · Devlog público

Notas técnicas selecionadas do produto público. Este documento não registra infraestrutura privada, dashboards administrativos, parceiros individuais, credenciais, dados pessoais ou runbooks operacionais.

## 17/09/2026 · DC nos PHEV (filtro recarga rápida) + badge só-sigla

| Área | Mudança pública |
|---|---|
| Carga DC | 10 PHEV ganham AC/DC oficiais e voltam ao filtro: PHEV19 (6,6/33), PHEV35 e GT (6,6/48), Tank (6,6/50), Wey (6,6/60), Omoda 7 L/P (6,6/40), Jaecoo 7 E/L/P (40). Filtro DC passa de 6 para 16 PHEV/REEV. Corretamente sem DC: Song Pro/King/Atto 2 (só AC nas fichas), Tiggo 7 (DC sem kW publicado), Outlander (sem DC externa). |
| Fontes | Fichas GWM/Omoda Espanha; GT via espelho dealer, Wey/Jaecoo via imprensa — sem proveniência verificada. |
| Cards | Badge de propulsão agora só a sigla (PHEV/HEV/REEV); descrições completas só no filtro. BEV segue sem badge. |
| Verificação | 396/396 testes, TypeScript limpo, build Vite (140 páginas), scanner de segredos e verificador de proveniência (760/1400, +5) aprovados. |

## 17/09/2026 · Novidades: só lançados há no máximo 3 meses (8 modelos)

| Área | Mudança pública |
|---|---|
| Regra | `NEW_MODELS` reduzido de 47 para 8 (Song Pro GL/GS, Atto 2 GS, MG4 Urban ×3, Ora 5, Sealion 7); tooltip passa a "lançados nos últimos 3 meses" (PT/EN). Saem Atto 8, Song Plus, King, Omoda/Jaecoo, Wey, Haval Flex, Tiggo 7/8, Aion UT, RZ, Dolphin SE, Yuan AWD, EX5, EX30 Ultra, 001/X, EV5, Spark, Captiva, EX5 EM-i, iEV330P, Corolla, Civic, CR-V, Kona, Outlander, C10 e demais linhas correntes. Revisão mensal recoloca/remove por data de lançamento. |
| Verificação | 396/396 testes, TypeScript limpo, build Vite (140 páginas), scanner de segredos e verificador de proveniência (755/1400) aprovados. |

## 17/09/2026 · Lote A híbridos: 10 entradas, 3 marcas novas, 1º REEV

| Área | Mudança pública |
|---|---|
| Catálogo | Corolla Cross Hybrid, Corolla GLi/Altis Hybrid, Civic e CR-V Advanced Hybrid, Kona Hybrid, Tiggo 7/8 Pro PHEV, Outlander HPE-S PHEV e C10 REEV. Catálogo vai a 140 veículos (36 marcas: Toyota, Honda, Mitsubishi novas). Maverick Hybrid fica pendente (foto oficial indisponível). |
| Divergências | Civic (R$ 266.500) e CR-V (R$ 353.500): só tabela de rede, sem proveniência verificada. Tiggo 8 a R$ 249.990 (tabela atual; lançamento era 229.990). Outlander a R$ 324.990 (condição set/2026; tabela 379.990). Outlander 11,6 km/l e Tiggo 7/8 sustain (15,4/14,4) via imprensa — ficha oficial não publica; Tiggo 7 sem DC em kW publicado e Tiggo 8 com 50 kW via lançamento. C10: 111 km e 12,0 km/l PBEV, 950 km WLTP. Kona 593px e C10 720px: oficiais, abaixo do ideal. |
| Simulador | C10 estreia o path REEV (α = 111/950); quiz passa a recomendar HEVs para recarga só pública (teste ajustado). |
| Verificação | 396/396 testes, TypeScript limpo, build Vite (140 páginas), scanner de segredos e verificador de proveniência (755/1400, +27 campos) aprovados. |

## 16/09/2026 · Flex com etanol oficial: ficha dupla e simulador fiel

| Área | Mudança pública |
|---|---|
| Dados | Novo campo `fuelConsumptionKmlEthanol` (cidade, oficial) nos 9 flex: HEV ONE/HEV2 10,2, PHEV19 10,0, PHEV35/GT 9,2, Tank 5,4 (fichas GWM), Song Pro GL/GS 12,1/11,7 e Atto 2 GS 11,8 (PBEV). Etanol oficial bem abaixo da estimativa ÷1,30 (ex. HEV 10,2 vs 12,15). |
| Ficha | Modal, página `/carro/` (tile novo), `ComparisonModal` e `CompareDetailPage` (linha etanol) exibem gasolina + etanol; `cars.json` passa a exportar `fuel_consumption_kml_ethanol` e `combined_range_km`. |
| Simulador | Etanol escolhido usa o oficial do carro; ÷1,30 só no comparador genérico (declarado na metodologia). |
| Verificação | 395/395 testes (invariante flex + motor), TypeScript limpo, build Vite (130 páginas), scanner de segredos e verificador de proveniência (728/1300) aprovados. |

## 16/09/2026 · Combinado PHEV pela premissa do carro (α = elétrica ÷ combinada)

| Área | Mudança pública |
|---|---|
| Regra | Combinado = fração elétrica α × km no kWh/100km oficial + (1−α) no km/L oficial, com α = autonomia elétrica PBEV ÷ combinada do carro. Novo campo `combinedRangeKm` nos 19 PHEV: 14 declarados pela montadora (ex. NEDC) + 5 GWM derivados de tanque oficial + km/L Inmetro (PHEV19 886, PHEV35/GT 814, Tank 599, Wey 981). Sem C, fallback utilização plena. Resolve a igualdade combinado/elétrico em km típica. |
| Método visível | Card exibe `% elétrico · premissa do carro (R de C km)`; metodologia (PT/EN) e bloco do modal com a fórmula e as fontes por camada. |
| Verificação | 393/393 testes (invariante `combinedRangeKm > electricRangeKm` + regra α), TypeScript limpo, build Vite (130 páginas), scanner de segredos e verificador de proveniência (728/1300) aprovados. |

## 16/09/2026 · Simulador refeito para híbridos: split elétrico + combustível (Inmetro)

| Área | Mudança pública |
|---|---|
| Motor | Novo `hybridCost.ts`: PHEV com seletor Combinado/Só-elétrico/Só-combustão; combinado = mín(km/mês, autonomia elétrica × 30) na tarifa mista + restante no km/L oficial; HEV só a combustão; BEV passa a usar MJ/km oficial antes da média da categoria. Comparador combustão inalterado. |
| TCO | Energia anual via split; manutenção PHEV a cada 15.000 km (custo revisão combustão), HEV na tabela combustão; seguro/depreciação/IPVA inalterados. |
| Metodologia | Nova seção Híbridos (PT/EN) com premissa de utilização plena declarada; bloco do modal atualizado. |
| Verificação | 392/392 testes (14 novos do motor + ajuste na MethodologyPage), TypeScript limpo, build Vite (130 páginas), scanner de segredos e verificador de proveniência (728/1300) aprovados. |

## 16/09/2026 · Fotos GWM refeitas: Haval (4) e Wey 07 em alta do site oficial

| Área | Mudança pública |
|---|---|
| Fotos | HEV ONE (3/4 nítida 1448px), HEV2 (3/4 estúdio 1080px — frames 360 descartados por parecer render), PHEV19 (frontal nítida 2400px), PHEV35 (3/4 fotográfica 2880px com placa PHEV35 — frame 360 descartado) e Wey 07 (frontal nítida 2880px, antes 33 kB) — todos do DAM oficial da GWM, carro inteiro, sem pessoas. GT e Tank mantidos. Mesmos nomes de arquivo, sem mudança no catálogo. |
| Verificação | 378/378 testes, TypeScript limpo, build Vite (130 páginas), scanner de segredos e verificador de proveniência (728/1300) aprovados. |

## 15/09/2026 · Omoda 7 e Jaecoo 7 PHEV: 5 entradas, marca Jaecoo nova

| Área | Mudança pública |
|---|---|
| Catálogo | Omoda 7 Luxury (R$ 254.990) e Prestige (R$ 279.990) — 279 cv, 60 km PBEV; Jaecoo 7 Elite (R$ 189.990), Luxury (R$ 234.990) e Prestige (R$ 256.990) — 339 cv / 52 kgfm divulgados pela rede, 79 km PBEV. Marca Jaecoo criada. Catálogo vai a 130 veículos (33 marcas). |
| Divergências | Jaecoo 7: rede oficial e G1 divulgam 339 cv/52 kgfm combinados (soma dos componentes); agregadores repetem 279/37,2 do sistema SHS — prevalece o divulgado pela rede, registrado em teste. Omoda 7 bateria 18,4 kWh só em fontes terceiras: fica sem proveniência verificada. Preço Jaecoo Prestige só na rede de concessionárias: sem proveniência verificada. Carga kW sem fonte oficial: fora das entradas. |
| Fotos | Recortes oficiais do CMS da marca, um por modelo (Omoda 7 e Jaecoo 7): carro inteiro em estúdio, sem paisagem/pessoas — reutilizado nas versões. Arquivos abaixo de 200 kB, sem variantes no pipeline. |
| Verificação | 378/378 testes, TypeScript limpo, build Vite (130 páginas), scanner de segredos e verificador de proveniência (728/1300) aprovados. |

## 15/09/2026 · Wey 07 ganha ficha completa: 517 cv do catálogo oficial

| Área | Mudança pública |
|---|---|
| Ficha | Wey 07 recebe `power` 517, `torque` 83,6, `battery` 42,5, `traction` AWD e dimensões/peso/porta-malas (5156/1980/1805 mm, 3050 mm, 2545 kg, 239 L) do catálogo oficial GWM — antes a entrada não tinha potência. Prevalece sobre terceiros (95,1 kgfm/4,5 s); catálogo e página oficial: 820 Nm, 0–100 em 4,9 s. Carga em kW segue sem fonte oficial e fica fora. |
| Proveniência | `power`, `battery`, `dimensions`, `trunk` e `weight` do `gwm-wey-07` passam a `verified` (catálogo oficial); cobertura vai a 706/1250. |
| Verificação | 377/377 testes (bloco Wey 07 estendido), TypeScript limpo, build Vite (125 páginas), scanner de segredos e verificador de proveniência aprovados. |

## 15/09/2026 · Novidade só no Atto 2 GS; fotos próprias para cada Haval H6

| Área | Mudança pública |
|---|---|
| Novidade | Selo "Novo" mantido só no Atto 2 GS; King GS, Atto 8 e os 7 GWM saem do `NEW_MODELS` (filtro "Novidades" e badge refletem isso, sem mudar preços ou dados). |
| Fotos | Cada Haval H6 não-GT agora tem foto oficial própria da GWM: HEV ONE (branca, placa HEV ONE), HEV2 (mantida — frontal escura com placa HEV2), PHEV19 (branca, placa PHEV19) e PHEV35 (branca, perfil lateral). GT segue com a foto exclusiva. Arquivos abaixo de 200 kB, sem variantes no pipeline. |
| Verificação | 377/377 testes, TypeScript limpo, build Vite (125 páginas), scanner de segredos e verificador de proveniência (701/1250) aprovados. |

## 15/09/2026 · Híbridos GWM: 7 entradas Flex com fotos, HEV sem autonomia e UI híbrida

| Área | Mudança pública |
|---|---|
| Catálogo | Haval H6 HEV ONE (R$ 199.900), HEV2 (R$ 225.000), PHEV19 (R$ 250.000, 77 km), PHEV35 (R$ 290.000, 126 km), GT (R$ 326.000, 126 km), Tank 300 (R$ 342.000, 74 km AWD) e Wey 07 (R$ 429.000, 128 km) — release oficial 09/06/2026 + linhas Flex da tabela PBEV. Catálogo vai a 125 veículos (16 híbridos). |
| HEV | Sem `range` (0 = sem modo elétrico, travado em invariante): passa o filtro de autonomia por definição; cards, ficha, página, comparação e SEO exibem km/l cidade Inmetro em vez de "0 km". |
| UI | Badge de propulsão nos cards; linha de consumo Inmetro na ficha; `og:image` e `cars.json` com fotos locais e WebP. |
| Fotos | Oficinas GWM (H6/GT/Tank/Wey) com pipeline completo e bytes antigos intactos. |
| Verificação | 377/377 testes, TypeScript limpo, build Vite (125 páginas), scanner de segredos e verificador de proveniência (701/1250) aprovados. |

## 15/09/2026 · Híbridos BYD-3: King GS, Atto 2 GS e Atto 8 + tabela PBEV extraída

| Área | Mudança pública |
|---|---|
| Fonte nova | Tabela PBEV 14/08/2026 extraída linha a linha (9 páginas): confirma elétrica e MJ/km de todos os PHEV (Song Pro GL 57/GS 72, King GL 35/GS 78, Shark 68, Atto 2 GL 33/GS 75, Song Plus 63 linha anterior, Premium 87, Atto 8 111) e km/l de HEV/PHEV. **A tabela não publica autonomia combinada** — falecido o campo de combinada: catálogo exibe só a elétrica. |
| Catálogo | King GS (R$ 175.990 varejo, 78 km, 235 cv), Atto 2 GS (R$ 169.990, 75 km PBEV — página citava 110 NEDC, prevalece o regulador) e Atto 8 (R$ 399.990, 111 km, 488 cv AWD, DC 72 kW), com fotos oficiais e pipeline. Catálogo vai a 118 veículos (9 PHEV BYD). |
| Preços | Regra trancada: só varejo "de" em fonte oficial; PcD/taxista/venda direta jamais (Atto 2 GL fica `pending` — R$ 149.990 era só venda direta). |
| Divergências | Song Plus base: tabela traz a linha anterior (63 km); ficha V2 vigente (99 km) prevalece com fonte de fabricante até homologação nova. |
| Verificação | 375/375 testes, TypeScript limpo, build Vite (118 páginas), scanner de segredos e verificador de proveniência (671/1180) aprovados. |

## 15/09/2026 · Híbridos BYD: fotos oficiais com pipeline completo

| Área | Mudança pública |
|---|---|
| Fotos | 6 PHEV BYD com fotos oficiais da montadora (`byd-song-pro-flex.webp` GL/GS, `byd-shark.jpg`, `byd-song-plus.webp`, `byd-song-plus-premium.webp`, `byd-king-gl.webp`), variantes WebP responsivas via `tools/generate-car-images.py` (Pillow 12.3.0 pinado; bytes das variantes antigas intactos) e `og:image` local nas páginas `/carro/`. |
| Verificação | 374/374 testes (inclui integridade do manifest), TypeScript limpo, build Vite (115 páginas), scanner de segredos e proveniência (653/1150) aprovados; smoke serviu WebP 200 e `og:image` local. |

## 15/09/2026 · Híbridos BYD-2: fichas oficiais, +3 modelos e divergências resolvidas

| Área | Mudança pública |
|---|---|
| Fontes | Fichas técnicas oficiais BYD (pasta 13/07/2026: Shark/King/SongPlus/SongPremium V2; SongPro Flex Rev3 de 05/08/2026): bateria, carga AC/DC, potência, torque, dimensões, peso e consumo MJ/km por versão. |
| Catálogo | Song Plus (R$ 249.990, 99 km, 240 cv, 26,6 kWh, AC/DC 6,6/18 kW), Song Plus Premium (R$ 299.800, 87 km, 324 cv AWD, 0,67 MJ/km) e King GL (R$ 147.990, 35 km, 209 cv, 8,3 kWh); Song Pro e Shark completados com ficha (bateria/carga/potência/dimensões). Catálogo vai a 115 veículos. |
| Divergências | Shark: página cita 57 km elétricos, ficha declara 68 km — prevalece a ficha. Song Plus: imprensa citava 18,3 kWh/63 km da linha anterior; ficha V2 vigente traz 26,6 kWh/99 km — prevalece a ficha. |
| Pendências | King GS sem preço oficial publicado (ficha completa mapeada); Atto 2 DM-i e Atto 8 aguardando elétrica PBEV por versão; fotos seguem genéricas até o pipeline de imagens. |
| Verificação | 374/374 testes, TypeScript limpo, build Vite (115 páginas), scanner de segredos e verificador de proveniência (653/1150) aprovados. |

## 15/09/2026 · Híbridos: visíveis por padrão, fotos e `image_url`

| Área | Mudança pública |
|---|---|
| Visibilidade | As 4 propulsões vêm marcadas por padrão e a autonomia mínima padrão cai para 50 km (piso do slider 30 km): os PHEV (57–72 km elétricos) aparecem na lista sem ação do usuário; BEVs inalterados. |
| Fotos | Híbridos passam a usar imagem genérica verificada (a anterior retornava 404); `image_url` do `cars.json` preserva URLs absolutas (corrige `og:image` das páginas `/carro/`). |
| Verificação | 373/373 testes, TypeScript limpo, build Vite, scanner de segredos e proveniência aprovados. |

## 15/09/2026 · Híbridos fase 1A: schema, filtro, consultor e 3 PHEV BYD

| Área | Mudança pública |
|---|---|
| Schema | Novo campo `powertrain` (`BEV`/`PHEV`/`HEV`/`REEV`) com `electricRangeKm`, `fuelConsumptionKml` e `fuelType2` opcionais; catálogo legado assume `BEV`. Para PHEV/REEV, `range` é sempre a autonomia elétrica (nunca a combinada tanque+cheio). |
| Filtro | Filtro de propulsão na Sidebar (default `BEV`, sem mudar ranking/URLs de quem já usa); `cars.json` passa a expor `powertrain`, `electric_range_km`, `fuel_consumption_kml` e `fuel_type_2`. |
| Consultor IA | Quiz offline combina as 5 respostas (km/dia, orçamento, onde carrega, carroceria, prioridade): sem recarga em casa, BEV perde pontos e HEV/PHEV ganham; prompts PT/EN e RAG entendem "híbrido", "plug-in", "sem tomada" e "extensor". |
| Catálogo | Song Pro GL (R$ 179.990, 57 km elétricos PBEV), Song Pro GS (R$ 199.990, 72 km) e Shark (R$ 344.990, 57 km, 437 cv AWD) via páginas oficiais BYD e condições comerciais de 11/09/2026. Bateria kWh e pareamento fino PBEV ficam pendentes de ficha oficial (fail-closed, sem inferência). |
| Pendências | Song Plus, Song Plus Premium, King GL/GS, Atto 2 DM-i e Atto 8 com preços oficiais mapeados, aguardando elétrica PBEV por versão; linha GWM Flex e C10 REEV nos próximos sub-lotes. |
| Verificação | 371/371 testes, TypeScript limpo, build Vite (112 páginas), scanner de segredos e verificador de proveniência (624/1120) aprovados. |

## 07/09/2026 · Mobile: lote 1 de correções de interação e imagens responsivas

| Área | Mudança pública |
|---|---|
| Cabeçalho | Em telas < 768px, parceiros/sugestões/idioma passam a um menu colapsável próprio, sem sobreposição do nome do Guia; controles da faixa de ferramentas reorganizados em grade no mobile. |
| Card do catálogo | Selo "Fora de linha"/"Novidade" sai do fluxo de toque dos botões; botões Comparar/Favoritar com alvo ≥ 44px e nome acessível; link do fabricante com nome acessível no mobile (axe link-name zerado na home em 390px). |
| Comparação | Remoção de veículo visível sem hover (toque), alvo ≥ 44px e aria-label descritivo na barra e no modal; barra de ações cabe em 320px; contador vira texto acessível no mobile em vez de disputar espaço com "Limpar"/"Comparar Agora". |
| Ficha do veículo | Compartilhar usa a URL canônica `https://guiapbev.cloud/carro/<slug>/` via `navigator.share` com fallback de cópia; CTA de wallbox ganha linha própria no mobile; fechar/compartilhar/favoritar com alvo ≥ 44px e nome acessível. |
| Imagens | 30 imagens locais acima de 200 kB geram 105 variantes WebP responsivas (320/640/960/1280) servidas por `srcset` com dimensões fixas; originais preservados. 18,2 MB → 5,6 MB nos arquivos cobertos (-69%); gerador reproduzível em `tools/generate-car-images.py` com manifest versionado e teste de integridade. |
| Testes | Suíte atual: 356 testes em 47 arquivos. Regressões novas cobrem card, cabeçalho, barra de comparação, ficha e comparador em cenários mobile; verificação em navegador (Playwright) aprovada em 320/360/390/430/768/1024/1440px sem cortes, sobreposição ou erros de página. |

## 03/09/2026 · Dimensões e peso: lote 4 final — catálogo coberto

| Área | Mudança pública |
|---|---|
| Cobertura | **106 dos 109 veículos** com dimensões oficiais. Sem dados por ausência de fonte oficial: JAC iEV330P (picape só por vendas diretas, sem ficha), Nissan Ariya (página oficial declara que não é comercializado no Brasil) e Avatr 11 (CAOA Changan não publica ficha técnica). |
| Chinesas independentes | JAC (E-JS1/JS4/J7 com fichas 25/26; E-JV5.5 furgão 5.500 L), Geely EX2/EX5 (fichas oficiais linkadas do site do importador), Kia EV5/EV9 (2.704 kg no EV9), Omoda E5, Neta Aya/X 500 (manuais oficiais; porta-malas do Aya não publicado) e Leapmotor B10/C10 (site oficial; entre-eixos e peso não publicados). |
| Premium | Audi via audi-imprensa (A6 Sportback e-tron 4.928/1.923/1.487 mm; Q6/SQ6 2026; Q8 e-tron descontinuado) e data sheet oficial Audi AG (e-tron GT); Porsche via porsche.com/brazil (Macan 4, Taycan 4S Cross Turismo — única 4S à venda, sedã saiu do line-up, e Cayenne Electric com 781 L); Lexus RZ 500e (solo 200 mm; só publica PBT — peso OM nulo). Larguras Audi Q8/Q6 divulgadas apenas com espelhos → nulas. Pesos "Peso (kg)" da Audi ficaram nulos onde o release chama "peso total" (Q8 — ambiguidade OM/PBT). |
| Mercedes-Benz | EQA/EQB pelas páginas oficiais BR (massa em ordem de marcha 2.045/2.105 kg); EQE 350+ sedã e EQE SUV pelos releases oficiais (a "EQE 300 SUV" citada no catálogo tem dimensões idênticas à EQE 350+ SUV atual); eSprinter Furgão Street 320 Longo (5.932/2.020/2.718 mm, entre-eixos 3.665, 2.725 kg, 10.500 L). Pesos dos EQE são kerb weight oficial de eBrochures Mercedes de outros mercados (incluem motorista 75 kg) — ressalva anotada. |
| Ford, Suzuki e iCar | Mustang Mach-E GT (4.743 mm, 2.307 kg, 402 L — largura só com espelhos), e-Transit furgão L2H2 (5.531 mm, 2.649 kg, 9.500 L), Suzuki e-Vitara 4Style 4x4 (4.275 mm, solo 180 mm, 1.899 kg) e CAOA Chery iCar (3.200 mm, 995 kg, 100 L). |
| Stellantis e comerciais | e-208 GT, e-2008 (ficha MY24/25; largura 1.815 diverge da internacional 1.770 — mantido o oficial mais recente com flag), e-Expert/e-Scudo/e-Jumpy (irmãs de plataforma: 5.309 mm, 2.053 kg, 6.100 L), 500e Icon (185 L), Foton eWonder (mini truck chassi; sem volume) e eView Grand (van 6.800 L), Farizon V6E (6.000 L) e SuperVan SV L1H2 (7.920 L) pelo importador oficial Grupo Timber. Todos os Stellantis citados saíram da linha MY26 — dados das últimas fichas oficiais publicadas. |
| Invariantes | Faixas ampliadas para furgões: altura até 3.000 mm (eSprinter 2.718), entre-eixos até 4.000 mm (eSprinter 3.665) e porta-malas/volume até 12.000 L (eSprinter 10.500). |
| Proveniência | Cobertura verificada sobe para **618/1090** (contagem rigorosa; boa parte das fontes oficiais de lote 3/4 são páginas sem data de edição e contam com URL registrada). |
| Verificação | 303/303 testes, TypeScript limpo, build Vite, rotas estáticas, scanner de segredos e verificador de proveniência aprovados. |

## 03/09/2026 · Dimensões e peso: lote 3 — GAC, Zeekr, BMW e MINI

| Área | Mudança pública |
|---|---|
| GAC | Linha Aion e Hyptec HT pelo configurador oficial GAC Brasil (gacgroup.com/pt-br): Aion UT Premium/Elite (4.270/1.850/1.575/2.750 mm, 340 L), Aion ES (4.810/1.880/1.545 mm, 453 L), Aion Y Elite (4.535/1.870/1.650 mm, 361 L), Aion V Elite (4.605/1.854/1.686/2.775 mm, 427 L) e Hyptec HT (4.935/1.920/1.700/2.935 mm, 2.200 kg, 670 L). Altura do solo não é publicada em nenhuma página oficial GAC Brasil → nula. Rótulo oficial é apenas "Peso (kg)" — presumido ordem de marcha (não é bruto), ressalva anotada. |
| Zeekr | Fichas técnicas oficiais do importador CICAL (cabeçalho zeekr.com.br): Zeekr X (4.432/1.836/1.572/2.750 mm, solo 191 mm, 1.855 kg, 362 L), 7X (4.787/1.930/1.650/2.900 mm, solo 172 mm, 2.460 kg, 616 L) e 001 (4.955/1.999/1.560/2.999 mm, solo 174 mm, 2.353 kg, 539 L). Pesos "vazio" por versão; a nova versão Premium RWD do 7X (2026) ainda sem ficha oficial — mantido o valor da ficha vigente (Flagship AWD). |
| BMW | Linha i completa via fichas técnicas oficiais do newsroom BMW Group (press.bmwgroup.com): iX2 xDrive30 (4.554/1.845/1.560/2.692 mm, solo 167 mm, 2.095 kg, 525 L), iX1 eDrive20 (4.500 mm, 1.940 kg, 490 L), iX3 Neue Classe (4.782/1.895/1.635/2.897 mm, solo 176 mm, 2.360 kg, 520 L), i4 eDrive35 (4.783 mm, solo 125 mm, 2.075 kg, 470 L), iX xDrive40 (4.953/1.967/1.695/3.000 mm, 2.440 kg, 500 L), i5 M60 (5.060 mm, altura 1.505 da versão M60, solo 136 mm, 2.380 kg) e i7 xDrive60 (5.391/1.950/1.544/3.215 mm, solo 136 mm, 2.715 kg, 500 L). iX1 e iX não têm altura do solo publicada pela BMW → nula. Peso é o kerb weight EU oficial (inclui motorista 75 kg), especificação idêntica à versão BR. |
| MINI | Cooper E e JCW E (3.858/1.756/1.460/2.526 mm, solo 124 mm, 1.615/1.730 kg, 210 L), Aceman SE (4.079 mm, solo 143 mm, 1.785 kg, 300 L) e Countryman SE ALL4 (4.445/1.843/1.635/2.692 mm, solo 171 mm, 2.075 kg, 460 L) — fichas oficiais do newsroom BMW Group; Countryman SE confirmado 100% elétrico no Brasil (não é o PHEV da geração anterior). |
| Proveniência | Cobertura verificada sobe para **587/1090**. |
| Verificação | 303/303 testes, TypeScript limpo, build Vite, rotas estáticas, scanner de segredos e verificador de proveniência aprovados. |

## 03/09/2026 · Dimensões e peso: lote 2 — MG Motor, Volvo e Volkswagen

| Área | Mudança pública |
|---|---|
| MG Motor | Linha completa com fichas oficiais do domínio MG (mapeamento de versões validado célula a célula nos PDFs): MG4 Urban Comfort/Luxury 43 kWh (4.395/1.842/1.549/2.750 mm, solo 117 mm, 1.422 kg, 577 L volume total), MG4 Urban Luxury 54 kWh (1.504 kg, 568 L), MG4 Comfort/Luxury/XPower 64 kWh (4.287/1.836/1.516/2.705 mm, 1.755/1.765/1.810 kg, 350 L), MGS5 Comfort/Luxury (4.476/1.849/1.633/2.734 mm, solo 145 mm, 1.705/1.755 kg, 453 L) e Cyberster (4.535/1.913/1.329/2.690 mm, solo 115,5 mm, 1.985 kg, 249 L). MG4 64 kWh publica apenas altura do solo com carga → nula. |
| Volvo | EX30 Plus/Ultra, EX40, EC40 e EX90 Twin com dimensões das páginas oficiais de especificações Volvo BR; pesos por conjunto propulsor (Single/Twin conforme a versão vendida no Brasil); portas-malas da 2ª/3ª fileira em pé (318/410/404/324 L); alturas do solo dos artigos oficiais do Volvo Support (medidas "com peso de meio-fio + 1 pessoa", ressalva anotada). |
| Volkswagen | ID.4 pelo Suplemento de dados técnicos oficial BR (4.584/1.852/1.618/2.765 mm, solo 171 mm, 2.142 kg OM); porta-malas 543 L confirmado em fichas oficiais VW de outros mercados e assessoria BR — proveniência do campo fica como não verificada até URL citável do newsroom. ID.Buzz Pro pelo newsroom oficial VW AG (4.712/1.985/1.937/2.989 mm, 2.471 kg, 1.121 L passageiros); altura do solo não divulgada → nula. |
| Invariantes | Valores de dimensões agora aceitam até 1 casa decimal (fichas oficiais trazem 115,5 mm — Cyberster). |
| Nomenclatura | Entrada Suzuki e-Vitara normalizada para o formato padrão do catálogo (aspas/uma linha) — sem mudança de dados. |
| Proveniência | Cobertura verificada sobe para **572/1090**; páginas de especificações sem data de edição (Volvo) e campos com fonte oficial sem data (MG4 64 kWh usa Last-Modified HTTP) contam como não verificadas pelo critério rigoroso, com sourceUrl registrado. |
| Verificação | 303/303 testes, TypeScript limpo, build Vite, rotas estáticas, scanner de segredos e verificador de proveniência aprovados. |

## 02/09/2026 · Dimensões e peso: lotes Chevrolet, GWM, Renault e Hyundai

| Área | Mudança pública |
|---|---|
| Chevrolet | Spark EUV (4.003/1.760/1.726/2.560 mm, 355 L), Captiva EV (entre-eixos 2.800 mm, 1.800 kg OM, 403 L), Equinox EV (4.840/1.954 mm, 441 L) e Blazer EV RS (4.884/1.982/1.650/3.094 mm, 2.421 kg OM, 436 L), via newsroom GM Brasil e ficha completa do site. GM não publica altura do solo de nenhum elétrico; Captiva não publica L/C/A; pesos de Spark ("peso total") e Equinox (sem rótulo) ficaram nulos por ambiguidade de métrica. Blazer: altura com rack de teto conforme release oficial. |
| GWM | Ora 03 Skin BEV48 (1.540 kg), Skin BEV58 (1.670 kg), GT BEV63 (4.254/1.848 mm, 1.580 kg) e Ora 5 (4.471/1.833/1.641/2.720 mm, solo 175 mm, 1.685 kg, 362 L), das fichas técnicas oficiais em PDF no domínio GWM. |
| Renault | Kwid E-Tech (3.701/1.534/2.423 mm, solo 172 mm, 969 kg, 290 L — release oficial da linha 2026); Megane E-Tech (4.200/1.768/1.505/2.685 mm, 1.680 kg, 440 L — manual do proprietário e catálogo BR); Kangoo E-Tech (chassi longo 4.910/3.100 mm, altura vazia 1.830 mm, volume de carga 4.300 L). Largura sem espelhos do Kwid e do Kangoo não é publicada — nula. Peso do Kangoo aguarda ficha oficial com URL citável. |
| Hyundai | Kona EV (4.180/1.800/1.570/2.600 mm, 1.535 kg, 332 L — documento técnico oficial da sala de imprensa Hyundai para a mesma geração/motorização vendida no BR; site BR não publica mais o modelo) e Ioniq 5 (4.655/1.890/1.605/3.000 mm, 520 L — catálogo digital oficial; divergência de altura 1.605 catálogo vs. 1.625 manual documentada; peso OM não publicado — nulo). |
| Invariantes | Faixa de porta-malas ampliada para até 8.000 L para acomodar volume de carga de furgões (Kangoo 4.300 L). |
| Proveniência | Cobertura verificada subiu de 519/1090 para **540/1090** (fonte oficial direta por grupo de campo). |
| Interface | Botão flutuante do Consultor IA recebeu `aria-label` (era só-ícone sem nome acessível). |
| Verificação | 303/303 testes, TypeScript limpo, build Vite, rotas estáticas, scanner de segredos e verificador de proveniência aprovados. |

## 02/09/2026 · Dimensões e peso: schema, ficha técnica e lote BYD

| Área | Mudança pública |
|---|---|
| Schema | Novos campos opcionais por veículo: comprimento, largura (sem espelhos), altura, entre-eixos, altura do solo (desalicerada) em mm, peso em ordem de marcha em kg e porta-malas VDA em litros. |
| Interface | Seção "Dimensões" na ficha técnica (modal e página `/carro/<slug>`), linhas condicionais na comparação (modal e `/comparar/`), JSON-LD `additionalProperty` e campos em `cars.json`. Convenções documentadas em `/metodologia`. |
| Validação | Invariants no `constants.test.ts`: faixas físicas plausíveis, entre-eixos < comprimento, altura do solo < altura. |
| Lote BYD | 12 de 13 modelos BYD com dimensões oficiais das fichas técnicas BR (`byd.com/material`, pasta de 13/07/2026): Dolphin Mini GS/GL, Dolphin GS/Plus/Special Edition, Yuan Pro, Yuan Plus, Yuan Plus AWD, Sealion 7, Seal AWD, Tan EV e Han EV. eT3 sem ficha oficial pública com dimensões — permanece sem dados. |
| Pendências documentadas | Yuan Plus (RWD): ficha oficial sem data declarada — proveniência marcada como não verificada até ficha datada. Seal AWD: ficha declara "Edição Fevereiro/2026" (dia não especificado). Tan EV: ficha BR traz apenas "distância do solo carregado", que viola a convenção desalicerada — campo ficou nulo. Larguras de fichas V2 em metros (±10 mm) prevalecem sobre fichas anteriores em mm quando conflito. |
| Proveniência | Verificador passa a rastrear os grupos `dimensions`, `trunk` e `weight` por veículo (1090 células); cobertura verificada **519/1090** com fonte oficial direta (+33 do lote BYD). |
| Verificação | 303/303 testes, TypeScript limpo, build Vite, rotas estáticas, scanner de segredos e verificador de proveniência aprovados. |

## 26/08/2026 · Lote B de comerciais leves e Leapmotor no Bloco 5

| Área | Mudança pública |
|---|---|
| Comerciais leves | e-Jumpy alinhada à versão Cargo vigente (258 km); Farizon V6E corrigida para bateria de 41,86 kWh e recarga 6,6/41 kW; SuperVan com 82,33 kWh; e-Scudo marcada como descontinuada. |
| Foton | Catálogo passa a representar a eView Grand 77 atualmente vendida: R$ 329.900, 187 km, 1,00 MJ/km e recarga 6,6/77 kW. eWonder corrigida para recarga 6,6/41,8 kW. |
| Leapmotor | C10 BEV alinhado à recarga DC oficial de 84 kW; preços, potências, baterias e autonomias de B10/C10 foram fixados em testes de regressão. |
| Proveniência | Verificador registra **486/763** campos com fonte oficial direta; o lote acrescentou 29 verificações por campo e documentou os pareamentos de versões comerciais. |
| Verificação | TDD RED→GREEN, suíte Vitest, TypeScript, build Vite, rotas estáticas, scanner de segredos e verificador de proveniência aprovados. |

## 26/08/2026 · Lote A de carros de passeio no Bloco 5

| Área | Mudança pública |
|---|---|
| Especificações | ID.Buzz com autonomia oficial de 337 km INMETRO (era 341); e-Transit com potência correta de 269 cv (o catálogo havia lido 198 kW como cv) e carregamento AC 11,5 kW; Omoda E5 com bateria de 61,1 kWh; Avatr 11 com os 578 cv da página oficial. |
| Disponibilidade | Chery iCar EQ marcado como descontinuado (fora do site oficial da CAOA desde mar/2026); Mustang Mach-E com todos os valores confirmados pela ficha técnica oficial Ford. |
| Transparência | VW ID.4 permanece com dados legados: a montadora anunciou a chegada ao varejo em nova configuração, ainda sem specs ou preço publicados. |
| Proveniência | Cobertura verificada subiu de 435/763 para **456/763** campos com fonte oficial direta por campo (+21), incluindo preços de tabela Omoda/Suzuki/Avatr e disponibilidade de sete veículos. |
| Verificação | TDD RED→GREEN, 291/291 testes, TypeScript limpo, build Vite, rotas estáticas, scanner de segredos e verificador de proveniência aprovados. |

## 26/08/2026 · Lote GWM, Porsche, Zeekr e Neta no Bloco 5

| Área | Mudança pública |
|---|---|
| Especificações Porsche | Cayenne Electric alinhado ao oficial: 442 cv Overboost, bateria bruta de 113 kWh e recarga DC de até 390 kW; Macan identificado como o Macan 4 da tabela PBEV (443 km / 0,60 MJ/km), encerrando a pendência de variantes. |
| Preços | GWM Ora 5 R$ 163.990 (preço atual); Macan R$ 690.000 (Macan 4; o anterior era preço de lançamento da versão RWD descontinuada) e Taycan 4S R$ 1.080.000 (MY27), com snapshots no histórico. |
| Nomenclatura | Correspondências registradas sem renomear entradas para preservar URLs: "Macan EV" = Macan 4 AWD; "Taycan 4S" vendido hoje como Cross Turismo. |
| Especificações Neta | Neta X 500 passa a exibir a bateria correta de 64,1 kWh LFP CATL (os 52,5 kWh pertencem à versão X 400). |
| Proveniência | Cobertura verificada subiu de 400/763 para **435/763** campos com fonte oficial direta por campo (+35), incluindo potências, baterias e autonomias Zeekr/GWM confirmadas nos domínios oficiais das marcas. |
| Verificação | TDD RED→GREEN, 289/289 testes, TypeScript limpo, build Vite, rotas estáticas, scanner de segredos e verificador de proveniência aprovados. |

## 25/08/2026 · Lotes MG Motor e Mini no Bloco 5

| Área | Mudança pública |
|---|---|
| Especificações MG | Fichas técnicas oficiais auditadas: baterias nominais do MG4 Urban corrigidas para 42,8/53,9 kWh; carregamentos alinhados (AC 11 kW na linha MG4, MGS5 AC 7/DC 150 kW, Cyberster AC 11/DC 150 kW, MG4 Comfort DC 140 kW); MGS5 com potência oficial de 205 cv. |
| Preços MG | Tabela MY 26/27 aplicada: MG4 Comfort R$ 184.600, MG4 Luxury R$ 199.800, MGS5 Comfort R$ 218.800 e MGS5 Luxury R$ 238.800, com snapshots no histórico (promoções não tratadas como preço de tabela). |
| Especificações Mini | Pareamento PBEV das linhas Mini fechado com as páginas oficiais: Cooper E passa a exibir 239 km/0,46 MJ/km e JCW E 0,48 MJ/km conforme o Inmetro; Countryman SE passa a exibir a bateria bruta de 66,45 kWh do release oficial. |
| Preços Mini | Lista oficial de agosto/2026 aplicada: Cooper E R$ 264.990, JCW E R$ 349.990, Aceman SE R$ 325.990 e Countryman SE R$ 409.990, com snapshots no histórico. |
| Proveniência | Cobertura verificada subiu de 339/763 para **400/763** campos com fonte oficial direta por campo (+42 MG, +19 Mini), incluindo disponibilidade de todos os veículos das duas marcas. |
| Verificação | TDD RED→GREEN em cada lote, 287/287 testes, TypeScript limpo, build Vite, rotas estáticas, scanner de segredos e verificador de proveniência aprovados. |

## 25/08/2026 · Fichas técnicas oficiais BYD no Bloco 5

| Área | Mudança pública |
|---|---|
| Especificações BYD | Baterias corrigidas conforme as fichas técnicas oficiais (09/07/2026): 38,88 kWh (Dolphin Mini GS), 60,48 kWh (Dolphin Plus), 82,56 kWh (Seal AWD) e 45,12 kWh (Yuan Pro). Carregamentos alinhados: Dolphin GS AC 6,6 kW; Han EV AC 6,6 kW; Seal AWD AC 6,6 kW; Tan EV DC 170 kW; Yuan Pro 6,6/65 kW; Dolphin Mini GS DC 40 kW. |
| Proveniência | Cobertura verificada subiu de 307/763 para **339/763** campos com fonte oficial direta por campo, incluindo as fichas técnicas BYD e a disponibilidade do Dolphin Plus. Consumo MJ/km das fichas confere com a tabela PBEV em 10 modelos. |
| Verificação | TDD RED→GREEN, 283/283 testes, TypeScript limpo, build Vite, rotas estáticas, scanner de segredos e verificador de proveniência aprovados. |

## 25/08/2026 · Decisões pendentes do Bloco 5

| Área | Mudança pública |
|---|---|
| Preços | BYD Dolphin Mini GL alinhado ao documento oficial de condições comerciais de agosto/2026 (R$ 109.990); GS confirmado em R$ 119.990 pela mesma fonte oficial; Hyundai Ioniq 5 Signature realinhado a R$ 409.990 com snapshot no histórico. |
| Especificações | Ioniq 5 passa a exibir a bateria de 84 kWh publicada pelo site/catálogo oficial Hyundai; Yuan Plus AWD com autonomia PBEV/Inmetro de 378 km conforme a página oficial do modelo. |
| Nomenclatura | Entrada do catálogo renomeada para Mercedes-Benz EQB 250+, idêntica à versão atual da montadora (URL do veículo preservada). |
| Disponibilidade | BYD eT3 marcado como descontinuado (fora do menu oficial; FIPE lista apenas o ano 2022). |
| Proveniência | Cobertura verificada subiu de 171/763 para **307/763** campos com fonte oficial direta por campo, incluindo os lotes de todas as marcas restantes e a auditoria ponta a ponta da tabela PBEV. |
| Verificação | TDD RED→GREEN em cada lote, 273/273 testes, TypeScript, build Vite, rotas estáticas, scanner de segredos e verificador de proveniência aprovados. |

## 25/08/2026 · Blocos 4 e 5 da revisão do catálogo

| Área | Mudança pública |
|---|---|
| Preço oficial | BMW i7 xDrive60 alinhado à tabela da montadora (R$ 1.373.950), com teste de regressão e snapshot no histórico de preços. |
| Correções aprovadas | 15 valores em 12 veículos após evidência oficial e aprovação explícita: linha Volvo (EX30 Plus/Ultra, EX40, EC40, EX90 com potência e torque da versão vendida), Blazer EV RS, EQA 250 (autonomia Inmetro), EQE 350 (potência e carregamento CA) e BYD Seal, Yuan Pro e Dolphin Plus. |
| Descontinuações | BMW i4 eDrive35 (linha oficial reduzida a eDrive40/M50) e Mercedes-Benz EQE 300 SUV (substituído pelo 350+) marcados como fora de linha. |
| Proveniência | Registro ampliado de 3 para 7 campos por veículo (preço, autonomia, consumo, potência, bateria, carregamento, disponibilidade); cobertura verificada subiu de 5/763 para 62/763 com fonte oficial por campo, sem transformar ausência de fonte em estimativa. |
| Documentação | Matriz de proveniência por campo e relatórios de lote (Volvo, marcas e itens 1–4) publicados em `.github/data/`; handoff atualizado com o estado real dos blocos. |
| Verificação | TDD RED→GREEN em cada lote, 262/265 testes (3 falhas pré-existentes conhecidas em testes de workflow), TypeScript, build Vite, rotas estáticas, scanner de segredos, CI/deploy e checagens ao vivo aprovadas. |


## 25/08/2026 · Handoff da revisão do catálogo

- Documentada a sequência de blocos da revisão do catálogo em [`docs/CATALOG_REVIEW_HANDOFF.md`](./docs/CATALOG_REVIEW_HANDOFF.md), com commits, estado, relatório de preços e instruções de retomada independentes do modelo de LLM.
- Blocos 1, 2 e 3 permanecem concluídos e publicados.
- Bloco 4 tem pesquisa concluída, mas nenhuma alteração de preço foi aplicada; o relatório registra uma divergência confirmada no BMW i7 e três casos ambíguos.
- Blocos 5 e 6 permanecem na fila.
- A documentação não autoriza alteração, commit, push ou deploy; qualquer mudança futura deve seguir TDD, regenerar artefatos e passar pelas validações do repositório.


## 15/08/2026 · Piloto único de um lead gratuito

| Área | Mudança pública |
|---|---|
| Landing | Todos os acessos a `/parceiros/`, independentemente de campanha ou UTM, exibem o mesmo limite de 1 lead qualificado e aceito, sem custo, por parceiro. |
| Candidatura | O formulário envia `termsVersion=2026-08-14-pilot-one-lead-v2` e `freePilotLeadLimit=1`, sem fallback para contrato de dois leads. |
| Continuidade | O primeiro lead qualificado e aceito não tem custo; qualquer lead adicional depende de nova proposta, contrato e aceite formal. Não há promessa de aprovação, volume ou conversão. |
| Histórico | Aceites e comunicações anteriores não são reescritos. |
| Verificação | TDD RED→GREEN, 209/209 testes, build Vite, rota estática e scanner de segredos aprovados. |

## 14/08/2026 · Qualificação q2 e proposta de valor para parceiros

| Área | Mudança pública |
|---|---|
| Parceiros | A landing passa a explicar o contexto entregue antes do contato: serviço, região, perfil, imóvel, prazo, preferência de contato, consentimento e revisão humana. |
| Candidatura | O CTA destaca o piloto gratuito sem prometer aprovação, volume, exclusividade ou conversão. |
| Consumidor | O questionário q2 adiciona preferência obrigatória para o primeiro contato, sem duplicar a pergunta de prazo, e informa com transparência o resumo compartilhado com o parceiro selecionado. |
| Compatibilidade | A versão do questionário acompanha o lead; formulários legados permanecem compatíveis com a API durante o rollout. |
| Privacidade | A política pública explicita preferência de contato e versão do questionário entre os dados tratados. |
| Verificação | TDD RED→GREEN, 209/209 testes, build Vite, rota estática e scanner de segredos aprovados. |

## 14/08/2026 · Solicitações de limpeza de placas solares

| Área | Mudança pública |
|---|---|
| Formulário | “Limpeza de placas solares” passa a ser uma opção de serviço, com qualificação obrigatória pela quantidade aproximada de placas. |
| Cobertura | O formulário reúne 21 cidades de SP cobertas pelos parceiros homologados para wallbox, energia solar e limpeza solar. |
| Entrada | Banner, simulador, consultor e deep links `/interesse` direcionam a nova modalidade sem convertê-la em energia solar genérica. |
| Privacidade | Consentimento explícito, revisão humana e compartilhamento somente com parceiro selecionado permanecem obrigatórios; a política pública foi atualizada. |
| Verificação | 209/209 testes, build Vite com rota estática e scanner de segredos aprovados. |

## 14/08/2026 · Limpeza de sistema solar no programa de parceiros

| Área | Mudança pública |
|---|---|
| Categoria | A landing e a candidatura passam a incluir “Limpeza de sistema de placa solar” entre as modalidades disponíveis para cadastro em SP; o encaminhamento depende de cobertura operacional. |
| Transparência | O valor previsto após o piloto é R$ 35 por lead qualificado e aceito, sempre sujeito à formalização de continuidade já descrita na landing. |
| Consentimento | Novas candidaturas usam termos versionados em 14/08/2026; versões anteriores permanecem preservadas. |
| SEO | Metadata estática e dinâmica e roadmap público foram alinhados à nova modalidade. |
| Verificação | 206/206 testes, build Vite, rota estática, scanner de segredos e inspeção visual local aprovados. |

## 13/08/2026 · Validação visível no formulário de interesse

| Área | Mudança pública |
|---|---|
| Experiência | Pendências obrigatórias agora exibem aviso explícito ao lado do botão de envio, inclusive no navegador interno do WhatsApp. |
| Mensuração | Início, validação local, tentativa, sucesso e erro geram pageviews virtuais agregadas, sem valores de campos ou dados pessoais. |
| Verificação | 206/206 testes, build Vite e scanner do artifact aprovados. |

## 02/08/2026 · Funil de parceiros e landing orientada à conversão

| Área | Mudança pública |
|---|---|
| Proposta | Headline e prova de produto passam a explicar o valor para fornecedores antes dos detalhes comerciais. |
| Formulário | Candidatura aparece antes dos preços e oferece apenas as modalidades ativas de wallbox e energia solar. |
| Transparência | Termos completos permanecem acessíveis no formulário; preços futuros continuam visíveis depois da candidatura. |
| Mensuração | Etapas de CTA, início, validação, tentativa, sucesso e erro mantêm eventos próprios e também geram pageviews virtuais agregadas, sem dados pessoais. |
| SEO | Metadata estática e dinâmica da rota de parceiros permanecem alinhadas às modalidades ativas. |
| Verificação | 201/201 testes, build Vite, rotas estáticas, scanner do artifact, E2E local com POST isolado e smoke de produção aprovados. |

## 01/08/2026 · Manutenção mensal de dados auditável

| Área | Mudança pública |
|---|---|
| Fontes oficiais | Coletores de combustíveis, eletricidade e PBEV usam fontes públicas atuais, retry com timeout e emitem evidências estruturadas. |
| Segurança operacional | Falha, ausência de resultado ou cobertura crítica parcial bloqueiam conclusão automática em vez de simular ausência de mudanças. |
| Catálogo | Proveniência por veículo e por campo crítico foi versionada; dados legados sem evidência permanecem explicitamente não verificados. |
| Descoberta | Notícias geram watchlist, não mutações automáticas; híbridos, infraestrutura e falsos positivos de substring são filtrados. |
| Auditoria | Uma issue mensal idempotente agrega status, cobertura, PRs, fontes, ações e critérios; PRs existentes são reutilizados por título exato. |
| Verificação | 193/193 testes, build Vite, rotas estáticas e scanner do artifact aprovados. |

## 31/07/2026 · Oferta versionada de um lead válido

| Área | Mudança pública |
|---|---|
| Landing | Convites da campanha versionada exibem 1 lead válido e aceito sem custo; acesso padrão permanece em até 2. |
| Consentimento | A oferta envia `termsVersion=2026-07-31-pilot-one-lead-v1` e `freePilotLeadLimit=1`; o contrato padrão envia `pilot-v2` e limite `2`. |
| Consistência | Título, métricas, explicação comercial, checkbox e payload usam o mesmo limite resolvido pela campanha atual. |
| Histórico | Termos e candidaturas anteriores não são reescritos. |

## 30/07/2026 · Piloto ajustado para dois leads gratuitos

| Área | Mudança pública |
|---|---|
| Landing | `/parceiros/` passa a limitar o piloto a até 2 leads qualificados aceitos por parceiro, sem cobrança durante o piloto. |
| Consentimento | Novas candidaturas enviam `termsVersion=2026-07-30-pilot-v2`, vinculando o aceite ao texto atualizado. |
| Continuidade | Os valores futuros permanecem Wallbox PF R$ 100, Wallbox PJ R$ 150 e energia solar PF/PJ R$ 250 por lead aceito, sempre após nova formalização. |
| Histórico | O registro abaixo documenta corretamente o contrato público anterior de 3 leads e não foi reescrito. |
| Verificação | 170/170 testes, build Vite, rotas estáticas e scanner do artifact aprovados. |

## 29/07/2026 · Programa de parceiros com piloto e preços futuros transparentes

| Área | Mudança pública |
|---|---|
| Landing | `/parceiros/` explica o piloto de até 3 leads aceitos sem cobrança e apresenta os valores previstos para continuidade. |
| Transparência | Wallbox PF R$ 100, Wallbox PJ R$ 150 e energia solar PF/PJ R$ 250 por lead aceito após o piloto. |
| Limite | Nenhum lead adicional é encaminhado antes de nova proposta, contrato, estrutura jurídica e fiscal adequadas, forma de pagamento e aceite formal. |
| Consentimento | A candidatura envia `termsVersion=2026-07-29-pilot-v1`, permitindo auditoria do texto aceito. |
| Privacidade | O frontend público envia apenas dados informados no formulário; operação administrativa e dados persistidos ficam fora deste repositório. |
| Engenharia | Contrato TypeScript explícito, testes de conteúdo/payload e build estático com scanner de segredos. |
| Verificação | 170/170 testes, build Vite e scanner do artifact aprovados. |

### Fronteira do repositório público

- removidos scripts de sincronização de máquinas e documentação de paths locais;
- `ROADMAP.md`, `DEVLOG.md`, `DEPLOY.md` e `CLAUDE.md` agora contêm apenas contexto adequado ao público;
- dashboards, dados, regras operacionais e runbooks detalhados permanecem em serviço/repositório privado;
- o contrato HTTP necessário ao frontend continua público e testável.

## 29/07/2026 · Rotas estáticas e atribuição

- URL canônica de parceiros normalizada para `/parceiros/`.
- Rotas estáticas geradas no build para compatibilidade com GitHub Pages.
- Parâmetros UTM preservados sem criar URLs inválidas.
- Metadados SEO e Open Graph próprios para a página de parceiros.

## Julho de 2026 · Captura consentida de interesse

- Fluxo separado para consumidores interessados em wallbox ou energia solar.
- Consentimento explícito antes da submissão.
- Eventos analíticos sem dados pessoais.
- Feature flag de build para rollout controlado.

## Agosto de 2026 · Proposta de experiências reais de uso

- Definida a feature pública para receber relatos de proprietários com foto do painel e contexto da medição.
- A especificação separa dado homologado, resultado do simulador, consumo observado no painel e medição independente.
- O escopo prevê aviso claro, consentimento explícito para eventual uso editorial, opção de publicação anônima, análise prévia independente, limites de upload e remoção de metadados quando suportado pela infraestrutura.
- O envio não garante publicação ou seleção: a plataforma decide de forma independente quais casos podem ser usados.
- A feature não publica automaticamente, não transforma um caso individual em média ou promessa e não inclui dados pessoais no frontend ou no build.
- Evolução futura mapeada: com base robusta de relatos revisados, criar uma biblioteca pública agregada, com seção própria e possíveis resumos contextuais nas fichas dos veículos.
- Especificação: `docs/REAL_USE_EXPERIENCES.md`.
- Implementação do formulário, fluxo técnico de recebimento e superfície pública ainda não iniciada.

## 2026 · Segurança do frontend e supply chain

- Content Security Policy no documento estático.
- Sanitização de entradas e detecção de padrões de prompt injection.
- GitHub Actions com permissões mínimas e dependências pinadas.
- Scanner bloqueia `.env`, private keys e credenciais conhecidas no artifact `dist/`.
- Source maps não são publicados no artifact de produção.

## 2026 · Catálogo, TCO e planejamento de rota

- Catálogo BEV com dados PBE/INMETRO e filtros avançados.
- Comparações compartilháveis por URL.
- Simuladores de economia, IPVA e TCO com premissas editáveis.
- Planejamento de rota com estimativa energética e fontes públicas de eletropostos.
- PWA responsiva, bilíngue e instalável.

## Política deste devlog

Pode entrar:

- arquitetura frontend;
- decisões de UX;
- contratos públicos;
- métricas de teste e build;
- segurança do artifact;
- fontes públicas e metodologia.

Não pode entrar:

- URLs administrativas;
- nomes e condições individuais de parceiros;
- IPs, paths pessoais ou detalhes de VPS;
- cron jobs, tokens, credenciais ou nomes de secrets;
- dados pessoais;
- lógica operacional que pertença ao serviço privado.
