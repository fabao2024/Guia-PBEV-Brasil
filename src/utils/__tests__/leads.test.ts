import { submitLead } from '../leads';
import { LeadFormData } from '../../types';

const lead: LeadFormData = {
  name: 'Fabio Test',
  whatsapp: '(11) 99999-9999',
  city: 'Jundiaí',
  state: 'SP',
  customerType: 'pf',
  budget: '',
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
  message: 'Tenho garagem e rodo 60 km/dia',
};

describe('submitLead()', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts the qualified lead without exposing the matched partner', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'needs_review', lead_id: 42 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitLead(lead, 'vehicle_details');

    expect(result).toEqual({ status: 'needs_review', lead_id: 42 });
    expect(fetchMock).toHaveBeenCalledWith('https://bot.guiapbev.cloud/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...lead,
        source: 'vehicle_details',
      }),
    });
  });

  it('throws when the bot API rejects the request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'server error',
    }));

    await expect(submitLead(lead, 'lead_banner')).rejects.toThrow('Falha ao enviar lead: 500 server error');
  });

  it.each([
    [{ status: 'approved', lead_id: 42 }, 'status'],
    [{ status: 'needs_review' }, 'lead_id'],
    [{ status: 'needs_review', lead_id: 42, partner_name: 'E.R SOLAR' }, 'partner_name'],
  ])('rejects a malformed or divergent success response: %s', async (payload, expectedField) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    }));

    await expect(submitLead(lead, 'lead_banner')).rejects.toThrow(`Resposta inválida da API de leads: ${expectedField}`);
  });
});
