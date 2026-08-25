# Handoff da revisão do catálogo

Última atualização: 2026-08-25 18:05 UTC

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

Status: concluído, publicado e verificado.

Relatório: `.github/data/bloco4-precos-relatorio-2026-08-24.md`

- Oito preços foram verificados e permaneceram iguais ao catálogo.
- Uma divergência foi confirmada e corrigida com aprovação explícita, teste RED→GREEN, histórico de preços e verificação ao vivo:
  - BMW i7 xDrive60 M Sport: R$ 1.321.950 → R$ 1.373.950 (fonte oficial BMW).
- Casos ambíguos seguiram para tratamento nos lotes do Bloco 5 (Ioniq 5 teve autonomia e potência verificadas na página oficial; preço segue pendente).
- Promoções temporárias não foram tratadas como preço de tabela.
- Commit: `1cc8f44` (`fix(catalog): align BMW i7 xDrive60 price with official BMW table`).

### Bloco 5 — proveniência campo a campo

Status: em execução; lotes de 2026-08-25 publicados e verificados.

Documentos: `.github/data/bloco5-matriz-proveniencia-2026-08-25.md` e relatórios de lote (`bloco5-lote-piloto-volvo`, `bloco5-lote-marcas`, `bloco5-itens-1-a-4`).

- Matriz de proveniência por campo publicada; registro ampliado de 3 para 7 campos (`price`, `range_km`, `consumption`, `power`, `battery`, `charging`, `availability`) com bootstrap sem inventar evidência.
- Cobertura verificada: 62/763 campos com fonte oficial direta por campo.
- Correções de valor aplicadas somente após aprovação explícita, sempre via TDD, com snapshots em `src/constants/priceHistory.ts`: Volvo (EX30 Plus/Ultra, EX40, EC40, EX90 preço/potência/torque), Chevrolet Blazer EV RS, Mercedes EQA 250 (autonomia) e EQE 350 (potência/carregamento CA), BYD Seal, Yuan Pro e Dolphin Plus.
- Triagens com evidência oficial: BMW i4 eDrive35 e Mercedes-Benz EQE 300 SUV marcados como descontinuados; Yuan Plus AWD e BYD eT3 ausentes do menu oficial seguem para triagem futura.
- Coletor PBEV confirma a tabela `2026_14_AGOd` vigente.
- Pendências: extração de linhas do PDF PBEV para verificar `consumption`; lotes das demais marcas; preços BYD ambíguos (Dolphin Mini GL/GS, Yuan Plus); renome EQB 250+ pendente de fonte oficial.
- Commits: `8a6ffdf`, `4a4b5c4`, `1638a87`, `1b98995`, `9584b78`, `7a0baeb`.

### Bloco 6 — documentação do ciclo

Status: concluído nesta data; este handoff, `DEVLOG.md` e o roadmap público refletem o estado real dos blocos.

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
4. Para concluir um bloco, a sequência aprovada é:
   - obter aprovação explícita para cada alteração de valor;
   - criar teste RED para os novos valores;
   - alterar somente `src/constants.ts` e a proveniência/evidência necessária;
   - regenerar `public/data/cars.json` e demais artefatos;
   - executar testes, TypeScript, build e scanner;
   - revisar o diff;
   - fazer `git pull --rebase origin main` antes do push;
   - commit e push somente após aprovação;
   - acompanhar o CI/deploy e conferir `https://guiapbev.cloud/data/cars.json`.
5. Deixar casos sem evidência conclusiva sem alteração até haver decisão explícita (hoje: Dolphin Mini GL/GS, Yuan Plus, Yuan Plus AWD, eT3, renome EQB 250+, preço do Ioniq 5 e do Equinox EV).
6. Retomar o Bloco 5 pelos lotes restantes: parser de linhas do PDF PBEV (`consumption`), marcas ainda não verificadas (Audi, GAC, Geely, JAC, Kia, Lexus, Nissan, Peugeot, Renault, Toyota e outras) e triagens pendentes.
7. Manter a documentação pública atualizada com fatos verificáveis e sem informações privadas.

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
