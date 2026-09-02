# Revisão mensal PBEV · edição 2026_25_AGO

Data da verificação: 2026-09-01
Fonte oficial: [página PBEV/Inmetro](https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/veiculos-automotivos-pbe-veicular)
Referência visível: `Tabela PBEV 2026_25_AGO.pdf`
PDF servido por: `https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/veiculos-automotivos-pbe-veicular/mascara-pbev-2026_19_jan-rev01.pdf/@@download/file`
SHA-256: `43e928f89a526f7b59013faca3501b2b0716e5a8cdc2e097b8653638aa688ba0`
Tamanho: `3.387.564` bytes · `9` páginas

## Método

- Download direto da página oficial e hash do arquivo recebido.
- Extração integral do texto das nove páginas.
- Identificação das linhas com propulsão elétrica e cauda de consumo/autonomia.
- Pareamento por marca, modelo, versão e valores PBEV contra os 109 registros de `public/data/cars.json`.
- Nenhuma alteração de valor foi aplicada por coincidência numérica ou por pareamento de versão ambíguo.

## Resultado

- `186` linhas elétricas extraídas, incluindo duplicidades de paginação/versão.
- `93` registros do catálogo possuem nota PBEV e consumo para comparação.
- `92` registros coincidem nos valores de autonomia e MJ/km.
- `1` exceção documentada: `Peugeot e-Expert`.

A tabela apresenta `PEUGEOT E-EXPERT CARGO ELÉTRICO` com `0,75 MJ/km` e `258 km`. O catálogo usa o modelo comercial genérico `e-Expert`, com `330 km`, e não há confirmação inequívoca de que o registro corresponda à variante Cargo da linha PBEV. O valor legado foi mantido e a exceção foi registrada em `.github/data/catalog-provenance.json` como `legacy_unverified`.

## Aplicação

- A referência pública foi atualizada de `Tabela PBEV 2026_14_AGOd` para `Tabela PBEV 2026_25_AGO.pdf` somente após a comparação integral.
- A proveniência do dataset registra a data interna do PDF (`2026-08-14`) e a verificação deste ciclo (`2026-09-01`).
- O `e-Expert` não recebeu correção automática; nova alteração depende de ficha oficial da versão vendida no Brasil.
