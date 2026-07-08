# PBEV local sync workflow

Este script mantém os clones locais do Windows alinhados com o GitHub sem fazer merge ou push automático.

## Quando usar

Use antes de abrir VS Code/Antigravity, ou quando o Hermes/VPS tiver feito alterações e você quiser atualizar os clones locais.

## Repositórios cobertos

| Projeto | Pasta local |
|---|---|
| Guia PBEV Brasil | `C:\Users\fabio\Guia-PBEV-Brasil` |
| Bot Instagram | `C:\Users\fabio\OneDrive\Documentos\I.A jobs\testes\Guia PBEV\pbev-instagram-bot` |

## Rodar no PowerShell

```powershell
cd "C:\Users\fabio\Guia-PBEV-Brasil"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\tools\sync-pbev.ps1
```

Ou de qualquer pasta:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\fabio\Guia-PBEV-Brasil\tools\sync-pbev.ps1"
```

## Garantias de segurança

O script:

- faz `git fetch origin --prune`
- faz `git pull --ff-only` somente se o working tree estiver limpo
- não faz merge automático
- não faz rebase automático
- não faz push automático
- bloqueia se houver alterações locais, commits locais ou divergência

## Se bloquear

Rode no repo indicado:

```powershell
git status
git log --oneline --decorate -5
```

E decida uma das opções:

- commitar suas alterações locais
- guardar com `git stash`
- descartar com `git restore .`, somente se tiver certeza

## Fonte da verdade

GitHub é a fonte da verdade. Fluxo correto:

```text
Qualquer origem de alteração
→ commit
→ push origin main
→ demais ambientes fazem pull seguro
```
