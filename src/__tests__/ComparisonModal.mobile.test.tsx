import { fireEvent, render, screen } from '@testing-library/react';
import ComparisonModal from '../components/ComparisonModal';
import { CAR_DB } from '../constants';
import '../i18n';

const kwid = CAR_DB.find(car => car.model === 'Kwid E-Tech')!;
const dolphin = CAR_DB.find(car => car.model === 'Dolphin Mini GS')!;
const cars = [kwid, dolphin];

function renderComparison() {
  const onRemove = vi.fn();
  const onClose = vi.fn();
  const view = render(
    <ComparisonModal cars={cars} allCars={cars} onClose={onClose} onRemove={onRemove} onAdd={vi.fn()} />,
  );
  return { ...view, onRemove, onClose };
}

describe('ComparisonModal — controles touch', () => {
  it('nomeia cada remoção com marca e modelo e entrega o veículo correto ao callback', () => {
    const { onRemove } = renderComparison();

    cars.forEach((car, index) => {
      const name = `Remover ${car.brand} ${car.model} da comparação`;
      const remove = screen.getByRole('button', { name });
      expect(remove).toHaveAttribute('aria-label', name);
      fireEvent.click(remove);
      expect(onRemove).toHaveBeenNthCalledWith(index + 1, car);
    });
    expect(onRemove).toHaveBeenCalledTimes(cars.length);
  });

  it('mantém os botões de remoção visíveis sem hover, com alvo mínimo de 44px', () => {
    renderComparison();
    const removeButtons = screen.getAllByTitle('Remover');
    expect(removeButtons).toHaveLength(cars.length);

    // Protege as classes que implementam o alvo/visibilidade; happy-dom não mede pixels.
    for (const button of removeButtons) {
      expect(button).not.toHaveClass('opacity-0', 'group-hover:opacity-100');
      expect(button).toHaveClass('min-h-[44px]', 'min-w-[44px]');
    }
  });

  it('oferece fechamento com nome acessível, alvo de 44px e sem encolher no cabeçalho', () => {
    const { onClose } = renderComparison();
    const close = screen.getByRole('button', { name: 'Fechar comparação' });

    expect(close).toHaveClass('min-h-[44px]', 'min-w-[44px]', 'shrink-0');
    fireEvent.click(close);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('preserva a tabela intencionalmente horizontal e a dica mobile', () => {
    const { container } = renderComparison();
    const grid = container.querySelector<HTMLElement>('[style*="grid-template-columns"]')!;

    expect(grid).toHaveStyle({ minWidth: 'max(560px, 100%)' });
    expect(grid.style.gridTemplateColumns).toContain('repeat(2, minmax(min(72vw,240px), 1fr))');
    expect(grid.parentElement).toHaveClass('overflow-auto');
    expect(container.querySelector('.sm\\:hidden')).toHaveTextContent(/deslize/i);
  });
});
