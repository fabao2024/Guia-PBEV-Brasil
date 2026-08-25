# Lote piloto Volvo · Bloco 5 — proveniência campo a campo

Data da verificação: 2026-08-25
Matriz de referência: `.github/data/bloco5-matriz-proveniencia-2026-08-25.md`
Fontes oficiais usadas (todas `official_manufacturer`, páginas Volvo Cars Brasil):

- EX30: https://www.volvocars.com/br/cars/ex30-electric/specifications/
- EX40: https://www.volvocars.com/br/cars/ex40-electric/specifications/
- EC40: https://www.volvocars.com/br/cars/ec40-electric/specifications/
- EX90: https://www.volvocars.com/br/cars/ex90-electric/specifications/

## Resultado

Cobertura do registro: 19/763 campos verificados (era 5/763). Nenhum valor do catálogo foi alterado neste lote.

### Campos verificados (14 novos)

| Veículo | Campos |
|---|---|
| `volvo-ex30-plus` | `range_km` (250 km Inmetro), `power` (272 cv), `battery` (51 kWh nominal), `availability` |
| `volvo-ex30-ultra` | `power` (428 cv), `battery` (69 kWh nominal), `availability` |
| `volvo-ex40-xc40` | `power` (238 cv), `availability` |
| `volvo-ec40-c40` | `range_km` (385 km Inmetro), `power` (238 cv), `availability` |
| `volvo-ex90-twin` | `range_km` (459 km Inmetro), `availability` |

### Divergências registradas (campos permanecem não verificados)

Nenhuma divergência abaixo foi corrigida; todas exigem decisão explícita antes de editar o catálogo.

| Veículo | Campo | Catálogo | Fonte oficial | Observação |
|---|---|---|---|---|
| `volvo-ex30-plus.price` | preço | R$ 239.950 | specs: R$ 239.950 / landing: R$ 249.950 | Duas páginas oficiais conflitam entre si |
| `volvo-ex30-ultra.price` | preço | R$ 309.950 | specs: R$ 309.950 / landing: R$ 319.950 | Mesmo conflito entre páginas oficiais |
| `volvo-ex40-xc40.price` | preço | R$ 342.950 | R$ 329.950 | Divergência direta com a página oficial |
| `volvo-ex40-xc40.range_km` | autonomia | 385 km | specs: 364 km / landing: 393 km | Páginas oficiais conflitam entre si e com o catálogo |
| `volvo-ec40-c40.price` | preço | R$ 359.950 | R$ 334.950 | Divergência direta com a página oficial |
| `volvo-ec40-c40.battery` | bateria | 69 kWh | 70,0 kWh nominal | Possível diferença de convenção bruto/líquido |
| `volvo-ex90-twin.price` | preço | R$ 849.990 | R$ 849.950 | Divergência pequena, porém direta |
| `volvo-ex90-twin.power` | potência | 408 cv | 517 cv (380 kW) | Versão vendida no Brasil é a Twin Motor Performance |

### Pendências sem evidência suficiente (fail-closed)

- `consumption` dos 5 Volvos: exige leitura direta da tabela PBEV/Inmetro vigente (MJ/km); as páginas oficiais publicam kWh/100 km, métrica não equivalente.
- `charging` dos 5 Volvos: páginas oficiais divulgam tempos (ex.: "10–80% em 28 min com carregador DC 175 kW"), não a potência máxima comparável ao campo do catálogo.

### Lacunas de cobertura detectadas (para triagem futura)

- EC40 Twin Motor Performance (R$ 384.950, 442 cv, 404 km) está à venda no site oficial e não consta no catálogo;
- EX40 Twin Motor Performance também aparece no site oficial; confirmar se é versão distinta à venda no Brasil.

## Método

1. Levantamento das páginas oficiais Volvo Brasil (landing + especificações) por modelo;
2. comparação campo a campo com os valores do catálogo (`public/data/cars.json`);
3. marcação de `verified` somente quando valor idêntico e fonte oficial direta;
4. divergências e ambiguidades mantidas como `legacy_unverified` e listadas acima.
