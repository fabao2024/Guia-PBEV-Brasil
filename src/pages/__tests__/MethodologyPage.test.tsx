import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import MethodologyPage from '../MethodologyPage';
import i18n from '../../i18n';

describe('MethodologyPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  const renderPage = () =>
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/metodologia']}>
          <MethodologyPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

  it('publishes the canonical trailing-slash URL and meta description', () => {
    renderPage();

    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://guiapbev.cloud/metodologia/',
    );
    const description = document.querySelector('meta[name="description"]');
    expect(description).toHaveAttribute('content', expect.stringMatching(/fontes de dados, premissas e fórmulas/i));
    expect(document.title).toMatch(/metodologia de cálculo/i);
  });

  it('renders all methodology sections with live constants in pt-BR', () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: /metodologia de cálculo/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /fontes de dados/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /custo de energia/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /custo de combustível/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^ipva$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /tco — custo total de propriedade/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /planejador de rota/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /limitações/i })).toBeInTheDocument();

    expect(screen.getByText(/tabela pbev 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/9,5% ao ano/i)).toBeInTheDocument();
    expect(screen.getByText(/7% ao ano/i)).toBeInTheDocument();
    expect(screen.getByText(/3,3% do valor depreciado/i)).toBeInTheDocument();
    expect(screen.getByText(/2,5% do valor depreciado/i)).toBeInTheDocument();
    expect(screen.getByText(/1,3× maior/i)).toBeInTheDocument();
    expect(screen.getByText(/bateria × 0,93/i)).toBeInTheDocument();
    expect(screen.getByText(/acima de R\$ 300\.000/i)).toBeInTheDocument();
    expect(screen.getByText(/acima de R\$ 150\.000/i)).toBeInTheDocument();
    expect(screen.getByText(/20\.000 km/i)).toBeInTheDocument();
    expect(screen.getByText(/10\.000 km/i)).toBeInTheDocument();
  });

  it('renders methodology sections in english when language is en', async () => {
    const { rerender } = renderPage();

    await i18n.changeLanguage('en');
    rerender(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/metodologia']}>
          <MethodologyPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(screen.getByRole('heading', { level: 1, name: /calculation methodology/i })).toBeInTheDocument();
    expect(screen.getByText(/9\.5% per year/i)).toBeInTheDocument();
    expect(screen.getByText(/above R\$ 300,000/i)).toBeInTheDocument();
    expect(screen.getByText(/battery × 0\.93/i)).toBeInTheDocument();

    await i18n.changeLanguage('pt-BR');
  });
});
