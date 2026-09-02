import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

vi.mock('../config/leadCapture', () => ({
  LEAD_CAPTURE_ENABLED: true,
  isLeadCapturePath: (pathname: string) => pathname.replace(/\/+$/, '') === '/interesse',
}));

// Cada teste monta o App completo com o catálogo inteiro; em CI, o último
// teste acumulava o custo dos renders anteriores e estourava o timeout
// padrão de 5s. O orçamento explícito mantém o gate estável sem mascarar
// falhas de asserção.
describe('App partner CTA', () => {
  it('links the catalog home to the partner application page for Instagram bio visitors', () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </HelmetProvider>,
    );

    const partnerLinks = screen.getAllByRole('link', { name: /programa de parceiros|parceiros|fornecedores/i });
    expect(partnerLinks.length).toBeGreaterThan(0);
    expect(partnerLinks.every(link => link.getAttribute('href') === '/parceiros/')).toBe(true);
  }, 30_000);

  it('adds a direct WhatsApp entry point on the catalog home', () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(screen.getByRole('link', { name: /continuar no whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/551133958879'),
    );
  }, 30_000);

  it('opens the consumer form with solar-panel cleaning preselected', async () => {
    const user = userEvent.setup();
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </HelmetProvider>,
    );

    await user.click(screen.getByRole('button', { name: /quero limpeza de placas/i }));
    const serviceSelect = await screen.findByLabelText(/serviço desejado/i, {}, { timeout: 10_000 });
    await waitFor(() => expect(serviceSelect).toHaveDisplayValue(/limpeza de placas solares/i));
  }, 30_000);

  it('accepts a direct solar-cleaning interest URL', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/interesse?servico=limpeza_sistema_solar&origem=chat']}>
          <App />
        </MemoryRouter>
      </HelmetProvider>,
    );

    const serviceSelect = await screen.findByLabelText(/serviço desejado/i, {}, { timeout: 10_000 });
    await waitFor(() => expect(serviceSelect).toHaveDisplayValue(/limpeza de placas solares/i));
  }, 30_000);
});
