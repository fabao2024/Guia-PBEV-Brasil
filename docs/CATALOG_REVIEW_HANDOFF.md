# Handoff da revisão do catálogo

Última atualização: 2026-08-25 11:55 UTC

Este documento é um ponto de retomada independente do modelo de LLM usado. Ele registra o ciclo de revisão do catálogo público, o que já foi publicado e o que ainda exige decisão explícita.

## Repositório e fonte da verdade

- Repositório: https://github.com/fabao2024/Guia-PBEV-Brasil
- Site: https://guiapbev.cloud
- Dados editáveis do catálogo: `src/constants.ts`
- Artefato gerado: `public/data/cars.json`
- Evidência pública: `src/constants/catalogEvidence.ts`
- Proveniência estruturada: `.github/data/catalog-provenance.json`
- Relatório atual de preços: `.github/data/bloco4-precos-relatorio-2026-08-24.md`

Nunca editar `public/data/cars.json` manualmente. Depois de alterar `src/constants.ts`, regenerar os artefatos com o gerador do repositório.

## Ciclo de blocos

### Bloco 1 — transparência e estrutura do catálogo

Status: concluído, publicado e verificado.

- Procedência dos dados e ressalva de preços indicativos.
- Ordenação por catálogo original, preço, autonomia, eficiência PBE e potência.
- Páginas estáticas individuais dos veículos.
- Correções de SEO e metadados no JSON público.
- Commit: `9f0950f` (`feat: static car pages, catalog ranking and data evidence`).

### Bloco 2 — alinhamento com a tabela PBEV/Inmetro 2026_14_AGOd

Status: concluído, publicado e verificado.

- Correções de valores homologados quando o pareamento era inequívoco.
- Atualização do BMW iX3 para a geração NA5.
- Triagem dos modelos ausentes da tabela vigente.
- Marcação de descontinuação somente quando havia evidência suficiente, incluindo Nissan Ariya e outros casos conclusivos.
- Commits:
  - `f67310d` — alinhamento inicial com a tabela PBEV/Inmetro;
  - `d170a3d` — triagem conclusiva com fontes oficiais;
  - `e512607` — iX3 NA5 e Nissan Ariya.

### Bloco 3 — preenchimento dos dados PBEV faltantes

Status: concluído, publicado e verificado.

- Pareamento manual entre nomes comerciais e homologações.
- Inclusão de nota PBE e consumo em MJ/km para 19 veículos.
- Cobertura registrada: 80 de 102 veículos ativos com dados PBE.
- TDD, TypeScript, build, scanner, CI e verificação ao vivo concluídos.
- Commit: `c3a5a0e` (`feat: fill PBE data for 19 vehicles homologated in table 2026_14_AGOd`).

### Bloco 4 — revisão dos preços indicativos

Status: pesquisa concluída; catálogo não alterado.

Relatório: `.github/data/bloco4-precos-relatorio-2026-08-24.md`

- Oito preços foram verificados e permaneceram iguais ao catálogo.
- Uma divergência foi confirmada:
  - BMW i7 xDrive60 M Sport: R$ 1.321.950 no catálogo;
  - R$ 1.373.950 na fonte oficial BMW, válido para agosto de 2026.
- Permaneceram ambíguos e não devem ser alterados sem nova decisão:
  - Hyundai Ioniq 5;
  - Chevrolet Equinox EV;
  - Mercedes-Benz EQA 250.
- Promoções temporárias não foram tratadas como preço de tabela.

### Bloco 5 — proveniência campo a campo

Status: não iniciado.

Objetivo: substituir registros genéricos de dados legados não verificados por evidência específica para campos como preço, autonomia, potência, bateria, carregamento e consumo, com fonte, data, referência e validade.

Não é autorização para alterar valores. Primeiro deve ser definida a fonte de cada campo e mantida a regra de não inventar dados.

### Bloco 6 — documentação do ciclo

Status: este handoff iniciou a documentação; a consolidação final em `DEVLOG.md` e `ROADMAP.md` ainda pode ser feita em uma etapa própria.

## Como retomar

Ao voltar ao trabalho, independentemente do modelo de LLM:

1. Ler este arquivo, `ROADMAP.md`, `DEVLOG.md` e o relatório do Bloco 4.
2. Verificar o estado real do repositório:

   ```bash
   git status --short --branch
   git log --oneline -12
   git pull --rebase origin main
   ```

3. Não alterar o catálogo automaticamente. Confirmar primeiro qual bloco será retomado e qual escopo foi aprovado.
4. Para concluir o Bloco 4, a sequência aprovada deve ser:
   - obter aprovação explícita para corrigir o i7;
   - criar teste RED para o novo preço;
   - alterar somente `src/constants.ts` e a proveniência/evidência necessária;
   - regenerar `public/data/cars.json` e demais artefatos;
   - executar testes, TypeScript, build e scanner;
   - revisar o diff;
   - fazer `git pull --rebase origin main` antes do push;
   - commit e push somente após aprovação;
   - acompanhar o CI/deploy e conferir `https://guiapbev.cloud/data/cars.json`.
5. Deixar Ioniq 5, Equinox EV e EQA 250 sem alteração até haver evidência suficiente ou nova decisão.
6. Depois do Bloco 4, retomar o Bloco 5 com uma matriz de proveniência por campo, sem transformar ausência de fonte em estimativa.
7. Fechar o Bloco 6 atualizando a documentação pública com fatos verificáveis e sem informações privadas.

## Regras que continuam válidas

- `src/constants.ts` é a fonte editável; JSON público é gerado.
- Só atualizar pares inequívocos com evidência verificável.
- Modelos sem homologação na tabela vigente não recebem nota PBE por inferência.
- Preço do catálogo significa preço indicativo de veículo 0 km, não valor FIPE de usado.
- Não publicar alterações sem aprovação explícita.
- Não usar merge commit ou force push em `main`.
- Preservar a cronologia e o histórico das fontes.

## Prompt de retomada sugerido

```text
Leia docs/CATALOG_REVIEW_HANDOFF.md, ROADMAP.md, DEVLOG.md e .github/data/bloco4-precos-relatorio-2026-08-24.md no repositório Guia-PBEV-Brasil. Recupere o estado do ciclo de blocos. Não altere arquivos, não faça commit, push ou deploy sem minha aprovação explícita. Primeiro mostre o status Git e proponha somente o próximo passo do bloco que eu indicar.
```
