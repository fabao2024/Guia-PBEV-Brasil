import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PartnerApplicationsPage from '../PartnerApplicationsPage';

vi.mock('../../utils/partnerApplications', () => ({
  submitPartnerApplication: vi.fn().mockResolvedValue({ status: 'submitted', application_id: 9 }),
}));

import { submitPartnerApplication } from '../../utils/partnerApplications';

describe('PartnerApplicationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the partner landing sections before the application form', () => {
    render(
      <MemoryRouter>
        <PartnerApplicationsPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /programa de parceiros/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /como funciona/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /critérios de aprovação/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /modelo comercial inicial/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /preencher candidatura/i })).toHaveAttribute('href', '#formulario-parceiro');
    expect(screen.getByRole('heading', { name: /preço por lead\/modalidade/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /match codes/i })).toBeInTheDocument();
    expect(screen.getAllByText(/piloto manual/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/sem exclusividade automática/i)).toBeInTheDocument();
  });

  it('submits a supplier application with categories, coverage and LGPD acceptance', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PartnerApplicationsPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /programa de parceiros/i })).toBeInTheDocument();
    expect(screen.getByText(/cadastro não garante aprovação/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/nome da empresa/i), { target: { value: 'Wallbox Teste Ltda' } });
    fireEvent.change(screen.getByLabelText(/^cnpj$/i), { target: { value: '12.345.678/0001-90' } });
    fireEvent.change(screen.getByLabelText(/site/i), { target: { value: 'https://wallbox.example.com' } });
    fireEvent.change(screen.getByLabelText(/nome do responsável/i), { target: { value: 'Maria Parceira' } });
    fireEvent.change(screen.getByLabelText(/cargo/i), { target: { value: 'Diretora Comercial' } });
    fireEvent.change(screen.getByLabelText(/email profissional/i), { target: { value: 'maria@wallbox.example.com' } });
    fireEvent.change(screen.getByLabelText(/whatsapp comercial/i), { target: { value: '11988887777' } });
    fireEvent.change(screen.getByLabelText(/cidade sede/i), { target: { value: 'Jundiaí' } });
    await user.selectOptions(screen.getByLabelText(/uf sede/i), 'SP');
    await user.click(screen.getByRole('checkbox', { name: /^wallbox \/ instalação$/i }));
    await user.click(screen.getByRole('checkbox', { name: /^energia solar \/ recarga$/i }));
    await user.selectOptions(screen.getByLabelText(/ufs atendidas/i), ['SP', 'MG']);
    fireEvent.change(screen.getByLabelText(/cidades prioritárias/i), { target: { value: 'Jundiaí, Campinas, São Paulo' } });
    await user.click(screen.getByLabelText(/pessoa física/i));
    await user.click(screen.getAllByRole('checkbox', { name: /^atende cnpj\/frota$/i })[0]);
    fireEvent.change(screen.getByLabelText(/experiência com veículos elétricos/i), { target: { value: 'Já instalamos wallbox para BYD, Volvo e GWM.' } });
    fireEvent.change(screen.getByLabelText(/marcas\/modelos/i), { target: { value: 'BYD, Volvo, GWM' } });
    fireEvent.change(screen.getByLabelText(/capacidade mensal/i), { target: { value: '20 leads/mês' } });
    await user.selectOptions(screen.getByLabelText(/sla de primeiro contato/i), '4');
    await user.selectOptions(screen.getByLabelText(/canal preferido/i), 'whatsapp');
    await user.selectOptions(screen.getByLabelText(/modelo comercial/i), 'pagamento_por_lead');
    await user.selectOptions(screen.getByLabelText(/faixa viável por lead/i), 'R$ 81–R$ 150');
    fireEvent.change(screen.getByLabelText(/preço por lead seguro ev/i), { target: { value: 'R$ 90' } });
    fireEvent.change(screen.getByLabelText(/preço por lead wallbox/i), { target: { value: 'R$ 140' } });
    await user.click(screen.getByLabelText(/uf exata/i));
    await user.click(screen.getByLabelText(/cidade prioritária/i));
    await user.click(screen.getByLabelText(/recarga residencial/i));
    await user.click(screen.getByLabelText(/aceito respeitar lgpd/i));

    await user.click(screen.getByRole('button', { name: /enviar candidatura/i }));

    await waitFor(() => expect(submitPartnerApplication).toHaveBeenCalledTimes(1));
    expect(submitPartnerApplication).toHaveBeenCalledWith(expect.objectContaining({
      companyName: 'Wallbox Teste Ltda',
      email: 'maria@wallbox.example.com',
      serviceCategories: ['wallbox', 'energia_solar_recarga'],
      coverageStates: ['SP'],
      leadPriceByModality: expect.objectContaining({ seguro: 'R$ 90', wallbox: 'R$ 140' }),
      matchCodes: expect.arrayContaining(['uf_exact', 'city_priority', 'home_charging']),
      lgpdAcceptance: true,
    }));
    expect(await screen.findByText(/candidatura recebida/i)).toBeInTheDocument();
    expect(screen.getByText(/avaliação humana/i)).toBeInTheDocument();
  });
});
