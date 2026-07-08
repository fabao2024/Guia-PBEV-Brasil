import React, { useEffect, useMemo, useState } from 'react';
import { Mail, Send, X, Zap } from 'lucide-react';
import { Car, LeadFormData, LeadInterest } from '../types';
import { track } from '../utils/analytics';
import { submitLead } from '../utils/leads';

interface LeadCaptureModalProps {
  isOpen: boolean;
  selectedCar: Car | null;
  source: string;
  onClose: () => void;
}

const INTEREST_OPTIONS: { value: LeadInterest; label: string }[] = [
  { value: 'compra', label: 'Comprar / receber proposta' },
  { value: 'seguro', label: 'Cotação de seguro EV' },
  { value: 'wallbox', label: 'Wallbox / instalação de recarga' },
  { value: 'financiamento', label: 'Financiamento' },
  { value: 'frota', label: 'Frota / empresa' },
  { value: 'duvida', label: 'Dúvida técnica' },
];

const INITIAL_FORM: LeadFormData = {
  name: '',
  whatsapp: '',
  city: '',
  budget: '',
  interest: 'compra',
  vehicleModel: '',
  vehicleBrand: '',
  message: '',
};

function persistLead(lead: LeadFormData & { source: string; createdAt: string }) {
  const key = 'pbev_leads_pending';
  try {
    const current = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([lead, ...current].slice(0, 25)));
  } catch {
    localStorage.setItem(key, JSON.stringify([lead]));
  }
}

export default function LeadCaptureModal({ isOpen, selectedCar, source, onClose }: LeadCaptureModalProps) {
  const [form, setForm] = useState<LeadFormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leadId, setLeadId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const vehicleLabel = selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : 'ainda não definido';

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
    setForm(prev => ({
      ...prev,
      vehicleBrand: selectedCar?.brand || '',
      vehicleModel: selectedCar?.model || '',
    }));
  }, [isOpen, selectedCar]);

  const hydratedForm = useMemo<LeadFormData>(() => ({
    ...form,
    vehicleBrand: selectedCar?.brand || form.vehicleBrand,
    vehicleModel: selectedCar?.model || form.vehicleModel,
  }), [form, selectedCar]);

  if (!isOpen) return null;

  const updateField = (field: keyof LeadFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const buildMailtoFallback = (lead: LeadFormData & { source: string; createdAt: string }) => {
    const subject = `Lead Guia PBEV - ${vehicleLabel}`;
    const body = [
      'Novo lead vindo do Guia PBEV Brasil',
      '',
      `Nome: ${lead.name}`,
      `WhatsApp: ${lead.whatsapp}`,
      `Cidade/UF: ${lead.city || 'Não informado'}`,
      `Interesse: ${lead.interest}`,
      `Orçamento: ${lead.budget || 'Não informado'}`,
      `Veículo: ${vehicleLabel}`,
      `Origem: ${source}`,
      '',
      `Mensagem: ${lead.message || 'Não informado'}`,
    ].join('\n');

    return `mailto:fabio.pettian@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const lead = {
      ...hydratedForm,
      source,
      createdAt: new Date().toISOString(),
    };

    persistLead(lead);
    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitLead(hydratedForm, source);
      setLeadId(result.lead_id);
      setSubmitted(true);
      track('lead_submit', {
        source,
        interest: lead.interest,
        vehicle: vehicleLabel,
        has_budget: Boolean(lead.budget),
        has_city: Boolean(lead.city),
      });
      track('lead_success', {
        source,
        interest: lead.interest,
        vehicle: vehicleLabel,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao enviar lead';
      setSubmitError(message);
      track('lead_error', {
        source,
        interest: lead.interest,
        vehicle: vehicleLabel,
      });
      window.location.href = buildMailtoFallback(lead);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-normal text-white placeholder:text-white/35 focus:ring-2 focus:ring-[#00b4ff] focus:border-[#00b4ff]/60 outline-none transition';

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#00b4ff]/20 bg-[#08090e] shadow-[0_0_80px_rgba(0,180,255,0.18)]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(0,180,255,0.22),transparent_45%)]" />
        <div className="relative border-b border-white/10 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#00b4ff] mb-2">Guia PBEV Brasil</p>
          <h2 className="text-2xl md:text-3xl font-black leading-tight">Receba ajuda para escolher seu elétrico</h2>
          <p className="mt-2 text-sm text-white/65">Modelo de interesse: <strong className="text-white">{vehicleLabel}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="relative p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
          <label className="flex flex-col gap-1 text-sm font-bold text-white/80">
            Nome
            <input required value={form.name} onChange={e => updateField('name', e.target.value)} className={inputClass} placeholder="Seu nome" />
          </label>

          <label className="flex flex-col gap-1 text-sm font-bold text-white/80">
            WhatsApp
            <input required value={form.whatsapp} onChange={e => updateField('whatsapp', e.target.value)} className={inputClass} placeholder="(11) 99999-9999" />
          </label>

          <label className="flex flex-col gap-1 text-sm font-bold text-white/80">
            Cidade/UF
            <input value={form.city} onChange={e => updateField('city', e.target.value)} className={inputClass} placeholder="Jundiaí/SP" />
          </label>

          <label className="flex flex-col gap-1 text-sm font-bold text-white/80">
            Orçamento aproximado
            <input value={form.budget} onChange={e => updateField('budget', e.target.value)} className={inputClass} placeholder="Ex: até R$ 180 mil" />
          </label>

          <label className="md:col-span-2 flex flex-col gap-1 text-sm font-bold text-white/80">
            Interesse principal
            <select value={form.interest} onChange={e => updateField('interest', e.target.value)} className={`${inputClass} bg-[#08090e]`}>
              {INTEREST_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>

          <label className="md:col-span-2 flex flex-col gap-1 text-sm font-bold text-white/80">
            Mensagem opcional
            <textarea value={form.message} onChange={e => updateField('message', e.target.value)} className={`${inputClass} min-h-24`} placeholder="Ex: tenho garagem, rodo 60 km/dia e quero comparar Dolphin Mini vs EX2" />
          </label>

          <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
            <p className="text-xs text-white/45 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Envia direto para a base do Guia PBEV. Se falhar, abrimos e-mail como fallback.
            </p>
            <button disabled={submitting} type="submit" className="bg-[#00b4ff] hover:bg-[#33c9ff] disabled:opacity-60 disabled:cursor-wait text-black font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(0,180,255,0.25)] transition active:scale-[0.98]">
              {submitting ? 'Enviando...' : 'Enviar interesse'} <Send className="w-4 h-4" />
            </button>
          </div>

          {submitted && (
            <div className="md:col-span-2 bg-emerald-400/10 border border-emerald-400/20 text-emerald-200 rounded-xl p-3 text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4" /> Lead registrado na base do Guia PBEV{leadId ? ` (#${leadId})` : ''}. Em breve entraremos em contato.
            </div>
          )}

          {submitError && !submitted && (
            <div className="md:col-span-2 bg-amber-400/10 border border-amber-400/20 text-amber-100 rounded-xl p-3 text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4" /> Não consegui salvar na base agora. Abrimos um e-mail como fallback.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
