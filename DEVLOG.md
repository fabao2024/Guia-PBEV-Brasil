# Guia PBEV Brasil · Devlog público

Notas técnicas selecionadas do produto público. Este documento não registra infraestrutura privada, dashboards administrativos, parceiros individuais, credenciais, dados pessoais ou runbooks operacionais.

## 29/07/2026 · Programa de parceiros com piloto e preços futuros transparentes

| Área | Mudança pública |
|---|---|
| Landing | `/parceiros/` explica o piloto de até 3 leads aceitos sem cobrança e apresenta os valores previstos para continuidade. |
| Transparência | Wallbox PF R$ 100, Wallbox PJ R$ 150 e energia solar PF/PJ R$ 250 por lead aceito após o piloto. |
| Limite | Nenhum lead adicional é encaminhado antes de nova proposta, contrato, estrutura fiscal, forma de pagamento e aceite formal. |
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
