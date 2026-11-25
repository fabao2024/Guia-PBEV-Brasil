import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CAR_DB } from '../constants';
import CarCard from '../components/CarCard';
import CarDetailsModal from '../components/CarDetailsModal';
import CarDetailPage from '../pages/CarDetailPage';
import CompareDetailPage from '../pages/CompareDetailPage';
import ComparisonModal from '../components/ComparisonModal';
import i18n from '../i18n';
import { readFileSync } from 'node:fs';
import { motorPowerSummary, powerLabelKey, powerProperties } from '../utils/power';
import MotorPowerDetails from '../components/MotorPowerDetails';

const cases = [
  { model: 'Civic Advanced Hybrid', slug: 'honda-civic-advanced-hybrid', combustion: 143 },
  { model: 'CR-V Advanced Hybrid', slug: 'honda-cr-v-advanced-hybrid', combustion: 147 },
  { model: 'Accord Advanced Hybrid', slug: 'honda-accord-advanced-hybrid', combustion: 146 },
];
const honda = cases.map(({ model }) => CAR_DB.find(car => car.model === model)!);

beforeEach(async () => { await i18n.changeLanguage('pt-BR'); });

describe('potências Honda e:HEV — motores não são somados', () => {
  it('exporta campos aditivos por motor sem mudar o contrato de preços ou anúncios', () => {
    const payload = JSON.parse(readFileSync('public/data/cars.json', 'utf8'));
    for (const { slug, combustion } of cases) {
      const car = payload.cars.find((entry: { slug: string }) => entry.slug === slug);
      expect(car).toMatchObject({
        power_cv: 184, power_basis: 'electric_motor', electric_motor_power_cv: 184,
        combustion_power_cv: combustion, combined_power_cv: null,
      });
      expect(car.price).toBeGreaterThan(0);
    }
    expect(payload.cars.filter((car: { power_basis?: string }) => car.power_basis)).toHaveLength(3);
    expect(payload.total).toBe(CAR_DB.length);
    expect(payload.announced_cars.find((car: { slug: string }) => car.slug === 'denza-bao-3').price).toBeNull();
  });
  it('registra fontes primárias para cada motor sem declarar combinada verificada', () => {
    const registry = JSON.parse(readFileSync('.github/data/catalog-provenance.json', 'utf8'));
    for (const { slug } of cases) {
      const field = registry.vehicles[slug].fields.power;
      expect(field.verificationStatus).toBe('verified');
      expect(field.sourceType).toBe('official_press_release');
      expect(field.sourceUrl).toContain('saladeimprensa.honda.com.br/releases/');
      expect(field.notes).toMatch(/[Cc]ombinada não confirmada/);
    }
  });

  it('não deduz combinada nos helpers nem no contexto do consultor', () => {
    const summary = motorPowerSummary(honda[1]);
    expect(summary).toContain('motor elétrico de tração: 184 cv');
    expect(summary).toContain('motor a combustão: 147 cv');
    expect(summary).toContain('potência combinada não confirmada');
    expect(summary).not.toMatch(/331|207/);
    expect(powerLabelKey(honda[1])).toBe('details.electricPower');
    const confirmed = { ...honda[1], combinedPowerCv: 207 };
    expect(powerProperties(confirmed)).toContainEqual(expect.objectContaining({ name: 'Potência combinada', value: '207 cv' }));
    expect(powerProperties({ ...honda[1], price: 999999 })).toEqual(powerProperties(honda[1]));
  });

  it('traduz a ficha de potências e mantém o catálogo legado sem novo painel', async () => {
    await i18n.changeLanguage('en');
    const { unmount } = render(<MotorPowerDetails car={honda[0]} />);
    const details = screen.getByRole('region', { name: 'Power by motor' });
    expect(within(details).getByText('Electric traction motor')).toBeInTheDocument();
    expect(within(details).getByText('Combustion engine')).toBeInTheDocument();
    expect(within(details).getByText('Unconfirmed')).toBeInTheDocument();
    unmount();
    const legacy = CAR_DB.find(car => car.model === 'Kwid E-Tech')!;
    expect(render(<MotorPowerDetails car={legacy} />).container).toBeEmptyDOMElement();
    expect(powerLabelKey(legacy)).toBe('details.power');
  });
  it.each(cases)('$model mantém potência elétrica distinta da térmica e da combinada', ({ model, combustion }) => {
    const car = CAR_DB.find(car => car.model === model)!;
    expect(car).toMatchObject({
      power: 184, powerBasis: 'electric_motor', electricMotorPowerCv: 184,
      combustionPowerCv: combustion, combinedPowerCv: null,
    });
    expect(car.power).not.toBe(184 + combustion);
    expect(car.features!.join(' ')).toContain('Potência combinada não confirmada');
  });

  it.each(honda)('$model exibe 184 cv com rótulo de motor elétrico, nunca estimativa pelo preço', car => {
    render(<MemoryRouter><CarCard car={car} onClick={vi.fn()} isSelectedForCompare={false}
      onToggleCompare={vi.fn()} isFavorite={false} onToggleFavorite={vi.fn()} /></MemoryRouter>);
    expect(screen.getByText('Motor elétrico de tração')).toBeInTheDocument();
    expect(screen.getByText('184', { exact: false })).toBeInTheDocument();
    expect(screen.queryByText(String(Math.round(car.price / 3000)), { exact: true })).not.toBeInTheDocument();
  });

  it('detalha os motores no modal e não publica combinada desconhecida no schema', () => {
    render(<CarDetailsModal car={honda[1]} onClose={vi.fn()} isSelectedForCompare={false}
      onToggleCompare={vi.fn()} isFavorite={false} onToggleFavorite={vi.fn()} />);
    const details = screen.getByRole('region', { name: 'Potência por motor' });
    expect(within(details).getByText('147 cv')).toBeInTheDocument();
    expect(within(details).getByText('184 cv')).toBeInTheDocument();
    expect(within(details).getByText('Não confirmada')).toBeInTheDocument();
    const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map(node => JSON.parse(node.textContent!));
    const product = schemas.find(schema => schema['@type'] === 'Product');
    expect(product.additionalProperty).toContainEqual(expect.objectContaining({
      name: 'Potência do motor elétrico de tração', value: '184 cv',
    }));
    expect(product.additionalProperty).toContainEqual(expect.objectContaining({
      name: 'Potência do motor a combustão', value: '147 cv',
    }));
    expect(product.additionalProperty.some((prop: { name: string }) => prop.name === 'Potência combinada')).toBe(false);
  });

  it('a ficha direta mantém os três campos visíveis', () => {
    render(<HelmetProvider><MemoryRouter initialEntries={['/carro/honda-accord-advanced-hybrid']}>
      <Routes><Route path="/carro/:slug" element={<CarDetailPage />} /></Routes>
    </MemoryRouter></HelmetProvider>);
    const details = screen.getByRole('region', { name: 'Potência por motor' });
    expect(within(details).getByText('146 cv')).toBeInTheDocument();
    expect(within(details).getByText('184 cv')).toBeInTheDocument();
    expect(within(details).getByText('Não confirmada')).toBeInTheDocument();
  });

  it('compara potências da mesma natureza, sem premiar motor elétrico contra potência combinada', () => {
    render(<HelmetProvider><MemoryRouter initialEntries={[
      '/comparar/honda-cr-v-advanced-hybrid/byd-dolphin-mini-gs',
    ]}><Routes><Route path="/comparar/:slugA/:slugB" element={<CompareDetailPage />} /></Routes>
    </MemoryRouter></HelmetProvider>);
    const combined = screen.getByRole('row', { name: /Potência combinada/ });
    expect(combined).not.toHaveTextContent('184');
    expect(screen.getByRole('row', { name: /^Potência 184 cv 75 cv$/ })).not.toHaveTextContent('✓');
    expect(screen.getByRole('row', { name: /Motor a combustão/ })).toHaveTextContent('147');
    expect(screen.getByRole('row', { name: /Base da potência/ })).toHaveTextContent('Motor elétrico de tração');
  });

  it('o comparador modal também identifica a base e mostra combinada pendente', () => {
    render(<ComparisonModal cars={honda.slice(0, 2)} allCars={honda}
      onClose={vi.fn()} onRemove={vi.fn()} onAdd={vi.fn()} />);
    expect(screen.getAllByText('Motor elétrico de tração')).toHaveLength(2);
    expect(screen.getByText('Motor a combustão')).toBeInTheDocument();
    expect(screen.getByText('Potência combinada')).toBeInTheDocument();
    expect(screen.getAllByText('Não confirmada')).toHaveLength(2);
  });
});
