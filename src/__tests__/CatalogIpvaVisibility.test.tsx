import { fireEvent, render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import '../i18n';

// Um modelo basta para testar a navegação real home → ficha, sem duplicar
// o custo dos testes que já montam o catálogo inteiro.
vi.mock('../constants', async importOriginal => {
  const actual = await importOriginal<typeof import('../constants')>();
  return { ...actual, CAR_DB: actual.CAR_DB.filter(car => car.model === 'Corolla Cross Hybrid') };
});

it('shows IPVA only after opening a vehicle, not on the home grid or a home UF selector', async () => {
  render(<HelmetProvider><MemoryRouter><App /></MemoryRouter></HelmetProvider>);
  expect(screen.queryAllByText(/IPVA/)).toHaveLength(0);
  expect(screen.queryByRole('combobox', { name: /Selecione o Estado/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Ver ficha: Toyota Corolla Cross Hybrid' }));
  // A ficha é carregada por React.lazy; aguardar o chunk, não apenas um render.
  expect(await screen.findByText(/IPVA · SP · 2026/, {}, { timeout: 10000 })).toBeInTheDocument();
  expect(screen.getByText(/Isenção estimada — não confirmada/)).toBeInTheDocument();
  expect(screen.getByText(/IPVA · SP · 2026 · 0%/)).toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: /Selecione o Estado/ })).toBeInTheDocument();
}, 15000);
