import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CAR_DB } from '../constants';
import CarCard from '../components/CarCard';
import CarDetailPage from '../pages/CarDetailPage';
import i18n from '../i18n';

beforeEach(async () => { await i18n.changeLanguage('pt-BR'); });

describe('RAV4 HEV discovery and detail routes', () => {
  it('shows fuel economy and combined power on the catalog card', () => {
    const car = CAR_DB.find(entry => entry.model === 'RAV4 S Hybrid')!;
    render(<MemoryRouter><CarCard car={car} onClick={vi.fn()} isSelectedForCompare={false}
      onToggleCompare={vi.fn()} isFavorite={false} onToggleFavorite={vi.fn()} /></MemoryRouter>);
    expect(screen.getByText('RAV4 S Hybrid')).toBeInTheDocument();
    expect(screen.getByText('Potência combinada')).toBeInTheDocument();
    expect(screen.getByText(/16[.,]1/)).toBeInTheDocument();
    expect(screen.queryByText(/^0 km$/)).not.toBeInTheDocument();
  });

  it.each(['s', 'sx'])('resolves the %s detail route with price and shared-photo limits', version => {
    render(<HelmetProvider><MemoryRouter initialEntries={[`/carro/toyota-rav4-${version}-hybrid`]}>
      <Routes><Route path="/carro/:slug" element={<CarDetailPage />} /></Routes>
    </MemoryRouter></HelmetProvider>);
    expect(screen.getByRole('heading', { name: `RAV4 ${version.toUpperCase()} Hybrid`, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Preço de referência em 26\/11\/2026.*Brasília/)).toBeInTheDocument();
    expect(screen.getByText(/foto compartilhada da linha HEV/)).toBeInTheDocument();
    expect(screen.getByText(/16,1 km\/l cidade e 13,5 km\/l estrada/)).toBeInTheDocument();
  });
});
