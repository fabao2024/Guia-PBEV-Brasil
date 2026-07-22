import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SavingsSimulatorModal from '../SavingsSimulatorModal';
import { CAR_DB } from '../../constants';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('SavingsSimulatorModal lead CTA', () => {
  it('offers the active wallbox and solar pilot for simulations in SP', async () => {
    localStorage.setItem('selectedState', 'SP');
    const onLeadRequest = vi.fn();
    const user = userEvent.setup();

    render(
      <SavingsSimulatorModal
        onClose={vi.fn()}
        initialCars={[CAR_DB[0]]}
        onLeadRequest={onLeadRequest}
      />,
    );

    expect(screen.getByText(/planeje sua recarga residencial em sp/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /avaliar wallbox/i }));
    await user.click(screen.getByRole('button', { name: /avaliar energia solar/i }));

    expect(onLeadRequest).toHaveBeenNthCalledWith(1, 'wallbox');
    expect(onLeadRequest).toHaveBeenNthCalledWith(2, 'energia_solar_recarga');
  });
});
