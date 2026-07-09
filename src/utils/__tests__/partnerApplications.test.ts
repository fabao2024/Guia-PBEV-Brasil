import { submitPartnerApplication } from '../partnerApplications';
import { PartnerApplicationFormData } from '../../types';

const application: PartnerApplicationFormData = {
  companyName: 'Wallbox Teste Ltda',
  cnpj: '',
  website: 'https://wallbox.example.com',
  contactName: 'Maria Parceira',
  contactRole: '',
  email: 'maria@wallbox.example.com',
  whatsapp: '11988887777',
  city: 'Jundiaí',
  state: 'SP',
  serviceCategories: ['wallbox', 'energia_solar_recarga'],
  coverageStates: ['SP', 'MG'],
  coverageCities: 'Jundiaí, Campinas, São Paulo',
  servesPf: true,
  servesPj: true,
  servesRemote: false,
  evExperience: '',
  brandsSupported: '',
  monthlyCapacity: '',
  slaHours: '4',
  crmTool: '',
  preferredDeliveryChannel: '',
  commercialModelInterest: '',
  acceptablePriceRange: 'R$ 81–R$ 150',
  leadPriceByModality: {},
  matchCodes: ['uf_exact', 'city_priority', 'home_charging', 'fast_sla_4h'],
  notes: 'Teste de candidatura.',
  lgpdAcceptance: true,
};

describe('submitPartnerApplication()', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts the partner application to the bot API and returns the application id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'submitted', application_id: 7 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitPartnerApplication(application);

    expect(result).toEqual({ status: 'submitted', application_id: 7 });
    expect(fetchMock).toHaveBeenCalledWith('https://bot.guiapbev.cloud/api/partner-applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(application),
    });
  });

  it('throws when the partner application API rejects the request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      text: async () => 'validation error',
    }));

    await expect(submitPartnerApplication(application)).rejects.toThrow('Falha ao enviar candidatura: 422 validation error');
  });
});
