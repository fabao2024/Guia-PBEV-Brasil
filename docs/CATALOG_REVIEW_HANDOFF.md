# Handoff da revisão do catálogo

Última atualização: 2026-08-26 09:00 UTC

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

Status: em execução; cobertura verificada em **456/763** campos com fonte oficial direta por campo. Lotes de marcas, o pareamento completo da tabela PBEV e os lotes BYD, MG Motor, Mini, GWM/Porsche/Zeekr/Neta e carros de passeio (lote A) concluídos.

Documentos: matriz (`bloco5-matriz-proveniencia-2026-08-25.md`) e relatórios de lote (`lote-piloto-volvo`, `lote-marcas`, `itens-1-a-4`, `lote-pbev-consumo`, `lote-audi`, `lote-decisoes-pendentes`, `lote-gac`, `lote-geely`, `lote-jac`, `lote-kia-lexus-nissan`, `lote-peugeot-renault-audi`, `lote-pbev-final`, `lote-tracoes`, `lote-byd-fichas`, `lote-mg-motor`, `lote-mini`, `lote-gwm-porsche-zeekr-neta`, `lote-a-passeio`).

- Registro ampliado de 3 para 7 campos (`price`, `range_km`, `consumption`, `power`, `battery`, `charging`, `availability`) com bootstrap sem inventar evidência.
- Tabela PBEV vigente auditada ponta a ponta: extração linha a linha do PDF oficial, pareamento manual auditado por família, consumo e autonomia alinhados (inclui correções BYD Dolphin/GWM Ora/MG4/Zeekr/Volvo, preenchimentos Leapmotor/iEV330P e autonomias iX/Blazer/Q8).
- Marcas com lote concluído: Volvo, BYD, BMW, Chevrolet, Hyundai, Mercedes-Benz, GAC, Geely, JAC, Kia, Lexus, Nissan, Peugeot, Renault, Audi.
- Triagens concluídas: BMW i4 eDrive35, Mercedes EQE 300 SUV, BYD eT3 e Audi Q8 e-tron descontinuados; Kwid E-Tech reativado (voltou ao site oficial); EQB renomeado para EQB 250+; Yuan Plus AWD confirmado à venda.
- Pendências: trações divergentes resolvidas (Ioniq 5 AWD HTRAC; Geely EX2 tração traseira); fail-closed documentados (Mini Cooper/JCW, Macan variantes, família e-tron GT, vans Cargo-only, Kangoo preço, Yuan Plus FWD fora da linha 2027); lacunas de cobertura à triagem (Aion Y Premium, Hyptec HT Ultra); reavaliações (Equinox EV esgotado mantido ativo por decisão).
- Lote BYD por ficha técnica oficial (09/07/2026): +32 campos verificados; 10 correções aprovadas (baterias Mini GS/Plus/Seal/Yuan Pro; carregamentos Dolphin GS, Han, Seal, Tan DC 170 kW e Yuan Pro); consumo MJ/km conferido em 10 modelos sem divergência.
- Lote MG Motor por fichas técnicas oficiais e tabela MY 26/27: +42 campos verificados; 15 correções aprovadas (preços MG4 Comfort/Luxury e MGS5 Comfort/Luxury; carregamentos AC 11 kW da linha MG4, AC 7/DC 150 kW do MGS5 e AC 11/DC 150 kW do Cyberster; baterias nominais 42,8/53,9 kWh do Urban; potência 205 cv do MGS5).
- Lote Mini por lista de preços oficial ago/26 e releases BMW Group Brasil: +19 campos verificados; fechou o fail-closed do pareamento PBEV das linhas Mini (Cooper E 239 km/0,46; JCW-E 306 km/0,48); correções aprovadas em autonomia/consumo/preço do Cooper E, consumo/preço do JCW-E, preço do Aceman SE e bateria (66,45 kWh bruta)/preço do Countryman SE.
- Lote GWM/Porsche/Zeekr/Neta por páginas e documentos oficiais: +35 campos verificados; 8 correções aprovadas (Ora 5 R$ 163.990; Cayenne 442 cv/113 kWh/DC 390 kW; Macan = linha MACAN E4 da tabela com consumo 0,60 MJ/km e preço R$ 690.000 do Macan 4; Taycan MY27 R$ 1.080.000; Neta X 500 com bateria LFP 64,1 kWh). Renomeações de nomenclatura (Macan 4, Taycan 4S Cross Turismo) avaliadas e não aplicadas para preservar URLs canônicas.
- Lote A (carros de passeio): +21 campos verificados; correções aprovadas no ID.Buzz (337 km INMETRO), e-Transit (269 cv — kW lido como cv — e AC 11,5 kW), Omoda E5 (61,1 kWh), Avatr 11 (578 cv do site oficial) e iCar EQ descontinuado; ficha Ford confirmou todos os valores do Mach-E; VW ID.4 segue legado até a publicação das specs da versão de varejo.
- Commits: `8a6ffdf`, `4a4b5c4`, `1638a87`, `1b98995`, `9584b78`, `7a0baeb`, `ed2322f`, `aa7aae2`, `7f2b358`, `61d709a`, `e1b841a`, `bd3ca4c`, `c022128`, `58ad51c`.

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
5. Deixar casos sem evidência conclusiva sem alteração até haver decisão explícita (hoje: Equinox EV — esgotado sem previsão de retorno, mantido à venda por decisão do mantenedor; Yuan Plus FWD — linha atual é versão única AWD; BYD Tan EV — página oficial cita 110 kW DC e a ficha técnica oficial 170 kW; prevaleceu a ficha).
6. Retomar o Bloco 5 pelo lote B (comerciais leves e Leapmotor: Citroën e-Jumpy, Fiat e-Scudo, Farizon ×2, Foton ×2, Leapmotor ×2), seguido da varredura final de `availability`.
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
