import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

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
    expect(partnerLinks.some(link => link.getAttribute('href') === '/parceiros')).toBe(true);
  });
});
