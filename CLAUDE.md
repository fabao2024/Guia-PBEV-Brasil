# CLAUDE.md · Guia PBEV Brasil público

## Escopo

Este repositório contém o frontend público do Guia PBEV Brasil, publicado em `https://guiapbev.cloud`.

Não adicionar aqui dashboards administrativos, Kanbans internos, dados pessoais, informações de parceiros, regras privadas de matching/deduplicação, credenciais, IPs, paths pessoais, cron jobs ou runbooks de infraestrutura.

## Stack

- React 19 + TypeScript strict
- Vite 6
- Tailwind CSS 4
- Vitest + Testing Library
- GitHub Pages via GitHub Actions

## Comandos

```bash
npm install
npm run dev
npm run test:run
npm run build
```

## Regras de desenvolvimento

1. Leia `ROADMAP.md` antes de iniciar uma mudança.
2. Use TDD para alterações funcionais.
3. Mantenha textos públicos claros, verificáveis e sem promessas não implementadas.
4. Formulários com dados pessoais exigem consentimento explícito e contrato versionado.
5. APIs externas devem aparecer apenas como contratos públicos mínimos no cliente.
6. Nunca inclua segredos em variáveis `VITE_*`; todo valor `VITE_*` pode chegar ao navegador.
7. Execute `npm run test:run`, `npm run build` e o scanner de `dist` antes do commit.
8. Restaure artefatos gerados incidentalmente quando não fizerem parte da mudança.
9. Atualize `ROADMAP.md` e `DEVLOG.md` somente com informações adequadas ao público.

## Git

- `main` é a fonte de verdade do frontend público.
- Antes do push: `git pull --rebase origin main`.
- Nunca use force push ou merge commit em `main`.
- Faça push imediatamente após cada commit aprovado.

## Fronteira público/privado

Adequado ao repo público:

- componentes React;
- dados públicos de veículos;
- testes frontend;
- scripts de build estático;
- workflows de CI/CD do site;
- arquitetura e metodologia públicas.

Não adequado:

- código do backend administrativo;
- dashboards e Kanbans internos;
- scripts de operação pessoal;
- dados ou condições individuais de parceiros;
- detalhes de máquinas, redes ou credenciais.
