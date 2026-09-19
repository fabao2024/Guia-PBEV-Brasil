import { PartnerApplicationFormData } from '../types';
import { getFirstTouchAttribution } from './attribution';

export interface SubmitPartnerApplicationResponse {
  status: string;
  application_id: number;
}

export interface PartnerFormValidationIssue {
  field: string;
  message: string;
}

export function validatePartnerApplication(application: PartnerApplicationFormData): PartnerFormValidationIssue | null {
  const requiredTextFields: Array<[keyof PartnerApplicationFormData, string, number]> = [
    ['companyName', 'Informe o nome da empresa.', 2],
    ['contactName', 'Informe o nome do responsável.', 2],
    ['email', 'Informe o e-mail profissional.', 5],
    ['whatsapp', 'Informe o WhatsApp comercial.', 8],
    ['city', 'Informe a cidade sede.', 2],
    ['state', 'Informe a UF principal.', 2],
    ['commercialModelInterest', 'Informe o modelo comercial.', 2],
    ['acceptablePriceRange', 'Informe a faixa comercial.', 2],
    ['termsVersion', 'Informe a versão dos termos.', 2],
  ];

  for (const [field, message, minimumLength] of requiredTextFields) {
    const value = application[field];
    if (typeof value !== 'string' || value.trim().length < minimumLength) return { field, message };
  }
  if (!application.serviceCategories.length) return { field: 'serviceCategories', message: 'Selecione pelo menos uma modalidade.' };
  if (!application.coverageStates.length || application.coverageStates.some(state => !state.trim())) {
    return { field: 'coverageStates', message: 'Informe pelo menos uma UF de cobertura.' };
  }
  if (!application.servesPf && !application.servesPj) {
    return { field: 'audience', message: 'Informe se atende pessoa física, PJ/frota ou ambos.' };
  }
  if (!Object.keys(application.leadPriceByModality).length) {
    return { field: 'leadPriceByModality', message: 'Informe os termos de preço por modalidade.' };
  }
  if (application.freePilotLeadLimit == null || application.freePilotLeadLimit < 1) {
    return { field: 'freePilotLeadLimit', message: 'Informe o limite do piloto.' };
  }
  if (!application.lgpdAcceptance) return { field: 'lgpdAcceptance', message: 'Aceite as regras de LGPD e uso dos dados.' };
  return null;
}

export const PARTNER_APPLICATIONS_API_URL = 'https://bot.guiapbev.cloud/api/partner-applications';

export async function submitPartnerApplication(
  application: PartnerApplicationFormData,
): Promise<SubmitPartnerApplicationResponse> {
  const validationIssue = validatePartnerApplication(application);
  if (validationIssue) throw new Error(validationIssue.message);

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
