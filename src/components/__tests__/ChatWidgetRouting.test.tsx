import { buildPbevRedirectResponse, classifyPbevInteraction } from '../ChatWidget';

describe('ChatWidget routing', () => {
  it('separates partners, pilot services and unsupported vehicle financing', () => {
    expect(classifyPbevInteraction('Somos instaladores de wallbox e queremos receber leads')).toEqual({ type: 'partner' });
    expect(classifyPbevInteraction('Quero instalar um wallbox em casa')).toEqual({ type: 'lead', modality: 'wallbox' });
    expect(classifyPbevInteraction('Quero financiamento para meu projeto de energia solar')).toEqual({ type: 'lead', modality: 'energia_solar_recarga' });
    expect(classifyPbevInteraction('Quero financiar um BYD Dolphin')).toEqual({ type: 'lead', modality: 'financiamento' });
    expect(classifyPbevInteraction('Quero fazer leasing de um carro elétrico')).toEqual({ type: 'lead', modality: 'financiamento' });
    expect(classifyPbevInteraction('Tem consórcio para comprar um BYD?')).toEqual({ type: 'lead', modality: 'financiamento' });
    expect(classifyPbevInteraction('Preciso de crédito para adquirir um veículo')).toEqual({ type: 'lead', modality: 'financiamento' });
    expect(classifyPbevInteraction('Qual a autonomia do BYD Dolphin?')).toEqual({ type: 'informational' });
  });

  it('routes supported demand to the consent form and rejects unsupported financing handoff', () => {
    const partner = buildPbevRedirectResponse({ type: 'partner' }, 'pt-BR');
    expect(partner).toContain('/parceiros');
    expect(partner).toContain('fornecedor');
    expect(partner).toContain('candidatura');

    const wallbox = buildPbevRedirectResponse({ type: 'lead', modality: 'wallbox' }, 'pt-BR', true);
    expect(wallbox).toContain('/interesse?servico=wallbox&origem=chat');
    expect(wallbox).toContain('consentimento explícito');
    expect(wallbox).toContain('parceiro selecionado');

    const financing = buildPbevRedirectResponse({ type: 'lead', modality: 'financiamento' }, 'pt-BR');
    expect(financing).toContain('não oferece nem encaminha financiamento para aquisição de veículos');
    expect(financing).not.toContain('/interesse');
  });

  it('does not advertise the consent form while the rollout flag is disabled', () => {
    const wallbox = buildPbevRedirectResponse({ type: 'lead', modality: 'wallbox' }, 'pt-BR', false);
    expect(wallbox).toContain('ainda não está recebendo solicitações');
    expect(wallbox).not.toContain('/interesse');
  });
});
