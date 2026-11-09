# Guia PBEV Brasil · Roadmap público

Este roadmap cobre somente o produto público disponível em [guiapbev.cloud](https://guiapbev.cloud) e o código frontend deste repositório.

Operações administrativas, dados pessoais, regras de matching, credenciais, infraestrutura privada e informações de parceiros não fazem parte deste repositório.

## Princípios

- Dados de veículos provenientes de fontes públicas e oficiais, com data de atualização visível.
- Experiência mobile-first, acessível e progressiva.
- Cálculos reproduzíveis para autonomia, energia, IPVA e TCO.
- Privacidade por padrão e consentimento explícito em formulários.
- Nenhuma credencial embutida no build estático.
- Integrações externas tratadas por contratos HTTP mínimos e testados.

## Entregue

| Área pública | Estado | Resumo |
|---|---:|---|
| Catálogo BEV | ✅ | Busca, filtros, imagens, ficha técnica e dados PBE/INMETRO |
| Catálogo híbrido | 🚧 | Filtro por propulsão (BEV/PHEV/HEV/REEV) e 3 PHEV BYD com fonte oficial; HEV, REEV e demais marcas em lotes seguintes |
| Comparação | ✅ | Comparação lado a lado com URLs compartilháveis |
| Simulador de economia | ✅ | Energia, combustível e premissas editáveis; detalhes fiscais somente no TCO ou na ficha do veículo |
| TCO | ✅ | IPVA SP por modelo e exercício civil, com alíquotas anuais na tabela/PNG, projeção condicional opcional e comparação parcial quando o imposto é indisponível |
| Quiz de recomendação | ✅ | Recomendação local baseada no perfil informado (km/dia, orçamento, recarga, carroceria, prioridade), com BEV e híbridos |
| Planejamento de rota | ✅ | Estimativa de consumo e eletropostos ao longo do trajeto |
| PWA | ✅ | Manifesto, instalação e experiência responsiva |
| Internacionalização | ✅ | PT-BR e inglês |
| Observabilidade pública | ✅ | Eventos de produto sem identificação pessoal |
| Segurança do cliente | ✅ | CSP, sanitização, rate limit e scanner de segredos no build |
| Governança de dados | ✅ | Coletores oficiais, proveniência versionada, relatórios fail-closed e manutenção mensal auditável |
| Interesse em serviços | ✅ | Formulário consentido para wallbox, energia solar e limpeza de placas solares em SP |
| Programa de parceiros | ✅ | Landing com cadastro aberto para wallbox, energia solar e limpeza de sistemas solares, termos transparentes, funil mensurável e revisão humana |

## Programa público de parceiros

O cadastro de parceiros para wallbox, energia solar e limpeza de sistemas solares em SP segue regras visíveis na própria landing `/parceiros/`:

- limite gratuito único exibido e aceito na própria landing: 1 lead qualificado e aceito, sem custo, por parceiro, independentemente da origem ou campanha;
- Wallbox PF: R$ 100 por lead aceito após o piloto;
- Wallbox PJ: R$ 150 por lead aceito após o piloto;
- energia solar integrada à recarga PF/PJ: R$ 250 por lead aceito após o piloto;
- limpeza de sistema de placa solar PF/PJ: R$ 35 por lead aceito após o piloto;
- nenhum lead adicional antes de nova proposta, contrato, estrutura jurídica e fiscal adequadas, forma de pagamento e aceite formal;
- sem promessa de volume ou conversão;
- compartilhamento de contato somente após consentimento e revisão humana.

O frontend envia a candidatura a uma API externa por contrato versionado, incluindo o limite numérico exibido no aceite. Implementação administrativa, dados e automações permanecem fora deste repositório público.

## Próximos incrementos públicos

### Propostas em validação

- **Experiências reais de uso** — receber, com consentimento explícito, foto do painel e contexto de consumo informado por proprietários; diferenciar visualmente relato real, dado homologado, simulação e medição independente; manter revisão humana antes de qualquer publicação.

### Curto prazo

- concluir a revisão individual das localizações do Mapa EV: 159 legados sem evidência em quarentena; arquivo OCM histórico complementado por 94 fichas adicionais consultadas em novembro e 396 registros do extrato OSM/Geofabrik de 08/11/2026, total local de 1.787 registros. Extrato completo e checksum verificados; campos ausentes e 33 centros de áreas aproximados explícitos. Datas de arquivo, consulta, extrato e atualização não se confundem; fontes podem repetir um local físico. Sincronização OCM nacional depende de chave autorizada e permanece pendente. Abertura independente das APIs, agrupamentos e critérios DC mais restritos nas rotas preservados. Sem publicação; ver `docs/mapa-ev-localizacoes.md`.
- ampliar testes de acessibilidade das rotas de catálogo, comparação e parceiros;
- publicar metodologia das estimativas de TCO e consumo;
- melhorar Core Web Vitals e divisão de bundles;
- exibir atualização e procedência dos dados de forma mais granular.
- concluir a auditoria de IPVA das demais UFs e a evidência técnica por versão; revisão dos 16 híbridos flex com fontes brasileiras em `docs/ipva-sp-2026.md`: 8 com isenção SP estimada pelo preço de catálogo, 3 acima do teto e 5 pendentes. Dados ou tetos ausentes não determinam 4%; TCO parcial exclui o imposto de ambos os veículos somente nos exercícios pendentes. As outras UFs e as cinco versões com lacunas seguem pendentes de auditoria/evidência.

### Médio prazo

- histórico comparável de preços públicos;
- novos cenários de recarga residencial e pública;
- exportação compartilhável de comparações e simulações;
- biblioteca pública de experiências reais de uso, condicionada a uma base robusta de relatos revisados e a uma metodologia pública de agregação;
- expansão geográfica do programa de parceiros somente após validação do piloto.

### Fora do escopo público

- dashboards administrativos;
- Kanbans internos;
- dados de consumidores ou parceiros;
- regras privadas de deduplicação, matching e due diligence;
- credenciais, infraestrutura, jobs e runbooks operacionais;
- condições comerciais individuais.

## Critério de conclusão

Uma entrega pública só é marcada como concluída após:

1. teste automatizado relevante;
2. build de produção;
3. scanner de segredos do artifact;
4. documentação pública sem informação operacional privada;
5. deploy verificado na URL canônica.
