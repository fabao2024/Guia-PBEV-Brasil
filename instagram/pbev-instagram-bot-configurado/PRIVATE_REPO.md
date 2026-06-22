# Private Repo Bootstrap

Este projeto esta pronto para virar um repositorio privado, mas o push inicial deve ser feito com alguns cuidados.

## O que pode ir para o repo privado

- codigo-fonte do bot
- docs operacionais
- `.env.example`
- configs de `systemd` e Nginx como referencia
- scripts de setup, deploy e diagnostico
- `.codex/skills/` se voce quiser versionar o contexto interno de desenvolvimento com Codex

## O que nao deve ir para git

- `.env`
- `pbev_instagram.db`
- tokens Meta, Gemini e Plausible
- chaves SSH, `.pem`, `.key`, `.crt`
- imagens geradas em `generated_images/`
- caches e artefatos locais

## Verificacao rapida antes do primeiro commit

No diretorio do projeto:

```bash
git status --ignored
```

Confirme que estes itens aparecem como ignorados:

- `.env`
- `pbev_instagram.db`
- `generated_images/`

## Importante sobre este diretorio

Hoje este projeto aparenta estar dentro de um repositorio maior. Antes de criar o repo privado dele, confira o topo do git atual:

```bash
git rev-parse --show-toplevel
```

Se o resultado for um diretorio acima deste projeto, faca um repositorio separado so para esta pasta.

Fluxo recomendado:

```powershell
Copy-Item "C:\CAMINHO\pbev-instagram-bot-configurado" -Destination "C:\Users\fabio\OneDrive\Documentos\Repos\PBEV-Instagram-Automation" -Recurse
Set-Location "C:\Users\fabio\OneDrive\Documentos\Repos\PBEV-Instagram-Automation"
```

## Criando um repo privado standalone

No PowerShell, dentro desta pasta:

```powershell
git init
git branch -M main
git add .
git commit -m "Initial private repo bootstrap"
```

Depois de criar o repo privado no GitHub:

```powershell
git remote add origin git@github.com:SEU_USUARIO/SEU_REPO_PRIVADO.git
git push -u origin main
```

## Recomendacao de acesso

Prefira remoto SSH, nao HTTPS com senha.

Exemplo:

```powershell
git remote set-url origin git@github.com:SEU_USUARIO/SEU_REPO_PRIVADO.git
```

## SSH recomendado

GitHub:

```powershell
ssh -T git@github.com
```

VPS:

```powershell
ssh root@SEU_IP
scp .\README.md root@SEU_IP:/tmp/README.md
```

Se o acesso SSH estiver funcionando, prefira sempre `git@github.com:...` no remoto e `scp`/`ssh` para a VPS.

## Quando a VPS nao usa git

Em algumas VPS este projeto pode estar em `/opt/pbev-instagram-bot` sem `.git`.
Nesse caso, `deploy.sh` apenas reinstala dependencias e reinicia o servico; ele nao baixa codigo novo.

Observacao:
- `.codex/skills/` nao faz parte do runtime do bot
- essa pasta nao precisa ser copiada para a VPS para a automacao funcionar
- ela so e util para reaproveitar o mesmo contexto de desenvolvimento assistido por Codex

Fluxo operacional recomendado:

1. editar e validar localmente
2. usar a raiz do projeto como fonte da verdade
3. se existir copia em `PBEV-Instagram-Automation-push-temp/`, espelhar a mesma mudanca antes do deploy
4. validar com `python -m py_compile` nos arquivos alterados na raiz e no `push-temp`
5. copiar arquivos alterados com `scp`
6. rodar `bash deploy.sh` na VPS

Regra permanente:
- nunca aplicar uma correcao somente em `PBEV-Instagram-Automation-push-temp/`
- toda manutencao deve nascer na raiz e terminar com os diretorios alinhados
- se os dois diretorios divergirem, corrija a raiz primeiro e depois replique a mudanca compativel no `push-temp`

Exemplo real:

```powershell
Set-Location "C:\Users\fabio\OneDrive\Documentos\I.A jobs\testes\Guia PBEV\Guia-PBEV-Brasil\instagram\pbev-instagram-bot-configurado"
scp .\main.py .\manage_queue.py .\config.py .\image_generator.py root@SEU_HOST:/opt/pbev-instagram-bot/
```

Na VPS:

```bash
cd /opt/pbev-instagram-bot
source venv/bin/activate
bash deploy.sh
```

## Arquivos que costumam exigir copy manual

Durante manutencao do bot, estes arquivos mudam com frequencia e podem precisar de `scp` para a VPS:

- `main.py`
- `manage_queue.py`
- `config.py`
- `image_generator.py`
- `content_generator.py`
- `analytics.py`
- `publisher.py`
- `scheduler.py`
- `requirements.txt`
- `README.md`
- `QUICKSTART.md`

Se `requirements.txt` mudar, lembre de reinstalar dependencias na VPS:

```bash
cd /opt/pbev-instagram-bot
source venv/bin/activate
pip install -r requirements.txt
```

Exemplo: suporte a imagens `.avif` exigiu update de `requirements.txt` com `pillow-avif-plugin`.

## Nunca copie para o repo privado

Mesmo em repo privado, nao suba:

- `.env`
- dumps de banco
- tokens colados em scripts temporarios
- capturas de tela com access token visivel no terminal
- logs com `access_token=` em query string

Se precisar compartilhar logs, mascare o token antes.

## Estrategia recomendada

Use dois repositorios:

1. privado: operacao real, integrações, deploy e manutencao
2. publico: showcase sanitizado para portfolio

O repo publico deve ser derivado do privado, e nao o contrario.

## Checklist do repo privado

- `.gitignore` revisado
- `.env` fora do git
- banco SQLite fora do git
- docs atualizadas
- token real nunca copiado para README, QUICKSTART ou scripts
- push inicial feito para repo GitHub privado
