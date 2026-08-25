# Lote PBEV · Bloco 5 — consumo verificado contra a tabela oficial

Data da verificação: 2026-08-25
Fonte: `Tabela PBEV 2026_14_AGOd.pdf` (download direto via página oficial do Inmetro; SHA-256 confirmado pelo coletor `check-pbev-update.mjs`)

## Método

1. Download do PDF oficial e extração de texto (`pdf-parse`, executado fora do repositório);
2. identificação das linhas de veículos elétricos pelo padrão de cauda `<MJ/km> <autonomia> <graus> `;
3. pareamento manualmente auditado entre linhas da tabela e entradas do catálogo, com aliases explícitos por veículo;
4. marcação de `verified` apenas nos 44 pares com MJ/km E autonomia idênticos ao catálogo;
5. nenhum valor do catálogo foi alterado neste lote.

## Resultado

- Cobertura do registro: **145/763** campos verificados (era 62/763).
- 44 campos `consumption` marcados como `verified` (`official_regulator`);
- 39 campos `range_km` adicionais passaram a `verified` pela mesma fonte.

## Divergência detectada (sem correção; exige decisão)

| Veículo | Catálogo | Tabela vigente |
|---|---|---|
| Renault Kwid E-Tech | autonomia 180 km | 185 km |

## Pendências para o próximo ciclo

- Revisar os ~38 veículos PBE não marcados neste lote (pareamentos exigem validação caso a caso: GWM Ora 03 nas três baterias, BYD Dolphin GS/Plus/Mini GS, Mini Cooper/JCW/Aceman, Volvo EX30 Plus/Ultra/EX40/EX90, Audi Q6/A6, Porsche Macan/Cayenne/Taycan variantes, MG4/MG5 restantes, Peugeot Expert/Jumpy (tabela só lista Cargo), Zeekr X, Equinox EV e Leapmotor C10 aparentemente ausentes da edição vigente).
- Divergências menores já visíveis (a confirmar no mesmo método): Dolphin GS (0.51×0.42 MJ/km), MG4 Comfort/Luxury (0.59×0.50), GWM Ora 03 (±0.01–0.03), EX30 Plus (0.57×0.55), Zeekr X (0.59×0.55), Macan (0.61×0.60).
