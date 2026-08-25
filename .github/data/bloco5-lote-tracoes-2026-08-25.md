# Lote trações · Bloco 5 — correção de drivetrain conforme fontes oficiais

Data da verificação/aplicação: 2026-08-25
Fontes: hyundai.com.br (catálogo digital oficial do Ioniq 5: "Tração AWD HTRAC", motor elétrico duplo, 325 cv combinados) e geelybrasil.com.br (página e ficha técnica do EX2: motor traseiro, "o único do segmento com tração traseira").

## Correções aplicadas (aprovação explícita em 25/08/2026)

| Veículo | Campo | Antes | Depois |
|---|---|---|---|
| Hyundai Ioniq 5 | `traction` | RWD | **AWD** (HTRAC, dois motores) |
| Geely EX2 Pro | `traction` | FWD | **RWD** |
| Geely EX2 Max | `traction` | FWD | **RWD** |

Observações: o campo `traction` não integra os 7 campos rastreados pelo registro de proveniência; a correção segue documentada neste relatório com as fontes oficiais acima. Os textos descritivos dos veículos não citavam a tração.

## Verificações

`npm run test:run` 281/281 · TypeScript limpo · build Vite · rotas estáticas · scanner de `dist` · verificador de proveniência (307/763).
