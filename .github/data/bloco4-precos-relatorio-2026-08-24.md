# Bloco 4 — Preços indicativos: relatório de divergências (agosto/2026)

Data: 24/08/2026 · Pesquisa read-only, nada alterado ainda.

## Metodologia

- Fonte prioritária: site oficial da marca (hierarquia `official_manufacturer`).
- Secundária: mídia especialista com data verificável (Autoesporte, Quatro Rodas, EVblog).
- Excluídos: Tabela FIPE (valor de usado, não serve para "preço a partir de") e agregadores sem fonte.
- Promoções temporárias (ex.: "Por R$ X até 31/08") NÃO são preço de tabela — ignoradas por design, igual à campanha Move Brasil da BYD.
- Só propus mudança onde a versão do catálogo bate exatamente com a versão da fonte.

## Confirmados iguais ao catálogo (sem ação) — 8 verificados

| Modelo | Catálogo | Evidência |
|---|---|---|
| BYD Dolphin Mini GL | 118.990 | byd.com/br/ofertas "De" válido até 31/08 |
| BYD Dolphin GS | 149.990 | byd.com/br/ofertas + evblog atualizado em 24/08 |
| GAC Aion UT Premium | 139.990 | Autoesporte + evblog (atualizado em 01/08) |
| GAC Aion UT Elite | 159.990 | Autoesporte (lançamento) |
| Geely EX2 Pro | 123.800 | geelybrasil.com.br oficial |
| Geely EX2 Max | 136.800 | geelybrasil.com.br oficial |
| BMW iX2 xDrive30 M Sport | 495.950 | bmw.com.br, condições 01–31/08/2026 |
| BMW iX3 50 xDrive | 582.950 | bmw.com.br, condições 27/07–31/08/2026 |

## Divergência confirmada (proposta de correção)

| Modelo | Catálogo | Fonte oficial | Delta |
|---|---|---|---|
| BMW i7 xDrive60 M Sport | 1.321.950 | **1.373.950** (bmw.com.br, ano/mod 2025/2026, válido 01–31/08/2026) | +52.000 |

## Ambíguos — NÃO mexer sem decisão sua

1. **Hyundai Ioniq 5**: catálogo 394.990. Naz diz "a partir de R$ 339.990"; evblog/julho 349.990; página oficial Hyundai não expõe preço no HTML. Pode haver versão nova mais barata ou erro dos agregadores.
2. **Chevrolet Equinox EV**: catálogo 349.990. O "Equinox 2026" da Chevrolet BR é o turbo a combustão (291.190), não o EV. Última notícia confiável do EV: R$ 349.990 (Quatro Rodas, ago/2025). Sem evidência agosto/2026.
3. **Mercedes EQA 250**: catálogo 369.900. Naz aponta 379.900 (e facelift 250+ a 399.900 chegando no 2º semestre); evblog ainda 349.990. Reajuste plausível mas fontes conflitam entre si.

## Não verificados nesta rodada (~90 modelos restantes)

Marcas sem preço público acessível no HTML (MG, GWM, Volvo, Porsche etc.) ficaram fora; exigiria navegação interativa ou contato. Sugestão: tratar em rodadas futuras marca a marca.

## Próximos passos (após sua aprovação)

1. Aplicar só o i7 xDrive60 → 1.373.950 via TDD (teste novo, depois constants.ts + regenerar artefatos).
2. Validar (testes, tsc, build, scanner), commit, push, verificar CI e produção.
3. Atualizar `catalogEvidence.ts` se necessário (marketHistoryThrough continua julho/2026 até termos varredura completa; ou mover para "agosto/2026 parcial").
