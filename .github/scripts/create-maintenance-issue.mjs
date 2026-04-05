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
    `## Checklist de manutenção — ${mes}`,
    '',
    'Aberto automaticamente no dia 1 de cada mês.',
    'Os jobs **ANP** e **PBEV** já rodaram antes desta issue — verifique se abriram PR ou issue separada.',
    'Feche esta issue após concluir todas as verificações.',
    '',
    '---',
    '',
    '### 🤖 Automáticos (verificar resultado)',
    '- [ ] **ANP preços combustível** — checar se o job abriu um PR em aberto e fazer merge após revisar os valores',
    '- [ ] **PBEV tabela** — checar se o job abriu issue de nova tabela disponível',
    '',
    '---',
    '',
    '### 🚗 Catálogo de veículos (manual)',
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
    '### ⚡ Tarifas de energia elétrica — ANEEL (manual)',
    '- [ ] Consultar tarifas B1 atualizadas: https://www.aneel.gov.br/tarifas-de-distribuicao',
    '- [ ] Atualizar valores em `src/constants/electricityPricesByState.ts`',
    `- [ ] Atualizar \`ELECTRICITY_PRICES_UPDATED\` para \`'${mesAbrev}'\``,
    '',
    '---',
    '',
    '### 🏛️ IPVA por estado (manual — mudanças anuais jan/fev)',
    '- [ ] Verificar se algum estado alterou alíquota para EVs ou combustão',
    '- [ ] Se houver alteração: atualizar `src/constants/ipvaByState.ts`',
    '- [ ] Atualizar `IPVA_DATA_UPDATED` se houve mudança',
    '',
    '---',
    '',
    '### 🔗 Links e afiliados (manual)',
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
