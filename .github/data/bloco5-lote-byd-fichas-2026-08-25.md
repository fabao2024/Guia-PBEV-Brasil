# Lote BYD · Bloco 5 — fichas técnicas oficiais por modelo

Data da verificação/aplicação: 2026-08-25
Fontes: fichas técnicas oficiais BYD Brasil por modelo ("Revisado em: 09/07/2026"), linkadas em cada página de modelo em byd.com.br (`/material/__CN/byd-site/br/fichas-tecnicas-2026/update-13-07-2026/07-13-2026---ficha-txiunica/BYD_<Modelo>_V2.pdf`); páginas oficiais dos modelos; `/br/condicoes` (atualizada em 20/08/2026).

## Resultado

Cobertura do registro: **339/763** campos verificados (era 307/763; **+32 no lote**). Correções de valor aplicadas somente após aprovação explícita do mantenedor, via TDD RED→GREEN (`src/__tests__/catalogIndicativePrices.test.ts`, dois blocos novos).

## Marcados como verificados sem alteração de valor

| Veículo | Campos |
|---|---|
| Dolphin Mini GL | range_km 224, power 75, battery 30,08, charging 6,6/30 |
| Dolphin Mini GS | power 75 |
| Dolphin GS | power 95, battery 44,9, charging DC 60 |
| Dolphin Plus | power 204, charging 11/80, availability (página do modelo ativa) |
| Dolphin Special Edition | range_km 272, power 177, battery 45,12, charging 6,6/80 |
| Han EV | power 517, battery 85,4 |
| Seal AWD | power 531 |
| Sealion 7 | power 531, battery 82,5, charging 11/150 |
| Tan EV | power 517, battery 108,8 |
| Yuan Pro | power 177 |

Consumo energético (MJ/km) conferido nas fichas para 10 modelos: todos idênticos aos valores já verificados pela tabela PBEV (Mini GL 0,39 · Mini GS 0,41 · Dolphin GS 0,42 · Plus 0,51 · SE 0,49 · Yuan Pro 0,51 · Seal AWD 0,62 · Sealion 7 0,66 · Tan 0,73 · Han 0,69).

## Correções aplicadas (aprovação explícita em 25/08/2026)

| Veículo | Campo | Antes | Depois |
|---|---|---|---|
| Dolphin Mini GS | `battery` | 38 kWh | **38,88 kWh** |
| Dolphin Mini GS | `charging` DC | 30 kW | **40 kW** |
| Dolphin GS | `charging` AC | 7 kW | **6,6 kW** |
| Dolphin Plus | `battery` | 60,4 kWh | **60,48 kWh** |
| Han EV | `charging` AC | 11 kW | **6,6 kW** |
| Seal AWD | `battery` | 82,5 kWh | **82,56 kWh** |
| Seal AWD | `charging` AC | 11 kW | **6,6 kW** (registro de proveniência reancorado na ficha) |
| Tan EV | `charging` DC | 110 kW | **170 kW** |
| Yuan Pro | `battery` | 45 kWh | **45,12 kWh** |
| Yuan Pro | `charging` AC/DC | 7 / 60 kW | **6,6 / 65 kW** |

Os textos correspondentes em `features` foram alinhados a cada alteração.

Observação Tan EV: a página oficial do modelo traz texto "recarregado de 30% a 80% … corrente contínua de 110 kW", enquanto a ficha técnica oficial (documento técnico mais recente, 09/07/2026) indica 170 kW DC. O mantenedor optou pela ficha técnica, com a divergência entre fontes oficiais registrada aqui.

## Fail-closed (documentado, sem alteração)

- **Yuan Plus FWD**: fora da linha atual; a página oficial `/car/yuan-plus` documenta apenas a versão AWD. Campos `price`, `range_km`, `power`, `battery`, `charging` permanecem `legacy_unverified`, pendentes da decisão já registrada no handoff sobre manter/atualizar a entrada.
- **eT3**: descontinuado; sem página nem ficha no site atual. Permanece como está.
- **Preços**: `/condicoes` (20/08/2026) confirma os preços já verificados (Mini GL R$ 109.990, Mini GS R$ 119.990, Yuan Pro R$ 182.990, Seal AWD R$ 299.990). Preços de Dolphin GS/Plus/SE, Yuan Plus FWD/AWD, Sealion 7, Han EV e Tan EV não constam do documento atual e permanecem como estão.

## Verificações

`npm run test:run` 283/283 · TypeScript limpo · build Vite · rotas estáticas · scanner de `dist` · verificador de proveniência (339/763).
