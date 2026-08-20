import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

vi.mock('../config/leadCapture', () => ({
  LEAD_CAPTURE_ENABLED: true,
  isLeadCapturePath: (pathname: string) => pathname.replace(/\/+$/, '') === '/interesse',
}));

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
  });

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
  });

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
    expect(screen.getByLabelText(/serviço desejado/i)).toHaveDisplayValue(/limpeza de placas solares/i);
  });

  it('accepts a direct solar-cleaning interest URL', () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/interesse?servico=limpeza_sistema_solar&origem=chat']}>
          <App />
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(screen.getByLabelText(/serviço desejado/i)).toHaveDisplayValue(/limpeza de placas solares/i);
  });
});
