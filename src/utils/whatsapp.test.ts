import { describe, expect, it } from 'vitest';
import {
  WHATSAPP_NUMBER,
  buildWhatsAppLink,
  getWhatsAppPrefillMessage,
} from './whatsapp';

describe('WhatsApp CTA links', () => {
  it('builds a consumer link with the approved prefilled message', () => {
    const link = buildWhatsAppLink({ placement: 'home', audience: 'consumer' });
    const url = new URL(link);

    expect(WHATSAPP_NUMBER).toBe('551133958879');
    expect(url.protocol).toBe('https:');
    expect(url.hostname).toBe('wa.me');
    expect(url.pathname).toBe(`/${WHATSAPP_NUMBER}`);
    expect(url.searchParams.get('text')).toBe(getWhatsAppPrefillMessage({ placement: 'home', audience: 'consumer' }));
    expect(url.searchParams.get('text')).toContain('Vim pelo Guia PBEV');
  });

  it('builds the partner message separately from the consumer message', () => {
    const partnerMessage = getWhatsAppPrefillMessage({ placement: 'partner', audience: 'partner' });
    const consumerMessage = getWhatsAppPrefillMessage({ placement: 'interest', audience: 'consumer' });

    expect(partnerMessage).toBe('Sou uma empresa e quero conhecer o Programa de Parceiros da Guia PBEV Brasil.');
    expect(consumerMessage).toBe('Vim pelo Guia PBEV e quero orientação sobre wallbox, energia solar ou veículo elétrico. Minha cidade é:');
    expect(partnerMessage).not.toBe(consumerMessage);
  });

  it('uses a safe default when placement is omitted', () => {
    expect(getWhatsAppPrefillMessage({ audience: 'consumer' })).toContain('Vim pelo Guia PBEV');
    expect(buildWhatsAppLink({ audience: 'consumer' })).toContain(`https://wa.me/${WHATSAPP_NUMBER}`);
  });
});
