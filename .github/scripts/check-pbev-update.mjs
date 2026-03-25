/**
 * check-pbev-update.mjs
 * Verifica se existe uma nova tabela PBEV/INMETRO publicada.
 *
 * A tabela atual no projeto é identificada pela constante CURRENT_TABLE_ID abaixo.
 * O script busca na página oficial do INMETRO por links de PDF com nome mais recente.
 * Se encontrar uma versão mais nova, abre uma GitHub Issue notificando.
 *
 * NOTA: Atualização automática do catálogo NÃO é feita aqui —
 * o PDF requer pdfplumber (Python) e mapeamento manual de modelos.
 * O processo manual está documentado em CLAUDE.md.
 *
 * Fonte: https://www.inmetro.gov.br/paineis-resultado/energia/pbev.asp
 */

import { execSync } from 'child_process';

// ── Configuração ──────────────────────────────────────────────────────────────

// Identificador da tabela atual no repositório (do nome do arquivo PDF)
// Formato: "PBEV AAAA_AA_MES-REVNN"
const CURRENT_TABLE_ID = 'PBEV 2026_27_FEV-REV05';

// Páginas candidatas para verificação (tentadas em ordem)
const PBEV_PAGES = [
  'https://www.pbev.gov.br/tabelas-de-eficiencia-energetica.php',
  'https://www.inmetro.gov.br/paineis-resultado/energia/pbev.asp',
  'https://www.gov.br/inmetro/pt-br/assuntos/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/pbev',
];

// Padrão para identificar links de tabela PBEV em HTML
const TABLE_LINK_PATTERN = /href="([^"]*Tabela[^"]*PBEV[^"]*\.pdf[^"]*)"/gi;
const VERSION_PATTERN    = /PBEV\s+(\d{4}_\d{2}_\w{3}-REV\d{2})/i;

// ── Helpers ───────────────────────────────────────────────────────────────────

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe','pipe','pipe'] }).trim();
}

/**
 * Compara dois identificadores de versão PBEV.
 * Ex: "PBEV 2026_27_FEV-REV05" vs "PBEV 2026_27_MAR-REV06"
 * Retorna true se found > current.
 */
function isNewer(found, current) {
  // Extrai: year, month abbr, revision number
  const parse = (s) => {
    const m = s.match(/(\d{4})_(\d{2})_(\w{3})-REV(\d{2})/i);
    if (!m) return null;
    const MONTHS = { JAN:1,FEV:2,MAR:3,ABR:4,MAI:5,JUN:6,JUL:7,AGO:8,SET:9,OUT:10,NOV:11,DEZ:12 };
    return {
      year: parseInt(m[1]),
      month: MONTHS[m[3].toUpperCase()] ?? 0,
      rev: parseInt(m[4]),
    };
  };
  const f = parse(found);
  const c = parse(current);
  if (!f || !c) return false;
  if (f.year  !== c.year)  return f.year  > c.year;
  if (f.month !== c.month) return f.month > c.month;
  return f.rev > c.rev;
}

/**
 * Tenta buscar links de PDF PBEV em uma URL.
 * Retorna array de { url, version } ou [] em caso de erro.
 */
async function scrapeLinks(pageUrl) {
  try {
    const resp = await fetch(pageUrl, {
      headers: { 'User-Agent': 'GuiaPBEV-Bot/1.0' },
      signal: AbortSignal.timeout(10_000),
    });
    if (!resp.ok) return [];
    const html = await resp.text();

    const found = [];
    let m;
    while ((m = TABLE_LINK_PATTERN.exec(html)) !== null) {
      const href = m[1];
      const vm = VERSION_PATTERN.exec(href) ?? VERSION_PATTERN.exec(html.slice(Math.max(0, m.index - 200), m.index + 200));
      const version = vm ? `PBEV ${vm[1]}` : null;
      found.push({ url: href.startsWith('http') ? href : new URL(href, pageUrl).href, version });
    }
    return found;
  } catch (e) {
    console.log(`  ↳ Não acessível: ${e.message}`);
    return [];
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`🔍 Verificando nova tabela PBEV (atual: ${CURRENT_TABLE_ID})…`);

  let newerTable = null;

  for (const pageUrl of PBEV_PAGES) {
    console.log(`   Verificando: ${pageUrl}`);
    const links = await scrapeLinks(pageUrl);

    if (links.length) {
      console.log(`   ${links.length} link(s) de tabela encontrado(s)`);
      for (const link of links) {
        if (link.version && isNewer(link.version, CURRENT_TABLE_ID)) {
          newerTable = link;
          console.log(`   🆕 Versão mais nova detectada: ${link.version}`);
          break;
        }
      }
      if (newerTable) break;
    }
  }

  if (!newerTable) {
    console.log('✅ Nenhuma tabela PBEV mais recente encontrada. Nada a fazer.');
    return;
  }

  // Abrir issue notificando sobre nova tabela
  console.log('📋 Abrindo issue no GitHub…');

  const token = process.env.GH_TOKEN;
  if (!token) throw new Error('GH_TOKEN não definido');

  const [owner, repo] = run('git remote get-url origin')
    .replace('https://github.com/', '').replace('.git', '').split('/');

  const issueBody = `## Nova tabela PBEV disponível

**Versão detectada:** ${newerTable.version ?? '(versão não identificada)'}
**Versão atual no repositório:** ${CURRENT_TABLE_ID}
**Link:** ${newerTable.url}

### Passos para atualizar

1. Baixar o PDF: ${newerTable.url}
2. Salvar em \`public/\` ou na raiz do projeto
3. Extrair dados com pdfplumber:
   \`\`\`bash
   pip install pdfplumber
   python3 -c "
   import pdfplumber, json
   with pdfplumber.open('Tabela-PBEV-nova.pdf') as pdf:
       rows = []
       for page in pdf.pages:
           rows += page.extract_table() or []
   # filtrar col 5 case-insensitive por 'elétrico'
   ev_rows = [r for r in rows if r and r[4] and 'elétrico' in r[4].lower()]
   print(json.dumps(ev_rows, ensure_ascii=False, indent=2))
   "
   \`\`\`
4. Atualizar campos \`range\`, \`pbeRating\`, \`energyMJkm\` em \`src/constants.ts\`
5. Atualizar \`CURRENT_TABLE_ID\` em \`.github/scripts/check-pbev-update.mjs\`

🤖 Detectado automaticamente por [GuiaPBEV Bot](https://github.com/${owner}/${repo}/actions)`;

  const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      title: `📋 Nova tabela PBEV disponível — ${newerTable.version ?? 'versão desconhecida'}`,
      body: issueBody,
      labels: ['dados'],
    }),
  });

  if (!resp.ok) throw new Error(`Erro ao criar issue: ${resp.status} ${await resp.text()}`);
  const issue = await resp.json();
  console.log(`🎉 Issue criada: ${issue.html_url}`);
}

main().catch(err => {
  // Falha não crítica — não deve parar o workflow de manutenção
  console.error('⚠️  check-pbev-update falhou:', err.message);
  console.error('   O scraping de sites do governo pode estar instável. Verifique manualmente:');
  PBEV_PAGES.forEach(u => console.error(`   ${u}`));
  // Exit 0 para não bloquear o workflow pai
  process.exit(0);
});
