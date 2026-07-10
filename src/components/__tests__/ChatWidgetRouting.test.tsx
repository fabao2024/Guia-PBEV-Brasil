import { buildPbevRedirectResponse, classifyPbevInteraction } from '../ChatWidget';

describe('ChatWidget routing', () => {
  it('classifies supplier/partner intent separately from consumer lead intent', () => {
    expect(classifyPbevInteraction('Somos instaladores de wallbox e queremos receber leads')).toEqual({ type: 'partner' });
    expect(classifyPbevInteraction('Quero cotar seguro para meu BYD Dolphin')).toEqual({ type: 'lead', modality: 'seguro' });
    expect(classifyPbevInteraction('Qual a autonomia do BYD Dolphin?')).toEqual({ type: 'informational' });
  });

  it('builds segmented redirect responses for partners and potential leads', () => {
    const partner = buildPbevRedirectResponse({ type: 'partner' }, 'pt-BR');
    expect(partner).toContain('/parceiros');
    expect(partner).toContain('fornecedor');
    expect(partner).toContain('candidatura');

    const lead = buildPbevRedirectResponse({ type: 'lead', modality: 'wallbox' }, 'pt-BR');
    expect(lead).toContain('wallbox');
    expect(lead).toContain('parceiro selecionado');
    expect(lead).toContain('não executa instalação');
  });
});
