import { render, screen, waitFor } from '@testing-library/react';
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

    await user.type(screen.getByLabelText(/nome da empresa/i), 'Wallbox Teste Ltda');
    await user.type(screen.getByLabelText(/^cnpj$/i), '12.345.678/0001-90');
    await user.type(screen.getByLabelText(/site/i), 'https://wallbox.example.com');
    await user.type(screen.getByLabelText(/nome do responsável/i), 'Maria Parceira');
    await user.type(screen.getByLabelText(/cargo/i), 'Diretora Comercial');
    await user.type(screen.getByLabelText(/email profissional/i), 'maria@wallbox.example.com');
    await user.type(screen.getByLabelText(/whatsapp comercial/i), '11988887777');
    await user.type(screen.getByLabelText(/cidade sede/i), 'Jundiaí');
    await user.selectOptions(screen.getByLabelText(/uf sede/i), 'SP');
    await user.click(screen.getByLabelText(/wallbox/i));
    await user.click(screen.getByLabelText(/energia solar/i));
    await user.selectOptions(screen.getByLabelText(/ufs atendidas/i), ['SP', 'MG']);
    await user.type(screen.getByLabelText(/cidades prioritárias/i), 'Jundiaí, Campinas, São Paulo');
    await user.click(screen.getByLabelText(/pessoa física/i));
    await user.click(screen.getByLabelText(/cnpj\/frota/i));
    await user.type(screen.getByLabelText(/experiência com veículos elétricos/i), 'Já instalamos wallbox para BYD, Volvo e GWM.');
    await user.type(screen.getByLabelText(/marcas\/modelos/i), 'BYD, Volvo, GWM');
    await user.type(screen.getByLabelText(/capacidade mensal/i), '20 leads/mês');
    await user.selectOptions(screen.getByLabelText(/sla de primeiro contato/i), '4');
    await user.selectOptions(screen.getByLabelText(/canal preferido/i), 'whatsapp');
    await user.selectOptions(screen.getByLabelText(/modelo comercial/i), 'pagamento_por_lead');
    await user.selectOptions(screen.getByLabelText(/faixa viável por lead/i), 'R$ 81–R$ 150');
    await user.click(screen.getByLabelText(/aceito respeitar lgpd/i));

    await user.click(screen.getByRole('button', { name: /enviar candidatura/i }));

    await waitFor(() => expect(submitPartnerApplication).toHaveBeenCalledTimes(1));
    expect(submitPartnerApplication).toHaveBeenCalledWith(expect.objectContaining({
      companyName: 'Wallbox Teste Ltda',
      email: 'maria@wallbox.example.com',
      serviceCategories: ['wallbox', 'energia_solar_recarga'],
      coverageStates: ['SP'],
      lgpdAcceptance: true,
    }));
    expect(await screen.findByText(/candidatura recebida/i)).toBeInTheDocument();
    expect(screen.getByText(/avaliação humana/i)).toBeInTheDocument();
  });
});
