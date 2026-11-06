import { IPVA_BY_STATE } from '../constants/ipvaByState';
import { FUEL_PRICES_BY_STATE, FUEL_PRICES_UPDATED } from '../constants/fuelPricesByState';
import { ELECTRICITY_PRICES_BY_STATE, ELECTRICITY_PRICES_UPDATED } from '../constants/electricityPricesByState';
import { SP_IPVA_REVIEWED, SP_IPVA_SOURCES } from './ipva';

export function buildStateDataSummary(): string {
  const lines = IPVA_BY_STATE.map(s => {
    const fuel = FUEL_PRICES_BY_STATE[s.abbr];
    const elec = ELECTRICITY_PRICES_BY_STATE[s.abbr];
    return `${s.abbr} (${s.name}): gas R$${fuel?.gasoline.toFixed(2)}/L | etanol R$${fuel?.ethanol.toFixed(2)}/L | energia R$${elec?.toFixed(2)}/kWh`;
  });
  return `Dados por Estado (ANP ${FUEL_PRICES_UPDATED} | ANEEL ${ELECTRICITY_PRICES_UPDATED}):\n${lines.join('\n')}\nDemais UFs — IPVA: regras e elegibilidade não verificadas; consulte a Secretaria da Fazenda da UF.
SP, revisão ${SP_IPVA_REVIEWED}, exercício 2026: cenário particular da classe geral 4% (inclusive BEV e híbrido gasolina/diesel). Caminhões 1,5%; ônibus/micro-ônibus e cabine simples 2%; categoria Comercial não prova a classe fiscal.
Benefício híbrido SP exige etanol/flex, potência elétrica total mínima 40 kW, sistema de tensão mínima 150 V, recuperação de energia, classe do art. 9º III e valor até R$ 261.154,45 em 2026. Potência combinada em cv NÃO comprova requisito elétrico. Não presuma requisitos técnicos ausentes no catálogo, nem isenção confirmada com base apenas no modelo e preço.
Calendário legal para elegíveis: 2025/2026 0%; 2027 1%; 2028 2%; 2029 3%; a partir de 2030 4%. Não extrapole o teto de 2026 para futuros exercícios. Preço/depreciação não é valor fiscal oficial.
Sem benefícios pessoais, de locadora, por idade, município, restituições, desconto por pagamento ou proporcionalidade sem dados adicionais. 3% à vista para usados em janeiro/2026 dependeu do prazo, já encerrado; não é permanente.
Fontes SP: ${SP_IPVA_SOURCES.map(source => source.url).join(' | ')}.
Não afirme isenção ou desconto individual sem comprovação; quando pendente, descreva somente o cenário sem benefício. TCO sem IPVA disponível exclui o imposto de ambos os veículos e é parcial.`;
}
