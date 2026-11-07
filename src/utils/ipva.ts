import { Car, powertrainOf } from '../types';

/** Exercício explícito: não mudar silenciosamente com o relógio do navegador. */
export const IPVA_REFERENCE_YEAR = 2026;
export const SP_IPVA_REVIEWED = '06/11/2026';
export const SP_IPVA_SOURCES = [
  { label: 'Lei 13.296/2008, arts. 7–13', url: 'https://www.al.sp.gov.br/repositorio/legislacao/lei/2008/lei-13296-23.12.2008.html' },
  { label: 'Lei 18.065/2024', url: 'https://www.al.sp.gov.br/repositorio/legislacao/lei/2024/lei-18065-18.12.2024.html' },
  { label: 'Portaria SRE 94/2024, arts. 1–4', url: 'https://legislacao.fazenda.sp.gov.br/Paginas/Portaria-SRE-94-de-2024.aspx' },
  { label: 'Sefaz-SP / SIPET — requisitos e teto', url: 'https://www3.fazenda.sp.gov.br/SIPET/ServicosInstrucao/Instrucao/321' },
  { label: 'Sefaz-SP — pagamento IPVA 2026', url: 'https://portal.fazenda.sp.gov.br/Noticias/Paginas/ipva2026placas890fev.aspx' },
];

// Não estender o teto atual a exercícios futuros nem usar depreciação como teto legal.
const SP_CEILINGS: Readonly<Record<number, number>> = { 2025: 250000, 2026: 261154.45 };

export function spHybridRate(year: number): number | null {
  if (year === 2025 || year === 2026) return 0;
  if (year >= 2027 && year <= 2029) return (year - 2026) / 100;
  return year >= 2030 ? 0.04 : null;
}

export interface IpvaEstimate {
  state: string;
  year: number;
  baseValue: number;
  rate: number | null;
  amount: number | null;
  standardAmount: number | null;
  standardRate: number | null;
  benefitRate: number | null;
  status: 'estimate' | 'conditional' | 'unavailable';
  reason: 'bev' | 'fuel' | 'technical' | 'technicalFail' | 'threshold' | 'eligible' | 'futureCeiling' | 'classification' | 'unreviewed' | 'period' | 'invalidBase' | 'general';
  missing: string[];
}

/** Cenário anual de uso particular, sem benefícios pessoais ou desconto de pagamento.
 * Preço/depreciação são proxies, não lançamento ou confirmação administrativa.
 * UF sem auditoria permanece indisponível, nunca herda a regra de SP ou BEV.
 */
export function resolveIpva(car: Car, state: string, options: { year?: number; baseValue?: number } = {}): IpvaEstimate {
  const year = options.year ?? IPVA_REFERENCE_YEAR;
  const baseValue = options.baseValue ?? car.price;
  const result: IpvaEstimate = { state, year, baseValue, rate: null, amount: null, standardAmount: null, standardRate: null, benefitRate: null, status: 'unavailable', reason: 'unreviewed', missing: [] };
  if (state !== 'SP') return result;
  if (!Number.isInteger(year) || year < 2025) return { ...result, reason: 'period' };
  if (!Number.isFinite(baseValue) || baseValue <= 0) return { ...result, reason: 'invalidBase' };

  const profile = car.taxProfile;
  const hasEvidence = !!profile?.sourceUrl.match(/^https:\/\//);
  const fiscalClass = hasEvidence && profile?.spClass
    ? profile.spClass
    : car.cat !== 'Comercial' ? 'general' : undefined;
  if (!fiscalClass) return { ...result, reason: 'classification', missing: ['spClass'] };
  const standardRate = fiscalClass === 'truck' ? 0.015 : fiscalClass === 'general' ? 0.04 : 0.02;
  const standardAmount = Math.round(baseValue * standardRate);
  const regular = { ...result, rate: standardRate, amount: standardAmount, standardAmount, standardRate, status: 'estimate' as const, reason: 'general' as const };
  // A isenção do art. 5º transitório só alcança a classe do art. 9º, III.
  if (fiscalClass !== 'general') return regular;
  if (powertrainOf(car) === 'BEV') return { ...regular, reason: 'bev' };
  if (car.fuelType2 && !['flex', 'etanol'].includes(car.fuelType2)) return { ...regular, reason: 'fuel' };
  const benefitRate = spHybridRate(year);
  if (benefitRate === standardRate) return regular;
  const ceiling = SP_CEILINGS[year];
  if (ceiling !== undefined && baseValue > ceiling) return { ...regular, reason: 'threshold', benefitRate };
  const missing: string[] = [];
  if (!car.fuelType2) missing.push('fuelType2');
  if (!hasEvidence || !Number.isFinite(profile?.electricMotorKw)) missing.push('electricMotorKw');
  if (!hasEvidence || !Number.isFinite(profile?.voltageV)) missing.push('voltageV');
  if (!hasEvidence || profile?.regenerativeBraking === undefined) missing.push('regenerativeBraking');
  if (hasEvidence && ((profile?.electricMotorKw !== undefined && profile.electricMotorKw < 40)
    || (profile?.voltageV !== undefined && profile.voltageV < 150) || profile?.regenerativeBraking === false)) {
    return { ...regular, reason: 'technicalFail' };
  }
  // Uma pendência não comprova inelegibilidade. A alíquota geral é apenas referência.
  const pending = { ...regular, rate: null, amount: null, status: 'conditional' as const, benefitRate };
  if (missing.length) return { ...pending, reason: 'technical', missing };
  if (ceiling === undefined) return { ...pending, reason: 'futureCeiling' };
  return { ...regular, rate: benefitRate, amount: Math.round(baseValue * benefitRate!), reason: 'eligible', benefitRate };
}
