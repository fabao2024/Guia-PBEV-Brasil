# DENZA no catálogo brasileiro

Revisão de fontes públicas em **10/11/2026**. DENZA é uma marca própria nos filtros, separada da BYD; o vínculo com o mesmo grupo empresarial não implica agrupar seus veículos sob a marca BYD.

## Versões incluídas

| Versão brasileira | Propulsão | Categoria do catálogo | Preço de referência oficial | Autonomia elétrica PBEV |
|---|---|---|---:|---:|
| B5 GL | PHEV, gasolina | SUV | R$ 405.000 | 81 km |
| B5 GS | PHEV, gasolina | SUV | R$ 505.000 | 74 km |
| Z9GT EV | BEV | Luxo (shooting brake) | R$ 670.000 | 476 km |
| D9 EV | BEV | Luxo (minivan de sete lugares) | R$ 750.000 | 421 km |

Z e B3 não foram incluídos: anúncio, exposição, testes ou presença no site não bastam para comprovar oferta de uma versão brasileira com preço e ficha correspondentes.

## Fontes oficiais e divergências

- [Site brasileiro](https://www.denza.com/br), [B5](https://www.denza.com/br/B5.html), [Z9GT](https://www.denza.com/br/denza-z9gt.html) e [D9](https://www.denza.com/br/denza-d9.html).
- Os preços vêm dos dados públicos usados pelos configuradores: [B5 GL/GS](https://www.denza.com/car/denza/br/CX202001.json), [Z9GT EV](https://www.denza.com/car/denza/br/CX201003.json) e [D9 EV](https://www.denza.com/car/denza/br/CX206004.json). Conferidos os nomes das versões e `formattedPrice`, não apenas campos numéricos cuja pontuação varia entre modelos. Não são valores FIPE nem anúncios de usados.
- **B5 GS:** todos os SKUs consultados do configurador brasileiro, ano-modelo 26/27, exibiam **R$ 505.000,00**. [Webmotors](https://www.webmotors.com.br/denza) e a [reportagem de 06/10/2026](https://www.webmotors.com.br/wm1/carros/lancamentos/denza-b5-precos) ainda citam R$ 449.000. Foi priorizada a fonte oficial atual, sem tratar as condições comerciais como equivalentes. Preço indicativo sujeito a confirmação com a marca.
- **D9:** a página do fabricante ainda traz “em breve”, mas seu configurador já oferece a versão EV por R$ 750.000. A [reportagem de 03/11/2026](https://www.vrum.com.br/mercado/2026/11/7532591-denza-b5-segue-liderando-o-mercado-de-suvs-premium.html) registra 15 emplacamentos e entregas aos clientes em outubro, além de 34 Z9GT. Há também [ofertas 0 km de concessionárias](https://www.mobiauto.com.br/comprar/carros/brasil/denza/d9). Esse cruzamento sustenta a inclusão, sem interpretar o texto residual “em breve” como indisponibilidade atual.

### Fichas técnicas brasileiras

- [B5 GL e GS](https://www.denza.com/material/__CN/denza-site/denza-brazil/b5compress/Catalogo_b5.pdf): metadado de modificação do PDF em 30/10/2026.
- [Z9GT EV](https://www.denza.com/material/__CN/denza-site/denza-brazil/z9gt/maintenance/ficha_tecnica_denzaZ9GT.pdf): metadado de modificação em 19/10/2026.
- [D9 EV](https://www.denza.com/material/__CN/denza-site/denza-brazil/d9/maintenance/ficha_tecnica_DenzaD9.pdf): metadado de modificação em 16/10/2026; explicita 421 km **PBEV**, distintos dos 650 km NEDC.

Essas datas são metadados dos arquivos, não datas comprovadas de lançamento ou publicação. Os configuradores e as etiquetas não fornecem data de atualização: no registro de proveniência, `sourceDateKind: observed` identifica a data de observação usada na referência, não uma atualização declarada pelo fabricante. `verifiedAt` é a data da consulta. Nenhuma referência global do catálogo foi atualizada para sugerir uma revisão integral da tabela PBEV.

### Etiquetas e limites dos cálculos

- [B5 GL PBEV](https://www.denza.com/material/denza-site/denza-brazil/DENZA%20B5%20GL%20DM%20PBEV.jpg): 81 km elétricos; gasolina em modo híbrido 8,0 km/L cidade e 8,1 km/L estrada.
- [B5 GS PBEV](https://www.denza.com/material/denza-site/denza-brazil/informa%C3%A7%C3%A3o-veicular/DENZA%20B5%20GS%20DM%20PBEV.png): 74 km elétricos; gasolina em modo híbrido 8,4 km/L cidade e 7,9 km/L estrada.
- [Z9GT PBEV](https://www.denza.com/material/__CN/denza-site/denza-brazil/manuten%C3%A7%C3%A3o/DENZA%20Z9%20GT%201210EV%20PBEV.png): 476 km elétricos, confirmados também na ficha brasileira.
- Para o D9 foi usada a indicação PBEV explícita da ficha oficial; não foi localizada etiqueta individual vinculada na página. Consumo em MJ/km e classificação PBE ausentes não foram inventados.
- As autonomias totais do B5 são **estimativas do Guia**, necessárias ao simulador: GL `round(81 + 83 × 8,0) = 745 km`; GS `round(74 + 83 × 8,4) = 771 km`. Tanque de 83 L da ficha, autonomia elétrica e consumo urbano da etiqueta. Não são autonomias totais homologadas nem a promessa NEDC de outra fonte.
- Potências oficiais convertidas de kW para cv com fator 1,35962 e arredondamento: B5 505 kW → 687 cv; Z9GT 850 kW → 1.156 cv; D9 410 kW → 557 cv. Torque de Nm para kgfm por divisão por 9,80665.
- Altura **máxima** ajustável do solo não foi lançada como vão livre estático sem carga. Não foram presumidos benefícios fiscais ou garantia de bateria a partir da garantia geral.
- Z9GT: a ficha informa AC 11 kW e tempos Flash em laboratório, mas a potência acima de 1.300 kW descreve a **estação**, não o pico do veículo. `chargeDC` permanece ausente. D9: a ficha explicita AC 7 kW e DC 1.196 kW. Tempos Flash dependem da bateria, temperatura e infraestrutura; não são promessa de tempo em qualquer eletroposto.

## Imagens oficiais

Originais mantidos sem recorte, ampliação ou texto adicional. Fotos de detalhe/interior e imagens em que a paisagem domina foram descartadas. O pipeline gera apenas variantes responsivas WebP.

| Arquivo local | Fonte oficial | Conferência |
|---|---|---|
| `denza-b5-gl.jpg` | [Imagem vinculada ao B5 GL no configurador brasileiro](https://www.denza.com/material/denza_b5_mexico/model_page/18_inch/glacier-blue-gl-pc.jpg) | 3840 × 2161, veículo inteiro em 3/4, apresentação de estúdio com rodas de 18”; caminho do CMS menciona México, mas é o asset explicitamente selecionado para GL no configurador brasileiro |
| `denza-b5-gs.jpg` | [Perfil oficial do B5](https://www.denza.com/material/__CN/denza-site/denza-brazil/b5compress/side-profile-pc.jpg) | 2400 × 1200, veículo inteiro de perfil com rodas de 20”; imagem distinta do GL |
| `denza-z9gt-ev.jpg` | [Fotografia oficial Z9GT](https://www.denza.com/material/__CN/denza-site/denza-brazil/z9gt/DENZA-Z9GT-SOYER-24.jpg) | 7008 × 4672, veículo inteiro de perfil, sem pessoas |
| `denza-d9-ev.png` | [Fotografia oficial D9](https://www.denza.com/material/__CN/denza-site/denza-brazil/d9/Denza-d9-rua.png) | 2400 × 1200, veículo inteiro em 3/4 dianteiro, sem pessoas |
