/**
 * process-ev-suggestions.mjs
 * Roda semanalmente via GitHub Actions.
 * Lê issues abertas com label "sugestão-ev", adiciona veículos novos ao
 * CAR_DB em constants.ts e abre um PR para revisão humana.
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

// ── helpers ──────────────────────────────────────────────────────────────────

function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], ...opts }).trim();
}

/** Parse o corpo da issue no formato gerado pelo ChatWidget */
function parseIssueBody(body) {
  const field = (label) => {
    const m = body.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`));
    return m ? m[1].trim() : '';
  };

  const brand    = field('Marca');
  const model    = field('Modelo');
  const priceRaw = field('Preço');
  const rangeRaw = field('Autonomia');
  const category = field('Categoria');
  const source   = field('Fonte');
  const notes    = field('Observações');

  if (!brand || !model) return null;

  // Normaliza preço: "R$ 259.900" ou "259900" ou "259,900"
  const priceNum = parseInt(
    priceRaw.replace(/R\$|\s/g, '').replace(/\.(?=\d{3}(?!\d))/g, '').replace(',', '')
  );
  const rangeNum = parseInt(rangeRaw.replace(/[^\d]/g, ''));

  if (!priceNum || !rangeNum) return null;

  const VALID_CATS = ['Urbano', 'Compacto', 'SUV', 'Sedan', 'Luxo', 'Comercial'];
  const cat = VALID_CATS.find(c => c.toLowerCase() === category.toLowerCase()) ?? null;
  if (!cat) return null;

  return { brand, model, price: priceNum, range: rangeNum, cat, source, notes };
}

/** Gera a entrada TypeScript para o CAR_DB */
function generateEntry(v) {
  const slug = `${v.brand}-${v.model}`.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const imgPath = `/car-images/${slug}.jpg`;

  const fields = [
    `model: "${v.model}", brand: "${v.brand}", price: ${v.price}, range: ${v.range}, cat: "${v.cat}"`,
    `    img: "${imgPath}"`,
  ].join(',\n    ');

  return `  {\n    ${fields},\n  }`;
}

/** Insere entries no CAR_DB antes do `];` final */
function insertEntries(source, entries) {
  const marker = '\n];';
  const idx = source.lastIndexOf(marker);
  if (idx === -1) throw new Error('CAR_DB closing ]; not found in constants.ts');
  const toInsert = entries.map(e => '\n' + e + ',').join('');
  return source.slice(0, idx) + toInsert + source.slice(idx);
}

// ── main ─────────────────────────────────────────────────────────────────────

const issues = JSON.parse(
  run('gh issue list --label "sugestão-ev" --state open --json number,title,body --limit 50')
);

if (issues.length === 0) {
  console.log('Nenhuma sugestão aberta. Encerrando.');
  process.exit(0);
}

console.log(`${issues.length} issue(s) encontrada(s).`);

const constants = readFileSync('src/constants.ts', 'utf8');
const toAdd = [];

for (const issue of issues) {
  const v = parseIssueBody(issue.body);
  if (!v) {
    console.log(`#${issue.number}: corpo inválido ou campos obrigatórios ausentes — pulando.`);
    continue;
  }
  if (constants.includes(`model: "${v.model}"`)) {
    console.log(`#${issue.number}: ${v.brand} ${v.model} já está no catálogo — fechando issue.`);
    run(`gh issue comment ${issue.number} --body "✅ Este modelo já consta no catálogo. Encerrando a sugestão."`);
    run(`gh issue close ${issue.number}`);
    continue;
  }
  toAdd.push({ ...v, issueNumber: issue.number });
}

if (toAdd.length === 0) {
  console.log('Nenhum veículo novo para adicionar.');
  process.exit(0);
}

// Configura git
run('git config user.name "github-actions[bot]"');
run('git config user.email "github-actions[bot]@users.noreply.github.com"');

const branch = `ev-suggestions-${new Date().toISOString().slice(0, 10)}`;
run(`git checkout -b ${branch}`);

// Atualiza constants.ts
const entries = toAdd.map(generateEntry);
const updated = insertEntries(constants, entries);
writeFileSync('src/constants.ts', updated);

run('git add src/constants.ts');
const commitMsg = `feat(data): adicionar ${toAdd.length} EV(s) via sugestões da comunidade\n\n${toAdd.map(v => `- ${v.brand} ${v.model} (issue #${v.issueNumber})`).join('\n')}`;
run(`git commit -m ${JSON.stringify(commitMsg)}`);
run(`git push origin ${branch}`);

// Monta corpo do PR
const imgTodos = toAdd.map(v => {
  const slug = `${v.brand}-${v.model}`.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  return `- [ ] \`public/car-images/${slug}.jpg\` — ${v.brand} ${v.model} (fonte: ${v.source || 'não informada'})`;
}).join('\n');

const prBody = `## Sugestões de EV da comunidade

${toAdd.map(v => `- **${v.brand} ${v.model}** · R$ ${v.price.toLocaleString('pt-BR')} · ${v.range} km · ${v.cat} (issue #${v.issueNumber})`).join('\n')}

## ✅ Checklist antes de mergear

- [ ] Verificar specs no site oficial de cada marca
- [ ] Adicionar imagens pendentes abaixo
- [ ] Rodar \`npm run test:run\` localmente

## 🖼️ Imagens pendentes (adicionar manualmente)

${imgTodos}

---
_Gerado automaticamente pelo workflow \`weekly-ev-suggestions\`_`;

const prUrl = run(
  `gh pr create --title "feat(data): ${toAdd.length} EV(s) via sugestões — ${new Date().toISOString().slice(0, 10)}" --body ${JSON.stringify(prBody)} --base main --head ${branch}`
);

console.log(`PR criado: ${prUrl}`);

// Comenta nas issues processadas
for (const v of toAdd) {
  const slug = `${v.brand}-${v.model}`.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  run(`gh issue comment ${v.issueNumber} --body "🚗 Sugestão processada e incluída no ${prUrl}\n\n**Pendente:** adicionar imagem \`public/car-images/${slug}.jpg\` antes do merge."`);
}

console.log('Concluído.');
