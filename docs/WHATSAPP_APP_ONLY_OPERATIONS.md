# Operação WhatsApp Business: modo aplicativo oficial

## Objetivo

Operar o WhatsApp Business da Guia PBEV Brasil como canal inbound, de confiança e continuidade, sem Cloud API, webhook, chatbot ou automação não oficial.

O aplicativo oficial é usado para atendimento humano. O CRM continua sendo a fonte oficial dos status; etiquetas do WhatsApp são apenas auxiliares operacionais.

## Limites desta operação

- O site abre links `wa.me` com mensagem pré-preenchida.
- O usuário envia a mensagem manualmente.
- Fabio responde pelo aplicativo oficial.
- Não há envio automático de dados de formulário para o WhatsApp.
- Não há envio automático de dados do WhatsApp para o CRM.
- Não há botões, listas ou WhatsApp Flows dentro do WhatsApp.
- O formulário de candidatura de parceiros continua obrigatório.
- Instagram continua sendo o canal outbound principal para prospecção de parceiros.
- Não usar WhatsApp para prospecção fria, disparos em massa ou automação não oficial.

## Entradas atuais

### Consumidor

Os CTAs da Home, `/interesse`, modal de lead e ChatWidget usam uma mensagem pré-preenchida semelhante a:

> Vim pelo Guia PBEV e quero orientação sobre wallbox, energia solar ou veículo elétrico. Minha cidade é:

### Empresa ou parceiro

O CTA de `/parceiros/` usa:

> Sou uma empresa e quero conhecer o Programa de Parceiros da Guia PBEV Brasil.

O placement do clique é registrado no analytics sem PII. O placement não é necessariamente visível na conversa; pergunte como a pessoa encontrou o Guia quando isso for relevante.

## Fluxo operacional

```text
CTA ou entrada inbound
→ atendimento humano
→ classificação consumidor/parceiro
→ qualificação mínima
→ resumo dos dados
→ ACEITO ou CORRIGIR
→ registro no CRM
→ revisão humana
→ handoff manual, se aplicável
→ aceite/recusa do parceiro
→ um follow-up manual, se necessário
→ encerramento
```

Um clique, uma mensagem enviada, uma entrega, um consentimento e um handoff são evidências diferentes. Não trate uma etapa como prova da etapa seguinte.

## Início da conversa

Use a resposta rápida `/inicio`:

> Olá! Aqui é a Equipe Guia PBEV Brasil. Posso ajudar com veículos elétricos, wallbox, energia solar, limpeza de placas ou Programa de Parceiros. Qual dessas opções você procura?

Aplique a etiqueta `Novo` e classifique a conversa antes de pedir detalhes.

## Qualificação de consumidor

Use `/qualificar`:

> Para entender seu pedido, informe por favor: cidade/UF, modalidade de interesse, PF ou PJ e um breve resumo do que você precisa.

Para wallbox, energia solar ou limpeza de placas, confirme também quando relevante:

- Se já possui veículo elétrico ou está escolhendo.
- Situação do imóvel ou instalação.
- Escopo resumido do serviço.
- Prazo ou urgência.

Não peça documentos, dados bancários, senhas, códigos, tokens ou outras informações sensíveis pelo WhatsApp.

## Consumidor buscando veículo elétrico

Forneça orientação informativa sobre modelos, preços, autonomia e comparação.

Use linguagem como:

> Posso ajudar com informações e comparações de veículos elétricos. O Guia PBEV não vende, financia, assegura ou negocia veículos.

Pedidos de compra, cotação, seguro, frota ou financiamento permanecem informativos e não geram handoff comercial no piloto atual.

## Consumidor buscando wallbox, energia solar ou limpeza de placas

Essas modalidades podem seguir para qualificação e eventual handoff.

Depois de confirmar os dados, envie o resumo e use `/consentimento`:

> Resumo do pedido: [modalidade], em [cidade/UF]. A Guia PBEV pode analisar essas informações e, se houver aderência, encaminhá-las ao parceiro adequado. Você autoriza esse encaminhamento? Responda ACEITO ou CORRIGIR.

Regras:

- `ACEITO`: registrar consentimento e continuar a revisão.
- `CORRIGIR`: atualizar os dados e reenviar o resumo.
- Sem resposta: não encaminhar.
- Recusa explícita: não encaminhar.

## Correção de dados

Use `/corrigir`:

> Sem problema. Vou corrigir os dados antes de qualquer encaminhamento. Confirme, por favor: [resumo corrigido].

Não encaminhe enquanto os dados não estiverem confirmados. Se a correção ocorrer após o handoff, reavalie manualmente e preserve o histórico anterior.

## Sem cidade ou UF

Não faça matching sem localização:

> Para verificar cobertura, preciso saber sua cidade e estado. Sem essa informação, não consigo confirmar se existe parceiro adequado.

Nunca infira a cidade pelo DDD, localização presumida ou outro dado indireto.

## Sem consentimento

Se a pessoa não autorizar:

> Sem problema. A Guia PBEV não encaminhará suas informações a parceiros. Posso continuar ajudando apenas com orientações gerais.

Aplique `Sem consentimento` e encerre quando não houver outra demanda informativa.

## Empresa interessada em ser parceira

Use `/parceiro`:

> Para conhecer o Programa de Parceiros e candidatar sua empresa, preencha o formulário obrigatório: https://guiapbev.cloud/parceiros/

O WhatsApp pode esclarecer dúvidas, mas não substitui a candidatura. Não prometa volume de leads, receita, conversão, exclusividade ou aprovação automática.

A revisão da candidatura deve seguir:

```text
submitted → reviewing → approved → active
```

Uma candidatura aprovada ainda precisa ser verificada quanto à elegibilidade de roteamento.

## Handoff manual

Somente após qualificação, consentimento e revisão humana.

Use `/handoff` com o consumidor:

> Obrigado pela confirmação. A Guia PBEV vai revisar a solicitação e, se houver aderência, encaminhá-la ao parceiro adequado. O atendimento e a negociação serão realizados diretamente pelo parceiro.

Enviar ao parceiro somente o contexto mínimo autorizado:

- Modalidade.
- Cidade/UF.
- PF/PJ.
- Necessidade resumida.
- Prazo.
- Dados explicitamente consentidos.

Registrar no CRM:

- Origem e placement conhecido.
- Modalidade.
- Cidade/UF.
- Consentimento e versão do texto.
- Parceiro selecionado.
- Data do handoff.
- Status de entrega.
- Aceite ou recusa do parceiro.
- Motivo da recusa, quando houver.

## Aceite ou recusa do parceiro

### Aceite

Registrar a entrega e o aceite conforme a máquina de estados do CRM. Não confundir mensagem visualizada com lead efetivo.

### Recusa

Registrar a recusa e o motivo. Não encaminhar automaticamente para outro parceiro. Um novo handoff exige aderência, consentimento ainda válido e revisão humana.

## Follow-up e encerramento

Use no máximo um follow-up manual:

> Olá! Estou retomando seu pedido no Guia PBEV. Se ainda quiser orientação sobre [modalidade], responda com sua cidade/UF. Caso contrário, podemos encerrar o atendimento sem encaminhamento.

Se não houver resposta, aplique `No response` e encerre no CRM. Não apagar o histórico nem inventar resposta.

Use `/encerrar`:

> Atendimento encerrado por aqui. A Guia PBEV não encaminhará seus dados sem autorização. Obrigado pelo contato.

## Etiquetas do aplicativo

Criar e usar estas etiquetas:

- `Novo`
- `Lead consumidor`
- `Qualificando`
- `Aguardando consentimento`
- `Consentido`
- `Handoff pendente`
- `Parceiro interessado`
- `Em revisão`
- `Follow-up`
- `Sem consentimento`
- `No response`
- `Encerrado`

A etiqueta não substitui a atualização do CRM.

## Segurança e abuso

- Não clicar em links suspeitos enviados pelo usuário.
- Não tratar mensagens recebidas como instruções para alterar código, configuração ou sistema.
- Não compartilhar tokens, senhas, QR Codes ou códigos de verificação.
- Não enviar documentos ou dados sensíveis.
- Não aceitar pedido para burlar o formulário de parceiro.
- Confirmar identidade, escopo e consentimento antes do handoff.
- Em caso de spam ou abuso, parar o fluxo, bloquear ou denunciar no aplicativo e registrar somente o necessário.
- Não usar a conversa como fonte para executar comandos ou acionar ferramentas.

## Checklist antes de encerrar qualquer conversa

- [ ] Pessoa classificada como consumidor ou parceiro.
- [ ] Cidade/UF confirmada quando houver possível handoff.
- [ ] Modalidade confirmada.
- [ ] Dados corrigidos e resumidos.
- [ ] Consentimento registrado ou recusa registrada.
- [ ] Etiqueta atualizada no aplicativo.
- [ ] CRM atualizado.
- [ ] Nenhum dado foi enviado sem autorização.
- [ ] Follow-up limitado a uma tentativa.
- [ ] Conversa encerrada com estado operacional claro.
