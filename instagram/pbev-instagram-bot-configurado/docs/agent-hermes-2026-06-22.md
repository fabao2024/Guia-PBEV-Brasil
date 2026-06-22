# Alteracoes do Agent Hermes - 2026-06-22

Este registro documenta as alteracoes feitas pelo Agent Hermes no bot pessoal do Guia PBEV Brasil e sincronizadas a partir da VPS de producao em `/opt/pbev-instagram-bot`.

## Origem

- Autor operacional: Agent Hermes
- Ambiente de origem: VPS de producao
- Servico: `pbev-instagram-bot`
- Data da sincronizacao local: 2026-06-22
- Estado em producao no momento da conferencia: servico ativo e `/health` saudavel

## Arquivos sincronizados da VPS

- `main.py`
- `content_generator.py`
- `image_generator.py`
- `ev_knowledge.py`
- `demo_posts.py`
- `vehicle_catalog.py`
- `sync_catalog.py`

## Modificacoes principais

### Dashboard operacional

`main.py` recebeu um dashboard operacional com:

- endpoint JSON `/api/dashboard`
- pagina HTML `/dashboard`
- metricas de posts publicados, posts planejados, comentarios, respostas enviadas e DMs registradas
- filtros por `start_date` e `end_date`
- busca de permalinks dos posts via Meta Graph API quando disponivel
- listagem de posts recentes, proximos posts e comentarios recentes

### Identidade do perfil

As referencias visuais e textuais foram atualizadas de `@guiapbev` para `@guiapbevbrasil` em:

- prompt de geracao de legenda
- contexto do assistente
- rodapes das imagens geradas

### Legendas e engajamento

`content_generator.py` passou a orientar geracoes mais curtas e diretas:

- legendas entre 60 e 120 palavras
- temperatura de geracao reduzida para `0.7`
- lista de estilos de hook para variar a primeira linha
- lista de CTAs de engajamento para a ultima linha da legenda
- instrucao explicita para nao repetir aberturas como "Voce sabia que..." ou "Voce ja parou para pensar..."

### Conhecimento do consultor

`ev_knowledge.py` foi ajustado para:

- usar `@guiapbevbrasil`
- alterar frequencia sugerida de `modelo_destaque` e `dica_ev` para `2x/semana`
- atualizar exemplo de TCO de 4 para 5 anos
- simplificar a orientacao sobre recarga, removendo a mencao especifica ao mapa DC incompleto

### Exemplos e TCO

`demo_posts.py` foi atualizado para exemplos em horizonte de 5 anos, incluindo textos e imagem de apoio para TCO.

### Catalogo de veiculos

`vehicle_catalog.py` foi sincronizado com timestamp `2026-06-04 11:55:05` e ajusta imagens de modelos MG Motor para arquivos `.webp`.

### Sincronizacao de catalogo

`sync_catalog.py` voltou a importar `httpx` no topo do arquivo e removeu a reconfiguracao explicita de `stdout` e `stderr`.

## Validacao realizada

- hashes locais dos 7 arquivos acima conferidos contra as copias baixadas da VPS
- VPS conferida com `systemctl show pbev-instagram-bot`
- health check conferido em `http://127.0.0.1:8001/health`

## Observacao operacional

A VPS nao e um checkout Git em `/opt/pbev-instagram-bot`; o deploy e tratado como copia manual de arquivos. Antes de qualquer novo envio para a VPS, preserve essas alteracoes para nao sobrescrever o dashboard e os ajustes do Agent Hermes.
