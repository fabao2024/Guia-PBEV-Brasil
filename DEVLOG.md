# Guia PBEV Brasil · Devlog público

Notas técnicas selecionadas do produto público. Este documento não registra infraestrutura privada, dashboards administrativos, parceiros individuais, credenciais, dados pessoais ou runbooks operacionais.

## 25/08/2026 · Handoff da revisão do catálogo

- Documentada a sequência de blocos da revisão do catálogo em [`docs/CATALOG_REVIEW_HANDOFF.md`](./docs/CATALOG_REVIEW_HANDOFF.md), com commits, estado, relatório de preços e instruções de retomada independentes do modelo de LLM.
- Blocos 1, 2 e 3 permanecem concluídos e publicados.
- Bloco 4 tem pesquisa concluída, mas nenhuma alteração de preço foi aplicada; o relatório registra uma divergência confirmada no BMW i7 e três casos ambíguos.
- Blocos 5 e 6 permanecem na fila.
- A documentação não autoriza alteração, commit, push ou deploy; qualquer mudança futura deve seguir TDD, regenerar artefatos e passar pelas validações do repositório.


## 15/08/2026 · Piloto único de um lead gratuito

| Área | Mudança pública |
|---|---|
| Landing | Todos os acessos a `/parceiros/`, independentemente de campanha ou UTM, exibem o mesmo limite de 1 lead qualificado e aceito, sem custo, por parceiro. |
| Candidatura | O formulário envia `termsVersion=2026-08-14-pilot-one-lead-v2` e `freePilotLeadLimit=1`, sem fallback para contrato de dois leads. |
| Continuidade | O primeiro lead qualificado e aceito não tem custo; qualquer lead adicional depende de nova proposta, contrato e aceite formal. Não há promessa de aprovação, volume ou conversão. |
| Histórico | Aceites e comunicações anteriores não são reescritos. |
| Verificação | TDD RED→GREEN, 209/209 testes, build Vite, rota estática e scanner de segredos aprovados. |

## 14/08/2026 · Qualificação q2 e proposta de valor para parceiros

| Área | Mudança pública |
|---|---|
| Parceiros | A landing passa a explicar o contexto entregue antes do contato: serviço, região, perfil, imóvel, prazo, preferência de contato, consentimento e revisão humana. |
| Candidatura | O CTA destaca o piloto gratuito sem prometer aprovação, volume, exclusividade ou conversão. |
| Consumidor | O questionário q2 adiciona preferência obrigatória para o primeiro contato, sem duplicar a pergunta de prazo, e informa com transparência o resumo compartilhado com o parceiro selecionado. |
| Compatibilidade | A versão do questionário acompanha o lead; formulários legados permanecem compatíveis com a API durante o rollout. |
| Privacidade | A política pública explicita preferência de contato e versão do questionário entre os dados tratados. |
| Verificação | TDD RED→GREEN, 209/209 testes, build Vite, rota estática e scanner de segredos aprovados. |

## 14/08/2026 · Solicitações de limpeza de placas solares

| Área | Mudança pública |
|---|---|
| Formulário | “Limpeza de placas solares” passa a ser uma opção de serviço, com qualificação obrigatória pela quantidade aproximada de placas. |
| Cobertura | O formulário reúne 21 cidades de SP cobertas pelos parceiros homologados para wallbox, energia solar e limpeza solar. |
| Entrada | Banner, simulador, consultor e deep links `/interesse` direcionam a nova modalidade sem convertê-la em energia solar genérica. |
| Privacidade | Consentimento explícito, revisão humana e compartilhamento somente com parceiro selecionado permanecem obrigatórios; a política pública foi atualizada. |
| Verificação | 209/209 testes, build Vite com rota estática e scanner de segredos aprovados. |

## 14/08/2026 · Limpeza de sistema solar no programa de parceiros

| Área | Mudança pública |
|---|---|
| Categoria | A landing e a candidatura passam a incluir “Limpeza de sistema de placa solar” entre as modalidades disponíveis para cadastro em SP; o encaminhamento depende de cobertura operacional. |
| Transparência | O valor previsto após o piloto é R$ 35 por lead qualificado e aceito, sempre sujeito à formalização de continuidade já descrita na landing. |
| Consentimento | Novas candidaturas usam termos versionados em 14/08/2026; versões anteriores permanecem preservadas. |
| SEO | Metadata estática e dinâmica e roadmap público foram alinhados à nova modalidade. |
| Verificação | 206/206 testes, build Vite, rota estática, scanner de segredos e inspeção visual local aprovados. |

## 13/08/2026 · Validação visível no formulário de interesse

| Área | Mudança pública |
|---|---|
| Experiência | Pendências obrigatórias agora exibem aviso explícito ao lado do botão de envio, inclusive no navegador interno do WhatsApp. |
| Mensuração | Início, validação local, tentativa, sucesso e erro geram pageviews virtuais agregadas, sem valores de campos ou dados pessoais. |
| Verificação | 206/206 testes, build Vite e scanner do artifact aprovados. |

## 02/08/2026 · Funil de parceiros e landing orientada à conversão

| Área | Mudança pública |
|---|---|
| Proposta | Headline e prova de produto passam a explicar o valor para fornecedores antes dos detalhes comerciais. |
| Formulário | Candidatura aparece antes dos preços e oferece apenas as modalidades ativas de wallbox e energia solar. |
| Transparência | Termos completos permanecem acessíveis no formulário; preços futuros continuam visíveis depois da candidatura. |
| Mensuração | Etapas de CTA, início, validação, tentativa, sucesso e erro mantêm eventos próprios e também geram pageviews virtuais agregadas, sem dados pessoais. |
| SEO | Metadata estática e dinâmica da rota de parceiros permanecem alinhadas às modalidades ativas. |
| Verificação | 201/201 testes, build Vite, rotas estáticas, scanner do artifact, E2E local com POST isolado e smoke de produção aprovados. |

## 01/08/2026 · Manutenção mensal de dados auditável

| Área | Mudança pública |
|---|---|
| Fontes oficiais | Coletores de combustíveis, eletricidade e PBEV usam fontes públicas atuais, retry com timeout e emitem evidências estruturadas. |
| Segurança operacional | Falha, ausência de resultado ou cobertura crítica parcial bloqueiam conclusão automática em vez de simular ausência de mudanças. |
| Catálogo | Proveniência por veículo e por campo crítico foi versionada; dados legados sem evidência permanecem explicitamente não verificados. |
| Descoberta | Notícias geram watchlist, não mutações automáticas; híbridos, infraestrutura e falsos positivos de substring são filtrados. |
| Auditoria | Uma issue mensal idempotente agrega status, cobertura, PRs, fontes, ações e critérios; PRs existentes são reutilizados por título exato. |
| Verificação | 193/193 testes, build Vite, rotas estáticas e scanner do artifact aprovados. |

## 31/07/2026 · Oferta versionada de um lead válido

| Área | Mudança pública |
|---|---|
| Landing | Convites da campanha versionada exibem 1 lead válido e aceito sem custo; acesso padrão permanece em até 2. |
| Consentimento | A oferta envia `termsVersion=2026-07-31-pilot-one-lead-v1` e `freePilotLeadLimit=1`; o contrato padrão envia `pilot-v2` e limite `2`. |
| Consistência | Título, métricas, explicação comercial, checkbox e payload usam o mesmo limite resolvido pela campanha atual. |
| Histórico | Termos e candidaturas anteriores não são reescritos. |

## 30/07/2026 · Piloto ajustado para dois leads gratuitos

| Área | Mudança pública |
|---|---|
| Landing | `/parceiros/` passa a limitar o piloto a até 2 leads qualificados aceitos por parceiro, sem cobrança durante o piloto. |
| Consentimento | Novas candidaturas enviam `termsVersion=2026-07-30-pilot-v2`, vinculando o aceite ao texto atualizado. |
| Continuidade | Os valores futuros permanecem Wallbox PF R$ 100, Wallbox PJ R$ 150 e energia solar PF/PJ R$ 250 por lead aceito, sempre após nova formalização. |
| Histórico | O registro abaixo documenta corretamente o contrato público anterior de 3 leads e não foi reescrito. |
| Verificação | 170/170 testes, build Vite, rotas estáticas e scanner do artifact aprovados. |

## 29/07/2026 · Programa de parceiros com piloto e preços futuros transparentes

| Área | Mudança pública |
|---|---|
| Landing | `/parceiros/` explica o piloto de até 3 leads aceitos sem cobrança e apresenta os valores previstos para continuidade. |
| Transparência | Wallbox PF R$ 100, Wallbox PJ R$ 150 e energia solar PF/PJ R$ 250 por lead aceito após o piloto. |
| Limite | Nenhum lead adicional é encaminhado antes de nova proposta, contrato, estrutura jurídica e fiscal adequadas, forma de pagamento e aceite formal. |
| Consentimento | A candidatura envia `termsVersion=2026-07-29-pilot-v1`, permitindo auditoria do texto aceito. |
| Privacidade | O frontend público envia apenas dados informados no formulário; operação administrativa e dados persistidos ficam fora deste repositório. |
| Engenharia | Contrato TypeScript explícito, testes de conteúdo/payload e build estático com scanner de segredos. |
| Verificação | 170/170 testes, build Vite e scanner do artifact aprovados. |

### Fronteira do repositório público

- removidos scripts de sincronização de máquinas e documentação de paths locais;
- `ROADMAP.md`, `DEVLOG.md`, `DEPLOY.md` e `CLAUDE.md` agora contêm apenas contexto adequado ao público;
- dashboards, dados, regras operacionais e runbooks detalhados permanecem em serviço/repositório privado;
- o contrato HTTP necessário ao frontend continua público e testável.

## 29/07/2026 · Rotas estáticas e atribuição

- URL canônica de parceiros normalizada para `/parceiros/`.
- Rotas estáticas geradas no build para compatibilidade com GitHub Pages.
- Parâmetros UTM preservados sem criar URLs inválidas.
- Metadados SEO e Open Graph próprios para a página de parceiros.

## Julho de 2026 · Captura consentida de interesse

- Fluxo separado para consumidores interessados em wallbox ou energia solar.
- Consentimento explícito antes da submissão.
- Eventos analíticos sem dados pessoais.
- Feature flag de build para rollout controlado.

## 2026 · Segurança do frontend e supply chain

- Content Security Policy no documento estático.
- Sanitização de entradas e detecção de padrões de prompt injection.
- GitHub Actions com permissões mínimas e dependências pinadas.
- Scanner bloqueia `.env`, private keys e credenciais conhecidas no artifact `dist/`.
- Source maps não são publicados no artifact de produção.

## 2026 · Catálogo, TCO e planejamento de rota

- Catálogo BEV com dados PBE/INMETRO e filtros avançados.
- Comparações compartilháveis por URL.
- Simuladores de economia, IPVA e TCO com premissas editáveis.
- Planejamento de rota com estimativa energética e fontes públicas de eletropostos.
- PWA responsiva, bilíngue e instalável.

## Política deste devlog

Pode entrar:

- arquitetura frontend;
- decisões de UX;
- contratos públicos;
- métricas de teste e build;
- segurança do artifact;
- fontes públicas e metodologia.

Não pode entrar:

- URLs administrativas;
- nomes e condições individuais de parceiros;
- IPs, paths pessoais ou detalhes de VPS;
- cron jobs, tokens, credenciais ou nomes de secrets;
- dados pessoais;
- lógica operacional que pertença ao serviço privado.
