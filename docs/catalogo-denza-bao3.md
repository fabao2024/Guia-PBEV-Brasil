# DENZA BAO 3 — pré-lançamento brasileiro

Consulta em **25/11/2026**. Marca **DENZA**, separada da BYD. O nome brasileiro adotado é **BAO 3**, não “B3”, Tai 3 ou uma versão AWD global.

## Estado comercial e preço

- Apresentação em 24/11/2026; **pré-venda prevista para 01/12/2026**, segundo a reportagem do [g1 de 25/11](https://g1.globo.com/carros/noticia/2026/11/25/denza-bao-3-conheca-o-suv-eletrico-de-mais-de-r-400-mil-que-promete-recarga-em-9-minutos.ghtml). As primeiras entregas são previstas para janeiro de 2027, não garantidas.
- **Preço não divulgado**. As estimativas de imprensa divergem; nenhuma foi adotada. O campo é `null`, nunca zero, “a partir de R$ 0”, R$ 350 mil ou R$ 400 mil inventados.
- Não há promoção automática para “em estoque” ou “disponível” na virada da data. A abertura da pré-venda, o preço e a ficha devem ser conferidos novamente em fonte oficial.

## Fontes e especificações

- [Página brasileira oficial](https://www.denza.com/br/denza-bao3.html): metadados confirmam SUV elétrico de **354 cv**, bateria Blade 2.0 e compatibilidade Flash Charging. Os módulos confirmam DiLINK de 15,6”, CarPlay/Android Auto e **amortecimento inteligente DiSus-C**. Não se afirma suspensão pneumática com base em reportagens.
- Configuração brasileira reportada pelo g1: **RWD**, 270 Nm (aproximadamente **27,5 kgfm**), **86,3 kWh** e **427 km atribuídos ao PBEV**. A ficha explicita que capacidade e autonomia vêm da imprensa, e a etiqueta/ficha primária continuam pendentes; não se declara verificação independente da homologação.
- Os **510 cv, AWD e 75,6 kWh** das reportagens preliminares referem-se a outra configuração. Não foram usados.
- Não inferir a potência máxima aceita pelo veículo a partir da potência de uma estação Flash. AC/DC em kW e tempos de carga não entram como especificação confirmada. A compatibilidade DC fica em campo booleano próprio.
- Dimensões, bagagem, massa, consumo energético, classificação PBE, garantias e evidência fiscal não foram completados sem confirmação primária da versão brasileira.
- Proveniência por campo em `.github/data/catalog-provenance.json`. `legacy_unverified` é o nome do status de pendência no schema atual, não alegação de origem histórica; nove pendências documentadas, inclusive ausência de preço. O campo de potência verificado refere-se aos 354 cv confirmados no site; torque/tração permanecem reportados pela imprensa.

## Imagem

- [Imagem oficial usada](https://www.denza.com/material/__CN/denza-site/denza-brazil/bao3/exterior/bao3-mattcopper-7.jpg), vinculada à página brasileira: veículo inteiro em três quartos dianteiros, sem pessoas ou texto promocional.
- `public/car-images/denza-bao-3.jpg`: JPG original **3000 × 1577**, sem recorte, ampliação ou recompressão manual. Crédito: DENZA/divulgação. Imagem ilustrativa oficial; detalhes visuais não comprovam equipamentos da versão entregue.
- Variantes e manifestos gerados por `tools/generate-car-images.py` com Pillow 12.3.0.

## Contrato de catálogo e cálculos

- `src/constants/announcedVehicles.ts` mantém o registro em `ANNOUNCED_CARS`. `AnnouncedCar` tem `price: null` e não é atribuível a `Car`, cujo preço permanece obrigatório e numérico.
- O catálogo mostra uma seção de pré-lançamentos, com busca, marca, categoria, propulsão e autonomia divulgada. Preço máximo restritivo exclui esses anúncios: não se promete adequação ao orçamento. A seleção de novidades usa a data do anúncio.
- TCO, IPVA, comparação financeira, quiz, recomendações por preço e simuladores continuam recebendo apenas `CAR_DB`, sem o anúncio. O consultor recebe uma nota separada com limites explícitos, não um preço fictício.
- O JSON público é aditivo: `cars`/`total` preservam o contrato dos veículos com preço; `announced_cars`/`announced_total` registram os anúncios. Sitemap e página estática `/carro/denza-bao-3/` incluem o anúncio sem `Offer`, preço zero ou `InStock`.
- Quando o preço oficial sair, revisar a evidência e mover explicitamente o registro para `CAR_DB`, removendo-o de `ANNOUNCED_CARS`. Não manter duplicatas nem promover por data.
