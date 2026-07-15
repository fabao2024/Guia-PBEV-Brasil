import React, { useEffect, useMemo, useState } from 'react';
import { Send, ShieldCheck, X, Zap } from 'lucide-react';
import { Car, LeadFormData, LeadInterest } from '../types';
import { track } from '../utils/analytics';
import { submitLead } from '../utils/leads';

interface LeadCaptureModalProps {
  isOpen: boolean;
  selectedCar: Car | null;
  source: string;
  initialInterest?: LeadInterest;
  onClose: () => void;
}

const PILOT_CONSENT_TEXT_VERSION = 'pilot-v3-2026-07-15';
const PILOT_CITIES = ['Jundiaí', 'Campinas', 'São Paulo', 'Itupeva', 'Várzea Paulista', 'Campo Limpo Paulista'];
const INTEREST_OPTIONS: { value: LeadInterest; label: string }[] = [
  { value: '', label: 'Selecione o serviço' },
  { value: 'wallbox', label: 'Wallbox e instalação de recarga' },
  { value: 'energia_solar_recarga', label: 'Energia solar para recarga' },
];

const INITIAL_FORM: LeadFormData = {
  name: '',
  whatsapp: '',
  city: '',
  state: 'SP',
  customerType: 'pf',
  budget: '',
  interest: '',
  vehicleModel: '',
  vehicleBrand: '',
  qualificationData: {
    property_situation: '',
    timeline: '',
    service_detail: '',
    equipment_financing: '',
  },
  consentAccepted: false,
  consentTextVersion: PILOT_CONSENT_TEXT_VERSION,
  message: '',
};

export default function LeadCaptureModal({ isOpen, selectedCar, source, initialInterest = '', onClose }: LeadCaptureModalProps) {
  const [form, setForm] = useState<LeadFormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leadId, setLeadId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const vehicleLabel = selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : '';

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    setSubmitted(false);
    setSubmitting(false);
    setLeadId(null);
    setSubmitError(null);
    setForm({
      ...INITIAL_FORM,
      interest: initialInterest,
      vehicleBrand: selectedCar?.brand || '',
      vehicleModel: selectedCar?.model || '',
      qualificationData: { ...INITIAL_FORM.qualificationData },
    });
  }, [isOpen, selectedCar, initialInterest]);

  const hydratedForm = useMemo<LeadFormData>(() => ({
    ...form,
    vehicleBrand: selectedCar?.brand || form.vehicleBrand,
    vehicleModel: selectedCar?.model || form.vehicleModel,
  }), [form, selectedCar]);

  if (!isOpen) return null;

  const updateField = <K extends keyof LeadFormData>(field: K, value: LeadFormData[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateQualification = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      qualificationData: { ...prev.qualificationData, [field]: value },
    }));
  };

  const updateInterest = (interest: LeadInterest) => {
    setForm(prev => ({
      ...prev,
      interest,
      qualificationData: { ...prev.qualificationData, service_detail: '' },
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitLead(hydratedForm, source);
      setLeadId(result.lead_id);
      setSubmitted(true);
      track('lead_submit', {
        source,
        interest: hydratedForm.interest,
        city: hydratedForm.city,
        customer_type: hydratedForm.customerType,
        vehicle: vehicleLabel,
      });
      track('lead_success', {
        source,
        interest: hydratedForm.interest,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao enviar solicitação';
      setSubmitError(message);
      track('lead_error', {
        source,
        interest: hydratedForm.interest,
        city: hydratedForm.city,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-normal text-white placeholder:text-white/35 focus:ring-2 focus:ring-[#00b4ff] focus:border-[#00b4ff]/60 outline-none transition';

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 md:p-4" role="dialog" aria-modal="true" aria-labelledby="lead-form-title">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[94vh] overflow-y-auto rounded-3xl border border-[#00b4ff]/20 bg-[#08090e] shadow-[0_0_80px_rgba(0,180,255,0.18)]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(0,180,255,0.22),transparent_45%)]" />
        <div className="relative border-b border-white/10 p-6 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#00b4ff] mb-2">Piloto Guia PBEV Brasil</p>
          <h2 id="lead-form-title" className="text-2xl md:text-3xl font-black leading-tight">Solicitar energia solar ou wallbox</h2>
          <p className="mt-2 text-sm text-white/65">
            O Guia qualifica sua solicitação e, após revisão humana, identifica um parceiro que atenda à região e ao serviço solicitado. Você será informado antes do compartilhamento.
          </p>
          {vehicleLabel && <p className="mt-2 text-sm text-white/65">Veículo de interesse: <strong className="text-white">{vehicleLabel}</strong></p>}
        </div>

        <form onSubmit={handleSubmit} className="relative p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
          <label className="flex flex-col gap-1 text-sm font-bold text-white/80">
            Nome
            <input required value={form.name} onChange={e => updateField('name', e.target.value)} className={inputClass} placeholder="Seu nome" autoComplete="name" />
          </label>

          <label className="flex flex-col gap-1 text-sm font-bold text-white/80">
            WhatsApp
            <input required minLength={8} value={form.whatsapp} onChange={e => updateField('whatsapp', e.target.value)} className={inputClass} placeholder="(11) 99999-9999" inputMode="tel" autoComplete="tel" />
          </label>

          <label className="flex flex-col gap-1 text-sm font-bold text-white/80">
            Cidade atendida
            <select required value={form.city} onChange={e => updateField('city', e.target.value)} className={`${inputClass} bg-[#08090e]`}>
              <option value="" disabled>Selecione a cidade</option>
              {PILOT_CITIES.map(city => <option key={city} value={city}>{city}/SP</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-bold text-white/80">
            Perfil
            <select required value={form.customerType} onChange={e => updateField('customerType', e.target.value as 'pf' | 'pj')} className={`${inputClass} bg-[#08090e]`}>
              <option value="pf">Pessoa física</option>
              <option value="pj">Empresa / condomínio</option>
            </select>
          </label>

          <label className="md:col-span-2 flex flex-col gap-1 text-sm font-bold text-white/80">
            Serviço desejado
            <select required value={form.interest} onChange={e => updateInterest(e.target.value as LeadInterest)} className={`${inputClass} bg-[#08090e]`}>
              {INTEREST_OPTIONS.map(option => <option key={option.value || 'empty'} value={option.value} disabled={option.value === ''}>{option.label}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-bold text-white/80">
            Tipo de imóvel
            <select required value={form.qualificationData.property_situation} onChange={e => updateQualification('property_situation', e.target.value)} className={`${inputClass} bg-[#08090e]`}>
              <option value="" disabled>Selecione</option>
              <option value="casa_propria">Casa própria</option>
              <option value="condominio_apartamento">Condomínio / apartamento</option>
              <option value="imovel_alugado">Imóvel alugado</option>
              <option value="empresa">Empresa</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-bold text-white/80">
            Prazo para contratar
            <select required value={form.qualificationData.timeline} onChange={e => updateQualification('timeline', e.target.value)} className={`${inputClass} bg-[#08090e]`}>
              <option value="" disabled>Selecione</option>
              <option value="imediato">Imediato</option>
              <option value="30_dias">Em até 30 dias</option>
              <option value="90_dias">Em até 90 dias</option>
              <option value="pesquisa">Apenas pesquisando</option>
            </select>
          </label>

          {form.interest === 'wallbox' && (
            <label className="md:col-span-2 flex flex-col gap-1 text-sm font-bold text-white/80">
              Necessidade de recarga
              <select required value={form.qualificationData.service_detail} onChange={e => updateQualification('service_detail', e.target.value)} className={`${inputClass} bg-[#08090e]`}>
                <option value="" disabled>Selecione</option>
                <option value="equipamento_instalacao">Preciso do equipamento e da instalação</option>
                <option value="somente_instalacao">Já tenho equipamento e preciso instalar</option>
                <option value="avaliacao_tecnica">Quero avaliação técnica</option>
              </select>
            </label>
          )}

          {form.interest === 'energia_solar_recarga' && (
            <label className="md:col-span-2 flex flex-col gap-1 text-sm font-bold text-white/80">
              Conta mensal de energia
              <select required value={form.qualificationData.service_detail} onChange={e => updateQualification('service_detail', e.target.value)} className={`${inputClass} bg-[#08090e]`}>
                <option value="" disabled>Selecione</option>
                <option value="ate_300">Até R$ 300</option>
                <option value="301_700">R$ 301 a R$ 700</option>
                <option value="701_1500">R$ 701 a R$ 1.500</option>
                <option value="acima_1500">Acima de R$ 1.500</option>
              </select>
            </label>
          )}

          <label className="md:col-span-2 flex flex-col gap-1 text-sm font-bold text-white/80">
            Precisa avaliar financiamento do equipamento ou projeto?
            <select required value={form.qualificationData.equipment_financing} onChange={e => updateQualification('equipment_financing', e.target.value)} className={`${inputClass} bg-[#08090e]`}>
              <option value="" disabled>Selecione</option>
              <option value="nao">Não</option>
              <option value="sim">Sim, preciso de financiamento</option>
              <option value="quero_avaliar">Quero avaliar as opções</option>
            </select>
            <span className="text-xs font-normal text-white/45">Somente para o equipamento ou projeto solar/wallbox. Não inclui financiamento de veículo.</span>
          </label>

          <label className="md:col-span-2 flex flex-col gap-1 text-sm font-bold text-white/80">
            Contexto adicional
            <textarea value={form.message} onChange={e => updateField('message', e.target.value)} className={`${inputClass} min-h-20`} placeholder="Ex: garagem coberta, rede trifásica, rodo 60 km por dia" />
          </label>

          <label className="md:col-span-2 flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-white/80">
            <input required type="checkbox" checked={form.consentAccepted} onChange={e => updateField('consentAccepted', e.target.checked)} className="mt-1 h-4 w-4 accent-[#00b4ff]" />
            <span>
              Autorizo o Guia PBEV Brasil a utilizar os dados informados para qualificar esta solicitação e, após análise, compartilhá-los com um parceiro indicado pela plataforma que atenda à minha região e ao serviço solicitado. Li a{' '}
              <a href={`${import.meta.env.BASE_URL}privacy.html`} target="_blank" rel="noopener noreferrer" className="text-[#00b4ff] underline">Política de Privacidade</a>{' '}
              e entendo que o envio não garante proposta, preço ou contratação.
            </span>
          </label>

          <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
            <p className="text-xs text-white/45 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Revisão humana antes do encaminhamento. Não compartilhamos o lead automaticamente.
            </p>
            <button disabled={submitting || submitted} type="submit" className="bg-[#00b4ff] hover:bg-[#33c9ff] disabled:opacity-60 disabled:cursor-wait text-black font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(0,180,255,0.25)] transition active:scale-[0.98]">
              {submitting ? 'Enviando...' : submitted ? 'Solicitação enviada' : 'Solicitar contato'} <Send className="w-4 h-4" />
            </button>
          </div>

          {submitted && (
            <div className="md:col-span-2 bg-emerald-400/10 border border-emerald-400/20 text-emerald-200 rounded-xl p-3 text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4" /> Solicitação #{leadId} recebida. Informaremos o parceiro indicado antes do contato e do compartilhamento dos dados.
            </div>
          )}

          {submitError && !submitted && (
            <div className="md:col-span-2 bg-amber-400/10 border border-amber-400/20 text-amber-100 rounded-xl p-3 text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4" /> Não foi possível enviar agora. Seus dados não foram armazenados neste dispositivo. Tente novamente em instantes.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
