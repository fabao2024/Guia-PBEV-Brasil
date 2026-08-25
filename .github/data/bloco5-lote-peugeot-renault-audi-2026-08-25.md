# Lote Peugeot + Renault + Audi · Bloco 5 — fechamento das marcas restantes

Data da verificação/aplicação: 2026-08-25
Fontes: renault.com.br (páginas oficiais de versões e preços), media.stellantis.com (release oficial de lançamento do e-2008), audi.com.br / audi-imprensa.com.br, imprensa especializada para contexto.

## Resultado

Cobertura do registro: **267/763** campos verificados (era 257/763; +10 no lote). Correções aprovadas explicitamente pelo mantenedor e aplicadas via TDD RED→GREEN.

## Campos verificados sem alteração de valor

| Veículo | Campos |
|---|---|
| `renault-kwid-e-tech` | `price` (R$ 99.990) |
| `renault-megane-e-tech` | `power` (220 cv), `battery` (60 kWh), `availability` |

## Correções aplicadas (aprovação explícita em 25/08/2026)

| Veículo | Campo | Antes | Depois | Fonte |
|---|---|---|---|---|
| Megane E-Tech | `price` | R$ 279.900 | **R$ 279.990** | página oficial "a partir de" + snapshot no histórico |
| Kwid E-Tech | `range_km` | 180 km | **185 km** | tabela PBEV vigente (divergência registrada no lote PBEV-consumo) |
| Kwid E-Tech | disponibilidade | descontinuado | **à venda** | renault.com.br oferece o KWID E-TECH por R$ 99.990 — reverte a triagem do Bloco 2, quando o site omitia o modelo elétrico; teste do Bloco 2 atualizado com a nova evidência |
| e-2008 | `power` | 136 cv | **158 cv** | release oficial Stellantis (out/2024): "passando de 136 cv para 158 cv" |
| e-2008 | `battery` | 50 kWh NMC | **54 kWh LFP** | idem — catálogo misturava a geração anterior com a autonomia da nova |
| Q8 e-tron | disponibilidade | à venda | **descontinuado** | produção global encerrada em Bruxelas (fev/2025); releases da linha 2026 da Audi não citam o modelo |

## Fail-closed e observações registradas

- **Kangoo E-Tech**: preço oficial não capturado com clareza (a página oficial mistura valores de outros modelos no cabeçalho).
- **e-tron GT**: composição atual da família na Audi Brasil incerta após o lançamento do RS e-tron GT Performance (R$ 1.334.990, jun/2026, release oficial) — registrado para triagem futura; nada alterado.
- **e-208 GT**: sem evidência nova neste ciclo.
- **EV5/Kwid**: consumo 0,44 MJ/km do Kwid permanece verificado pela tabela.

## Método

1. Captura das páginas oficiais de preços Renault, do release Stellantis e dos materiais Audi (25/08/2026);
2. comparação campo a campo com `public/data/cars.json`;
3. aprovação explícita do mantenedor para cada correção, incluindo as duas mudanças de disponibilidade;
4. teste RED → edição em `src/constants.ts` → GREEN (incluindo atualização do teste legado do Bloco 2 sobre o Kwid);
5. regeneração de artefatos; `npm run test:run` (279/279), TypeScript, build Vite, rotas estáticas, scanner de `dist` e verificador de proveniência aprovados.
