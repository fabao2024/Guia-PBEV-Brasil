import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LeadCaptureModal from '../LeadCaptureModal';
import { Car } from '../../types';
import { submitLead } from '../../utils/leads';
import { track } from '../../utils/analytics';

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
    vi.mocked(submitLead).mockResolvedValue({ status: 'needs_review', lead_id: 99 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('submits only a qualified and explicitly consented pilot lead', async () => {
    const user = userEvent.setup();
    render(
      <LeadCaptureModal
        isOpen
        selectedCar={kwid}
        source="vehicle_detail"
        initialInterest="wallbox"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /solicitar energia solar ou wallbox/i })).toBeInTheDocument();
    expect(screen.queryByText(/E\.R SOLAR/i)).not.toBeInTheDocument();
    expect(screen.getByText(/parceiro indicado pela plataforma que atenda à minha região/i)).toBeInTheDocument();
    expect(screen.queryByText(/informado antes do compartilhamento/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/financiamento do equipamento ou projeto/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/seguro ev/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/serviço desejado/i)).toHaveDisplayValue(/wallbox/i);

    await user.type(screen.getByLabelText(/^nome/i), 'Fabio Teste');
    expect(track).toHaveBeenCalledWith('lead_form_start', {
      source: 'vehicle_detail',
      interest: 'wallbox',
    });
    await user.type(screen.getByLabelText(/whatsapp/i), '11999999999');
    await user.selectOptions(screen.getByLabelText(/cidade atendida/i), 'Jundiaí');
    await user.selectOptions(screen.getByLabelText(/tipo de imóvel/i), 'casa_propria');
    await user.selectOptions(screen.getByLabelText(/prazo para contratar/i), '30_dias');
    await user.selectOptions(screen.getByLabelText(/necessidade de recarga/i), 'equipamento_instalacao');
    await user.type(screen.getByLabelText(/contexto adicional/i), 'Garagem coberta e rede 220V.');

    await user.click(screen.getByRole('button', { name: /solicitar contato/i }));
    expect(submitLead).not.toHaveBeenCalled();

    expect(screen.getByRole('link', { name: /política de privacidade/i })).toHaveAttribute('href', '/privacy.html');
    await user.click(screen.getByLabelText(/autorizo o guia pbev brasil/i));
    await user.click(screen.getByRole('button', { name: /solicitar contato/i }));

    await waitFor(() => expect(submitLead).toHaveBeenCalledTimes(1));
    const confirmation = screen.getByText(/solicitação #99 recebida/i);
    expect(confirmation).toHaveTextContent(/aguarda revisão humana/i);
    expect(confirmation).not.toHaveTextContent(/informaremos o parceiro/i);
    expect(submitLead).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Fabio Teste',
        whatsapp: '11999999999',
        city: 'Jundiaí',
        state: 'SP',
        customerType: 'pf',
        interest: 'wallbox',
        vehicleBrand: 'Renault',
        vehicleModel: 'Kwid E-Tech',
        qualificationData: {
          property_situation: 'casa_propria',
          timeline: '30_dias',
          service_detail: 'equipamento_instalacao',
        },
        consentAccepted: true,
        consentTextVersion: 'pilot-v3-2026-07-15',
      }),
      'vehicle_detail'
    );
    expect(screen.queryByText(/E\.R SOLAR/i)).not.toBeInTheDocument();
    expect(track).toHaveBeenCalledWith('lead_submit_attempt', {
      source: 'vehicle_detail',
      interest: 'wallbox',
      customer_type: 'pf',
    });
    expect(track).toHaveBeenCalledWith('lead_success', {
      source: 'vehicle_detail',
      interest: 'wallbox',
    });
    expect(track).not.toHaveBeenCalledWith('lead_submit', expect.anything());
  });
});
