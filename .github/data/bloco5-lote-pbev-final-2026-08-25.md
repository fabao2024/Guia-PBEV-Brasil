# Lote PBEV final · Bloco 5 — pareamento caso a caso da tabela vigente

Data da verificação/aplicação: 2026-08-25
Fonte: `Tabela PBEV 2026_14_AGOd.pdf` (download direto da página oficial do Inmetro; SHA-256 `CB8AB267…79DB2B`; o arquivo é servido sob o nome histórico `mascara-pbev-2026_19_jan-rev01.pdf`, rótulo oficial "Tabela PBEV 2026_14_AGOd").
Método de extração: texto do PDF convertido e varrido por padrão de cauda `<cidade> <estrada> <MJ/km> <autonomia> <graus>`; 196 linhas elétricas extraídas (com duplicidades entre páginas); pareamento manual auditado por família, com contexto de nome.

## Resultado

Cobertura do registro: **307/763** campos verificados (era 267/763; **+40 no lote**). Todas as correções foram aprovadas explicitamente pelo mantenedor e aplicadas via TDD RED→GREEN (`src/__tests__/catalogIndicativePrices.test.ts`, bloco final).

## Pacote A — valor idêntico, marcados como verificados

Kwid E-Tech 0,44 · GWM Ora 5 0,49/349 · Fiat 500e Icon 0,46/227 · Mini Aceman SE 0,52/270 · Dolphin Plus 0,51 · Leapmotor C10 BEV 0,61/338 · Yuan Plus 0,56/294 · Chevrolet Equinox EV 0,56/443 · Volvo EX30 Ultra 0,62/316 · Porsche Cayenne EV 0,63/493 · Porsche Taycan 4S 0,69/415.

Observações relevantes: Equinox EV e Leapmotor C10 **constam da edição vigente** (hipótese anterior de ausência refutada).

## Pacote B — correções de consumo (9)

Dolphin Mini GS 0,39→**0,41** · Dolphin GS 0,51→**0,42** · Ora 03 Skin BEV48 0,51→**0,52** · Ora 03 GT BEV63 0,51→**0,54** · MG4 Comfort 0,59→**0,50** · MG4 Luxury 0,59→**0,50** · Zeekr X 0,59→**0,55** · EX30 Plus 0,57→**0,55** · EX40 (XC40) 0,59→**0,55** com autonomia 385→**364 km** (alinha com a página oficial Volvo da versão Single Motor vendida).

## Pacote C — preenchimentos (6 + 1 verificação)

Dolphin Mini GL **0,39** · Dolphin Special Edition **0,49** · Yuan Plus AWD **0,58** (autonomia 378 já verificada) · Geely EX2 Pro **0,39** · Leapmotor B10 BEV **0,55** · iEV330P **0,75** com autonomia 226 km confirmada pelo regulador (o nome comercial "330" não corresponde à homologação Inmetro).

## Pacote D — correções de autonomia + consumo (3)

BMW iX xDrive40 329→**327 km**, consumo **0,59** (bate com a página oficial BMW) · Blazer EV RS 483→**481 km**, consumo **0,63** · Audi Q8 e-tron 332→**424 km**, consumo **0,61** (versão 55 atual da linha).

## Fail-closed (documentado, sem alteração)

- **Mini Cooper E / JCW**: múltiplas linhas próximas na tabela (239/253/270/306/312/312) sem correspondência unívoca com as versões do catálogo — requererá captura das fichas MINI Brasil.
- **Porsche Macan**: quatro variantes homologadas (443/435/438/441 km); a linha de 443 km traz 0,60 MJ/km contra 0,60→0,61 do catálogo — mapeamento de versão pendente.
- **Audi e-tron GT**: apenas a linha RS identificada com clareza (0,80/348) — composição atual da família pendente de triagem.
- **Vans Stellantis**: tabela lista somente variantes Cargo (258 km) — os e-Expert/e-Jumpy/e-Scudo do catálogo (330/330/289 km) não têm pareamento.
- **Ausentes confirmados da edição vigente**: Kona EV, ID.4, ID. Buzz, Neta Aya/X500, Ariya, i4 eDrive35, Mustang Mach-E, iCar EQ.

## Verificações

`npm run test:run` 280/280 · TypeScript limpo · build Vite · rotas estáticas · scanner de `dist` · verificador de proveniência (307/763).
