export const WHATSAPP_NUMBER = '551133958879';

export type WhatsAppAudience = 'consumer' | 'partner';
export type WhatsAppPlacement = 'home' | 'interest' | 'partner' | 'chat_widget';

interface WhatsAppLinkOptions {
  audience: WhatsAppAudience;
  placement?: WhatsAppPlacement;
}

export function getWhatsAppPrefillMessage({ audience }: WhatsAppLinkOptions): string {
  if (audience === 'partner') {
    return 'Sou uma empresa e quero conhecer o Programa de Parceiros da Guia PBEV Brasil.';
  }

  return 'Vim pelo Guia PBEV e quero orientação sobre wallbox, energia solar ou veículo elétrico. Minha cidade é:';
}

export function buildWhatsAppLink(options: Partial<WhatsAppLinkOptions> = {}): string {
  const audience = options.audience ?? 'consumer';
  const url = new URL(`https://wa.me/${WHATSAPP_NUMBER}`);
  url.searchParams.set('text', getWhatsAppPrefillMessage({ audience, placement: options.placement }));
  return url.toString();
}
