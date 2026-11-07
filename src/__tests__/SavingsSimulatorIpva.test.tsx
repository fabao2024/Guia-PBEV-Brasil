import { fireEvent, render, screen, within } from '@testing-library/react';
import SavingsSimulatorModal from '../components/SavingsSimulatorModal';
import { CAR_DB } from '../constants';
import '../i18n';

const car = CAR_DB.find(entry => entry.model === 'Corolla Cross Hybrid')!;

it('recomputes the selected UF and labels partial TCO without zero IPVA', () => {
  render(<SavingsSimulatorModal onClose={vi.fn()} initialCars={[car]} />);
  expect(screen.queryAllByText(/IPVA/)).toHaveLength(0);
  expect(screen.queryByText(/Elegibilidade não determinada/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Custo Total 4 Anos' }));
  expect(screen.getByText(/Isenção estimada — não confirmada/)).toBeInTheDocument();
  fireEvent.change(screen.getByRole('combobox', { name: 'Selecione o Estado' }), { target: { value: 'MG' } });
  expect(screen.getByText('Cálculo indisponível')).toBeInTheDocument();
  expect(screen.getByText(/TCO parcial — IPVA indisponível/)).toBeInTheDocument();
  const table = screen.getByRole('table');
  expect(within(table).getByRole('columnheader', { name: '2026' })).toBeInTheDocument();
  expect(within(table).getByRole('columnheader', { name: '2029' })).toBeInTheDocument();
  expect(within(table).getAllByText('—')).toHaveLength(10);
  fireEvent.change(screen.getByRole('combobox', { name: 'Selecione o Estado' }), { target: { value: 'SP' } });
  expect(screen.getByText(/TCO parcial — IPVA indisponível/)).toBeInTheDocument();
  expect(screen.getByText(/Elegibilidade ou teto pendente nos exercícios/)).toBeInTheDocument();
  expect(within(table).getAllByText('—')).toHaveLength(8);
  fireEvent.click(screen.getByRole('button', { name: 'Economia Mensal/Anual' }));
  expect(screen.queryAllByText(/IPVA/)).toHaveLength(0);
  expect(screen.queryByText(/Elegibilidade não determinada/)).not.toBeInTheDocument();
});

it.each([['MG', 10], ['SP', 8]] as const)('includes partial-tax disclaimers and missing-value dashes in the %s exported image', (state, dashes) => {
  localStorage.setItem('selectedState', state);
  const fillText = vi.fn();
  const context = { fillRect: vi.fn(), fill: vi.fn(), roundRect: vi.fn(), strokeRect: vi.fn(), fillText, createLinearGradient: () => ({ addColorStop: vi.fn() }) };
  const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
  const dataUrl = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,test');
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  try {
    render(<SavingsSimulatorModal onClose={vi.fn()} initialCars={[car]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Custo Total 4 Anos' }));
    fireEvent.click(screen.getByRole('button', { name: /Exportar/ }));
    const texts = fillText.mock.calls.map(args => String(args[0]));
    expect(texts.filter(text => text === '—')).toHaveLength(dashes);
    expect(texts.some(text => text.includes('TCO PARCIAL'))).toBe(true);
    expect(texts.some(text => text.includes('Sem benefícios pessoais'))).toBe(true);
    expect(texts.some(text => text.includes('cenário sem benefício'))).toBe(false);
    expect(click).toHaveBeenCalledOnce();
  } finally {
    getContext.mockRestore();
    dataUrl.mockRestore();
    click.mockRestore();
  }
});
