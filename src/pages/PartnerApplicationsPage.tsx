import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PartnerApplicationFormData } from '../types';
import { submitPartnerApplication } from '../utils/partnerApplications';

const SERVICE_CATEGORIES = [
  ['financiamento', 'Financiamento'],
  ['seguro', 'Seguro EV'],
  ['wallbox', 'Wallbox / instalação'],
  ['compra_veiculo', 'Venda / cotação de veículo'],
  ['frota_b2b', 'Frota / B2B'],
  ['energia_solar_recarga', 'Energia solar / recarga'],
  ['documentacao', 'Documentação / despachante'],
] as const;

const STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const initialForm: PartnerApplicationFormData = {
  companyName: '',
  cnpj: '',
  website: '',
  contactName: '',
  contactRole: '',
  email: '',
  whatsapp: '',
  city: '',
  state: 'SP',
  serviceCategories: [],
  coverageStates: [],
  coverageCities: '',
  servesPf: false,
  servesPj: false,
  servesRemote: false,
  evExperience: '',
  brandsSupported: '',
  monthlyCapacity: '',
  slaHours: '',
  crmTool: '',
  preferredDeliveryChannel: '',
  commercialModelInterest: '',
  acceptablePriceRange: '',
  notes: '',
  lgpdAcceptance: false,
};

const inputClass = 'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder-white/35 outline-none focus:border-[#00b4ff] focus:ring-2 focus:ring-[#00b4ff]/20';
const labelClass = 'block text-sm font-bold text-white/80 mb-2';

export default function PartnerApplicationsPage() {
  const [form, setForm] = useState<PartnerApplicationFormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const updateField = <K extends keyof PartnerApplicationFormData>(field: K, value: PartnerApplicationFormData[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: 'serviceCategories' | 'coverageStates', value: string) => {
    setForm(prev => {
      const current = prev[field];
      const next = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!form.serviceCategories.length) {
      setError('Selecione pelo menos uma categoria de atuação.');
      return;
    }
    if (!form.coverageStates.length) {
      setError('Selecione pelo menos uma UF atendida.');
      return;
    }
    if (!form.lgpdAcceptance) {
      setError('É necessário aceitar as regras de LGPD e uso dos dados.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitPartnerApplication(form);
      setSubmittedId(result.application_id);
      setForm(initialForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a candidatura.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <main className="min-h-screen bg-[#05070d] text-white px-5 py-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#00b4ff]/20 bg-white/[0.04] p-8 shadow-[0_0_45px_rgba(0,180,255,0.12)]">
          <CheckCircle2 className="h-12 w-12 text-[#00b4ff] mb-4" />
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#00b4ff]">Candidatura recebida</p>
          <h1 className="text-3xl md:text-4xl font-black mt-2">Sua empresa entrou na fila de avaliação humana.</h1>
          <p className="text-white/65 mt-4 leading-relaxed">
            Recebemos a candidatura #{submittedId}. O cadastro não garante aprovação nem volume de leads. O Guia PBEV revisará categoria,
            cobertura, SLA, experiência com EVs e aderência às regras comerciais antes de ativar qualquer parceiro.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => setSubmittedId(null)} className="rounded-xl bg-[#00b4ff] px-5 py-3 font-black text-black">Enviar outra candidatura</button>
            <Link to="/" className="rounded-xl border border-white/10 px-5 py-3 font-bold text-white/80">Voltar ao Guia</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#05070d] text-white px-5 py-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4" /> Voltar ao Guia PBEV
        </Link>

        <section className="rounded-3xl border border-[#00b4ff]/20 bg-gradient-to-br from-[#07111f] via-[#070a12] to-[#002b44] p-6 md:p-8 shadow-[0_0_45px_rgba(0,180,255,0.12)] mb-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#00b4ff]">Programa de parceiros</p>
          <h1 className="text-3xl md:text-5xl font-black mt-3 leading-tight">Cadastre sua empresa para avaliação no programa de parceiros do Guia PBEV Brasil.</h1>
          <p className="text-white/65 mt-4 max-w-3xl leading-relaxed">
            Este é um formulário de candidatura para fornecedores interessados em receber oportunidades qualificadas no futuro.
            O cadastro não garante aprovação, volume, exclusividade ou envio automático de leads.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 md:p-8 space-y-8">
          <section>
            <h2 className="text-xl font-black mb-4">Dados da empresa</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <label><span className={labelClass}>Nome da empresa *</span><input required className={inputClass} value={form.companyName} onChange={e => updateField('companyName', e.target.value)} /></label>
              <label><span className={labelClass}>CNPJ</span><input className={inputClass} value={form.cnpj} onChange={e => updateField('cnpj', e.target.value)} /></label>
              <label><span className={labelClass}>Site</span><input className={inputClass} value={form.website} onChange={e => updateField('website', e.target.value)} placeholder="https://" /></label>
              <label><span className={labelClass}>Nome do responsável *</span><input required className={inputClass} value={form.contactName} onChange={e => updateField('contactName', e.target.value)} /></label>
              <label><span className={labelClass}>Cargo</span><input className={inputClass} value={form.contactRole} onChange={e => updateField('contactRole', e.target.value)} /></label>
              <label><span className={labelClass}>Email profissional *</span><input required type="email" className={inputClass} value={form.email} onChange={e => updateField('email', e.target.value)} /></label>
              <label><span className={labelClass}>WhatsApp comercial *</span><input required className={inputClass} value={form.whatsapp} onChange={e => updateField('whatsapp', e.target.value)} /></label>
              <label><span className={labelClass}>Cidade sede *</span><input required className={inputClass} value={form.city} onChange={e => updateField('city', e.target.value)} /></label>
              <label>
                <span className={labelClass}>UF sede *</span>
                <select required className={inputClass} value={form.state} onChange={e => updateField('state', e.target.value)}>
                  {STATES.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </label>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black mb-4">Categoria e cobertura</h2>
            <fieldset className="grid md:grid-cols-2 gap-3 mb-5">
              <legend className="sr-only">Categorias de atuação</legend>
              {SERVICE_CATEGORIES.map(([value, label]) => (
                <label key={value} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm font-bold">
                  <input type="checkbox" checked={form.serviceCategories.includes(value)} onChange={() => toggleArrayValue('serviceCategories', value)} />
                  {label}
                </label>
              ))}
            </fieldset>
            <div className="grid md:grid-cols-2 gap-4">
              <label>
                <span className={labelClass}>UFs atendidas *</span>
                <select multiple required className={`${inputClass} min-h-36`} value={form.coverageStates} onChange={e => updateField('coverageStates', Array.from(e.target.selectedOptions, opt => opt.value))}>
                  {STATES.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </label>
              <label><span className={labelClass}>Cidades prioritárias</span><textarea className={`${inputClass} min-h-36`} value={form.coverageCities} onChange={e => updateField('coverageCities', e.target.value)} /></label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.servesPf} onChange={e => updateField('servesPf', e.target.checked)} /> Atende pessoa física</label>
              <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.servesPj} onChange={e => updateField('servesPj', e.target.checked)} /> Atende CNPJ/frota</label>
              <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.servesRemote} onChange={e => updateField('servesRemote', e.target.checked)} /> Atende remoto</label>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black mb-4">Operação e modelo comercial</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <label><span className={labelClass}>Experiência com veículos elétricos</span><textarea className={`${inputClass} min-h-28`} value={form.evExperience} onChange={e => updateField('evExperience', e.target.value)} /></label>
              <label><span className={labelClass}>Marcas/modelos que costuma atender</span><textarea className={`${inputClass} min-h-28`} value={form.brandsSupported} onChange={e => updateField('brandsSupported', e.target.value)} /></label>
              <label><span className={labelClass}>Capacidade mensal</span><input className={inputClass} value={form.monthlyCapacity} onChange={e => updateField('monthlyCapacity', e.target.value)} /></label>
              <label>
                <span className={labelClass}>SLA de primeiro contato</span>
                <select className={inputClass} value={form.slaHours} onChange={e => updateField('slaHours', e.target.value)}>
                  <option value="">Selecione</option><option value="2">Até 2h úteis</option><option value="4">Até 4h úteis</option><option value="24">Até 24h úteis</option><option value="48">Até 48h úteis</option>
                </select>
              </label>
              <label><span className={labelClass}>CRM usado</span><input className={inputClass} value={form.crmTool} onChange={e => updateField('crmTool', e.target.value)} /></label>
              <label>
                <span className={labelClass}>Canal preferido</span>
                <select className={inputClass} value={form.preferredDeliveryChannel} onChange={e => updateField('preferredDeliveryChannel', e.target.value)}>
                  <option value="">Selecione</option><option value="email">Email</option><option value="whatsapp">WhatsApp</option><option value="api">API</option><option value="crm">CRM/planilha</option>
                </select>
              </label>
              <label>
                <span className={labelClass}>Modelo comercial</span>
                <select className={inputClass} value={form.commercialModelInterest} onChange={e => updateField('commercialModelInterest', e.target.value)}>
                  <option value="">Selecione</option><option value="piloto">Piloto inicial</option><option value="pagamento_por_lead">Pagamento por lead qualificado</option><option value="mensalidade">Mensalidade com leads inclusos</option><option value="entender">Ainda quero entender</option>
                </select>
              </label>
              <label>
                <span className={labelClass}>Faixa viável por lead</span>
                <select className={inputClass} value={form.acceptablePriceRange} onChange={e => updateField('acceptablePriceRange', e.target.value)}>
                  <option value="">Selecione</option><option>até R$ 30</option><option>R$ 31–R$ 80</option><option>R$ 81–R$ 150</option><option>R$ 151–R$ 300</option><option>acima de R$ 300</option><option>depende da categoria</option>
                </select>
              </label>
            </div>
            <label className="block mt-4"><span className={labelClass}>Observações</span><textarea className={`${inputClass} min-h-28`} value={form.notes} onChange={e => updateField('notes', e.target.value)} /></label>
          </section>

          <section className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <label className="flex gap-3 text-sm leading-relaxed text-white/80">
              <input required type="checkbox" checked={form.lgpdAcceptance} onChange={e => updateField('lgpdAcceptance', e.target.checked)} className="mt-1" />
              <span>Aceito respeitar LGPD, usar dados recebidos apenas para o interesse informado pelo usuário e entendo que o cadastro será avaliado antes de qualquer envio de leads.</span>
            </label>
          </section>

          {error && <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}

          <button disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-[#00b4ff] px-6 py-3 font-black text-black disabled:opacity-60">
            <Send className="h-4 w-4" /> {submitting ? 'Enviando...' : 'Enviar candidatura'}
          </button>
        </form>
      </div>
    </main>
  );
}
