import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '../../i18n';
import CarCard from '../CarCard';
import { CAR_DB } from '../../constants';

const car = CAR_DB.find(c => c.model === 'iCar EQ')!;
function setup() {
  const onClick = vi.fn();
  const onToggleCompare = vi.fn((e: React.MouseEvent) => e.stopPropagation());
  render(<MemoryRouter><CarCard car={car} onClick={onClick} onToggleCompare={onToggleCompare}
    isSelectedForCompare={false} isFavorite={false} onToggleFavorite={vi.fn()} /></MemoryRouter>);
  return { onClick, onToggleCompare };
}
describe('CarCard mobile controls', () => {
  it('names the manufacturer link even when its visual text is hidden', () => {
    setup();
    expect(screen.getByRole('link', { name: `Ver no fabricante: ${car.brand} ${car.model}` }))
      .toHaveAttribute('target', '_blank');
  });
  it('offers a native button to open the card by keyboard without double bubbling', () => {
    const { onClick } = setup();
    expect(screen.getByRole('heading', { name: car.model })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: `Ver ficha: ${car.brand} ${car.model}` }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  it('keeps lifecycle badges out of the absolute top action cluster', () => {
    const { onClick, onToggleCompare } = setup();
    const badge = screen.getByText('Fora de linha');
    expect(badge).not.toHaveClass('absolute');
    const compare = screen.getByRole('button', { name: 'Comparar' });
    expect(compare).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(compare);
    expect(onToggleCompare).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });
});
