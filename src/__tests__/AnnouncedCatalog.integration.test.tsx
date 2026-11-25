import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../i18n';
import App from '../App';

vi.mock('../constants', async importOriginal => {
  const actual = await importOriginal<typeof import('../constants')>();
  return { ...actual, CAR_DB: actual.CAR_DB.filter(car => car.model === 'Kwid E-Tech') };
});
vi.mock('../components/ChatWidget', () => ({ default: () => null }));
vi.mock('../config/leadCapture', () => ({ LEAD_CAPTURE_ENABLED: false, isLeadCapturePath: () => false }));

beforeEach(async () => { await i18n.changeLanguage('pt-BR'); });

function openCatalog(path = '/') {
  return render(<HelmetProvider><MemoryRouter initialEntries={[path]}><App /></MemoryRouter></HelmetProvider>);
}

describe('pré-lançamento no catálogo público', () => {
  it('aparece na busca sem virar um carro grátis nem entrar no ranking de preço', async () => {
    const user = userEvent.setup();
    openCatalog();
    await user.type(screen.getByRole('searchbox'), 'Bao3');
    const section = await screen.findByRole('region', { name: /pré-lançamentos sem preço/i });
    expect(within(section).getByText('DENZA BAO 3')).toBeInTheDocument();
    expect(within(section).getByText('Preço a divulgar')).toBeInTheDocument();
    expect(within(section).queryByRole('button', { name: /comparar/i })).not.toBeInTheDocument();
    const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map(script => JSON.parse(script.textContent || '{}'));
    const catalog = schemas.find(schema => schema['@type'] === 'ItemList');
    const bao = catalog.itemListElement.find((entry: { item: { name: string } }) => entry.item.name === 'DENZA BAO 3').item;
    expect(bao).not.toHaveProperty('offers');
  });

  it('resolve a URL direta para a ficha de anúncio, sem 404 ou simulação financeira', () => {
    openCatalog('/carro/denza-bao-3');
    expect(screen.getByRole('heading', { level: 1, name: 'DENZA BAO 3' })).toBeInTheDocument();
    expect(screen.queryByText('Veículo não encontrado')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /simular|comparar/i })).not.toBeInTheDocument();
  });

  it('não inclui anúncio sem preço quando um teto de orçamento foi escolhido', () => {
    openCatalog();
    expect(screen.getByText('DENZA BAO 3')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Preço Máximo'), { target: { value: '400000' } });
    expect(screen.queryByText('DENZA BAO 3')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Kwid E-Tech' })).toBeInTheDocument();
  });
});
