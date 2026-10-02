import { LeadFormData } from '../types';
import { getFirstTouchAttribution } from './attribution';

export interface SubmitLeadResponse {
  status: 'needs_review';
  lead_id: number;
}

export interface FormValidationIssue {
  field: string;
  message: string;
}

export function validateLeadForm(lead: LeadFormData): FormValidationIssue | null {
  const requiredTextFields: Array<[keyof LeadFormData, string, number]> = [
    ['name', 'Informe seu nome.', 2],
    ['whatsapp', 'Informe um WhatsApp válido.', 8],
    ['city', 'Selecione sua cidade.', 2],
    ['state', 'Informe a UF.', 2],
  ];

  for (const [field, message, minimumLength] of requiredTextFields) {
    const value = lead[field];
    if (typeof value !== 'string' || value.trim().length < minimumLength) {
      return { field, message };
    }
  }

  if (!lead.customerType) return { field: 'customerType', message: 'Selecione o perfil de atendimento.' };
  if (!lead.interest) return { field: 'interest', message: 'Selecione a modalidade desejada.' };

  const qualificationFields: Array<[keyof LeadFormData['qualificationData'], string]> = [
    ['property_situation', 'Selecione o tipo de imóvel.'],
    ['timeline', 'Selecione o prazo para contratar.'],
    ['service_detail', 'Informe os detalhes da modalidade.'],
    ['preferred_contact', 'Selecione a preferência de contato.'],
  ];
  for (const [field, message] of qualificationFields) {
    if (!lead.qualificationData[field]?.trim()) return { field, message };
  }

  if (!lead.consentAccepted) {
    return { field: 'consentAccepted', message: 'Marque a autorização para uso dos dados.' };
  }
  return null;
}

export const LEADS_API_URL = import.meta.env.VITE_LEADS_API_URL || 'https://bot.guiapbev.cloud/api/leads';

export async function submitLead(
  lead: LeadFormData,
  source: string,
  idempotencyKey?: string,
): Promise<SubmitLeadResponse> {
  const validationIssue = validateLeadForm(lead);
  if (validationIssue) throw new Error(validationIssue.message);

  const requestKey = idempotencyKey || crypto.randomUUID();
  const response = await fetch(LEADS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': requestKey,
    },
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
