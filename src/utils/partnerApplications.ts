import { PartnerApplicationFormData } from '../types';
import { getFirstTouchAttribution } from './attribution';

export interface SubmitPartnerApplicationResponse {
  status: string;
  application_id: number;
}

export const PARTNER_APPLICATIONS_API_URL = 'https://bot.guiapbev.cloud/api/partner-applications';

export async function submitPartnerApplication(
  application: PartnerApplicationFormData,
): Promise<SubmitPartnerApplicationResponse> {
  const response = await fetch(PARTNER_APPLICATIONS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...application,
      attribution: getFirstTouchAttribution(),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Falha ao enviar candidatura: ${response.status} ${detail}`.trim());
  }

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== 'object') {
    throw new Error('Resposta inválida da API de parceiros');
  }

  const result = payload as Record<string, unknown>;
  if (result.status !== 'submitted') {
    throw new Error('Resposta inválida da API de parceiros: status');
  }
  if (!Number.isInteger(result.application_id) || Number(result.application_id) <= 0) {
    throw new Error('Resposta inválida da API de parceiros: application_id');
  }

  return result as unknown as SubmitPartnerApplicationResponse;
}
