# Lote GWM + Porsche + Zeekr + Neta · Bloco 5 — fontes oficiais por marca

Data da verificação/aplicação: 2026-08-25/26
Fontes: páginas oficiais gwmmotors.com.br (especificações e condições comerciais), porsche.com/brazil (páginas de modelo e configurador), newsroom.porsche.com (Q&A do Cayenne Electric 19/11/2025; PDF técnico do Taycan com Performance Battery Plus, MY 02/2024), zeekrlife.com (domínio oficial — zeekr.com.br redireciona para ele; páginas de modelo e releases 21/08/2025 e 22/06/2026), netaauto.com.br (páginas Neta Aya e Neta X) e tabela PBEV/Inmetro vigente.

## Resultado

Cobertura do registro: **435/763** campos verificados (era 400/763; **+35 no lote**). Correções aplicadas somente após aprovação explícita do mantenedor, via TDD RED→GREEN (`src/__tests__/catalogIndicativePrices.test.ts`, dois blocos novos).

## Correções aplicadas (aprovação explícita em 25/08/2026)

| Veículo | Campo | Antes | Depois |
|---|---|---|---|
| GWM Ora 5 | `price` | R$ 159.000 (= lançamento jun/26) | **R$ 163.990** (página do modelo e condições comerciais; snapshot no histórico) |
| Porsche Cayenne EV | `power` | 435 cv | **442 cv** (Overboost com Controle de largada, página oficial BR) |
| Porsche Cayenne EV | `battery` | 113,2 kWh | **113 kWh** bruta (newsroom; o 113,2 não tinha fonte) |
| Porsche Cayenne EV | `charging` DC | 320 kW | **390 kW** (até 400 kW em condições específicas; página BR) |
| Porsche Macan EV | `consumption` | 0,61 MJ/km | **0,60** — linha MACAN E4 da tabela PBEV é a de 443 km: o catálogo corresponde ao Macan 4 AWD, resolvendo o fail-closed de variantes |
| Porsche Macan EV | `price` | R$ 560.000 (= lançamento da versão RWD descontinuada) | **R$ 690.000** ("Macan 4 — a partir de"; snapshot no histórico) |
| Porsche Taycan 4S | `price` | R$ 980.000 (MY26) | **R$ 1.080.000** (MY27 no configurador; versão vendida hoje é o Cross Turismo; snapshot) |
| Neta X 500 | `battery` | 52 kWh (NMC) | **64,1 kWh LFP CATL** (site oficial; os 52,5 kWh são da versão X 400) |

## Marcados como verificados sem alteração de valor

- GWM Ora 03 Skin BEV58: price R$ 169.000 (preço público confirmado nas condições comerciais), power 171, battery 58, availability.
- GWM Ora 5: power 204, battery 58.3, availability.
- Porsche: Cayenne EV price R$ 900.000 + range/consumption já regulatórios + availability; Macan 4 power 408 Overboost, battery 100 kWh bruta, range 443, availability; Taycan 4S power 598, battery 105 bruta/97 útil, charging AC 11 kW / DC 320 kW (PDF técnico oficial), availability.
- Zeekr: 001 Premium 544 cv / 100 kWh / 426 km / availability; 7X Flagship AWD 646 cv / 100 kWh / 423 km / availability; Zeekr X Premium RWD 272 cv / 66 kWh / 332 km / availability (páginas e releases oficiais).
- Neta: potências 95 cv (Aya) e 163 cv (X 500) pelas páginas oficiais.

## Fail-closed (documentado, sem alteração)

- **Preços**: Zeekr ×3 e Neta ×2 permanecem como estão (valores do catálogo são de lançamento/pré-venda; a marca não publica tabela aberta atual); GWM Skin BEV48/GT BEV63 fora de venda sem preço atual; FIPE/imprensa indicam valores maiores, mas não são fontes aceitas.
- **Carregamentos**: Zeekr ×3 (documentos oficiais publicam só tempos, sem kW), GWM Ora 5 AC 11 kW (sem citação textual própria da marca), Ora 03 BEV58 AC/DC (constam apenas como imagem no PDF da ficha), Macan EV AC (página BR exibe só DC >270 kW).
- **Neta**: autonomias/consumos permanecem legados (site cita valores "PBEV", mas nenhum modelo consta da tabela vigente); disponibilidade ambígua (site ativo com "Quero comprar", porém zero concessionárias desde ago/2026 segundo apurações — marca nega saída).
- **GWM Ora 03 Skin BEV48 e GT BEV63**: já marcados descontinuados em triagem anterior; as fichas oficiais que confirmavam specs saíram do ar (404), então power/battery/charging permanecem legados.

## Renomeações avaliadas e não aplicadas

"Macan EV" → "Macan 4" e "Taycan 4S" → "Taycan 4S Cross Turismo" refletiriam a nomenclatura atual, mas os slugs públicos derivam do nome do modelo (`toSlug(brand, model)`), então a mudança alteraria URLs canônicas sem mecanismo de redirecionamento. Mantidos os nomes atuais, com a correspondência de versão registrada neste relatório.

## Anomalias oficiais registradas

- Página do GWM Ora 5 exibe bloco "243 cv / 540 Nm" que contradiz 204 cv/260 Nm do restante da página e do release (erro aparente de template; prevalece 204 cv).
- Ficha oficial do Zeekr 7X traz "645 cv" contra "646 cv" do release da marca (catálogo mantém 646).
- `/models/7x` retorna 404 na Zeekr, mas a homepage segue listando o 7X com CTAs de compra/reserva.
- FAQ do site MINI (lote anterior) e demais conflitos seguem registrados nos relatórios respectivos.

## Verificações

`npm run test:run` 289/289 · TypeScript limpo · build Vite · rotas estáticas · scanner de `dist` · verificador de proveniência (435/763).
