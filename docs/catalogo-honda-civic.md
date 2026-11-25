# Honda Civic Advanced Hybrid — revisão brasileira

Consulta em **25/11/2026**, referente à versão brasileira **2025/2026** identificada pela página Honda. Sem alteração de nome, slug ou quantidade de veículos.

## Fontes e limites

- [Página indicada pelo usuário](https://www.honda.com.br/automoveis/civic): visual reestilizado, Google integrado e ano/modelo 2025/2026. O acesso direto retornou HTTP 403, inclusive no navegador; texto e catálogo foram consultados pela indexação pública das URLs oficiais. O preço dinâmico não ficou legível. Não se declara leitura direta bem-sucedida nem preço vigente confirmado.
- [Catálogo oficial, impresso em julho/2025](https://www.honda.com.br/automoveis/sites/hab/files/2025-07/Cat%C3%A1logo_do_Ve%C3%ADculo_Civic_Advanced_Hybrid_2025.pdf): motor elétrico de tração com **184 cv e 32,1 kgfm**; motor 2.0 DI a gasolina de 143 cv e 19,1 kgfm; bateria de íons de lítio de **1,05 kWh**, transmissão e-CVT. **Não somar** as potências dos motores nem apresentar 327 cv como potência combinada.
- Consumo publicado no catálogo Honda: **18,4 km/L urbano e 15,9 km/L rodoviário**, a gasolina. O campo de cálculo mantém o urbano; o rodoviário é informado na ficha textual. Não foi feita nova conferência de etiqueta individual PBEV; classificação e MJ/km permanecem ausentes, sem inferências.
- Híbrido **HEV sem tomada**: `range: 0` é a convenção interna de ausência de autonomia plug-in, não uma afirmação de que o veículo não rode em modo EV. Sem alcance elétrico ou total inventado, potência AC ou tempo de recarga; `chargeDC: null` indica ausência de carga rápida externa. A métrica principal continua km/L.
- Dimensões oficiais: **4.687 × 1.802 × 1.432 mm**, entre-eixos **2.735 mm** e bagagem **495 L**. O catálogo não identifica o método de volume; não afirmar VDA. **1.449 kg** é massa legada preservada, não confirmada nesta revisão; exceção de proveniência permanece aberta até ficha primária da versão. Vão livre continua ausente.
- [Comunicado Honda de 30/06/2025](https://saladeimprensa.honda.com.br/releases/lancamento-civic-advanced-hybrid-onde-inovacao-encontra-sofisticacao): confirma potência/torque elétricos, oito airbags, Honda Sensing, multimídia de 9” com Google, painel de 10,2”, Bose com 12 alto-falantes, teto solar e ar Dual Zone.
- Garantia no catálogo e comunicado de 2025: **3 anos sem limite de km** para o veículo e **8 anos ou 160.000 km**, o que ocorrer primeiro, para componentes do sistema híbrido, condicionados ao manual e revisões. A página comercial atual informa **6 anos apenas para veículos fabricados a partir de 2026**. Mantido `warrantyYears: 3` para o escopo 2025/2026 do catálogo, com ressalva explícita na ficha; não estender automaticamente a cobertura por ano/modelo ou data de consulta. O aviso genérico de bateria de 1 ano da página não substitui a cobertura específica do conjunto híbrido.

## Preço pendente

Preservados os **R$ 266.500 indicativos do cadastro anterior**, sem promovê-los a preço oficial verificado. A ficha sinaliza a confirmação pendente e o registro continua `legacy_unverified`. Os **R$ 265.900** do comunicado de junho/2025 são o preço de lançamento, não evidência suficiente do valor vigente em novembro/2026. Não foi inventado novo preço, oferta ou disponibilidade de estoque.

O registro por campo está em `.github/data/catalog-provenance.json`: oito campos técnicos/comerciais com fontes oficiais; preço e massa continuam com exceções explícitas. Para o catálogo, `sourceUpdatedAt` usa **08/07/2025**, data de publicação apresentada pelo índice público (o documento informa apenas julho/2025); para a página sem data declarada usa **25/11/2026** como referência de observação exigida pelo contrato atual, não como atualização declarada da Honda. `verifiedAt` identifica esta revisão.

## Imagem

Foto da galeria oficial do comunicado de 2025, veículo inteiro em três quartos dianteiros, sem pessoas, mostrando a dianteira reestilizada:

- [Original Honda](https://cmssaladeimprensa.honda.com.br/sites/default/files/2025-06/Civic%20Advanced%20Hybrid%20Est%C3%A1tica%20%283%29.jpg).
- `public/car-images/honda-civic-hybrid.jpg`: JPEG original de **6000 × 4000**, sem corte, upscale ou recompressão manual; crédito Honda/divulgação, direitos preservados.
- Variantes WebP e manifestos regenerados por `tools/generate-car-images.py`, com Pillow 12.3.0, mantendo o caminho original do catálogo.
