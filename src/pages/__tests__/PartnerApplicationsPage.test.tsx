import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from 'react-helmet-async';
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

  it('publishes the canonical trailing-slash URL', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/parceiros/']}>
          <PartnerApplicationsPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
        'href',
        'https://guiapbev.cloud/parceiros/',
      );
      const description = document.querySelector('meta[name="description"]');
      expect(description).toHaveAttribute('content', expect.stringMatching(/wallbox.*energia solar.*são paulo/i));
      expect(description).not.toHaveAttribute('content', expect.stringMatching(/seguro|financiamento|veículos/i));
    });
  });

  it('renders a supply-side proposition and the short form before details', async () => {
    render(
      <MemoryRouter>
        <PartnerApplicationsPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /receba oportunidades de quem já pesquisa mobilidade elétrica/i })).toBeInTheDocument();
    expect(screen.getByText(/candidaturas estão abertas para wallbox, energia solar e limpeza de sistemas solares em sp\. o piloto gratuito de encaminhamento, sujeito à cobertura operacional/i)).toBeInTheDocument();
    expect(screen.getByText(/catálogo de bevs homologados, comparador e simuladores/i)).toBeInTheDocument();
    expect(screen.getByText(/até 2 leads qualificados aceitos por parceiro/i)).toBeInTheDocument();
    expect(screen.getByText(/os primeiros 2 leads aceitos são gratuitos/i)).toBeInTheDocument();
    expect(screen.getByText(/wallbox pf/i)).toHaveTextContent(/r\$\s*100/i);
    expect(screen.getByText(/wallbox pj/i)).toHaveTextContent(/r\$\s*150/i);
    expect(screen.getByText(/energia solar pf\/pj/i)).toHaveTextContent(/r\$\s*250/i);
    expect(screen.getByText(/limpeza de sistema solar pf\/pj/i)).toHaveTextContent(/r\$\s*35/i);
    expect(screen.getByText(/nenhum lead adicional será encaminhado antes da formalização/i)).toBeInTheDocument();
    expect(screen.getAllByText(/estrutura jurídica e fiscal adequadas/i).length).toBeGreaterThanOrEqual(2);
    const cta = screen.getByRole('link', { name: /candidatar em 2 minutos/i });
    expect(cta).toHaveAttribute('href', '#formulario-parceiro');
    await userEvent.click(cta);
    expect(track).toHaveBeenCalledWith('partner_cta_click', expect.objectContaining({ placement: 'hero' }));

    const form = screen.getByRole('form', { name: /candidatura de parceiro/i });
    const pricing = screen.getByRole('heading', { name: /condições previstas após o piloto/i });
    const details = screen.getByRole('heading', { name: /como funciona/i });
    expect(form.compareDocumentPosition(pricing) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(form.compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByLabelText(/site/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/ufs atendidas/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/sla de primeiro contato/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/faixa viável por lead/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole('checkbox', { name: /wallbox|energia solar|limpeza de sistema de placa solar/i })).toHaveLength(3);
    expect(screen.queryByRole('checkbox', { name: /^(financiamento|seguro ev|venda \/ cotação de veículo|frota \/ b2b|documentação \/ despachante)$/i })).not.toBeInTheDocument();
    expect(track).toHaveBeenCalledWith('partner_page_view', expect.objectContaining({
      utm_source: 'instagram',
      utm_campaign: 'partner_program',
    }));
  });

  it('uses the one-lead contract only for the versioned outreach campaign', async () => {
    const user = userEvent.setup();
    window.sessionStorage.clear();
    window.history.replaceState(
      {},
      '',
      '/parceiros?utm_source=instagram&utm_medium=dm&utm_campaign=partner_pilot_sp_2026q3_one_lead_20260731&utm_content=empresa_teste',
    );

    render(
      <MemoryRouter>
        <PartnerApplicationsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/limitado a 1 lead válido e aceito por parceiro/i)).toBeInTheDocument();
    expect(screen.getByText(/o primeiro lead válido e aceito é gratuito/i)).toBeInTheDocument();
    expect(screen.queryByText(/os primeiros 2 leads aceitos são gratuitos/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/nome da empresa/i), { target: { value: 'Empresa Rodada Um Lead' } });
    fireEvent.change(screen.getByLabelText(/nome do responsável/i), { target: { value: 'Maria Parceira' } });
    fireEvent.change(screen.getByLabelText(/email profissional/i), { target: { value: 'maria@example.com' } });
    fireEvent.change(screen.getByLabelText(/whatsapp comercial/i), { target: { value: '11988887777' } });
    fireEvent.change(screen.getByLabelText(/cidade sede/i), { target: { value: 'São Paulo' } });
    await user.click(screen.getByRole('checkbox', { name: /^wallbox \/ instalação$/i }));
    await user.click(screen.getByLabelText(/pessoa física/i));
    await user.click(screen.getByLabelText(/aceito os termos do piloto gratuito/i));
    await user.click(screen.getByRole('button', { name: /enviar candidatura/i }));

    await waitFor(() => expect(submitPartnerApplication).toHaveBeenCalledTimes(1));
    expect(submitPartnerApplication).toHaveBeenCalledWith(expect.objectContaining({
      termsVersion: '2026-08-14-pilot-one-lead-v2',
      freePilotLeadLimit: 1,
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
    await user.click(screen.getByRole('checkbox', { name: /^limpeza de sistema de placa solar$/i }));
    await user.click(screen.getByLabelText(/pessoa física/i));
    await user.click(screen.getByLabelText(/^atende cnpj\/frota$/i));
    await user.click(screen.getByLabelText(/aceito os termos do piloto gratuito/i));
    await user.click(screen.getByRole('button', { name: /enviar candidatura/i }));

    await waitFor(() => expect(submitPartnerApplication).toHaveBeenCalledTimes(1));
    expect(submitPartnerApplication).toHaveBeenCalledWith(expect.objectContaining({
      companyName: 'Wallbox Teste Ltda',
      email: 'maria@wallbox.example.com',
      state: 'SP',
      serviceCategories: ['wallbox', 'energia_solar_recarga', 'limpeza_sistema_solar'],
      coverageStates: ['SP'],
      commercialModelInterest: 'piloto_gratuito_com_cpl_futuro',
      acceptablePriceRange: 'Piloto gratuito; CPL futuro conforme modalidade',
      leadPriceByModality: {
        wallbox: 'PF R$ 100; PJ R$ 150 por lead aceito após o piloto',
        energia_solar_recarga: 'PF/PJ R$ 250 por lead aceito após o piloto',
        limpeza_sistema_solar: 'PF/PJ R$ 35 por lead aceito após o piloto',
      },
      termsVersion: '2026-08-14-pilot-v3',
      freePilotLeadLimit: 2,
      matchCodes: expect.arrayContaining(['uf_exact', 'serves_pf', 'serves_pj_fleet', 'home_charging', 'solar_cross_sell', 'solar_cleaning']),
      lgpdAcceptance: true,
    }));
    expect(track).toHaveBeenCalledWith('partner_form_start', expect.objectContaining({ landing_path: '/parceiros' }));
    expect(track).toHaveBeenCalledWith('partner_submit_attempt', expect.objectContaining({ category_count: 3 }));
    expect(track).toHaveBeenCalledWith('partner_submit_success', expect.objectContaining({ category_count: 3 }));
    expect(await screen.findByText(/candidatura recebida/i)).toBeInTheDocument();
  });
});
