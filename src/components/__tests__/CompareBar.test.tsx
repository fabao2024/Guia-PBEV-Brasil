import { render, screen, fireEvent } from '@testing-library/react';
import '../../i18n';
import CompareBar from '../CompareBar';
import { CAR_DB } from '../../constants';

it('names each removal action and keeps clear/compare available without hover', () => {
  const cars = CAR_DB.slice(0, 3);
  const onRemove = vi.fn(), onClear = vi.fn(), onCompare = vi.fn();
  render(<CompareBar cars={cars} onRemove={onRemove} onClear={onClear} onCompare={onCompare} />);
  for (const car of cars) {
    const remove = screen.getByRole('button', { name: `Remover ${car.brand} ${car.model} da comparação` });
    expect(remove.className).not.toMatch(/opacity-0|scale-75/);
    fireEvent.click(remove);
    expect(onRemove).toHaveBeenCalledWith(car);
  }
  const clear = screen.getByRole('button', { name: 'Limpar' });
  expect(clear).not.toHaveClass('hidden');
  fireEvent.click(clear);
  fireEvent.click(screen.getByRole('button', { name: 'Comparar Agora' }));
  expect(onClear).toHaveBeenCalledOnce();
  expect(onCompare).toHaveBeenCalledOnce();
});
