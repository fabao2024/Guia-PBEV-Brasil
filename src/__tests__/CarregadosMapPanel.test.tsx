import { act, fireEvent, render, screen } from '@testing-library/react';
import { CarregadosMapPanel } from '../components/CarregadosMapPanel';
import { stubExternalFrames } from '../test/stubExternalFrames';
import { runAxe, formatAxeViolations } from '../test/axe';
import i18n from '../i18n';

stubExternalFrames();

it('shows attributed market indicators separately and makes no iframe request before explicit activation', () => {
  const { container } = render(<CarregadosMapPanel />);
  expect(container.querySelector('iframe')).toBeNull();
  expect(screen.getByRole('link', { name: /Dados de mercado.*Carregados/ })).toHaveAttribute('href', 'https://carregados.com.br/dados-sobre-o-mercado-eletrico');
  expect(screen.getByText('12.775')).toBeInTheDocument();
  expect(screen.getByText('9.900')).toBeInTheDocument();
  expect(screen.getByText(/Referência consultada em 2026-11-09/)).toBeInTheDocument();
  expect(screen.getByText(/não são somados à base local/)).toBeInTheDocument();
  expect(screen.getByText(/receberá sua conexão/)).toBeInTheDocument();
});

it('loads only the official sandboxed embed on request and keeps a direct alternative available', () => {
  render(<CarregadosMapPanel />);
  fireEvent.click(screen.getByRole('button', { name: 'Carregar mapa Carregados' }));
  const frame = screen.getByTitle('Mapa externo de eletropostos — Carregados');
  const url = new URL(frame.getAttribute('src')!);
  expect(url.origin + url.pathname).toBe('https://carregados.com.br/embed');
  expect(url.searchParams.get('theme')).toBe('dark');
  expect(url.searchParams.get('mode')).toBe('homepage');
  expect(frame).toHaveAttribute('loading', 'lazy');
  expect(frame).toHaveAttribute('referrerpolicy', 'no-referrer');
  expect(frame).toHaveAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox');
  expect(frame).toHaveAttribute('allow', "geolocation 'none'; camera 'none'; microphone 'none'");
  expect(frame.getAttribute('sandbox')).not.toMatch(/allow-top-navigation|allow-forms/);
  expect(frame).toHaveFocus();
  const link = screen.getByRole('link', { name: /Abrir no site Carregados/ });
  expect(link).toHaveAttribute('href', 'https://carregados.com.br/mapa');
  expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  fireEvent.load(frame);
  expect(screen.queryByText('Aguardando conteúdo externo…')).not.toBeInTheDocument();
  expect(link).toBeInTheDocument();
});

it('offers an external fallback on errors without claiming a successful station import', () => {
  render(<CarregadosMapPanel />);
  fireEvent.click(screen.getByRole('button', { name: 'Carregar mapa Carregados' }));
  fireEvent.error(screen.getByTitle('Mapa externo de eletropostos — Carregados'));
  expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar o conteúdo externo');
  expect(screen.getByRole('link', { name: /Abrir no site Carregados/ })).toBeInTheDocument();
  expect(screen.getByText(/não integram o planejador de rotas/)).toBeInTheDocument();
});

it('presents the source choice and reference accessibly before connecting to the third party', async () => {
  const { container } = render(<CarregadosMapPanel />);
  const result = await runAxe(container);
  expect(result.violations, formatAxeViolations(result.violations)).toEqual([]);
});

it('translates the external panel and formats reference numbers in English', async () => {
  await act(async () => { await i18n.changeLanguage('en'); });
  try {
    render(<CarregadosMapPanel />);
    expect(screen.getByText('12,775')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Load Carregados map' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Load Carregados map' }));
    expect(screen.getByTitle('External charging-station map — Carregados')).toBeInTheDocument();
  } finally {
    await act(async () => { await i18n.changeLanguage('pt-BR'); });
  }
});
