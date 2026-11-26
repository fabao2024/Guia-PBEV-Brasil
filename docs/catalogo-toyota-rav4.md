# Toyota RAV4 — versões brasileiras 2026

Fontes consultadas em **26/11/2026**. Data de consulta não substitui a data de publicação ou atualização de uma fonte.

## Versões incluídas

| Campo | RAV4 S Hybrid | RAV4 SX Hybrid |
|---|---:|---:|
| Propulsão / combustível | HEV / gasolina | HEV / gasolina |
| Preço de referência | R$ 317.190 | R$ 349.290 |
| Potência combinada declarada | 239 cv | 239 cv |
| Tração / transmissão | AWD / eCVT | AWD / eCVT |
| Bateria declarada | 1,1 kWh | 1,1 kWh |
| Consumo urbano / rodoviário | 16,1 / 13,5 km/L | 16,1 / 13,5 km/L |
| Energia / classificação PBE | 1,42 MJ/km / B | 1,42 MJ/km / B |
| Comprimento / largura / altura | 4.600 / 1.855 / 1.695 mm | 4.600 / 1.855 / 1.695 mm |
| Entre-eixos | 2.690 mm | 2.690 mm |
| Peso em ordem de marcha | 1.755 kg | 1.770 kg |
| Porta-malas declarado | 514 L | 456 L |

HEV não tem autonomia elétrica homologada para cadastro nem recarga externa. `range: 0` é a convenção interna desse contrato, não uma alegação de alcance total zero. Não somar potência dos motores ou usar torque térmico como combinado.

## Fontes e divergências

1. [PBEV 2026, tabela de 25/08 disponível no portal Inmetro](https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/veiculos-automotivos-pbe-veicular/mascara-pbev-2026_19_jan-rev01.pdf/@@download/file), página 4, consultada diretamente: **S HYBRID e SX HYBRID**, 16,1 km/L cidade, 13,5 estrada, 14,8 combinado, 1,42 MJ/km, classe B na categoria e geral, sem selo Conpet. A coluna de propulsão dessas duas linhas diz “Combustão”; prevalece a ficha Toyota para a classificação HEV, sem alterar ou ocultar o texto do regulador.
2. A mesma página lista **S CONNECT e SX CONNECT** com 15,3/14,1 km/L e 1,43 MJ/km. Não transferir esses dados às novas S/SX Hybrid. O [comunicado de lançamento de 14/04/2026](https://www.toyotacomunica.com.br/novo-toyota-rav4-estreia-no-brasil-com-duas-versoes-hibridas-full-maistecnologia-e-preco-a-partir-de-r-317-mil/) reproduz 15,3/14,1 e classe A; a tabela do regulador foi priorizada. A pesquisa preliminar foi corrigida antes do cadastro.
3. [Ficha Toyota com S, SX e XSE](https://media.toyota.com.br/816f3b05-1ce9-49fc-98cc-935aa1dea606.pdf): 239 cv combinados HEV, 1,1 kWh, pesos e dimensões por versão. Documento consultado pela indexação pública, pois o acesso direto a `media.toyota.com.br` e à página do modelo retornou **403**. Essa limitação é explícita, não se declara download ou inspeção visual integral do PDF.
4. [Página pública da rede Toyota Stéfani](https://stefanimotors.com.br/novos/rav4), acessada diretamente: versões 2026, 239 cv, equipamentos, pesos, 514/456 L e referências de preço na cor Cinza Titan, **base Brasília, pintura sólida, à vista e com frete incluso**. Preços regionais/cores podem diferir. A oferta local temporária de R$ 299.990 para a S não foi adotada como tabela nacional; tampouco os R$ 319.620/351.720 de outra referência de preço foram tratados como preço-base equivalente. Confirmação central vigente pela fabricante ainda pendente: preço permanece explicitamente indicativo na ficha e com exceção na proveniência.
5. Porta-malas SX: a [ficha HEV anterior](https://media.toyota.com.br/c16025eb-11ec-48b7-86e5-c8dde161ecfc.pdf) e a [página Sulpar](https://www.toyotasulpar.com.br/novos/toyota-rav4) informam 489 L. Adotados os **456 L** da ficha conjunta e da página Stéfani; não afirmar padrão VDA não identificado. A divergência permanece registrada para revisão da fabricante.
6. S: multimídia de 10,5", câmera traseira e teto solar; SX: JBL de 12,9", câmera 360°, head-up display e teto panorâmico, conforme a ficha e a rede. Garantia geral 5 anos, sistema híbrido 8 anos; Toyota 10 é extensão condicionada a revisões, prazos, quilometragem e regras do programa, não garantia incondicional de dez anos.

Vão livre e torque combinado não preenchidos por suposição. Gasolina não é flex: não se presume benefício fiscal destinado a híbridos a etanol. Nenhuma regra de IPVA foi alterada.

## Fotografia

- Foto de divulgação Toyota publicada pela [rede Sulpar no lançamento da linha HEV](https://blog.toyotasulpar.com.br/novo-toyota-rav4-2026-traz-visual-inedito-mais-tecnologia-e-duas-versoes-hibridas-full/).
- [Arquivo original servido pela rede](https://blog.toyotasulpar.com.br/wp-content/uploads/2026/04/externa-1.jpg): JPEG, **1280 × 854**, veículo inteiro em três quartos traseiros, sem pessoa identificável visível. Resolução inferior à preferência de 1440 px, preservada sem ampliação. Não é imagem de detalhe, evento ou versão PHEV.
- `public/car-images/toyota-rav4-hybrid.jpg`: bytes originais, sem corte, recompressão ou texto adicionado. Crédito: Toyota/divulgação via Toyota Sulpar; direitos da fotografia preservados.
- Foto ilustrativa compartilhada da linha HEV; não comprova todos os acabamentos/rodas de cada versão. Essa ressalva acompanha ambas as fichas. Frames do configurador com recorte serrilhado e fotos dianteiras com motorista visível foram rejeitados; novas fotos individuais de S/SX continuam desejáveis.
- Pipeline `tools/generate-car-images.py` e `--check` mantidos. Original abaixo de 200 kB não exige variantes; não editar manifestos à mão.

## XSE Plug-in Hybrid — pendente, não cadastrado

A [Toyota anunciou a versão brasileira em 21/08/2026](https://www.toyotacomunica.com.br/toyota-lanca-rav4-plug-in-hybrid-no-brasil-e-amplia-oferta-de-veiculos-eletrificados/): 329 cv combinados, bateria de 22,7 kWh, 61 km elétricos atribuídos ao Inmetro, recarga AC 11/DC 50 kW, preço de lançamento R$ 399.990. [Publicação da rede Sulpar de 04/09/2026](https://blog.toyotasulpar.com.br/toyota-rav4-phev-2026-chega-ao-brasil-com-329-cv-e-61-km-de-autonomia-eletrica/) confirma a configuração e esclarece a extensão de garantia.

A tabela PBEV consultada não contém linha XSE/PHEV RAV4. Não foram confirmados o consumo de gasolina em **sustentação de carga** da configuração de 329 cv nem uma autonomia total declarada com ciclo identificado. O contrato atual exige `combinedRangeKm` para PHEV/REEV, usado na fração elétrica dos simuladores; não afrouxar esse contrato, usar fallback ou inventar a autonomia para completar o cadastro.

Os 35/30 km/L equivalentes, 306 cv, 18,1 kWh e 55 km encontrados em publicações de 2024 são de outra geração. Não são dados de gasolina sustentada da versão atual. O XSE não entra em `CAR_DB`, no JSON, sitemap, quiz ou cálculos até resolver as pendências. Também não pertence à lista de anúncios sem preço: seu preço já foi divulgado.
