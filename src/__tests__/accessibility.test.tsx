import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import App from '../App';
import CompareDetailPage from '../pages/CompareDetailPage';
import PartnerApplicationsPage from '../pages/PartnerApplicationsPage';
import MethodologyPage from '../pages/MethodologyPage';
import { CAR_DB } from '../constants';
import { toSlug } from '../utils/slug';
import { runAxe, formatAxeViolations } from '../test/axe';

async function expectNoA11yViolations(ui: ReactElement, initialEntry: string) {
  const { container } = render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        {ui}
      </MemoryRouter>
    </HelmetProvider>,
  );

  const results = await runAxe(container);
  const summary = formatAxeViolations(results.violations);
  expect(results.violations, `Violações de acessibilidade em ${initialEntry}:\n${summary}`).toEqual([]);
}

describe('Acessibilidade das rotas públicas (axe-core)', () => {
  it(
    'catálogo (/) não tem violações de acessibilidade',
    async () => {
      await expectNoA11yViolations(<App />, '/');
    },
    120_000,
  );

  it(
    'comparação (/comparar/:a/:b) não tem violações de acessibilidade',
    async () => {
      const group = CAR_DB.filter(c => c.cat === 'Compacto');
      const [a, b] = group;
      const entry = `/comparar/${toSlug(a.brand, a.model)}/${toSlug(b.brand, b.model)}`;
      await expectNoA11yViolations(<CompareDetailPage />, entry);
    },
    60_000,
  );

  it(
    'parceiros (/parceiros/) não tem violações de acessibilidade',
    async () => {
      await expectNoA11yViolations(<PartnerApplicationsPage />, '/parceiros/');
    },
    60_000,
  );

  it(
    'metodologia (/metodologia) não tem violações de acessibilidade',
    async () => {
      await expectNoA11yViolations(<MethodologyPage />, '/metodologia');
    },
    60_000,
  );
});
