# Lote Mini · Bloco 5 — fontes oficiais brasileiras e lista de preços ago/26

Data da verificação/aplicação: 2026-08-25
Fontes: página "Lista de Preços Pública" oficial da MINI Brasil (PDF publicado em 04/08/2026, válido 01–31/08/2026), páginas oficiais de modelo em mini.com.br (Cooper elétrico/performance, Aceman, Countryman, JCW), press releases oficiais do BMW Group Brasil (Cooper E 26/09/2024; Countryman SE 24/06/2024; Aceman 18/02/2025; JCW E/JCW Aceman E 02/07/2025) e tabela PBEV/Inmetro vigente.

## Resultado

Cobertura do registro: **400/763** campos verificados (era 381/763; **+19 no lote**). Correções aplicadas somente após aprovação explícita do mantenedor, via TDD RED→GREEN (`src/__tests__/catalogIndicativePrices.test.ts`, dois blocos novos).

Este lote também **fechou o fail-closed do pareamento PBEV das linhas Mini** registrado no lote-pbev-final: a linha homologada do Cooper E é a de 239 km / 0,46 MJ/km e a do JCW-E 3P é a de 306 km / 0,48 MJ/km, confirmadas pelas páginas oficiais (o par restante da tabela pertence às versões Aceman E/SE, Cooper SE e JCW Aceman E, não presentes no catálogo ou já verificadas).

## Marcados como verificados sem alteração de valor

| Veículo | Campos |
|---|---|
| Cooper E | power 184 (release BR), battery 40,7 (mini.pt, bruta), charging AC 11 kW (página performance oficial) |
| JCW-E | power 258, battery 54,2 (release BR 02/07/2025), range_km 306 |
| Aceman SE | power 218, battery 54,2 (release BR 18/02/2025) |
| Countryman SE | power 306, range_km 320 |

`availability` dos 4 veículos marcada como verificada pelas páginas oficiais ativas.

## Correções aplicadas (aprovação explícita em 25/08/2026)

| Veículo | Campo | Antes | Depois |
|---|---|---|---|
| Cooper E | `range_km` | 246 km | **239 km** (PBEV vigente + página oficial; 246 era valor de lançamento) |
| Cooper E | `consumption` | 0,48 MJ/km | **0,46** |
| Cooper E | `price` | R$ 260.990 | **R$ 264.990** (lista ago/26; promoção de R$ 199.990 não é preço de tabela) |
| JCW-E | `consumption` | 0,50 MJ/km | **0,48** |
| JCW-E | `price` | R$ 330.990 (lançamento jul/25) | **R$ 349.990** (lista ago/26) |
| Aceman SE | `price` | R$ 304.990 (lançamento fev/25) | **R$ 325.990** (lista ago/26) |
| Countryman SE | `battery` | 64,6 kWh | **66,45 kWh** (bruta, release BR; 64,6 corresponde à útil divulgada pela MINI Portugal) |
| Countryman SE | `price` | R$ 340.990 | **R$ 409.990** (página oficial atual do modelo) |

Snapshots `2026-08` registrados no histórico de preços para os quatro veículos.

## Fail-closed (documentado, sem alteração)

- **Carregamento DC**: Cooper E 75 kW, JCW-E 95 kW e Aceman SE 95 kW não constam de fonte oficial brasileira (a página oficial cita estação de carga "CC 100 kW/250 A", que descreve o equipamento e não o teto do veículo); campos permanecem `legacy_unverified`.
- **Charging AC 11 kW do Countryman SE**: número não publicado em fonte oficial brasileira.
- Conflitos oficiais registrados para acompanhamento: FAQ do site MINI afirma "até 330 km" para o Cooper elétrico, contradizendo os máximos exibidos na própria página (312/239 km); página JCW exibe bateria "54,46 kWh" contra 54,2 kWh do release; dois preços simultâneos para o JCW E no site (R$ 340.990 × R$ 349.990 — prevaleceu a lista de preços ago/26).
- A lista de preços de agosto/2026 não traz nenhuma versão elétrica do Countryman; prevaleceu a página atual do modelo para preço e disponibilidade, com ressalva registrada.

## Verificações

`npm run test:run` 287/287 · TypeScript limpo · build Vite · rotas estáticas · scanner de `dist` · verificador de proveniência (400/763).
