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
  expect(screen.queryByText(/TCO parcial — IPVA indisponível/)).not.toBeInTheDocument();
  expect(screen.getByText('TCO — projeção condicional')).toBeInTheDocument();
  expect(within(table).queryByText('—')).not.toBeInTheDocument();
  for (const rate of ['0%', '1%*', '2%*', '3%*']) expect(within(table).getByText(rate)).toBeInTheDocument();
  expect(within(table).getByText('1%*').closest('td')).toHaveTextContent('2.046');
  expect(within(table).getByText('2%*').closest('td')).toHaveTextContent('3.663');
  expect(within(table).getByText('3%*').closest('td')).toHaveTextContent('4.850');
  fireEvent.click(screen.getByRole('checkbox', { name: 'Projetar continuidade do benefício de IPVA' }));
  expect(screen.getByText(/TCO parcial — IPVA indisponível/)).toBeInTheDocument();
  expect(within(table).getAllByText('—')).toHaveLength(8);
  fireEvent.click(screen.getByRole('button', { name: 'Economia Mensal/Anual' }));
  expect(screen.queryAllByText(/IPVA/)).toHaveLength(0);
  expect(screen.queryByText(/Elegibilidade não determinada/)).not.toBeInTheDocument();
});

it('recomputes projections when switching between an eligible, pending and gasoline model', () => {
  render(<SavingsSimulatorModal onClose={vi.fn()} initialCars={[car]} />);
  fireEvent.click(screen.getByRole('button', { name: 'Custo Total 4 Anos' }));
  const picker = screen.getAllByRole('combobox').find(select => (select as HTMLSelectElement).value === car.model)!;
  fireEvent.change(picker, { target: { value: 'Song Pro GL' } });
  expect(screen.queryByText('TCO — projeção condicional')).not.toBeInTheDocument();
  expect(within(screen.getByRole('table')).queryByText('1%*')).not.toBeInTheDocument();
  expect(within(screen.getByRole('table')).getAllByText('—')).toHaveLength(10);
  fireEvent.change(picker, { target: { value: 'Civic Advanced Hybrid' } });
  expect(within(screen.getByRole('table')).getAllByText('4%')).toHaveLength(8);
  expect(within(screen.getByRole('table')).queryByText('—')).not.toBeInTheDocument();
  fireEvent.change(picker, { target: { value: car.model } });
  expect(within(screen.getByRole('table')).getByText('3%*')).toBeInTheDocument();
});

it.each([['MG', 10, true], ['SP', 0, true], ['SP', 8, false]] as const)('exports matching amounts and rates for %s (%i missing cells; projection %s)', (state, dashes, project) => {
  localStorage.setItem('selectedState', state);
  const fillText = vi.fn();
  const context = { fillRect: vi.fn(), fill: vi.fn(), roundRect: vi.fn(), strokeRect: vi.fn(), fillText, createLinearGradient: () => ({ addColorStop: vi.fn() }) };
  const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
  const dataUrl = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,test');
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  try {
    render(<SavingsSimulatorModal onClose={vi.fn()} initialCars={[car]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Custo Total 4 Anos' }));
    if (!project) fireEvent.click(screen.getByRole('checkbox', { name: 'Projetar continuidade do benefício de IPVA' }));
    fireEvent.click(screen.getByRole('button', { name: /Exportar/ }));
    const texts = fillText.mock.calls.map(args => String(args[0]));
    expect(texts.filter(text => text === '—')).toHaveLength(dashes);
    expect(texts.some(text => text.includes('TCO PARCIAL'))).toBe(dashes > 0);
    if (state === 'SP' && project) {
      expect(texts.some(text => text.includes('TCO CONDICIONAL'))).toBe(true);
      for (const rate of ['0%', '1%*', '2%*', '3%*']) expect(texts.some(text => text.includes(rate))).toBe(true);
      for (const amount of ['2.046', '3.663', '4.850']) expect(texts).toContain(amount);
      expect(texts.some(text => text.includes('teto futuro não confirmado'))).toBe(true);
    }
    expect(texts.some(text => text.includes('Sem benefícios pessoais'))).toBe(true);
    expect(texts.some(text => text.includes('cenário sem benefício'))).toBe(false);
    expect(click).toHaveBeenCalledOnce();
  } finally {
    getContext.mockRestore();
    dataUrl.mockRestore();
    click.mockRestore();
  }
});
