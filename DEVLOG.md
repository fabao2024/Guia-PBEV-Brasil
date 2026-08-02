# Guia PBEV Brasil · Devlog público

Notas técnicas selecionadas do produto público. Este documento não registra infraestrutura privada, dashboards administrativos, parceiros individuais, credenciais, dados pessoais ou runbooks operacionais.

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
