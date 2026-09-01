import { deriveOverallStatus, maintenancePeriodMarker } from './maintenance-core.mjs';

const SOURCE_LABELS = {
  anp: 'ANP · combustíveis',
  aneel: 'ANEEL · eletricidade',
  pbev: 'INMETRO · PBEV',
  news: 'Notícias · descoberta',
  brand_links: 'Links de fabricantes',
  provenance: 'Proveniência do catálogo',
};
const STATUS_LABELS = {
  changed: '🔵 alterações',
  unchanged: '✅ verificado',
  partial: '🟡 parcial',
  failed: '🔴 falhou',
};

function md(value) {
  return String(value ?? '—')
    .replace(/\\/g, '\\\\')
    .replace(/([\[\]_*`<>|])/g, '\\$1')
    .replace(/[\r\n]+/g, ' ')
    .slice(0, 500);
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href.replace(/\)/g, '%29') : null;
  } catch {
    return null;
  }
}

function coverage(result) {
  if (!result.coverage) return '—';
  const verifiable = result.coverage.verifiable == null ? '' : ` (verificáveis ${result.coverage.verifiable})`;
  return `${result.coverage.checked}/${result.coverage.expected}${verifiable}`;
}

function link(label, value) {
  const url = safeUrl(value);
  return url ? `[${md(label)}](${url})` : '—';
}

function evidence(result) {
  return link('Fonte', result.details?.resourceUrl ?? result.details?.pdfUrl ?? result.details?.landingUrl);
}

function resultTable(results) {
  const rows = results.map(result => [
    md(SOURCE_LABELS[result.source] ?? result.source),
    md(STATUS_LABELS[result.status] ?? result.status),
    md(coverage(result)),
    md(result.repositoryReference),
    md(result.sourceUpdatedAt),
    String(result.changes ?? 0),
    link('PR', result.prUrl),
    evidence(result),
  ].join(' | '));
  return [
    '| Fonte | Resultado | Cobertura | Referência no Guia | Referência da fonte | Alterações | PR | Evidência |',
    '|---|---:|---:|---|---|---:|---|---|',
    ...rows.map(row => `| ${row} |`),
  ].join('\n');
}

function resultActions(result) {
  const actions = [];
  const sourceLabel = SOURCE_LABELS[result.source] ?? result.source;
  if (result.status === 'failed') actions.push(`- [ ] Corrigir **${md(sourceLabel)}**: ${md(result.error)}`);
  if (result.status === 'partial') actions.push(`- [ ] Resolver cobertura parcial de **${md(sourceLabel)}**: ${md(result.error)}`);
  for (const warning of (result.warnings ?? []).slice(0, 10)) {
    actions.push(`- [ ] Revisar alerta de **${md(sourceLabel)}**: ${md(warning)}`);
  }
  if (result.status === 'changed' && result.prUrl) actions.push(`- [ ] Revisar e mesclar ${link(`PR de ${sourceLabel}`, result.prUrl)}`);
  if (result.source === 'pbev' && result.status === 'changed') {
    actions.push(`- [ ] Comparar integralmente **${md(result.details?.reference)}** com o catálogo antes de atualizar a referência PBEV.`);
  }
  if (result.source === 'brand_links') {
    for (const item of (result.details?.links ?? []).filter(item => item.status === 'broken').slice(0, 20)) {
      actions.push(`- [ ] Corrigir link de **${md(item.brand)}**: ${link(item.url, item.url)}`);
    }
  }
  if (result.source === 'provenance' && result.status !== 'unchanged') {
    actions.push(`- [ ] Migrar proveniência legada: ${md(coverage(result))} campos críticos verificados.`);
  }
  return actions;
}

function findingsSection(results) {
  const news = results.find(result => result.source === 'news');
  if (!news) return 'Nenhum resultado de notícias disponível.';
  const findings = news.details?.findings ?? [];
  const rejected = news.details?.rejected ?? [];
  const lines = [];
  if (!findings.length) lines.push('- Nenhuma atualização comercial detectada.');
  for (const item of findings.slice(0, 20)) {
    lines.push(`- **${md(item.classification)} · ${md(item.source)}:** ${link(item.title, item.link)}. ${md(item.reason)}`);
  }
  if (rejected.length) {
    lines.push('', '<details><summary>Itens descartados automaticamente</summary>', '');
    for (const item of rejected.slice(0, 20)) {
      const renderedTitle = safeUrl(item.link) ? link(item.title, item.link) : md(item.title);
      lines.push(`- ${renderedTitle}: ${md(item.reason)}`);
    }
    lines.push('', '</details>');
  }
  return lines.join('\n');
}

function cadenceSection(period) {
  const month = Number(period.slice(5, 7));
  const quarterly = [1, 4, 7, 10].includes(month);
  const annual = month === 1;
  return [
    `- ${quarterly ? '[ ]' : '[x]'} Histórico de preços: ${quarterly ? 'revisão trimestral prevista neste mês' : 'fora da cadência trimestral'}.`,
    `- ${annual ? '[ ]' : '[x]'} IPVA por UF: ${annual ? 'revisão anual prevista em janeiro' : 'fora da cadência anual'}.`,
    '- [x] ANP, ANEEL, PBEV, notícias, links e proveniência: execução mensal automática.',
  ].join('\n');
}

export function buildMaintenanceReport({ period, monthLabel, results, workflowUrl = null }) {
  const marker = maintenancePeriodMarker(period);
  const overall = deriveOverallStatus(results, ['anp', 'aneel', 'pbev']);
  const actions = results.flatMap(resultActions);
  const hasChanges = results.some(result => result.status === 'changed' || (result.changes ?? 0) > 0);
  const hasAttention = results.some(result => ['failed', 'partial'].includes(result.status)
    || (result.warnings ?? []).length > 0);
  const shouldClose = overall.code === 'verified' && !hasChanges && !hasAttention;
  const actionBlock = actions.length ? actions.join('\n') : '- [x] Nenhuma ação necessária a partir dos coletores.';
  const runLink = workflowUrl ? link('execução do GitHub Actions', workflowUrl) : 'execução não informada';
  const acceptance = [
    `- [${overall.code === 'blocked' ? ' ' : 'x'}] ANP, ANEEL e PBEV concluídos sem \`partial\` ou \`failed\`.`,
    `- [${hasChanges ? ' ' : 'x'}] PRs de dados revisados e mesclados, quando aplicável.`,
    `- [${hasAttention ? ' ' : 'x'}] Coberturas parciais e links quebrados resolvidos.`,
    '- [ ] Build, testes e smoke test de produção validados após merge de alterações.',
  ].join('\n');

  const labels = ['maintenance', 'automated', `maintenance-${overall.code}`];
  if (hasChanges) labels.push('maintenance-changes');

  return {
    title: `Manutenção mensal automatizada — ${monthLabel}`,
    body: [
      marker,
      `## Status geral: ${overall.label}`,
      '',
      `Período: **${md(period)}**  `,
      `Workflow: ${runLink}  `,
      `Atualizado em: ${md(new Date().toISOString())}`,
      '',
      '## Resultado por fonte',
      '',
      resultTable(results),
      '',
      '## Ações necessárias',
      '',
      actionBlock,
      '',
      '## Achados e watchlist',
      '',
      findingsSection(results),
      '',
      '## Cadências complementares',
      '',
      cadenceSection(period),
      '',
      '## Critérios para conclusão',
      '',
      acceptance,
      '',
      '> Regra fail-closed: ausência de resultado, falha de fonte ou cobertura crítica parcial nunca é interpretada como “sem alteração”.',
    ].join('\n'),
    shouldClose,
    overall,
    labels,
  };
}
