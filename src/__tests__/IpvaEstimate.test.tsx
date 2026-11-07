import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import IpvaEstimate from '../components/IpvaEstimate';
import CarCard from '../components/CarCard';
import { CAR_DB } from '../constants';
import { useSelectedState } from '../hooks/useSelectedState';
import '../i18n';

const hybrid = CAR_DB.find(car => car.model === 'Corolla Cross Hybrid')!;
const bev = CAR_DB.find(car => car.model === 'Kwid E-Tech')!;

it('shows pending eligibility without a determined rate or amount', () => {
  render(<IpvaEstimate car={{ ...hybrid, taxProfile: undefined }} state="SP" />);
  expect(screen.getByText(/Elegibilidade não determinada/)).toBeInTheDocument();
  expect(screen.getByText(/40 kW/)).toBeInTheDocument();
  expect(screen.getByText(/não valor venal oficial/)).toBeInTheDocument();
  expect(screen.queryByText(/^Isento$/)).not.toBeInTheDocument();
  expect(screen.getByText('IPVA · SP · 2026')).toBeInTheDocument();
  expect(screen.queryByText(/^R\$ \d/)).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Portaria SRE/ })).toHaveAttribute('href', expect.stringContaining('fazenda.sp.gov.br'));
});

it('shows sourced exemption and the technical evidence for the selected version', () => {
  render(<IpvaEstimate car={hybrid} state="SP" />);
  expect(screen.getByText(/IPVA · SP · 2026 · 0%/)).toBeInTheDocument();
  expect(screen.getByText('Isenção estimada — não confirmada')).toBeInTheDocument();
  expect(screen.getAllByRole('link').some(link => link.getAttribute('href') === hybrid.taxProfile?.sourceUrl)).toBe(true);
});

it('updates the model and state without stale rates or SP fallback', () => {
  const { rerender } = render(<IpvaEstimate car={bev} state="SP" />);
  expect(screen.getByText(/IPVA · SP · 2026 · 4%/)).toBeInTheDocument();
  rerender(<IpvaEstimate car={bev} state="MG" />);
  expect(screen.getByText('Cálculo indisponível')).toBeInTheDocument();
  expect(screen.queryByText(/4%/)).not.toBeInTheDocument();
  expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
});

it('keeps tax details off catalog cards while retaining the vehicle details action', () => {
  const onClick = vi.fn();
  render(<MemoryRouter><CarCard car={hybrid} onClick={onClick} isSelectedForCompare={false} onToggleCompare={vi.fn()} isFavorite={false} onToggleFavorite={vi.fn()} /></MemoryRouter>);
  expect(screen.queryByText(/IPVA/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Elegibilidade não determinada/)).not.toBeInTheDocument();
  expect(screen.queryByText(/sem descontos pessoais/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: `Ver ficha: ${hybrid.brand} ${hybrid.model}` }));
  expect(onClick).toHaveBeenCalledOnce();
});

it('shares state changes between selectors', () => {
  function StatePicker() {
    const [state, setState] = useSelectedState();
    return <button onClick={() => setState('RJ')}>{state}</button>;
  }
  render(<><StatePicker /><StatePicker /></>);
  fireEvent.click(screen.getAllByRole('button', { name: 'SP' })[0]);
  expect(screen.getAllByRole('button', { name: 'RJ' })).toHaveLength(2);
  act(() => window.dispatchEvent(new StorageEvent('storage', { key: 'selectedState' })));
  expect(screen.getAllByRole('button', { name: 'RJ' })).toHaveLength(2);
});

it('keeps selection usable when storage is blocked', () => {
  const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
  try {
    function Picker() {
      const [state, setState] = useSelectedState();
      return <button onClick={() => setState('SP')}>{state}</button>;
    }
    render(<Picker />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button', { name: 'SP' })).toBeInTheDocument();
  } finally {
    get.mockRestore();
    set.mockRestore();
  }
});
