import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PartnerApplicationsPage from '../PartnerApplicationsPage';
import { track } from '../../utils/analytics';

vi.mock('../../utils/partnerApplications', () => ({
  submitPartnerApplication: vi.fn().mockResolvedValue({ status: 'submitted', application_id: 9 }),
}));

vi.mock('../../utils/analytics', () => ({
  track: vi.fn(),
}));

import { submitPartnerApplication } from '../../utils/partnerApplications';

describe('PartnerApplicationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    window.history.replaceState({}, '', '/parceiros?utm_source=ig&utm_campaign=partner_program');
  });

  it('renders an active-pilot proposition and the short form before details', async () => {
    render(
      <MemoryRouter>
        <PartnerApplicationsPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /programa de parceiros/i })).toBeInTheDocument();
    expect(screen.getByText(/piloto de encaminhamento está ativo para wallbox e energia solar em sp/i)).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: /candidatar em 2 minutos/i });
    expect(cta).toHaveAttribute('href', '#formulario-parceiro');
    await userEvent.click(cta);
    expect(track).toHaveBeenCalledWith('partner_cta_click', expect.objectContaining({ placement: 'hero' }));

    const form = screen.getByRole('form', { name: /candidatura de parceiro/i });
    const details = screen.getByRole('heading', { name: /como funciona/i });
    expect(form.compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByLabelText(/site/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/ufs atendidas/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/sla de primeiro contato/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/faixa viável por lead/i)).not.toBeInTheDocument();
    expect(track).toHaveBeenCalledWith('partner_page_view', expect.objectContaining({
      utm_source: 'instagram',
      utm_campaign: 'partner_program',
    }));
  });

  it('submits the essential supplier data and tracks the conversion funnel', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PartnerApplicationsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/leva cerca de 2 minutos/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/nome da empresa/i), { target: { value: 'Wallbox Teste Ltda' } });
    fireEvent.change(screen.getByLabelText(/nome do responsável/i), { target: { value: 'Maria Parceira' } });
    fireEvent.change(screen.getByLabelText(/email profissional/i), { target: { value: 'maria@wallbox.example.com' } });
    fireEvent.change(screen.getByLabelText(/whatsapp comercial/i), { target: { value: '11988887777' } });
    fireEvent.change(screen.getByLabelText(/cidade sede/i), { target: { value: 'Jundiaí' } });
    await user.selectOptions(screen.getByLabelText(/uf principal/i), 'SP');
    await user.click(screen.getByRole('checkbox', { name: /^wallbox \/ instalação$/i }));
    await user.click(screen.getByRole('checkbox', { name: /^energia solar \/ recarga$/i }));
    await user.click(screen.getByLabelText(/pessoa física/i));
    await user.click(screen.getByLabelText(/^atende cnpj\/frota$/i));
    await user.click(screen.getByLabelText(/aceito respeitar lgpd/i));
    await user.click(screen.getByRole('button', { name: /enviar candidatura/i }));

    await waitFor(() => expect(submitPartnerApplication).toHaveBeenCalledTimes(1));
    expect(submitPartnerApplication).toHaveBeenCalledWith(expect.objectContaining({
      companyName: 'Wallbox Teste Ltda',
      email: 'maria@wallbox.example.com',
      state: 'SP',
      serviceCategories: ['wallbox', 'energia_solar_recarga'],
      coverageStates: ['SP'],
      leadPriceByModality: {},
      matchCodes: expect.arrayContaining(['uf_exact', 'serves_pf', 'serves_pj_fleet', 'home_charging', 'solar_cross_sell']),
      lgpdAcceptance: true,
    }));
    expect(track).toHaveBeenCalledWith('partner_form_start', expect.objectContaining({ landing_path: '/parceiros' }));
    expect(track).toHaveBeenCalledWith('partner_submit_attempt', expect.objectContaining({ category_count: 2 }));
    expect(track).toHaveBeenCalledWith('partner_submit_success', expect.objectContaining({ category_count: 2 }));
    expect(await screen.findByText(/candidatura recebida/i)).toBeInTheDocument();
  });
});
