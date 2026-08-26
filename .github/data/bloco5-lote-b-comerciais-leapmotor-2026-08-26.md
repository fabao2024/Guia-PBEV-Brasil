# Lote B · Bloco 5 — comerciais leves e Leapmotor

Data da verificação/aplicação: 2026-08-26

Fontes: tabela PBEV/Inmetro vigente (atualização de 14/08/2026); páginas, fichas técnicas e comunicados oficiais de Citroën, Fiat, Farizon, Foton e Leapmotor/Stellantis.

## Resultado

O verificador registra **486/763** campos com fonte oficial direta. Este lote acrescentou **29 verificações por campo** ao registro estruturado; a cobertura publicada anteriormente estava defasada em relação ao estado real do arquivo.

## Correções aplicadas

| Veículo | Campo | Antes | Depois |
|---|---|---|---|
| Citroën e-Jumpy | autonomia / consumo | 330 km / 0,75 MJ/km | **258 km / 0,75 MJ/km** (E-JUMPY CARGO na tabela vigente) |
| Leapmotor C10 BEV | recarga DC | 100 kW | **84 kW** |
| Farizon V6E | bateria / recarga | 81 kWh; AC 7 / DC 80 kW | **41,86 kWh; AC 6,6 / DC 41 kW** |
| Farizon SuperVan SV | bateria | 82,9 kWh | **82,33 kWh** |
| Foton eWonder | recarga | AC 7 / DC 60 kW | **AC 6,6 / DC 41,8 kW** |
| Foton eView Grand | versão, preço, autonomia, consumo e recarga | Grand 53; R$ 299.900; 162 km; 0,82 MJ/km; AC 11 / DC 80 kW | **Grand 77; R$ 329.900; 187 km; 1,00 MJ/km; AC 6,6 / DC 77 kW** |
| Fiat e-Scudo | disponibilidade | ativa | **descontinuada** (fora da tabela vigente e sem oferta corrente no site oficial) |

O novo preço da eView Grand foi acrescentado cronologicamente a `src/constants/priceHistory.ts`.

## Valores confirmados sem alteração

- e-Jumpy: 136 cv, bateria de 75 kWh e recarga AC 11 / DC 100 kW.
- Leapmotor B10 BEV: R$ 182.990, 218 cv, 56,2 kWh e 288 km.
- Leapmotor C10 BEV: R$ 204.990, 218 cv, 69,9 kWh e 338 km.
- Farizon SuperVan SV: R$ 425.000, 231 cv e 239 km.
- Farizon V6E: R$ 260.000, 136 cv e 156 km.
- Foton eView Grand 77: 184 cv e 77,28 kWh.
- Foton eWonder: R$ 235.900, 102 cv, 41,86 kWh e 189 km.

## Decisões de pareamento

- A tabela PBEV vigente separa a antiga `EVIEW GRAND53` (162 km / 0,82 MJ/km) da atual `EVIEW GRAND77` (187 km / 1,00 MJ/km). O catálogo representa a versão Grand 77 atualmente ofertada.
- A e-Jumpy foi pareada somente com `E-JUMPY CARGO ELÉTRICO`, combinação inequívoca de marca, modelo, carroceria e motorização.
- A SuperVan de 11 m³ foi mantida em 239 km; as variantes de 8 m³ da tabela têm 262 km e não correspondem à entrada atual.

## Fail-closed (documentado, sem alteração)

- **Farizon SuperVan**: a página específica atual informa bateria de 82,33 kWh, enquanto a página de pré-venda informa 82,88 kWh e recarga DC de 120 kW. A bateria segue a página específica; a recarga do catálogo permanece legada e não verificada até a marca esclarecer a configuração brasileira.
- **Leapmotor B10**: o comunicado oficial brasileiro de 09/04/2026 informa recarga DC de até 140 kW, divergente dos 80 kW legados no catálogo. O campo não foi alterado nem marcado como verificado neste lote.
- **Foton eView Grand 77**: a ficha Ed4 traz 179 km, enquanto a página atual da fabricante e a tabela PBEV vigente trazem 187 km. Para autonomia e consumo prevalece o regulador.

## Verificações

TDD RED→GREEN; 293/293 testes, TypeScript limpo, build Vite, 109 páginas estáticas, scanner de `dist` e verificador de proveniência (486/763) aprovados.
