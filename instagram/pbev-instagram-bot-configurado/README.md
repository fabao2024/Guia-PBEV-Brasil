# Guia PBEV Brasil - Instagram Automation Bot

Bot de automacao para o Instagram do Guia PBEV Brasil.

Ele cobre:
- geracao de posts com Gemini
- fila e agendamento com SQLite + APScheduler
- publicacao automatica via Meta Graph API
- respostas automaticas via webhook
- geracao de imagens branded com dados do catalogo
- preview HTML de posts antes da publicacao
- fallback de imagem por IA para posts sem foto de veiculo
- consultor de DM baseado no mesmo catalogo do Guia PBEV Brasil

## Como o projeto funciona

```text
1. O bot gera legenda + hashtags
2. Gera ou atualiza a imagem do post
3. Permite preview no navegador antes de publicar
4. Salva tudo na fila SQLite
5. O scheduler verifica a fila a cada 5 minutos
6. So publica posts que tenham imagem publica disponivel
```

## Estado atual do fluxo de conteudo

- `modelo_destaque`, `comparativo` e `tco_insight` usam dados do catalogo sincronizado do projeto `Guia-PBEV-Brasil`
- antes de gerar ou regenerar esses posts, o bot tenta sincronizar `src/constants.ts` e atualizar [vehicle_catalog.py](/c:/Users/fabio/OneDrive/Documentos/I.A%20jobs/testes/Guia%20PBEV/Guia-PBEV-Brasil/instagram/pbev-instagram-bot-configurado/vehicle_catalog.py)
- `comparativo` suporta fotos reais dos dois veiculos quando as imagens do catalogo estao disponiveis
- posts sem foto de veiculo so tentam gerar fundo com IA em `dica_ev`, `tco_insight` e `noticia_mercado`
- quando houver foto real de veiculo disponivel no catalogo, ela tem prioridade e a IA nao entra no fluxo
- imagens AVIF do catalogo agora sao convertidas para JPEG via `pillow-avif-plugin`
- CTAs de feed foram ajustados para "link na bio" e nao dependem de URL clicavel na legenda
- `noticia_mercado` continua disponivel para uso manual, mas foi removida da geracao semanal automatica
- a geracao semanal automatica agora cria 4 posts por semana: segunda, quarta, sexta e sabado
- alteracoes feitas pelo Agent Hermes em producao foram sincronizadas e documentadas em [docs/agent-hermes-2026-06-22.md](/c:/Users/fabio/OneDrive/Documentos/I.A%20jobs/testes/Guia%20PBEV/Guia-PBEV-Brasil/instagram/pbev-instagram-bot-configurado/docs/agent-hermes-2026-06-22.md)

## Pre-requisitos

1. Conta Instagram Business conectada a uma Facebook Page
2. App Meta com permissoes:
- `instagram_basic`
- `instagram_content_publish`
- `instagram_manage_comments`
- `instagram_manage_messages`
- `pages_show_list`
- `pages_read_engagement`
3. Chave do Google Gemini
4. VPS Ubuntu com Python 3.11+
5. Dominio com HTTPS para webhook e imagens publicas

## Setup local ou VPS

```bash
cd /opt
git clone <repo-url> pbev-instagram-bot
cd pbev-instagram-bot

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
python -c "from database import init_db; init_db()"
python publish.py --test
```

## Variaveis importantes

- `HOST=0.0.0.0`
- `PORT=8001`
- `PUBLIC_SITE_URL=https://guiapbev.cloud`
- `IMAGE_BASE_URL=https://bot.seu-dominio.com`
- `WEBHOOK_URL=https://bot.seu-dominio.com/webhook`
- `META_ACCESS_TOKEN=<token de publicacao>`
- `FACEBOOK_PAGE_ACCESS_TOKEN=<page_access_token>`
- `ENABLE_AI_IMAGE_GENERATION=true`
- `IMAGE_GENERATION_PROVIDER=gemini`
- `IMAGE_GENERATION_MODEL=gemini-3.1-flash-image-preview`
- `IMAGE_GENERATION_SIZE=1280x1280`

Observacao:
- `PUBLIC_SITE_URL` deve apontar para o site rastreado no Plausible
- `IMAGE_BASE_URL` deve apontar para o host que serve `/ig-images/`
- `IMAGE_FALLBACK_URL` e opcional e pode apontar para um host alternativo que sirva o mesmo caminho `/ig-images/...`; o publisher tenta esse host automaticamente se a Meta rejeitar a URL principal com erro de fetch de midia
- `SITE_URL` ficou como legado para compatibilidade
- DMs usam `FACEBOOK_PAGE_ACCESS_TOKEN`; publicacao de posts usa `META_ACCESS_TOKEN`
- para DMs, o ideal e salvar um verdadeiro Page Access Token retornado por `/me/accounts`, nao um token curto do Explorer
- para imagem por IA, `gemini` continua sendo o provider padrao; para testar Z.AI, use `IMAGE_GENERATION_PROVIDER=zai`, `IMAGE_GENERATION_MODEL=glm-image` e preencha `ZAI_API_KEY`

## Mensagens diretas e comentarios

- o webhook recebe DMs em `/webhook`
- respostas a comentarios usam `META_ACCESS_TOKEN`
- respostas a DMs usam `FACEBOOK_PAGE_ACCESS_TOKEN`
- o token da pagina deve ser obtido via `GET /me/accounts?fields=id,name,access_token`
- use o `access_token` retornado para a pagina cujo `id` bate com `FACEBOOK_PAGE_ID`
- o bot ignora mensagens enviadas por ele mesmo, para nao entrar em loop de auto-resposta
- se o token de DM expirar em poucas horas, normalmente voce salvou um token temporario e nao o page token final
- o helper `python refresh_token.py --sync-page-token` deriva e atualiza `FACEBOOK_PAGE_ACCESS_TOKEN` automaticamente a partir do `META_ACCESS_TOKEN`
- o auto responder usa o catalogo local como base principal, replicando o estilo do Consultor EletriBrasil do site

## Operacao diaria

```bash
# Rodar API + scheduler
python main.py

# Testar conexao com a Meta
python publish.py --test

# Gerar 1 post manual e publicar
python publish.py --generate-and-post modelo_destaque --topic "BYD Dolphin Mini"

# Gerar conteudo da semana e salvar
python generate_content.py --days 7 --save

# Ver preview HTML de um post
python manage_queue.py --preview 7
```

## Fila de posts

```bash
# Ver pendentes
python manage_queue.py --list

# Ver pendentes + publicados
python manage_queue.py --list --all

# Ver estatisticas
python manage_queue.py --stats

# Reagendar
python manage_queue.py --reschedule 5 "2026-04-01 10:00"

# Reaplicar correcoes atuais em todos os pendentes e redistribuir agenda
python manage_queue.py --refresh-pending --start-at "2026-04-02 09:00" --interval-hours 24

# Remover 1 post
python manage_queue.py --delete 5
```

Regra importante:
- o scheduler so publica posts com `image_url`
- post sem imagem fica pendente na fila
- se voce gerar imagens para posts ja vencidos, eles podem publicar no proximo ciclo de 5 minutos
- a geracao semanal automatica nao cria novos posts se ja existir backlog pendente na fila

## Comandos de imagem

```bash
# Gerar imagens faltantes para pendentes
python manage_queue.py --generate-images

# Preview no navegador
python manage_queue.py --preview 5

# Publicar um post da fila manualmente
python publish.py --post 5
```

Observacoes:
- para posts de feed, prefira CTA tipo `link na bio`; Instagram nao trata URL em legenda como fluxo confiavel de clique
- se a foto real do carro vier do catalogo em `.avif`, o bot converte para `.jpg` antes de montar a arte

## Regeneracao de posts aterrados

Categorias aterradas:
- `modelo_destaque`
- `comparativo`
- `tco_insight`

Comandos:

```bash
# Regenerar todas as categorias aterradas pendentes
python manage_queue.py --reset-grounded-posts

# Regenerar um post especifico
python manage_queue.py --reset-post 7

# Regenerar um comparativo preservando um tema explicito
python manage_queue.py --reset-post 7 --topic "GWM Ora 03 Skin BEV48 vs BYD Dolphin GS"
```

## Sync do catalogo

Manual:

```bash
python sync_catalog.py
```

Automatico:
- `generate_weekly_content()` tenta sincronizar o catalogo antes da geracao semanal
- `generate_single_post()` tenta sincronizar antes de gerar ou regenerar um post

Se a sync falhar:
- o bot continua usando o snapshot local atual de [vehicle_catalog.py](/c:/Users/fabio/OneDrive/Documentos/I.A%20jobs/testes/Guia%20PBEV/Guia-PBEV-Brasil/instagram/pbev-instagram-bot-configurado/vehicle_catalog.py)

## VPS e deploy

O projeto roda bem em VPS com:
- app Python na porta `8001`
- Nginx fazendo proxy para `127.0.0.1:8001`
- Nginx servindo `/ig-images/` a partir de `/var/www/pbev-images`
- `systemd` usando [pbev-instagram-bot.service](/c:/Users/fabio/OneDrive/Documentos/I.A%20jobs/testes/Guia%20PBEV/Guia-PBEV-Brasil/instagram/pbev-instagram-bot-configurado/pbev-instagram-bot.service)

O script [deploy.sh](/c:/Users/fabio/OneDrive/Documentos/I.A%20jobs/testes/Guia%20PBEV/Guia-PBEV-Brasil/instagram/pbev-instagram-bot-configurado/deploy.sh) hoje e um update seguro para VPS existente. Ele:
- atualiza dependencias
- garante diretorios e permissoes
- atualiza `systemd`
- valida o Nginx existente sem sobrescrever o vhost
- reinicia o bot e testa o health local

## Troubleshooting

- DM falhando com `(#190) This method must be called with a Page Access Token`:
  use `FACEBOOK_PAGE_ACCESS_TOKEN` extraido de `/me/accounts?fields=id,name,access_token`
- DM falhando com `code 190 / subcode 463` poucas horas depois:
  o valor salvo em `FACEBOOK_PAGE_ACCESS_TOKEN` provavelmente nao e o page token final; refaca o fluxo user token longo -> `/me/accounts` -> page token
- DM falhando mas posts seguem normais:
  confira `python refresh_token.py --check` e, se necessario, rode `python refresh_token.py --sync-page-token`
- DM falhando com `(#230) Requires pages_messaging permission` para o proprio IG:
  confirme que o `main.py` atualizado esta ignorando mensagens do proprio bot
- post repetindo na fila:
  verifique permissoes do SQLite; erro `attempt to write a readonly database` impede marcar `published=True`
- post nao saiu no horario:
  confira se ele tinha `image_url`; sem imagem ele nunca entra no filtro de publicacao
- legenda com URL sem clique:
  esperado no feed do Instagram; use CTA de `link na bio`
- Plausible sem trafego do Instagram:
  `PUBLIC_SITE_URL` deve apontar para `guiapbev.cloud` e `IMAGE_BASE_URL` para `bot.guiapbev.cloud`
- `/me/accounts` vazio no Graph API Explorer:
  refaca a concessao da app em `Business Integrations` e marque a pagina `Guia PBEV Brasil`

## Health e logs

```bash
# Health local
curl http://127.0.0.1:8001/health

# Health publico
curl https://bot.seu-dominio.com/health

# Logs do bot
journalctl -u pbev-instagram-bot -f
```

## Tokens Meta

```bash
# Verificar token de publicacao e token da pagina
python refresh_token.py --check

# Renovar META_ACCESS_TOKEN
python refresh_token.py

# Sincronizar FACEBOOK_PAGE_ACCESS_TOKEN com o token Meta atual
python refresh_token.py --sync-page-token

# Depois de qualquer mudanca de token
systemctl restart pbev-instagram-bot
```

Observacao:
- o estado ideal do check e `Status do token Meta: Valido: Sim` e `Status do token da pagina: Valido: Sim`
- se o check mostrar `Alinhado ao META_ACCESS_TOKEN atual: Nao`, ainda pode estar funcionando, mas vale sincronizar

## Repo privado

Antes do primeiro push para GitHub, revise o guia:
- [PRIVATE_REPO.md](/c:/Users/fabio/OneDrive/Documentos/I.A%20jobs/testes/Guia%20PBEV/Guia-PBEV-Brasil/instagram/pbev-instagram-bot-configurado/PRIVATE_REPO.md)

Ele cobre:
- o que pode e o que nao pode ir para git
- como verificar se este diretorio esta dentro de um repo maior
- como criar um repo privado standalone com push via SSH

## Skills internas do projeto

Este repositorio tambem pode conter skills locais do Codex em `.codex/skills/`.

Uso:
- servem como contexto operacional e editorial para desenvolvimento assistido por IA
- ajudam a padronizar imagem, copy, respostas de DM e operacao do bot

Importante:
- essas skills nao fazem parte do runtime do bot
- nao alteram o comportamento da API em producao por si so
- nao precisam ser copiadas para a VPS para o bot funcionar
- so copie `.codex/skills/` para outro ambiente se quiser reutilizar o mesmo contexto de desenvolvimento com Codex

Skills atuais:
- `pbev-visual-director`: usar para arte, imagem ruim, prompt visual, foto real do carro e composicao
- `pbev-social-copy`: usar para legenda, CTA, tom do post e copy PT-BR
- `pbev-dm-consultor`: usar para DMs, comentarios, persona do EletriBrasil, grounding no catalogo e dedupe
- `pbev-instagram-ops`: usar para preview, fila, republicacao, tokens, VPS e operacao diaria

## Estrutura principal

```text
pbev-instagram-bot/
|-- main.py
|-- config.py
|-- database.py
|-- content_generator.py
|-- image_generator.py
|-- publisher.py
|-- publish.py
|-- manage_queue.py
|-- scheduler.py
|-- sync_catalog.py
|-- vehicle_catalog.py
|-- auto_responder.py
|-- analytics.py
|-- deploy.sh
|-- pbev-instagram-bot.service
|-- README.md
|-- QUICKSTART.md
```
