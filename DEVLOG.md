# Guia PBEV Brasil · Devlog público

Notas técnicas selecionadas do produto público. Este documento não registra infraestrutura privada, dashboards administrativos, parceiros individuais, credenciais, dados pessoais ou runbooks operacionais.

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
