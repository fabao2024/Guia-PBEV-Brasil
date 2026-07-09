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
    expect(screen.queryByRole('heading', { name: /preço por lead\/modalidade/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /match codes/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/preço por lead seguro ev/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/uf exata/i)).not.toBeInTheDocument();
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
    expect(screen.getByText(/cadastro é simples/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/nome da empresa/i), { target: { value: 'Wallbox Teste Ltda' } });
    fireEvent.change(screen.getByLabelText(/site/i), { target: { value: 'https://wallbox.example.com' } });
    fireEvent.change(screen.getByLabelText(/nome do responsável/i), { target: { value: 'Maria Parceira' } });
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
    await user.selectOptions(screen.getByLabelText(/sla de primeiro contato/i), '4');
    await user.selectOptions(screen.getByLabelText(/faixa viável por lead/i), 'R$ 81–R$ 150');
    expect(screen.queryByLabelText(/^cnpj$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/cargo/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/experiência com veículos elétricos/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/modelo comercial/i)).not.toBeInTheDocument();
    await user.click(screen.getByLabelText(/aceito respeitar lgpd/i));

    await user.click(screen.getByRole('button', { name: /enviar candidatura/i }));

    await waitFor(() => expect(submitPartnerApplication).toHaveBeenCalledTimes(1));
    expect(submitPartnerApplication).toHaveBeenCalledWith(expect.objectContaining({
      companyName: 'Wallbox Teste Ltda',
      email: 'maria@wallbox.example.com',
      serviceCategories: ['wallbox', 'energia_solar_recarga'],
      coverageStates: ['SP'],
      acceptablePriceRange: 'R$ 81–R$ 150',
      leadPriceByModality: {},
      matchCodes: expect.arrayContaining(['uf_exact', 'city_priority', 'serves_pf', 'serves_pj_fleet', 'home_charging', 'solar_cross_sell', 'fast_sla_4h']),
      lgpdAcceptance: true,
    }));
    expect(await screen.findByText(/candidatura recebida/i)).toBeInTheDocument();
    expect(screen.getByText(/avaliação humana/i)).toBeInTheDocument();
  });
});
