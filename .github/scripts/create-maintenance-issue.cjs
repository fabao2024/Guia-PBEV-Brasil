/**
 * create-maintenance-issue.mjs
 * Cria a issue mensal de manutenção no GitHub.
 * Chamado pelo workflow monthly-maintenance.yml via actions/github-script.
 *
 * Exporta: module.exports = async ({ github, context }) => { ... }
 * (compatível com actions/github-script@v7 usando script-path)
 */

module.exports = async ({ github, context }) => {
  const now = new Date();
  const mes = now.toLocaleDateString('pt-BR', {
    month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo',
  });
  const mesAbrev = now.toLocaleDateString('pt-BR', {
    month: 'short', year: '2-digit', timeZone: 'America/Sao_Paulo',
  }).replace('. ', '/').replace('.', '');
  const yyyyMM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const body = [
    `## Manutenção mensal — ${mes}`,
    '',
    '> Aberta automaticamente no dia 1 de cada mês pelo workflow `monthly-maintenance.yml`.',
    '',
    '---',
    '',
    '## O que o workflow já fez automaticamente',
    '',
    '| Job | O que faz | Como verificar |',
    '|-----|-----------|----------------|',
    '| **ANP preços combustível** | Baixa preços médios de gasolina/etanol da ANP e abre um **PR** se os valores mudaram | Veja a aba [Pull Requests](../../pulls) — se não há PR, os preços não mudaram ou o site da ANP estava fora |',
    '| **PBEV tabela INMETRO** | Verifica se há versão mais nova da tabela de certificação | Veja a aba [Issues](../../issues) — se não há issue separada, não há tabela nova |',
    '',
    '> ⚠️ Nenhum desses jobs altera o código diretamente sem sua revisão.',
    '',
    '---',
    '',
    '## O que você precisa fazer manualmente',
    '',
    '### 🚗 Catálogo de veículos',
    '- [ ] Verificar se há novos EVs no mercado brasileiro (sites das marcas, PBEV, notícias)',
    '- [ ] Atualizar preços alterados em `src/constants.ts` (campo `price`)',
    '- [ ] Para cada preço alterado, adicionar entrada em `src/constants/priceHistory.ts`:',
    '  ```ts',
    '  "Modelo": [',
    '    { date: \'YYYY-MM-anterior\', price: NNN },',
    `    { date: '${yyyyMM}', price: NNN_NOVO },`,
    '  ]',
    '  ```',
    '- [ ] Marcar veículos descontinuados com `discontinued: true`',
    '- [ ] Atualizar contagem de veículos no README se houve adição/remoção',
    '',
    '---',
    '',
    '### ⚡ Tarifas de energia elétrica — ANEEL',
    '- [ ] Consultar tarifas B1 atualizadas: https://www.aneel.gov.br/tarifas-de-distribuicao',
    '- [ ] Atualizar valores em `src/constants/electricityPricesByState.ts`',
    `- [ ] Atualizar \`ELECTRICITY_PRICES_UPDATED\` para \`'${mesAbrev}'\``,
    '',
    '---',
    '',
    '### 🏛️ IPVA por estado _(relevante jan/fev — verificar se houve mudança)_',
    '- [ ] Verificar se algum estado alterou alíquota para EVs ou combustão',
    '- [ ] Se houver alteração: atualizar `src/constants/ipvaByState.ts`',
    '- [ ] Atualizar `IPVA_DATA_UPDATED` se houve mudança',
    '',
    '---',
    '',
    '### 🔗 Links e afiliados',
    '- [ ] Verificar se links das marcas em `BRAND_URLS` estão funcionando',
    '- [ ] Verificar status do afiliado Trendseg',
    '',
    '---',
    '',
    '### ✅ Após concluir',
    '- [ ] `npm run test:run` — todos os testes passando',
    '- [ ] `npm run build` — build limpo',
    `- [ ] Commit com mensagem \`chore(data): atualização mensal ${mesAbrev}\``,
    '- [ ] Fechar esta issue',
  ].join('\n');

  // Ensure labels exist
  for (const [name, color, description] of [
    ['manutenção', '0075ca', 'Tarefas de manutenção periódica de dados'],
    ['dados',      'e4e669', 'Atualização de dados do catálogo'],
  ]) {
    try {
      await github.rest.issues.createLabel({
        owner: context.repo.owner, repo: context.repo.repo, name, color, description,
      });
    } catch (_) { /* label já existe */ }
  }

  await github.rest.issues.create({
    owner: context.repo.owner,
    repo: context.repo.repo,
    title: `🔧 Manutenção mensal — ${mes}`,
    body,
    labels: ['manutenção', 'dados'],
  });
};
