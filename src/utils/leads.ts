import { LeadFormData } from '../types';
import { getFirstTouchAttribution } from './attribution';

export interface SubmitLeadResponse {
  status: 'needs_review';
  lead_id: number;
}

export const LEADS_API_URL = import.meta.env.VITE_LEADS_API_URL || 'https://bot.guiapbev.cloud/api/leads';

export async function submitLead(lead: LeadFormData, source: string): Promise<SubmitLeadResponse> {
  const response = await fetch(LEADS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...lead,
      source,
      attribution: getFirstTouchAttribution(),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Falha ao enviar lead: ${response.status} ${detail}`.trim());
  }

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== 'object' || (payload as Record<string, unknown>).status !== 'needs_review') {
    throw new Error('Resposta inválida da API de leads: status');
  }

  const result = payload as Record<string, unknown>;
  if (!Number.isInteger(result.lead_id) || Number(result.lead_id) <= 0) {
    throw new Error('Resposta inválida da API de leads: lead_id');
  }
  if ('partner_name' in result) {
    throw new Error('Resposta inválida da API de leads: partner_name');
  }

  return result as unknown as SubmitLeadResponse;
}
