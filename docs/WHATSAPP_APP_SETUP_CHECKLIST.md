# Checklist de configuração do WhatsApp Business no aplicativo oficial

## Objetivo

Configurar somente os recursos nativos do aplicativo WhatsApp Business. Não ativar Cloud API, webhook, integração não oficial ou automação de WhatsApp Web.

Número operacional aprovado: `551133958879`

## Antes de começar

- [ ] Confirmar que o aplicativo aberto é o WhatsApp Business da Guia PBEV Brasil.
- [ ] Não solicitar nem inserir token, senha, QR Code ou código de verificação em código do site.
- [ ] Não conectar o número ao módulo Cloud API existente.
- [ ] Manter `WHATSAPP_ENABLED=false` no módulo separado do bot.
- [ ] Usar o CRM como fonte oficial de status.

## 1. Mensagem de saudação

No WhatsApp Business, abrir a área de ferramentas comerciais e configurar a saudação.

Texto sugerido:

> Olá! Aqui é a Equipe Guia PBEV Brasil. Recebemos sua mensagem e o atendimento é humano. Para agilizar, escreva sua cidade/UF e diga se procura veículo elétrico, wallbox, energia solar, limpeza de placas ou Programa de Parceiros.

Configuração recomendada:

- Ativar para novos contatos ou contatos que retornam após longo período.
- Não prometer horário específico se o horário não estiver configurado.
- Testar enviando uma mensagem de um número de teste.

A saudação é uma mensagem nativa do aplicativo, não um bot conversacional.

## 2. Mensagem de ausência

Ativar somente se houver horário operacional definido.

Texto sugerido:

> Recebemos sua mensagem. O atendimento da Guia PBEV é humano e responderemos quando retomarmos o atendimento. Não encaminharemos seus dados a parceiros sem sua autorização explícita.

Se não houver horário confiável de atendimento, deixar essa função desativada para evitar expectativa incorreta.

## 3. Respostas rápidas

Criar os atalhos abaixo. A resposta rápida apenas preenche a caixa de texto; Fabio revisa e envia manualmente.

### `/inicio`

> Olá! Aqui é a Equipe Guia PBEV Brasil. Posso ajudar com veículos elétricos, wallbox, energia solar, limpeza de placas ou Programa de Parceiros. Qual dessas opções você procura?

### `/qualificar`

> Para entender seu pedido, informe por favor: cidade/UF, modalidade de interesse, PF ou PJ e um breve resumo do que você precisa.

### `/consentimento`

> Resumo do pedido: [modalidade], em [cidade/UF]. A Guia PBEV pode analisar essas informações e, se houver aderência, encaminhá-las ao parceiro adequado. Você autoriza esse encaminhamento? Responda ACEITO ou CORRIGIR.

### `/corrigir`

> Sem problema. Vou corrigir os dados antes de qualquer encaminhamento. Confirme, por favor: [resumo corrigido].

### `/handoff`

> Obrigado pela confirmação. A Guia PBEV vai revisar a solicitação e, se houver aderência, encaminhá-la ao parceiro adequado. O atendimento e a negociação serão realizados diretamente pelo parceiro.

### `/parceiro`

> Para conhecer o Programa de Parceiros e candidatar sua empresa, preencha o formulário obrigatório: https://guiapbev.cloud/parceiros/

### `/semconsentimento`

> Sem problema. A Guia PBEV não encaminhará suas informações a parceiros. Posso continuar ajudando apenas com orientações gerais.

### `/followup`

> Olá! Estou retomando seu pedido no Guia PBEV. Se ainda quiser orientação sobre [modalidade], responda com sua cidade/UF. Caso contrário, podemos encerrar o atendimento sem encaminhamento.

### `/encerrar`

> Atendimento encerrado por aqui. A Guia PBEV não encaminhará seus dados sem autorização. Obrigado pelo contato.

## 4. Etiquetas

Criar as etiquetas:

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

Uso sugerido:

- Uma etiqueta de estágio principal por conversa.
- Trocar a etiqueta quando o estágio mudar.
- Não considerar etiqueta como prova de consentimento, entrega ou aceite.
- Atualizar também o CRM.

## 5. Teste controlado

Usar um número de teste ou uma conversa interna. Não criar lead comercial real.

- [ ] Enviar uma primeira mensagem e confirmar a saudação.
- [ ] Usar `/inicio` e confirmar que o texto aparece para revisão antes do envio.
- [ ] Usar `/qualificar` e confirmar os placeholders.
- [ ] Simular um pedido de wallbox sem cidade e confirmar que a conversa fica em `Qualificando`.
- [ ] Simular `CORRIGIR` e confirmar que o handoff não ocorre.
- [ ] Simular `ACEITO` e confirmar que a etiqueta muda para `Consentido` ou `Handoff pendente` conforme a operação.
- [ ] Simular uma empresa e confirmar o envio do link `/parceiros/`.
- [ ] Testar `/followup` somente como rascunho.
- [ ] Testar `/encerrar`.
- [ ] Confirmar que nenhuma mensagem automática envia dados pessoais a parceiro.

## 6. Operação diária

No início do atendimento:

- [ ] Abrir conversas com etiqueta `Novo`.
- [ ] Classificar consumidor ou parceiro.
- [ ] Aplicar a etiqueta de estágio.
- [ ] Registrar no CRM quando houver intenção comercial real.

Antes do handoff:

- [ ] Confirmar modalidade e cidade/UF.
- [ ] Enviar resumo.
- [ ] Receber `ACEITO` explícito.
- [ ] Atualizar consentimento no CRM.
- [ ] Revisar parceiro elegível.
- [ ] Enviar somente o contexto aprovado.

No encerramento:

- [ ] Registrar recusa, sem consentimento ou `no_response`.
- [ ] Fazer no máximo um follow-up manual.
- [ ] Não apagar o histórico.
- [ ] Aplicar `Encerrado` quando a conversa terminar.

## O que não configurar

- [ ] Não ativar Cloud API.
- [ ] Não ativar webhook.
- [ ] Não usar automação de WhatsApp Web.
- [ ] Não usar robôs não oficiais.
- [ ] Não criar disparos em massa.
- [ ] Não usar o WhatsApp para prospecção fria.
- [ ] Não enviar dados do formulário automaticamente.
- [ ] Não permitir que uma etiqueta substitua o CRM.
