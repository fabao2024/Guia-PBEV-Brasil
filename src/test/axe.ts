import * as axe from 'axe-core';

// Regras que exigem layout/viewport real: happy-dom não calcula contraste de
// cor nem landmark regions de página inteira de forma confiável.
const BASE_DISABLED_RULES = ['color-contrast', 'region'];

export async function runAxe(container: HTMLElement, extraDisabled: string[] = []): Promise<axe.AxeResults> {
  return axe.run(container, {
    rules: Object.fromEntries(
      [...BASE_DISABLED_RULES, ...extraDisabled].map(rule => [rule, { enabled: false }]),
    ),
  });
}

export function formatAxeViolations(violations: axe.Result[]): string {
  return violations
    .map(v => `${v.id} (${v.impact ?? 'n/a'}): ${v.nodes.map(n => n.target.join(' ')).join('; ')}`)
    .join('\n');
}
