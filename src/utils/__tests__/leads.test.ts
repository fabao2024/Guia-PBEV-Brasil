import { submitLead } from '../leads';
import { LeadFormData } from '../../types';

const lead: LeadFormData = {
  name: 'Fabio Test',
  whatsapp: '(11) 99999-9999',
  city: 'Jundiaí/SP',
  budget: 'até R$ 180 mil',
  interest: 'compra',
  vehicleBrand: 'Renault',
  vehicleModel: 'Kwid E-Tech',
  message: 'Tenho garagem e rodo 60 km/dia',
};

describe('submitLead()', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts the lead to the bot API and returns the lead id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', lead_id: 42 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitLead(lead, 'vehicle_details');

    expect(result).toEqual({ status: 'ok', lead_id: 42 });
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
});
