# Lote A (carros de passeio) · Bloco 5 — VW, Ford, Fiat, Omoda, Suzuki e CAOA

Data da verificação/aplicação: 2026-08-26
Fontes: páginas oficiais vw.com.br, ford.com.br, 500e.fiat.com.br, omodajaecoo.com.br (+ ficha oficial rev. 07/05/2025), suzikiveiculos.com.br (+ ficha técnica oficial fev/2026), avatr.caoachangan.com.br, caochery.com.br; ficha técnica oficial Ford Mustang Mach-E BR; tabela PBEV/Inmetro vigente.

## Resultado

Cobertura do registro: **456/763** campos verificados (era 435/763; **+21 no lote**). Correções aplicadas somente após aprovação explícita do mantenedor, via TDD RED→GREEN (`src/__tests__/catalogIndicativePrices.test.ts`, dois blocos novos).

## Correções aplicadas (aprovação explícita em 26/08/2026)

| Veículo | Campo | Antes | Depois |
|---|---|---|---|
| VW ID.Buzz | `range_km` | 341 km | **337 km** (página oficial: "337 Km INMETRO"; bateria 77 útil/82 brutos confirmada na mesma página) |
| Ford e-Transit | `power` | 198 cv | **269 cv** — o catálogo havia lido "198 kW" como cv ("E-Motor 198 kW com 269cv") |
| Ford e-Transit | `charging` AC | 11,3 kW | **11,5 kW** |
| Omoda E5 | `battery` | 61 kWh | **61,1 kWh** (ficha oficial; "Blade" removido do texto — a marca não declara fornecedor) |
| Avatr 11 | `power` | 585 cv | **578 cv** (site oficial atual; 585 era o número do release de lançamento — conflito entre fontes oficiais registrado) |
| Chery iCar EQ | disponibilidade | à venda | **descontinuado** — removido de caochery.com.br; vendas suspensas desde mar/2026 |

## Marcados como verificados sem alteração de valor

- Mustang Mach-E: range 379 km (INMETRO), power 487, battery 91 útil, charging AC 11/DC 150 — todos pela ficha técnica oficial Ford BR.
- ID.Buzz: power 204, battery 77 (útil), availability via Sign&Drive.
- E-Transit: battery 68, availability (site ativo; preços retirados).
- Fiat 500e Icon: availability (microsite oficial ativo; estoque ano 2022).
- Omoda E5: price R$ 209.990 (tabela), power 204, availability.
- Suzuki e-Vitara 4Style 4x4: price R$ 269.990 (tabela; promoção R$ 219.990 não é preço de tabela), power 184, availability.
- Avatr 11: price R$ 599.990 (5 lugares), availability.

## Fail-closed (documentado, sem alteração)

- **VW ID.4**: a hipótese de descontinuação é falsa — a VW anunciou (11/06/2026) a passagem da assinatura para venda regular no varejo ainda em 2026, em configuração mais avançada que a da assinatura. Especificações e preço da versão de varejo ainda não foram publicados; todos os campos permanecem legados até o lançamento.
- **Preços sem fonte oficial pública**: ID.Buzz (produto de assinatura), ID.4, e-Transit ("Consulte sua Concessionária"), Mach-E (reajuste reportado para R$ 449 mil apenas por veículos especializados + FIPE — insuficiente como fonte), 500e Icon (configurador "valor não disponível"), iCar EQ (fora de venda; R$ 119.990 era promoção de ago/2023).
- **Suzuki e-Vitara**: bateria permanece não informada no catálogo (ficha oficial BR não publica kWh; imprensa aponta 61 kWh LFP); carregamentos AC 11 / DC 100 do catálogo não conferem com nenhuma fonte (imprensa cita AC 7 / DC 150; oficial publica só tempo) — mantidos legados até posicionamento oficial da Suzuki Brasil.
- **Omoda E5 AC**: imprensa com fonte da marca indica 9,9 kW contra 11 kW do catálogo; ficha oficial não informa — mantido legado.
- **Avatr 11**: carregamento AC/DC sem publicação oficial; bateria 116 kWh aguarda citação textual direta da página oficial.
- **iCar EQ**: demais campos permanecem legados (evidência principal é snapshot arquivado da página oficial).
- Conflito E-Transit: site Ford diz "até 193 km (INMETRO)" contra 203 km da tabela PBEV vigente — prevalece o regulador.

## Verificações

`npm run test:run` 291/291 · TypeScript limpo · build Vite · rotas estáticas · scanner de `dist` · verificador de proveniência (456/763).
