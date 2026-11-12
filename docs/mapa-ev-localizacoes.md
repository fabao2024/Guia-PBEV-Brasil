# Mapa EV — revisão de localizações

Revisão iniciada em **09/11/2026**. Alteração local, ainda não publicada.

## Escopo e resultado

**Estado local atual:** 1.787 registros de locais com fonte: 1.391 registros OCM (incluindo 94 fichas adicionais consultadas em novembro) e 396 registros OSM do extrato de 08/11/2026. O arquivo histórico de abril permanece identificado como tal. A base não representa cobertura nacional completa, disponibilidade em tempo real ou endereços fisicamente validados. Os 159 registros legados continuam separados e ocultos por padrão.

A base legada contém 159 registros, 27 UFs e 18 nomes de operadores, com referência originalmente declarada de março/2026. Não havia fonte individual, identificação externa, endereço completo ou data de verificação. A auditoria estrutural não encontrou IDs duplicados, coordenadas exatamente repetidas ou valores numericamente inválidos. Isso **não comprova** existência, município/UF, operador, potência, acesso público ou posição física.

Os 159 registros foram classificados como **não verificados**, não como inexistentes. Suas coordenadas originais são preservadas para revisão, sem reposicionamento no centro da cidade, shopping ou outro estabelecimento. Ficam ocultos por padrão; a opção de revisão os mostra em cinza, sem potência presumida, cores de operadores ou links de navegação. Não entram nas sugestões de rota, inclusive quando as APIs externas falham.

Não há, nesta etapa, estação da base legada com posição física confirmada. A conferência externa foi **amostral**, não uma validação integral dos 159 pontos nem dos limites municipais/estaduais.

## Primeira etapa — correção da abertura vazia

A primeira implementação ocultou os registros legados, mas deixou a visualização padrão dependente de uma API que falhava. Isso criou uma regressão: nenhum ponto na abertura, e erro de conexão indistinguível de consulta vazia.

Na primeira correção foram incluídas **7 estações com fichas individuais consultadas no Open Charge Map em 09/11/2026**, nas cinco regiões do país. A amostra permanece na base ampliada abaixo. O seletor **Abrir estação** centraliza o mapa e abre o popup. Não se trata de confirmação em campo nem revalidação dos 159 registros legados.

| Fonte individual | Município/UF | DC máximo na ficha | Conector reproduzido | Crédito e licença na fonte |
|---|---|---:|---|---|
| [OCM-513710 — Avenida do Rio Bonito, 2002](https://openchargemap.org/poi/details/513710) | São Paulo/SP | 80 kW | CCS2 | Open Charge Map Contributors · CC BY 4.0 |
| [OCM-191634 — Copel Telecomunicações](https://openchargemap.org/poi/details/191634) | Curitiba/PR | 50 kW | CCS2 + CHAdeMO | Open Charge Map Contributors · CC BY 4.0 |
| [OCM-513602 — Pronto Eletroposto](https://openchargemap.org/poi/details/513602) | Boa Vista/RR | 40 kW | CCS2 | TriCharge via Open Charge Map · CC0 |
| [OCM-513541 — Posto Mahalo](https://openchargemap.org/poi/details/513541) | Florianópolis/SC | 30 kW | CCS2 | TriCharge via Open Charge Map · CC0 |
| [OCM-513601 — Energy Station](https://openchargemap.org/poi/details/513601) | Jaboatão dos Guararapes/PE | 80 kW | CCS2 | TriCharge via Open Charge Map · CC0 |
| [OCM-513594 — America Shopping - JJVM BRASIL 60KW](https://openchargemap.org/poi/details/513594) | Goiânia/GO | 60 kW | CCS2 | TriCharge via Open Charge Map · CC0 |
| [OCM-513595 — Eletroposto To Nem Aí](https://openchargemap.org/poi/details/513595) | Salvador/BA | 40 kW | CCS2 | TriCharge via Open Charge Map · CC0 |

As coordenadas são as publicadas em cada ficha, sem geocodificação de endereço ou deslocamento ao centro do município/estabelecimento. São classificadas como **aproximadas**. O nome do operador fica ausente quando a fonte não o identifica. Exigências de cadastro/app ou pagamento no local aparecem como informações da fonte. Não se reproduz o status do cadastro como disponibilidade em tempo real; a ficha da Copel, por exemplo, alerta para falta de verificação recente.

Dados selecionados em `src/data/sourcedChargers.ts`, com URL, ID, data, crédito e licença por registro. Créditos e link de licença aparecem no popup; termos: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) e [CC0](https://creativecommons.org/publicdomain/zero/1.0/). Nenhum dado de usuário, comentário, telefone ou mídia pessoal das fontes foi incorporado.

## Ampliação com dados abertos — AC e DC

O [export oficial OCM](https://github.com/openchargemap/ocm-export/tree/8e3bedca48ca94807d96b2f5e7ee02cffe63ae54/data/BR), com revisão de **22/04/2026**, contém 1.298 arquivos brasileiros. A importação em **09/11/2026** aceitou 1.291 registros e excluiu sete conforme critérios de país/coordenadas, acesso privado/restrito e ciclo de vida. Apenas fornecedores com licença explícita reconhecida **CC BY 4.0 ou CC0** são aceitos; a indicação genérica de dados abertos não basta. A licença de cada fornecedor é resolvida pelo `referencedata.json` da mesma revisão.

O arquivo gerado `src/data/ocmChargers.json` contém somente campos públicos selecionados de locais e conexões, mais referência, crédito, licença e datas. Não contém identidades de colaboradores, comentários, contatos pessoais, mídias ou textos livres de acesso. Não deve ser editado manualmente. Os termos do OCM distinguem [dados de contribuidores de dados de outros fornecedores](https://openchargemap.org/about/terms).

Na etapa anterior, apenas com o arquivo e a amostra, foram carregados **1.297 registros**: seis fichas adicionais e uma ficha Copel já presente no export, mantida uma única vez com a evidência mais recente. A distribuição histórica dessa etapa foi:

| Informação elétrica declarada | Registros de locais |
|---|---:|
| Apenas AC | 481 |
| Apenas DC | 553 |
| AC e DC | 223 |
| Tipo não informado | 40 |

Há UF informada em 24 UFs na base combinada; **559 registros do export não têm UF reconhecível**. Esses campos permanecem vazios, sem inventar município/UF ou mover coordenadas. A ausência de registros atribuídos a uma UF não comprova ausência de recarga. O export é de abril, mas há fichas com atualização declarada desde 2013: importar hoje **não torna o cadastro atual**. O mapa mostra separadamente data do export, importação e atualização declarada da ficha, quando disponível.

Cada registro representa um local na fonte. `NumberOfPoints`, quantidade de conectores e posições de estacionamento não se transformam em pinos adicionais. Registros próximos não são fundidos automaticamente: estabelecimentos vizinhos podem ser distintos, e duas fontes podem cadastrar o mesmo estabelecimento. A contagem exibida é de **registros de locais**, não de endereços únicos fisicamente confirmados ou tomadas disponíveis.

### Consulta atual do catálogo OCM — novembro

O [catálogo público brasileiro](https://openchargemap.org/poi?countrycode=BR) foi consultado em **09/11/2026**. Suas 100 fichas listadas foram abertas individualmente, com validação de identidade, país, coordenadas, licença por fornecedor, acesso e dados elétricos. O arquivo gerado `src/data/ocmCurrentChargers.json` tem `scope: recent-listings` e `completeCountry: false`: é uma amostra do catálogo atual, **não a totalidade do Brasil**. São 21 fichas AC e 79 DC; 94 não estavam no conjunto anterior e seis já pertenciam à amostra selecionada. Fichas da mesma identidade não se duplicam na contagem.

Exemplos consultados: [MultCharge — HUB Anastácio, OCM-513822](https://openchargemap.org/poi/details/513822), 60 kW DC, GB/T e CCS2, crédito Multcharge/CC0; [Rua da Prainha, OCM-513761](https://openchargemap.org/poi/details/513761), 40 kW DC, crédito OCM Contributors/CC BY 4.0; [Liber Energia — Loja Equus, OCM-513709](https://openchargemap.org/poi/details/513709), 7 kW AC, crédito YellotMob/CC0. Esses exemplos demonstram fichas adicionais, não instalação recente ou disponibilidade confirmada.

As páginas não fornecem uma data de atualização da ficha identificável no contrato HTML usado. Essa data **permanece ausente**, sem aproveitar datas de comentários, fotos ou da coleta como se fossem atualização/instalação. A interface distingue “Arquivo OCM” de “Fichas OCM”. Campos de município/UF ausentes continuam ausentes. Indisponibilidade explicitamente declarada acompanha o registro e impede seu uso no planejador; não é transformada em status ao vivo.

A importação nacional pela API foi preparada para paginação ascendente e término confirmado. Ela exige `OCM_API_KEY` no processo de importação, fora do frontend e sem `VITE_*`, nunca em URL ou arquivo gerado. **Nenhuma chave está configurada nesta etapa**, e o comando abortou antes de consultar a API; não se declara sincronização nacional obtida. Se uma importação completa autorizada for gerada, ela substitui a base OCM histórica, em vez de ressuscitar registros ausentes por fallback. A consulta pública às 100 fichas não usa nem contorna a API autenticada.

### OSM e resiliência

A busca OSM agora inclui AC, DC abaixo de 30 kW e locais sem potência/conector informados; usa nós, vias e relações com `amenity=charging_station`. Dados privados, desativados ou em construção são excluídos. Quando a fonte omite potência, corrente ou conector, isso permanece explicitamente desconhecido; tensão e amperagem não são convertidas em uma potência presumida. Dados OSM têm crédito e licença [ODbL 1.0](https://www.openstreetmap.org/copyright).

A coleta nacional OSM via Overpass falhou por timeout nas duas instâncias tentadas; uma terceira consulta de diagnóstico retornou HTTP 504. **Não foi gerado um snapshot OSM vazio como se a coleta tivesse sido bem-sucedida.** Um caminho independente usa o [extrato Geofabrik brasileiro de 08/11/2026](https://download.geofabrik.de/south-america/brazil.html), com checksum do arquivo fixado antes da extração. O extrator seleciona somente campos públicos necessários e busca apenas os nós de geometria das vias selecionadas, sem índice nacional inteiro em memória. Centros de áreas são marcados e explicados como aproximações, não como posição física do carregador.

O extrator foi validado com fixture local, incluindo privacidade dos campos e rejeição de geometria incompleta. **A transferência real foi concluída e seu MD5 conferido** (`e0076a91afd957aa8f18318be6185356`). O cabeçalho declara referência até **2026-11-08T21:21:00Z**. A seleção encontrou 407 elementos (373 nós e 34 vias), todos com geometria completa; 11 foram excluídos: sete com acesso privado e quatro com `motorcar=no`. O snapshot público `src/data/osmChargers.json` contém **396 registros**: 363 posições de nós preservadas e 33 centros de áreas explicitamente aproximados. O extrato cobre a seleção da fonte brasileira, não todos os carregadores existentes no país.

Dos registros OSM aceitos, 25 são AC, 29 DC, quatro mistos e 338 sem dados elétricos suficientes. O acesso está público/permissivo em 92, limitado a clientes em 29 e ausente em 275. Nenhum informa UF nos campos aceitos; ela não foi inferida. A data individual de edição OSM, quando presente, não comprova atualização das características, instalação ou inspeção. Somente dois registros OSM atendem aos critérios DC atuais de rota. A base combinada tem 527 registros AC, 655 DC, 227 mistos e 378 com tipo não informado; não se presume que sejam endereços físicos únicos entre fontes.

O coletor só substitui um snapshot após resposta completa, não vazia e sem erro parcial. A abertura carrega ambas as fontes localmente, sem chamadas às APIs de estações; requisições da camada de ruas são independentes. A atribuição e as datas de cada origem aparecem separadas no mapa.

### Atualização reproduzível

Com Node 22 e dependências do lockfile instaladas:

```bash
npx tsx tools/collect-charger-snapshot.ts --source ocm
npx tsx tools/collect-charger-snapshot.ts --source ocm-current
npx tsx tools/collect-charger-snapshot.ts --source osm
npm run test:run -- src/__tests__/chargerImport.test.ts src/__tests__/localChargers.test.ts
```

O importador OCM histórico fixa a revisão citada acima; atualizar a revisão exige conferir novamente licenças, contagens e testes. `ocm-current` lê somente as fichas recentes do catálogo público e não requer credencial. `ocm-api` exige a chave autorizada no ambiente do importador e só grava após término confirmado da paginação. Respostas brutas não são gravadas no repositório público. O coletor é uma ferramenta de dados públicos, não um backend. Falhas não autorizam apagar uma base já obtida. Fichas, conectores, acesso e atualização precisam de revisão individual antes de qualquer alegação de cobertura ou funcionamento.

O extrator offline `tools/extract-osm-chargers.py` requer **osmium 4.3.2** e recebe `--input` para o PBF local e `--output` para um JSON intermediário **fora do repositório**. Confere o MD5 fixado, mantém a data do cabeçalho e remove identidades/contatos dos contribuidores. Depois, `npx tsx tools/collect-charger-snapshot.ts --source osm-file --input <json-intermediario>` valida procedência, data e campos antes de gravar o snapshot público pequeno. Testes do extrator: `python -B tools/test_extract_osm_chargers.py` com a dependência instalada. O PBF de aproximadamente 2 GB não é publicado nem carregado pelo navegador.

## Carregados — visualização complementar sob demanda

O Mapa EV passa a oferecer uma alternância entre a base local e o [mapa oficial Carregados para incorporação](https://carregados.com.br/compartilhar). A base local continua sendo a visualização inicial, com 1.787 registros; trocar de fonte preserva filtros, seleção e o mapa Leaflet já criado. Na visualização Carregados, há explicação de privacidade e um botão explícito para carregar o iframe. Nenhuma conexão com a Carregados é feita na abertura local ou na simples seleção da fonte. Ao voltar à base local, o iframe é removido.

A integração usa somente a URL oficial `/embed`, com região inicial fixa do Brasil, tema escuro e sem enviar localização do visitante, carro ou filtros. O iframe recebe sandbox sem formulários ou navegação da página principal; geolocalização, câmera e microfone são negados. A CSP do Guia libera somente `https://carregados.com.br/embed` como origem/caminho de quadro, sem incluir scripts da plataforma ou acesso à sua API no documento principal. Links diretos ao mapa e às políticas ficam disponíveis; erros e bloqueios de quadros nem sempre emitem eventos detectáveis, portanto o link alternativo independe de detectar a falha. Um evento de carregamento do iframe não comprova funcionamento do mapa ou dos carregadores.

Os [dados de mercado Carregados](https://carregados.com.br/dados-sobre-o-mercado-eletrico), consultados em **09/11/2026**, informam 12.775 estações, incluindo 9.900 públicas/públicas rápidas. Esses dois indicadores são uma referência citada, sem atualização automática, não uma importação de estações. A página de incorporação anuncia 15.623 eletropostos; não foi demonstrado que os dois totais usem os mesmos critérios ou datas. A interface avisa que podem divergir e **não os soma à contagem local**, nem transforma total de estações em tomadas disponíveis.

A [documentação da API pública](https://carregados.com.br/docs/api.md) explicita que as fichas e buscas omitem coordenadas. Os [termos gerais](https://carregados.com.br/termos-e-condicoes) exigem autorização escrita para extração automatizada. Não foram usados caminhos alternativos para obter coordenadas, raspagem em massa, geocodificação de endereços para inventar pinos nem cópia de avaliações, contatos ou identidades de usuários. Para incorporar nativamente uma base Carregados, continuam necessários export autorizado com coordenadas e condições de redistribuição. Os pontos do iframe **não entram no planejador de rotas** do Guia PBEV; créditos, controles e contagens externos permanecem independentes. Alteração local, ainda sem publicação.

## Evidência e precisão

- **Confirmada:** requer fonte HTTPS individual, identificação externa, data de consulta e data de verificação da posição física, além de coordenadas válidas. Metadados são um requisito técnico, não substituem a revisão humana da evidência. Nenhum registro foi promovido a esse estado nesta revisão.
- **Aproximada:** coordenadas publicadas em cadastro individual OSM ou OCM, com URL, ID e data da consulta. A consulta não é inspeção em campo; centros de áreas OSM também permanecem aproximados.
- **Não verificada:** falta evidência individual ou metadados mínimos; não é destino de navegação nem alternativa de rota.

O Mapa EV abre com a base local ampliada. Ao aproximar até a cidade (zoom ≥ 10), o usuário pode buscar outros locais na área visível pelo OpenStreetMap/Overpass, sem chave. A consulta é limitada à área do Brasil e a uma janela de até 2° por eixo. Filtros de AC/DC, acesso e potência são aplicados sem preencher lacunas. Consulta concluída sem resultados, erro HTTP/rede, timeout e resposta parcial/inválida são estados distintos. Mesmo uma consulta vazia em outra área preserva resultados anteriores. Ausência de pinos após filtros não significa ausência de carregadores.

Cada resultado externo mostra fonte, ID e data de consulta. Nomes externos são inseridos como texto, não HTML. Google Maps recebe busca textual para localizações aproximadas; apenas posições confirmadas podem gerar busca por coordenadas. O link regional do PlugShare não seleciona uma estação e não é evidência de existência.

A camada de ruas foi trocada por tiles públicos do OpenStreetMap, com atribuição visível, após o navegador mostrar “API KEY REQUIRED” na camada anterior do CARTO. A busca de estações e a camada de ruas são serviços separados: ruas visíveis não garantem resposta da busca Overpass.

O planejador mantém um contrato mais restrito que o mapa: DC de pelo menos 30 kW na mesma conexão de conector reconhecido, evidência rastreável, sem indisponibilidade declarada da estação/conexão, sem acesso desconhecido ou aviso prévio e sem atualização declarada há mais de 730 dias. Esses critérios também se aplicam à conversão de resultados OCM/OSM para rotas; a consulta OCM opcional continua exigindo chave da sessão do usuário e licença reconhecida do fornecedor. As sete fichas selecionadas manualmente e as páginas recentes não informam data de atualização do cadastro distinta da consulta; isso não se converte em verificação em campo. Em 09/11/2026, a base combinada tem **604 candidatos DC** após esses filtros, sendo dois OSM; não são 604 estações fisicamente confirmadas. Fonte, licença e datas acompanham paradas e alternativas. Os legados sem evidência continuam excluídos. Confirme posição, acesso, conector e funcionamento com o operador antes de viajar.

## Leitura e interação no mapa

Os marcadores têm alvo de toque de 44 × 48 px, raio de recarga, contorno branco/escuro e sombra para se distinguirem das ruas. A seleção usa destaque e rótulo com nome, potência e precisão. `~` identifica posição aproximada; `?` identifica registro em revisão. A cor não indica funcionamento, acesso ou disponibilidade em tempo real. Alegações elétricas não verificadas continuam ausentes dos rótulos.

Quando os alvos ficam próximos na tela, um círculo com contagem representa o grupo. O agrupamento limita a extensão na tela para não unir uma cadeia nacional inteira em um único grupo que não aproxima. Contagens de quatro dígitos usam tipografia menor para permanecer no alvo de 44 px. Clicar aproxima os membros; ao aumentar o zoom, eles se separam. O centro de um grupo é apenas uma representação visual, não coordenada de uma estação ou destino de navegação. As coordenadas de cada registro permanecem intactas. A estação escolhida pelo seletor ganha pino individual e popup.

O enquadramento inicial inclui as estações carregadas. “Ver todas” enquadra os pontos dos filtros atuais e limpa a seleção, sem buscar dados externos ou remover filtros. Clicar em um pino sincroniza o seletor. Marcadores e agrupamentos aceitam Enter e Espaço; alvos de toque e controles de zoom têm pelo menos 44 px.

Avisos completos ficam em um bloco expansível, com cobertura parcial sinalizada no resumo. Controles têm rolagem própria em telas baixas; popup e rótulos se adaptam à área do mapa. Qualidade, fonte e data permanecem acessíveis; essas alterações visuais não ampliam a cobertura nem confirmam posições físicas.

Tipo de recarga e potência ficam acessíveis diretamente; **Filtros** reúne precisão, acesso e operador para preservar área no celular. Filtrar por DC não usa a potência de uma conexão AC do mesmo local. Locais sem potência continuam visíveis em “Todas”, mas não satisfazem um mínimo numérico. As datas do export/importação permanecem visíveis mesmo com os avisos recolhidos.

## Amostra e pendências

| Registro legado | Achado | Tratamento |
|---|---|---|
| 13 — ChargeHouse Shopping Eldorado | Pino cerca de 2,7 km da referência pública do shopping. A página oficial indexada descreve seis estações no 1SS; não comprova ChargeHouse, 120 kW DC ou coordenada do carregador. Acesso direto retornou 403. | Não verificado; não mover para o centro do shopping. |
| 22 — Tupinambá Iguatemi Campinas | Pino cerca de 3,6 km da referência pública do shopping. Diretórios consultados descrevem Type 2 AC de aproximadamente 7 kW na Av. Iguatemi, 777; não sustentam 150 kW DC Tupinambá. | Não verificado; não converter cadastro AC em estação DC. |
| 7, 19, 27, 45, 60, 90, 102, 115 — Tesla Supercharger | Sem evidência individual; listagem oficial retornou 403. | Identidade e existência pendentes; ausência de confirmação não prova inexistência. |
| 30 registros atribuídos a Electra | A empresa consultada descreve operação europeia. Não foi demonstrado vínculo dos pontos brasileiros com essa operadora. | Operador e estações pendentes. |
| 8 — Granja Viana; 39 — Anhanguera km 300; 67 — Via Dutra MG; 69 — Palladium Curitiba | Indícios de inconsistência entre nome, município, rodovia ou coordenada. | Conferência individual e geográfica pendente. |

Fontes da amostra:

- [Shopping Eldorado — serviços](https://www.shoppingeldorado.com.br/o-shopping/) e [como chegar](https://www.shoppingeldorado.com.br/conteudo/como-chegar.htm) — conteúdo parcialmente acessível por busca, sem confirmação da posição física.
- [Referência cartográfica Eldorado](https://mapcarta.com/37099686) e [Iguatemi Campinas](https://mapcarta.com/W89693149) — usadas apenas para comparar distância até o estabelecimento, não como coordenadas de carregadores.
- [Iguatemi Campinas — site oficial](https://iguatemi.com.br/campinas) — endereço do estabelecimento, não coordenada de estação DC.
- [Carregados — Shopping Iguatemi Campinas, ID 1380](https://carregados.com.br/estacoes/estacao-shopping-iguatemi-campinas-1380) — cadastro Type 2 AC.
- [Fullcarro — Shopping Iguatemi Campinas](https://ev.fullcarro.com/plug/brazil/sp/campinas/shopping-iguatemi-campinas/) — cadastro Type 2 AC; não confirma o registro legado DC.
- [Tesla — localizador](https://www.tesla.com/findus/list/superchargers/Brazil) — acesso direto bloqueado.
- [Electra — apresentação](https://www.go-electra.com/en/about/) — identificação da empresa, não evidência de estações brasileiras.

## Próxima etapa

Auditar cada registro com fonte identificável do operador e evidência da posição física, revisar município/UF e características elétricas e só então reintegrá-lo à visualização padrão. Não completar potência, conector ou disponibilidade por inferência. A base agregada por UF em `src/data/eletropostos.ts` não foi auditada nesta entrega e não é a fonte dos pinos deste mapa.

## Validação local

- Carregados: **25 testes em três arquivos aprovados**, cobrindo acessibilidade do painel inicial, tradução, foco no quadro após ativação, alternativa em erro, preservação de filtros/seleção e CSP restrita. Testes unitários usam um documento vazio no iframe, sem rede; o carregamento real foi verificado separadamente no navegador.
- Suíte completa final da integração Carregados: **604/604 testes aprovados em 67 arquivos**, incluindo a auditoria de acessibilidade do catálogo, sem silenciar testes ou ampliar seus limites. Os timeouts citados abaixo são resultados históricos de etapas anteriores, não uma falha desta execução.
- Navegador com build de produção: nenhuma conexão Carregados na abertura local nem na simples escolha da fonte. Após clicar em carregar, o iframe oficial retornou HTTP 200 e renderizou seu mapa. Layout sem overflow horizontal/externo em 390 × 844 e 360 × 640, com rolagem interna quando necessária; retorno remove o iframe e preserva a seleção local. A base continua com 1.787 registros, grupos enquadrados, teclado/toque e home sem detalhes fiscais. Typecheck, build, scanner e proveniência após build aprovados (`unchanged`, 989/1960).
- Fontes de novembro: **97 testes direcionados em 11 arquivos aprovados**, cobrindo mapa, importação, snapshots OCM/OSM reais, licenças, privacidade dos campos, datas, filtros, popups, marcadores e geometria de rota.
- Suíte completa da etapa de fontes de novembro, anterior à integração Carregados: **597/598 testes aprovados**, em 66 arquivos. Única falha: timeout de 120 s na auditoria de acessibilidade do catálogo (`src/__tests__/accessibility.test.tsx`), já observado anteriormente. O arquivo não foi alterado nem silenciado; não se declara a suíte completa aprovada.
- Extrator offline: dois testes Python aprovados, incluindo remoção de identidades/contatos, geometria incompleta e datas. A extração real conferiu checksum e cabeçalho, com 407 elementos e nenhuma geometria incompleta. Testes do snapshot público validam contagens, identidades, créditos/licenças, datas e inclusão na base combinada.
- Typecheck, build, scanner e proveniência aprovados (`unchanged`, 989/1960). O chunk compartilhado dos modais com os três snapshots tem aproximadamente 1,30 MB, 145 kB gzip; o aviso de bundle grande permanece explícito, sem aumentar seu limite ou adicionar dependências ao frontend.
- Build de produção conferido em navegador: 1.787 registros representados por cinco grupos enquadrados na abertura desktop, zero consultas a APIs de estações; datas do arquivo OCM, das fichas OCM e do extrato OSM separadas. Popups OCM atuais/históricos, nó OSM e centro de área OSM com créditos, licenças, data individual quando disponível e aviso de aproximação. Clicar em grupo aproxima; seleção, Enter, Espaço e toque validados. Em 390 × 844, “Buscar nesta área” e “Ver todas” ficam visíveis, com área de mapa de aproximadamente 356 px; sem overflow também em 360 × 640 com aviso expandido. Home permanece sem detalhes fiscais. São testes de apresentação e procedência, não inspeção física dos locais.

Resultados históricos das etapas anteriores:

- Arquivo de abril e amostra: 85 testes direcionados aprovados; reexecução sem a auditoria de acessibilidade, 582/582 em 63 arquivos. Suíte completa dessa etapa: 585/586, com timeout de 120 s na auditoria do catálogo (`accessibility.test.tsx`). Consulta OCM de novembro, antes do extrato OSM: 591/591 em 64 arquivos sem a auditoria de acessibilidade. Esse arquivo não foi alterado nem silenciado; resultados parciais não significam suíte completa aprovada.
- Primeira etapa: suíte completa 549/549. Correção da abertura vazia: **558/558 na suíte completa** e 57 testes direcionados aprovados, cobrindo também snapshot, navegação pelo seletor, preservação de pinos na falha, distinção de erro/vazio e precedência de atualização. A reexecução serial passou, inclusive a auditoria de acessibilidade do catálogo; uma execução anterior concorrente teve timeout nessa auditoria (120 s), sem falha de asserção do mapa.
- Typecheck, build e scanner aprovados; proveniência após build `unchanged`, 989/1960. Avisos de assets Leaflet e bundle grande já existentes não impedem o build.
- Build de produção em navegador desktop e mobile: sete pinos na abertura com zero consultas externas; seletor abre os registros reais OCM-513710 e OCM-191634 com fonte/licença e características da ficha, não estações simuladas. Sem overflow horizontal em 390 × 844; home continua sem detalhes fiscais.
- Consulta real Overpass no navegador: HTTP 502 com mensagem de erro e sete pinos preservados. Falha de rede controlada também preservou a base. As fichas OCM foram consultadas com sucesso por HTTP; isso não é inspeção física. **Novas estações pela busca Overpass no navegador continuam sem confirmação de retorno bem-sucedido neste ambiente**; não se atribui sucesso ao serviço externo indisponível.
- Legibilidade: 17 testes direcionados aprovados para marcadores e mapa; agrupamento por distância em tela, coordenadas preservadas, rótulos seguros, seleção e enquadramento testados. Conferência no navegador com dados reais: todos os alvos de pelo menos 44 px, sete estações representadas por pinos/grupos e enquadradas na abertura; seleção, clique em grupo, teclado (Enter/Espaço) e toque funcionando, com zero chamadas externas. Layout sem overflow em 390 × 844 e em 360 × 640 com aviso expandido. Typecheck, build, scanner e proveniência aprovados. Suíte completa nesta etapa: 566/567; timeout de 120 s na auditoria de acessibilidade do catálogo, sem falha de asserção nos testes do mapa. Esse teste permanece inalterado e pendente de uma execução sem timeout; não se declara a suíte completa aprovada.
