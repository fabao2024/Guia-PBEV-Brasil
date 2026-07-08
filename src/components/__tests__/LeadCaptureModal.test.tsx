import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LeadCaptureModal from '../LeadCaptureModal';
import { Car } from '../../types';
import { submitLead } from '../../utils/leads';

vi.mock('../../utils/leads', () => ({
  submitLead: vi.fn(),
}));

vi.mock('../../utils/analytics', () => ({
  track: vi.fn(),
}));

const kwid: Car = {
  brand: 'Renault',
  model: 'Kwid E-Tech',
  price: 99990,
  range: 180,
  cat: 'Urbano',
  img: '/car-images/renault-kwid-e-tech.jpg',
};

describe('LeadCaptureModal', () => {
  beforeEach(() => {
    vi.mocked(submitLead).mockResolvedValue({ status: 'ok', lead_id: 99 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('requires a selected lead modality and consent before submitting', async () => {
    const user = userEvent.setup();
    render(
      <LeadCaptureModal
        isOpen
        selectedCar={kwid}
        source="vehicle_detail"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /registrar interesse/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrar interesse/i })).toBeInTheDocument();
    expect(screen.queryByText(/em breve entraremos em contato/i)).not.toBeInTheDocument();

    const interestSelect = screen.getByLabelText(/tipo de contato/i);
    expect(interestSelect).toHaveDisplayValue(/selecione/i);

    await user.type(screen.getByLabelText(/^nome/i), 'Fabio Teste');
    await user.type(screen.getByLabelText(/whatsapp/i), '11999999999');
    await user.type(screen.getByLabelText(/cidade/i), 'Jundiaí/SP');
    await user.type(screen.getByLabelText(/mensagem/i), 'Quero entender financiamento do Kwid.');

    await user.click(screen.getByRole('button', { name: /registrar interesse/i }));
    expect(submitLead).not.toHaveBeenCalled();

    await user.selectOptions(interestSelect, 'financiamento');
    await user.click(screen.getByRole('button', { name: /registrar interesse/i }));
    expect(submitLead).not.toHaveBeenCalled();

    await user.click(screen.getByLabelText(/autorizo o guia pbev brasil/i));
    await user.click(screen.getByRole('button', { name: /registrar interesse/i }));

    await waitFor(() => expect(submitLead).toHaveBeenCalledTimes(1));
    expect(submitLead).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Fabio Teste',
        whatsapp: '11999999999',
        city: 'Jundiaí/SP',
        interest: 'financiamento',
        vehicleBrand: 'Renault',
        vehicleModel: 'Kwid E-Tech',
        consentAccepted: true,
      }),
      'vehicle_detail'
    );
    expect(screen.getByText(/vamos revisar os dados/i)).toHaveTextContent(/parceiro selecionado/i);
  });
});
