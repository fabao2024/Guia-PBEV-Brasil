import { LeadFormData } from '../types';

export interface SubmitLeadResponse {
  status: 'needs_review';
  lead_id: number;
  partner_name: string;
}

export const LEADS_API_URL = 'https://bot.guiapbev.cloud/api/leads';

export async function submitLead(lead: LeadFormData, source: string): Promise<SubmitLeadResponse> {
  const response = await fetch(LEADS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...lead,
      source,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Falha ao enviar lead: ${response.status} ${detail}`.trim());
  }

  return response.json() as Promise<SubmitLeadResponse>;
}
