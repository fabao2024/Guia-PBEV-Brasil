# Dados de terceiros — Mapa EV / Third-party EV map data

A licença geral do projeto aplica-se ao material original do Guia PBEV Brasil. **Não substitui nem acrescenta restrição não comercial às licenças dos dados de terceiros abaixo.** Os registros continuam sujeitos às respectivas licenças de origem, inclusive quando aparecem juntos na interface.

The project license applies to original Guia PBEV Brasil material. **It does not replace the following third-party data licenses or impose a NonCommercial restriction on these datasets.** Combining their presentation does not relicense the underlying data.

## Open Charge Map

- Arquivo histórico: `src/data/ocmChargers.json`.
- Consulta atual ou importação autorizada: `src/data/ocmCurrentChargers.json`.
- Amostra individual selecionada: `src/data/sourcedChargers.ts`.
- Créditos e licenças por registro: `location.attribution` e `location.license`, exibidos nos detalhes do ponto.
- Contribuidores OCM: **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**, com crédito a **Open Charge Map Contributors**.
- Dados de redes: **[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)** somente quando a ficha ou o fornecedor declara essa licença; crédito ao fornecedor identificado, por exemplo Easy Volt, TriCharge, Multcharge ou YellotMob.
- Termos e distinção entre fornecedores: <https://openchargemap.org/about/terms>.

Não se presume que todos os dados OCM tenham a mesma licença. Licenças ausentes, incompatíveis ou não reconhecidas pelo importador não são aceitas. Fichas e provedores individuais permanecem vinculados por URL e identificação externa.

## OpenStreetMap / Geofabrik

Quando obtido, o snapshot `src/data/osmChargers.json` e os dados da busca OSM conservam **[Open Database License 1.0 (ODbL)](https://opendatacommons.org/licenses/odbl/1-0/)**, com crédito **© OpenStreetMap contributors**. A seleção e a normalização de dados OSM, inclusive centros aproximados de áreas, não removem as obrigações da ODbL. O arquivo JSON público disponibiliza a seleção derivada, sem identidades de contribuidores.

- Direitos e atribuição: <https://www.openstreetmap.org/copyright>.
- Extratos distribuídos por **Geofabrik GmbH**, a partir de dados dos contribuidores OpenStreetMap: <https://download.geofabrik.de/south-america/brazil.html>.
- Dados OSM permanecem em arquivo identificável, separados dos arquivos OCM e do catálogo de veículos. Não se atribui BY-NC ao conjunto OSM.

## Transformações e limites / Changes and limitations

Os importadores selecionam campos públicos de locais e conexões, normalizam nomes de campos/unidades e descartam registros sem coordenadas ou condições mínimas de reutilização. Coordenadas de nós não são reposicionadas. Para áreas OSM com geometria completa, um centro de área é calculado e marcado como aproximação. Identidades, contatos, comentários e mídia de contribuidores não são redistribuídos. Contagens são de registros de locais, não de conectores disponíveis ou endereços fisicamente confirmados.

The importers select public location/connection fields, normalize field names/units and omit records failing coordinate or reuse requirements. Source node positions are not moved. Complete OSM area geometries may be represented by an explicitly approximate area center. Contributor identities, contacts, comments and media are not redistributed. Dataset/reference dates and public-page observation dates are not installation dates or field verification. Provider attribution, source identifiers and applicable license notices remain attached to the records.

Metodologia, referências e estado real de cada coleta: [`docs/mapa-ev-localizacoes.md`](docs/mapa-ev-localizacoes.md). Estes avisos não afirmam cobertura nacional completa, funcionamento, acesso público ou inspeção física das estações.
