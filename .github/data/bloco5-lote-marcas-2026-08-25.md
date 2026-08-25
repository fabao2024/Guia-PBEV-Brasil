# Lotes por marca · Bloco 5 — BYD, BMW, Chevrolet, Hyundai e Mercedes-Benz

Data da verificação: 2026-08-25
Matriz de referência: `.github/data/bloco5-matriz-proveniencia-2026-08-25.md`
Piloto anterior: `.github/data/bloco5-lote-piloto-volvo-2026-08-25.md`

## Desfecho das propostas (2026-08-25)

Aprovação explícita do mantenedor aplicada via TDD no mesmo dia: as oito correções do pacote principal e as duas do pacote estendido foram aplicadas ao catálogo com teste de regressão (`src/__tests__/catalogIndicativePrices.test.ts`), snapshots em `src/constants/priceHistory.ts` e regeneração dos artefatos. Os campos corrigidos com fonte oficial direta foram marcados como `verified`; potência e carregamento CA do EQE 350 permanecem sem marcação porque a evidência disponível é de imprensa especializada, não fonte direta.

## Resultado

Cobertura do registro: 33/763 campos verificados (19 no fim do piloto). Nenhum valor do catálogo foi alterado nestes lotes; divergências estão listadas para decisão.

### Campos verificados (14 novos)

| Veículo | Campos | Fonte |
|---|---|---|
| `chevrolet-spark-euv` | `price` (R$ 144.990), `range_km` (258 km), `power` (102 cv), `battery` (42 kWh) | chevrolet.com.br |
| `chevrolet-captiva-ev` | `range_km` (304 km PBEV), `battery` (60 kWh) | chevrolet.com.br |
| `hyundai-ioniq-5` | `range_km` (374 km), `power` (325 cv) | hyundai.com.br |
| `mercedes-benz-eqa-250` | `power` (190 cv), `battery` (66,5 kWh), `charging` (11 kW CA / 100 kW CC) | imprensa.mercedes-benz.com.br |
| `bmw-ix2-xdrive30` | `price` (R$ 495.950), `battery` (64,8 kWh) | bmw.com.br |
| `byd-sealion-7` | `price` (R$ 339.990) | byd.com/br |

### Divergências registradas — propostas de correção submetidas a aprovação

| Veículo | Campo | Catálogo | Evidência oficial | Fonte |
|---|---|---|---|---|
| Volvo EX30 Plus | preço | 239.950 | 249.950 (landing vigente ago/2026; specs defasada) | volvocars.com |
| Volvo EX30 Ultra | preço | 309.950 | 319.950 (idem) | volvocars.com |
| Volvo EX40 | preço | 342.950 | 329.950 | volvocars.com specs |
| Volvo EC40 | preço | 359.950 | 334.950 | volvocars.com specs |
| Volvo EX90 | preço | 849.990 | 849.950 | volvocars.com specs |
| Volvo EX90 | potência | 408 cv | 517 cv (380 kW); torque 92,8 kgfm vs 78,5 | volvocars.com specs |
| Chevrolet Blazer EV RS | preço | 489.000 | 503.190 | chevrolet.com.br (home) |
| Mercedes-Benz EQA 250 | autonomia | 370 km | até 321 km (Inmetro, linha atual) | imprensa.mercedes-benz.com.br |

### Divergências registradas — sem proposta (fail-closed)

| Veículo | Campo | Catálogo | Observação |
|---|---|---|---|
| BYD Seal AWD | preço | 269.990 | Documento oficial ago/2026 indica Seal 2026/2027 a R$ 299.990; versão AWD pode ter saído de linha |
| BYD Dolphin Plus | preço | 179.800 | Fontes secundárias convergem em R$ 184.800; falta página oficial com preço |
| BYD Yuan Pro | preço | 182.900 | Três valores oficiais distintos desde o lançamento (182.800/182.900/182.990) |
| BYD Yuan Plus | preço | 229.800 | Valores secundários divergentes (235.800/235.990) |
| BYD Dolphin Mini GL/GS | preço | 118.990/119.990? | Promoções de agosto/2026 misturadas à tabela; GS com evidência contraditória entre documento oficial e imprensa |
| BMW i4 eDrive35 | preço/versão | 449.950 | Linha oficial atual exibe apenas eDrive40 (582.950) e M50 (675.950); catálogo mistura especificações das versões |
| BMW iX xDrive40 | autonomia | 329 km | Página oficial/dealer cita 327 km PBEV; preço confirmado só em dealer |
| BMW iX2 xDrive30 | autonomia | 327 km | Página oficial exibe 327 e 337 km PBEV na mesma página |
| Mercedes EQB 250 | nomenclatura | — | Linha atual tem EQB 250+ e EQB 350 4MATIC; bateria 70,5 kWh sugere que entrada do catálogo corresponde ao 250+ |
| Mercedes EQE 300 SUV | status | 698.900 | PR jul/2024 indica substituição por EQE 350+ SUV (R$ 699.900) |
| Mercedes EQE 350 | potência/CA | 320 cv / 11 kW | 350+ atual: 292 cv e 22 kW CA conforme cobertura do PR oficial |
| Chevrolet Equinox EV | preço | 349.990 | Reposicionamento oficial relatado pela imprensa; página oficial ainda não consultada diretamente |
| Chevrolet Captiva EV | preço/potência | 199.990 / 201 cv | Site oficial exibe 199.990* (possível promoção sobre tabela de 219.990); potência 201 vs 204 cv entre fontes |
| Hyundai Ioniq 5 | bateria/carregamento | 72,6 kWh / 220 kW | Oficial cita 84 kWh nominal; convenção bruto/líquido a definir |
| Hyundai Kona EV | tudo | — | Sem dados oficiais coletados neste ciclo |

### Pendências estruturais (inalcançáveis neste ciclo)

- `consumption`: requer leitura da tabela PBEV vigente (MJ/km), métrica não equivalente aos kWh/100 km dos sites oficiais.
- Lacunas de cobertura detectadas: EC40 Twin Motor Performance (R$ 384.950) à venda fora do catálogo; BYD Atto 2 DM-i (híbrido plug-in, fora do escopo BEV).

## Método

1. Busca direcionada nas páginas oficiais por marca (sites manufacturer + releases de imprensa);
2. comparação campo a campo com `public/data/cars.json`;
3. `verified` somente com fonte oficial direta e valor idêntico;
4. divergências mantidas como `legacy_unverified`, classificadas em "proposta" ou "fail-closed";
5. imprensa especializada usada apenas como pista, nunca como fonte de verificação.
