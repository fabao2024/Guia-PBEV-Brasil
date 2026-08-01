/**
 * Cria, atualiza, reabre ou fecha a issue mensal única a partir dos JSONs dos coletores.
 * Executado por actions/github-script.
 */
module.exports = async ({ github, context, core }) => {
  const { readFileSync } = require('node:fs');
  const { buildMaintenanceReport } = await import('./maintenance-report.mjs');
  const { maintenancePeriodMarker, parseCollectorPayload } = await import('./maintenance-core.mjs');

  const now = new Date();
  const period = process.env.MAINTENANCE_PERIOD || now.toISOString().slice(0, 7);
  const monthLabel = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(`${period}-15T12:00:00Z`));
  const marker = maintenancePeriodMarker(period);

  const fromFile = source => {
    try {
      return parseCollectorPayload(readFileSync(`.maintenance-results/${source}.json`, 'utf8'), source);
    } catch {
      return parseCollectorPayload('', source);
    }
  };
  const results = [
    parseCollectorPayload(process.env.ANP_RESULT, 'anp'),
    parseCollectorPayload(process.env.ANEEL_RESULT, 'aneel'),
    parseCollectorPayload(process.env.PBEV_RESULT, 'pbev'),
    fromFile('news'),
    fromFile('brand_links'),
    fromFile('provenance'),
  ];
  const report = buildMaintenanceReport({
    period,
    monthLabel,
    results,
    workflowUrl: process.env.WORKFLOW_URL,
  });

  const labelDefinitions = {
    maintenance: ['0075ca', 'Manutenção periódica automatizada'],
    automated: ['6f42c1', 'Gerado ou atualizado por automação'],
    'maintenance-blocked': ['b60205', 'Fonte crítica falhou ou ficou parcial'],
    'maintenance-attention': ['fbca04', 'Cobertura consultiva parcial ou ação pendente'],
    'maintenance-changes': ['1d76db', 'Alterações de dados detectadas'],
    'maintenance-verified': ['0e8a16', 'Todas as fontes verificadas sem alterações'],
  };
  for (const label of report.labels) {
    const [color, description] = labelDefinitions[label];
    try {
      await github.rest.issues.createLabel({
        owner: context.repo.owner,
        repo: context.repo.repo,
        name: label,
        color,
        description,
      });
    } catch (error) {
      if (error.status !== 422) throw error;
    }
  }

  const issues = await github.paginate(github.rest.issues.listForRepo, {
    owner: context.repo.owner,
    repo: context.repo.repo,
    state: 'all',
    per_page: 100,
  });
  const normalizedMonth = monthLabel.toLocaleLowerCase('pt-BR');
  const existing = issues.find(issue => issue.body?.includes(marker))
    ?? issues.find(issue =>
      issue.title.toLocaleLowerCase('pt-BR').includes('manutenção mensal')
      && issue.title.toLocaleLowerCase('pt-BR').includes(normalizedMonth),
    );

  let issue;
  if (existing) {
    issue = await github.rest.issues.update({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: existing.number,
      title: report.title,
      body: report.body,
      labels: report.labels,
      state: report.shouldClose ? 'closed' : 'open',
      ...(report.shouldClose ? { state_reason: 'completed' } : {}),
    });
    core.info(`Issue mensal #${existing.number} atualizada; estado=${report.shouldClose ? 'closed' : 'open'}.`);
  } else {
    issue = await github.rest.issues.create({
      owner: context.repo.owner,
      repo: context.repo.repo,
      title: report.title,
      body: report.body,
      labels: report.labels,
    });
    if (report.shouldClose) {
      issue = await github.rest.issues.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issue.data.number,
        state: 'closed',
        state_reason: 'completed',
      });
    }
    core.info(`Issue mensal #${issue.data.number} criada.`);
  }

  core.setOutput('issue-number', issue.data.number);
  core.setOutput('issue-url', issue.data.html_url);
  core.setOutput('overall-status', report.overall.code);
};
