# Experiências reais de uso

**Status:** proposta de produto, aguardando implementação do fluxo de envio, aviso de consentimento e análise prévia.

## Objetivo

Permitir que proprietários compartilhem experiências reais de consumo e uso de veículos eletrificados, com foto do painel e contexto suficiente para que o Guia PBEV apresente o relato sem confundi-lo com dado homologado, cotação ou promessa de economia.

A feature deve transformar relatos individuais em evidência contextual para outros usuários, preservando a distinção entre:

- **dado homologado:** valor proveniente de fonte oficial ou base de homologação;
- **simulação:** resultado calculado com premissas editáveis, tarifas e referências do Guia;
- **relato de uso real:** leitura fornecida por um usuário, em condições específicas;
- **medição independente:** resultado obtido por método documentado, como energia medida na tomada ou medidor externo.

Uma foto do painel é um relato de uso real. Não deve ser apresentada como medição independente.

## Fluxo público proposto

1. O usuário encontra o CTA na ficha do veículo ou no simulador.
2. O formulário explica o objetivo, a separação entre tipos de dado e a possibilidade de uso editorial.
3. O usuário informa o veículo, o contexto e envia a foto opcional ou obrigatória conforme o formato aprovado.
4. O cliente valida campos básicos, extensão, tamanho e tipo do arquivo sem inferir dados técnicos.
5. A submissão segue para análise prévia independente da plataforma; o frontend não publica automaticamente.
6. A equipe verifica legibilidade, coerência, privacidade, unidade e contexto.
7. Somente um caso aprovado, com consentimento explícito para uso editorial, pode aparecer em conteúdo, ficha, biblioteca ou síntese pública.
8. O formulário informa que o envio não garante publicação, resposta ou seleção do caso.

## Campos sugeridos

### Identificação do caso

- marca, modelo e versão;
- cidade e UF, sem exigir endereço ou localização exata;
- período da medição;
- quilometragem percorrida;
- tipo de trajeto: urbano, rodoviário ou misto;
- uso do ar-condicionado;
- tipo de recarga: AC, DC ou mista;
- proporção de AC/DC, quando conhecida;
- tarifa de energia, opcional, quando o usuário quiser contextualizar custo.

### Dados observados

- consumo exibido;
- unidade exibida, como `kWh/100 km` ou `km/kWh`;
- distância desde a última carga, quando disponível;
- velocidade média, quando disponível;
- bateria restante, quando disponível;
- autonomia estimada restante, quando disponível;
- foto ou fotos do painel.

O formulário deve distinguir campo informado pelo usuário de valor lido automaticamente na imagem. OCR, se adotado futuramente, deve ser apenas auxiliar e sempre exigir revisão.

### Aviso e consentimento

- aviso claro de que as informações poderão ser analisadas pela plataforma;
- consentimento explícito para eventual uso editorial caso o caso seja aprovado;
- opção de publicação anônima ou com nome informado;
- autorização específica para uso da foto, quando aplicável;
- registro do texto de aviso apresentado no envio;
- indicação clara de que o envio não garante publicação;
- confirmação de que o usuário não enviou placa, chassi, endereço, QR code ou outro dado pessoal desnecessário;
- orientação pública sobre pedido de correção ou remoção, quando esse canal estiver implementado.

## Regras editoriais

Todo relato publicado deve trazer uma identificação equivalente a:

> **Relato de uso real de um proprietário, em condições específicas. O valor foi indicado pelo painel e não substitui o consumo homologado nem representa todos os usuários.**

A publicação deve informar, quando disponíveis:

- modelo e versão;
- localidade em nível de cidade/UF;
- contexto do trajeto;
- ar-condicionado;
- tipo de recarga;
- período ou distância;
- unidade do consumo.

Não publicar:

- médias gerais com base em um único caso;
- promessa de autonomia ou economia;
- comparação universal entre modelos;
- preço de energia sem tarifa e período identificados;
- conversão de `kWh/100 km` para `km/kWh` sem cálculo verificável;
- conclusão sobre eficiência fora das condições relatadas.

## Privacidade e segurança

- Não armazenar dados pessoais no repositório frontend.
- Não colocar fotos enviadas pelo usuário em `public/` ou no bundle estático antes da aprovação.
- Remover metadados EXIF quando a infraestrutura de recebimento permitir.
- Não exigir placa, chassi, endereço, localização exata ou documento.
- O fluxo técnico de recebimento deve limitar tamanho, tipo e retenção dos anexos.
- A submissão deve ter status separado de aprovado, rejeitado, pendente e removido.
- O envio não pode gerar publicação, mensagem automática ou encaminhamento comercial.
- Eventos analíticos devem registrar apenas o uso agregado da feature, sem conteúdo da foto ou dados identificáveis.

## Apresentação na plataforma

A interface deve usar rótulos visíveis e consistentes:

- `Homologado / fonte oficial`;
- `Simulação / premissas editáveis`;
- `Relato real de usuário`;
- `Medição independente`, somente quando houver método comprovado.

Na ficha e no simulador, o CTA pode ser:

> **Compartilhe seu caso de uso**
>
> Envie uma foto do painel e os parâmetros da medição. Seu relato pode ajudar outros proprietários a entender o consumo real.

O CTA deve apontar para uma rota pública própria quando o formulário estiver implementado. Até lá, não inventar URL de envio nem direcionar usuários para um fluxo que não exista.

## Critérios de aceitação

- [ ] CTA aparece somente quando o formulário estiver disponível.
- [ ] Formulário informa a possibilidade de uso editorial e exige consentimento explícito para esse uso.
- [ ] Modelo e versão são campos separados.
- [ ] Consumo exige unidade.
- [ ] Contexto de trajeto, ar-condicionado e recarga pode ser informado separadamente.
- [ ] Foto não é tratada como medição independente.
- [ ] Dados homologados e relatos reais aparecem com rótulos diferentes.
- [ ] A submissão fica pendente de análise prévia independente da plataforma.
- [ ] O formulário informa que o envio não garante publicação ou seleção.
- [ ] Nenhum anexo pessoal entra no repositório público ou no build.
- [ ] O fluxo técnico de recebimento é mínimo, versionado e testado.
- [ ] A feature pode ser desativada por rollout controlado.
- [ ] Eventos não carregam foto, nome, localização exata ou conteúdo livre.
- [ ] Casos rejeitados ou removidos deixam de aparecer na superfície pública.
- [ ] Testes, build e scanner do artifact passam antes de qualquer deploy.

## Evolução por etapas

### Etapa 1 — fluxo de envio e aviso

Definir fluxo técnico de recebimento, retenção, aviso de consentimento, limites de upload, revisão, remoção e identificação pública. Implementar com rollout controlado, sem publicação automática e sem promessa de seleção.

### Etapa 2 — biblioteca editorial

Exibir casos aprovados em ficha ou página própria, com filtros por tipo de trajeto, estado, período e unidade, sem transformar amostra pequena em ranking.

### Etapa 3 — sínteses agregadas

Somente após volume e metodologia suficientes, calcular faixas ou distribuições. Toda síntese deve informar tamanho da amostra, período, critérios de inclusão e limitações.

## Destino futuro na plataforma

Quando houver uma base robusta de relatos revisados, a experiência pode evoluir para uma **Biblioteca de Experiências Reais de Uso**, sem depender de um único caso individual.

### Localização proposta

1. **Seção própria pública**, com uma rota dedicada para pesquisar e filtrar relatos agregados.
2. **Resumo contextual na ficha do veículo**, somente quando houver amostra suficiente para aquele modelo e versão.
3. **Acesso a partir do simulador**, para comparar a premissa usada com faixas observadas por usuários em contextos semelhantes.

### Filtros e contexto

- marca, modelo e versão;
- estado, sem localização precisa;
- período da medição;
- urbano, rodoviário ou misto;
- uso ou não de ar-condicionado;
- recarga AC, DC ou mista;
- unidade do consumo;
- tamanho da amostra.

### Gate de publicação agregada

A seção só deve ser ativada depois de uma revisão específica que confirme:

- quantidade mínima de relatos por agrupamento;
- versões identificadas sem mistura silenciosa;
- período de coleta explícito;
- unidades normalizadas e conversões reproduzíveis;
- exclusão ou sinalização de registros incompletos;
- critérios públicos de inclusão e exclusão;
- separação entre consumo observado e consumo homologado;
- ausência de dados pessoais e de localização precisa;
- apresentação de faixa, distribuição ou mediana somente quando estatisticamente defensável;
- aviso de que clima, velocidade, carga, temperatura, topografia, pneus, ar-condicionado e método de recarga afetam o resultado.

Até esse gate ser atendido, a plataforma deve exibir apenas relatos individuais aprovados, sem ranking, média geral ou conclusão universal.

## Fora do escopo inicial

- marketplace ou venda de veículos;
- atendimento automático por WhatsApp;
- ranking de proprietários;
- validação de garantia, defeito ou assistência técnica;
- publicação automática de fotos;
- promessa de economia, autonomia ou desempenho;
- coleta de localização precisa;
- uso comercial da submissão sem consentimento específico.
