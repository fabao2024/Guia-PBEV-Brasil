import { PartnerApplicationFormData } from '../types';

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
    body: JSON.stringify(application),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Falha ao enviar candidatura: ${response.status} ${detail}`.trim());
  }

  return response.json() as Promise<SubmitPartnerApplicationResponse>;
}
