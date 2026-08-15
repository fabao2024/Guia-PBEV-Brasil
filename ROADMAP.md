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
| Comparação | ✅ | Comparação lado a lado com URLs compartilháveis |
| Simulador de economia | ✅ | Energia, combustível, IPVA e premissas editáveis |
| TCO | ✅ | Custo total de propriedade com cenários reproduzíveis |
| Quiz de recomendação | ✅ | Recomendação local baseada no perfil informado |
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

### Curto prazo

- ampliar testes de acessibilidade das rotas de catálogo, comparação e parceiros;
- publicar metodologia das estimativas de TCO e consumo;
- melhorar Core Web Vitals e divisão de bundles;
- exibir atualização e procedência dos dados de forma mais granular.

### Médio prazo

- histórico comparável de preços públicos;
- novos cenários de recarga residencial e pública;
- exportação compartilhável de comparações e simulações;
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
