import type { ReactNode } from 'react';
import { MessageCircle } from 'lucide-react';
import { track } from '../utils/analytics';
import { buildWhatsAppLink, type WhatsAppAudience, type WhatsAppPlacement } from '../utils/whatsapp';

interface WhatsAppCtaProps {
  audience?: WhatsAppAudience;
  placement: WhatsAppPlacement;
  children?: ReactNode;
  className?: string;
}

export default function WhatsAppCta({
  audience = 'consumer',
  placement,
  children,
  className = '',
}: WhatsAppCtaProps) {
  const label = children ?? (audience === 'partner' ? 'Falar com a Guia pelo WhatsApp' : 'Continuar no WhatsApp');

  return (
    <a
      href={buildWhatsAppLink({ audience, placement })}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('whatsapp_cta_click', { placement, audience })}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-black transition ${className}`}
    >
      <MessageCircle className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </a>
  );
}
