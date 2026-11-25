import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { beforeEach, describe, expect, it } from 'vitest';
import i18n from '../i18n';
import { ANNOUNCED_CARS } from '../constants/announcedVehicles';
import AnnouncedCarCard from '../components/AnnouncedCarCard';
import AnnouncedCarPage from '../pages/AnnouncedCarPage';

beforeEach(async () => { await i18n.changeLanguage('pt-BR'); });

describe('BAO 3 sem preço divulgado', () => {
  const car = ANNOUNCED_CARS[0];

  it('exibe previsão e preço a divulgar sem controles de cálculo ou comparação', () => {
    render(<MemoryRouter><AnnouncedCarCard car={car} /></MemoryRouter>);
    expect(screen.getByText('Preço a divulgar')).toBeInTheDocument();
    expect(screen.getByText(/01\/12\/2026/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver ficha.*bao 3/i })).toHaveAttribute('href', '/carro/denza-bao-3');
    expect(screen.queryByRole('button', { name: /comparar|simular/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/R\$\s*0/)).not.toBeInTheDocument();
  });

  it('mantém a ficha navegável sem Offer, preço zero ou disponibilidade InStock', () => {
    render(
      <HelmetProvider>
        <MemoryRouter><AnnouncedCarPage car={car} /></MemoryRouter>
      </HelmetProvider>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'DENZA BAO 3' })).toBeInTheDocument();
    expect(screen.getByText('Preço a divulgar')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /site oficial.*denza/i })).toHaveAttribute('href', car.url);
    expect(screen.getByText(/imprensa.*homologação|homologação.*imprensa/i)).toBeInTheDocument();
    expect(screen.queryByText(/IPVA estimado|Simular economia|TCO de 4 anos/i)).not.toBeInTheDocument();
    const schema = document.querySelector('script[type="application/ld+json"]')?.textContent ?? '';
    expect(schema).toContain('BAO 3');
    expect(schema).not.toMatch(/"offers"|"price"|InStock/);
  });
});
