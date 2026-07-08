# Guia PBEV Monetização e Lead Funnel Implementation Plan

> **Para Hermes:** executar em milestones pequenos, sempre com build/teste antes de commit.

**Goal:** transformar Guia PBEV + Bot Instagram em funil de monetização por leads qualificados, relatórios de mercado e oferta B2B.

**Architecture:** o Guia captura intenção e eventos; o Bot Instagram qualifica DMs/comentários; ambos enviam leads para um backend simples/planilha/CRM. O catálogo permanece fonte única para conteúdo, comparação e atendimento.

**Tech Stack:** React 19 + Vite + TypeScript, Plausible/GA events, Google Sheets/Airtable ou endpoint FastAPI, Instagram Bot Python + SQLite + Meta Graph API.

---

## Milestone 1 — Base técnica confiável

**Objetivo:** garantir que o Guia compila e que o catálogo local está consistente.

**Verificação:**
```bash
npm run build
npm run test:run
```

---

## Milestone 2 — Tracking de intenção

**Objetivo:** medir ações com valor comercial.

**Eventos mínimos:**
- `vehicle_view`
- `compare_start`
- `favorite_add`
- `chat_open`
- `chat_question`
- `lead_cta_click`
- `lead_submit`

---

## Milestone 3 — Captura de leads no Guia

**Objetivo:** converter usuários interessados em oportunidades comerciais.

**MVP:**
- CTA global: “Receber recomendação personalizada”
- CTA no modal do veículo: “Quero cotação / ajuda”
- formulário simples:
  - nome
  - WhatsApp
  - cidade/UF
  - orçamento
  - modelo de interesse
  - interesse: compra, seguro, wallbox, financiamento, frota

**Persistência inicial:**
- MVP salva em `localStorage` e abre e-mail pré-preenchido
- depois: Google Sheets/Airtable/FastAPI

---

## Milestone 4 — Bot Instagram como funil

**Objetivo:** classificar intenção comercial em comentários/DMs e salvar lead.

**Categorias:**
- compra
- seguro
- wallbox/recarga
- financiamento
- frota
- comparação técnica
- suporte genérico

---

## Milestone 5 — Landing comercial /parceiros

**Objetivo:** vender piloto para parceiros.

**Conteúdo:**
- proposta: leads qualificados EV
- canais: Guia + Instagram + IA
- formatos: CPA por lead, pacote mensal, relatório Radar BEV
- CTA: WhatsApp/e-mail
