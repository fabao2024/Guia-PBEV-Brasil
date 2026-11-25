# Honda e:HEV — potência dos motores e do sistema

Revisão em **25/11/2026**, limitada às versões brasileiras já cadastradas de Civic, CR-V e Accord Advanced Hybrid. Não aplica especificações de outros mercados ou de outra geração.

## Evidência primária

| Modelo / escopo | Combustão | Elétrico de tração | Fonte oficial |
|---|---:|---:|---|
| Civic reestilizado 2025/2026 | 143 cv | 184 cv | [Comunicado Honda de 30/06/2025](https://saladeimprensa.honda.com.br/releases/lancamento-civic-advanced-hybrid-onde-inovacao-encontra-sofisticacao) |
| CR-V, geração brasileira lançada em 2024 | 147 cv | 184 cv | [Comunicado Honda de 26/02/2024](https://saladeimprensa.honda.com.br/releases/honda-cr-v-advanced-hybrid-nova-geracao-estreia-no-brasil-com-tecnologia-hibrida-avancada) |
| Accord, atualização de setembro/2025 | 146 cv | 184 cv | [Comunicado Honda de 26/09/2025](https://saladeimprensa.honda.com.br/releases/accord-advanced-hybrid-conectividade-aprimorada) |

Os comunicados identificam um motor elétrico de tração e outro destinado à geração de energia. O gerador não é uma unidade adicional de tração, e as potências máximas individuais não são somadas. A atuação dos motores depende do modo EV Drive, Hybrid Drive ou Engine Drive; esta arquitetura não permite deduzir a potência combinada apenas pela maior potência individual.

## Potência combinada pendente

**Não foi localizada confirmação documental primária brasileira de potência combinada nas fontes consultadas.** Isso não significa que o valor combinado seja inexistente, zero ou igual a 184 cv.

- Para o CR-V, [Autoesporte](https://autoesporte.globo.com/carros/testes-de-carros/review/2024/02/teste-novo-honda-cr-v-tem-tudo-para-peitar-os-suvs-chineses-menos-preco.ghtml) e [Estadão](https://estadao.com.br/jornal-do-carro/honda-cr-v-hibrido-preco-video) reportam **207 cv combinados**, atribuídos à Honda.
- Para o Accord, [Autoesporte](https://autoesporte.globo.com/mercado/noticia/2024/01/honda-civic-e-accord-ficam-ate-r-7500-mais-caros-veja-novos-precos.ghtml) também reporta **207 cv combinados**.
- Essas referências secundárias não foram promovidas a evidência primária. Os anexos de ficha técnica apresentados nas páginas do CR-V/Accord não foram obtidos como documento com confirmação da combinada. A busca nas páginas oficiais não encontrou tal confirmação. Nenhum valor global, de outra versão ou calculado foi usado para preencher a lacuna.
- Revisar quando houver ficha brasileira, catálogo ou declaração técnica primária que identifique versão/ano e potência máxima do sistema. Não cadastrar 327/331/330 cv pela soma dos motores.

## Contrato e interface

- `power: 184` preserva o campo numérico legado; nos três modelos, `powerBasis: 'electric_motor'` informa explicitamente que é potência do **motor elétrico de tração**.
- Campos distintos: `electricMotorPowerCv`, `combustionPowerCv` e `combinedPowerCv`. A combinada fica explicitamente `null`, nunca zero, estimativa ou cópia da elétrica. As fontes por modelo e essa pendência estão em `fields.power` de `.github/data/catalog-provenance.json`.
- Export aditivo apenas para entradas com base declarada: `power_basis`, `electric_motor_power_cv`, `combustion_power_cv` e `combined_power_cv`. O campo `power_cv` continua disponível para consumidores existentes, com a qualificação ao lado; ausência de base nos demais modelos não implica potência combinada.
- Cards identificam o motor elétrico; fichas/modal apresentam motores e combinada pendente. Comparadores identificam a base, separam a combustão e a combinada e não marcam vencedor na linha genérica quando as bases diferem.
- Schema publica propriedades numéricas apenas para potências confirmadas; não emite potência combinada desconhecida nem atribui a unidade horsepower aos novos valores em cv. Metadados estáticos qualificam os 184 cv.
- Preços, consumo, torque, autonomia, impostos, garantias, fotos e os demais modelos não foram revistos nesta etapa. CR-V e Accord deixam de mostrar as estimativas indevidas de 118/111 cv derivadas do preço.
