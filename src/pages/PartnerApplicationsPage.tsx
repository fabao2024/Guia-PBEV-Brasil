import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Building2, CheckCircle2, Handshake, Send, ShieldCheck, Target } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { PartnerApplicationFormData } from '../types';
import { track } from '../utils/analytics';
import { attributionEventProps, getFirstTouchAttribution } from '../utils/attribution';
import { submitPartnerApplication } from '../utils/partnerApplications';

const SERVICE_CATEGORIES = [
  ['wallbox', 'Wallbox / instalação'],
  ['energia_solar_recarga', 'Energia solar / recarga'],
  ['limpeza_sistema_solar', 'Limpeza de sistema de placa solar'],
] as const;

const STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const PILOT_CONTRACT = {
  termsVersion: '2026-08-14-pilot-one-lead-v2',
  freePilotLeadLimit: 1,
} as const;

function createInitialForm(): PartnerApplicationFormData {
  return {
    companyName: '', cnpj: '', website: '', contactName: '', contactRole: '', email: '', whatsapp: '',
    city: '', state: 'SP', serviceCategories: [], coverageStates: ['SP'], coverageCities: '',
    servesPf: false, servesPj: false, servesRemote: false, evExperience: '', brandsSupported: '',
    monthlyCapacity: '', slaHours: '', crmTool: '', preferredDeliveryChannel: '',
    commercialModelInterest: '', acceptablePriceRange: '', leadPriceByModality: {}, matchCodes: [],
    notes: '', lgpdAcceptance: false, termsVersion: PILOT_CONTRACT.termsVersion,
    freePilotLeadLimit: PILOT_CONTRACT.freePilotLeadLimit,
  };
}

const inputClass = 'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder-white/35 outline-none focus:border-[#00b4ff] focus:ring-2 focus:ring-[#00b4ff]/20';
const labelClass = 'block text-sm font-bold text-white/80 mb-2';
const cardClass = 'rounded-3xl border border-white/10 bg-white/[0.035] p-5 md:p-6 shadow-[0_0_35px_rgba(0,180,255,0.08)]';

function PartnerPageHead() {
  const title = 'Programa de Parceiros | Guia PBEV Brasil';
  const description = 'Receba oportunidades qualificadas por serviço, região e momento de decisão no piloto Guia PBEV de wallbox, energia solar e limpeza de placas em São Paulo.';
  const canonicalUrl = 'https://guiapbev.cloud/parceiros/';
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}

function deriveMatchCodes(form: PartnerApplicationFormData): string[] {
  const codes = new Set<string>(['uf_exact']);
  if (form.servesPf) codes.add('serves_pf');
  if (form.servesPj) codes.add('serves_pj_fleet');
  if (form.serviceCategories.includes('wallbox')) codes.add('home_charging');
  if (form.serviceCategories.includes('energia_solar_recarga')) codes.add('solar_cross_sell');
  if (form.serviceCategories.includes('limpeza_sistema_solar')) codes.add('solar_cleaning');
  if (form.serviceCategories.includes('seguro')) codes.add('insurance_ev');
  if (form.serviceCategories.includes('financiamento')) codes.add('financing_ev');
  if (form.serviceCategories.includes('compra_veiculo')) codes.add('dealer_quote');
  if (form.serviceCategories.includes('frota_b2b')) codes.add('commercial_fleet');
  return Array.from(codes);
}

export default function PartnerApplicationsPage() {
  const [form, setForm] = useState<PartnerApplicationFormData>(createInitialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const formStartedRef = useRef(false);
  const attribution = getFirstTouchAttribution();
  const campaignProps = attributionEventProps(attribution);

  useEffect(() => {
    track('partner_page_view', campaignProps);
    // First-touch attribution is immutable for this browser session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markFormStarted = () => {
    if (formStartedRef.current) return;
    formStartedRef.current = true;
    track('partner_form_start', campaignProps);
  };

  const updateField = <K extends keyof PartnerApplicationFormData>(field: K, value: PartnerApplicationFormData[K]) => {
    markFormStarted();
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (value: string) => {
    markFormStarted();
    setForm(prev => ({
      ...prev,
      serviceCategories: prev.serviceCategories.includes(value)
        ? prev.serviceCategories.filter(item => item !== value)
        : [...prev.serviceCategories, value],
    }));
  };

  const rejectForm = (reason: string, message: string) => {
    setError(message);
    track('partner_form_validation_error', { ...campaignProps, reason });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!form.serviceCategories.length) return rejectForm('missing_category', 'Selecione pelo menos uma categoria de atuação.');
    if (!form.servesPf && !form.servesPj) return rejectForm('missing_audience', 'Informe se atende pessoa física, CNPJ/frota ou ambos.');
    if (!form.lgpdAcceptance) return rejectForm('missing_consent', 'É necessário aceitar as regras de LGPD e uso dos dados.');

    const submission: PartnerApplicationFormData = {
      ...form,
      coverageStates: [form.state],
      commercialModelInterest: 'piloto_gratuito_com_cpl_futuro',
      acceptablePriceRange: 'Piloto gratuito; CPL futuro conforme modalidade',
      leadPriceByModality: {
        wallbox: 'PF R$ 100; PJ R$ 150 por lead aceito após o piloto',
        energia_solar_recarga: 'PF/PJ R$ 250 por lead aceito após o piloto',
        limpeza_sistema_solar: 'PF/PJ R$ 35 por lead aceito após o piloto',
      },
      termsVersion: PILOT_CONTRACT.termsVersion,
      freePilotLeadLimit: PILOT_CONTRACT.freePilotLeadLimit,
      matchCodes: deriveMatchCodes(form),
    };
    const conversionProps = { ...campaignProps, category_count: submission.serviceCategories.length, state: submission.state };
    track('partner_submit_attempt', conversionProps);
    setSubmitting(true);
    try {
      const result = await submitPartnerApplication(submission);
      track('partner_submit_success', conversionProps);
      setSubmittedId(result.application_id);
      setForm(createInitialForm());
    } catch (err) {
      track('partner_submit_error', { ...conversionProps, reason: 'api_error' });
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a candidatura.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <main className="min-h-screen bg-[#05070d] text-white px-5 py-8">
        <PartnerPageHead />
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#00b4ff]/20 bg-white/[0.04] p-8">
          <CheckCircle2 className="h-12 w-12 text-[#00b4ff] mb-4" />
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#00b4ff]">Candidatura recebida</p>
          <h1 className="text-3xl md:text-4xl font-black mt-2">Sua empresa entrou na avaliação humana.</h1>
          <p className="text-white/65 mt-4">Candidatura #{submittedId}. Agora validaremos cobertura, operação e aderência ao piloto gratuito. O cadastro não garante aprovação nem volume de leads.</p>
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
      <PartnerPageHead />
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white mb-6"><ArrowLeft className="h-4 w-4" /> Voltar ao Guia PBEV</Link>

        <section className="relative overflow-hidden rounded-[2rem] border border-[#00b4ff]/20 bg-gradient-to-br from-[#07111f] via-[#070a12] to-[#002b44] p-6 md:p-10 mb-8">
          <div className="relative max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#00b4ff]">Programa de parceiros</p>
            <h1 className="text-4xl md:text-6xl font-black mt-3 leading-[0.96]">Receba oportunidades qualificadas por serviço, região e momento de decisão.</h1>
            <p className="text-white/75 mt-5 max-w-3xl text-lg leading-relaxed">O Guia atrai a demanda e organiza a qualificação antes do primeiro contato. As oportunidades surgem de consumidores que pesquisam veículos, calculam TCO e avaliam infraestrutura de recarga. O piloto gratuito, sujeito à cobertura operacional, é limitado a 1 lead qualificado e aceito por parceiro, sem custo, conforme disponibilidade.</p>
            <p className="mt-4 max-w-3xl text-sm font-bold text-[#37f29b]">Aquisição apoiada pelo catálogo de BEVs homologados, comparador e simuladores de TCO, economia e recarga do Guia PBEV.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#formulario-parceiro" onClick={() => track('partner_cta_click', { ...campaignProps, placement: 'hero' })} className="rounded-xl bg-[#00b4ff] px-5 py-3 font-black text-black">Quero testar o piloto gratuito</a>
              <a href="#como-funciona" className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white/85">Ver como funciona</a>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><strong className="text-2xl text-[#37f29b]">Guia</strong><p className="mt-1 text-sm text-white/60">catálogo, comparador e simuladores</p></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><strong className="text-2xl text-[#37f29b]">1</strong><p className="mt-1 text-sm text-white/60">lead qualificado e aceito sem custo</p></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><strong className="text-2xl text-[#37f29b]">0</strong><p className="mt-1 text-sm text-white/60">lead enviado sem revisão humana</p></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><strong className="text-2xl text-[#37f29b]">LGPD</strong><p className="mt-1 text-sm text-white/60">uso limitado ao interesse informado</p></div>
            </div>
          </div>
        </section>

        <section className={`${cardClass} mb-8`} aria-labelledby="qualificacao-antes-do-contato">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00b4ff]">Lead com contexto</p>
            <h2 id="qualificacao-antes-do-contato" className="mt-2 text-3xl font-black">O que chega antes do primeiro contato</h2>
            <p className="mt-3 text-white/65">O parceiro entra para atender a oportunidade, sem montar campanha, formulário e triagem do zero.</p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <Target className="h-6 w-6 text-[#37f29b]" />
              <h3 className="mt-3 font-black">Contexto de intenção</h3>
              <p className="mt-2 text-sm text-white/60">A demanda nasce no catálogo, comparador, simuladores e conteúdos sobre mobilidade elétrica.</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <Handshake className="h-6 w-6 text-[#00b4ff]" />
              <h3 className="mt-3 font-black">Qualificação útil</h3>
              <p className="mt-2 text-sm text-white/60">Serviço, cidade, perfil, imóvel, prazo e preferência de contato acompanham a oportunidade.</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <ShieldCheck className="h-6 w-6 text-[#37f29b]" />
              <h3 className="mt-3 font-black">Handoff governado</h3>
              <p className="mt-2 text-sm text-white/60">Consentimento, aderência à cobertura e revisão humana vêm antes da liberação dos dados.</p>
            </article>
          </div>
        </section>

        <form id="formulario-parceiro" aria-label="Candidatura de parceiro" onSubmit={handleSubmit} className="rounded-3xl border border-[#00b4ff]/20 bg-white/[0.045] p-5 md:p-8 space-y-6 scroll-mt-8 mb-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00b4ff]">Candidatura inicial</p>
            <h2 className="mt-2 text-3xl font-black">Informe somente o essencial</h2>
            <p className="mt-2 text-white/60">O cadastro leva cerca de 2 minutos. SLA, capacidade, cidades e termos operacionais serão validados depois com revisão humana.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <label><span className={labelClass}>Nome da empresa *</span><input required className={inputClass} value={form.companyName} onChange={e => updateField('companyName', e.target.value)} /></label>
            <label><span className={labelClass}>Nome do responsável *</span><input required className={inputClass} value={form.contactName} onChange={e => updateField('contactName', e.target.value)} /></label>
            <label><span className={labelClass}>Email profissional *</span><input required type="email" className={inputClass} value={form.email} onChange={e => updateField('email', e.target.value)} /></label>
            <label><span className={labelClass}>WhatsApp comercial *</span><input required inputMode="tel" className={inputClass} value={form.whatsapp} onChange={e => updateField('whatsapp', e.target.value)} /></label>
            <label><span className={labelClass}>Cidade sede *</span><input required className={inputClass} value={form.city} onChange={e => updateField('city', e.target.value)} /></label>
            <label><span className={labelClass}>UF principal *</span><select required className={inputClass} value={form.state} onChange={e => updateField('state', e.target.value)}>{STATES.map(uf => <option key={uf} value={uf}>{uf}</option>)}</select></label>
          </div>

          <fieldset>
            <legend className="text-xl font-black mb-3">Categoria de atuação *</legend>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{SERVICE_CATEGORIES.map(([value, label]) => <label key={value} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm font-bold"><input type="checkbox" checked={form.serviceCategories.includes(value)} onChange={() => toggleCategory(value)} />{label}</label>)}</div>
          </fieldset>

          <fieldset>
            <legend className="text-xl font-black mb-3">Quem sua empresa atende? *</legend>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.servesPf} onChange={e => updateField('servesPf', e.target.checked)} /> Atende pessoa física</label>
              <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.servesPj} onChange={e => updateField('servesPj', e.target.checked)} /> Atende CNPJ/frota</label>
            </div>
          </fieldset>

          <details className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
            <summary className="cursor-pointer font-black text-white">Termos comerciais e uso dos dados</summary>
            <p className="mt-3 leading-relaxed">O piloto é limitado a 1 lead qualificado e aceito, sem custo. A eventual continuidade usa os preços informados nesta página e exige nova proposta, contrato, estrutura jurídica e fiscal adequadas, forma de pagamento e concordância formal. Nenhum lead adicional será encaminhado antes dessa formalização. Dados recebidos devem ser usados somente para o interesse consentido, conforme a LGPD.</p>
          </details>
          <label className="flex gap-3 rounded-2xl border border-[#00b4ff]/20 bg-[#00b4ff]/5 p-4 text-sm leading-relaxed text-white/85"><input required type="checkbox" checked={form.lgpdAcceptance} onChange={e => updateField('lgpdAcceptance', e.target.checked)} className="mt-1" /><span>Aceito os termos do piloto gratuito e as regras de uso dos dados descritas acima.</span></label>
          {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
          <button disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-[#00b4ff] px-6 py-3 font-black text-black disabled:opacity-60"><Send className="h-4 w-4" /> {submitting ? 'Enviando...' : 'Enviar candidatura'}</button>
        </form>

        <section className={`${cardClass} mb-8`} aria-labelledby="precos-pos-piloto">
          <div className="flex items-center gap-3"><Handshake className="h-7 w-7 text-[#37f29b]" /><h2 id="precos-pos-piloto" className="text-2xl font-black">Condições previstas após o piloto</h2></div>
          <p className="mt-3 text-white/65">O primeiro lead qualificado e aceito não tem custo. Os valores abaixo só passam a valer após nova proposta, contrato, definição de estrutura jurídica e fiscal adequadas, forma de pagamento e concordância formal.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><strong className="text-white">Wallbox PF · R$ 100</strong><p className="mt-1 text-sm text-white/55">por lead qualificado e aceito após o piloto</p></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><strong className="text-white">Wallbox PJ · R$ 150</strong><p className="mt-1 text-sm text-white/55">por lead qualificado e aceito após o piloto</p></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><strong className="text-white">Energia solar PF/PJ · R$ 250</strong><p className="mt-1 text-sm text-white/55">por lead qualificado e aceito após o piloto</p></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><strong className="text-white">Limpeza de sistema solar PF/PJ · R$ 35</strong><p className="mt-1 text-sm text-white/55">por lead qualificado e aceito após o piloto</p></div>
          </div>
          <p className="mt-4 text-sm font-bold text-[#37f29b]">Nenhum lead adicional será encaminhado antes da formalização da continuidade.</p>
        </section>

        <section id="como-funciona" className="grid gap-5 lg:grid-cols-3 mb-8 scroll-mt-8">
          <article className={cardClass}><Handshake className="h-7 w-7 text-[#00b4ff] mb-3" /><h2 className="text-2xl font-black">Como funciona</h2><p className="mt-3 text-white/65">A candidatura passa por revisão humana. Os detalhes operacionais são confirmados antes da homologação e cada oportunidade tem trilha de auditoria.</p></article>
          <article className={cardClass}><Target className="h-7 w-7 text-[#37f29b] mb-3" /><h2 className="text-2xl font-black">Oferta controlada</h2><p className="mt-3 text-white/65">O parceiro recebe somente modalidades e regiões aprovadas. Não há promessa de volume antes de medir demanda real.</p></article>
          <article className={cardClass}><ShieldCheck className="h-7 w-7 text-[#00b4ff] mb-3" /><h2 className="text-2xl font-black">Dados protegidos</h2><p className="mt-3 text-white/65">Nenhum contato é compartilhado sem consentimento, qualificação e revisão. Leads inválidos, duplicados ou fora da cobertura podem ser recusados e não contam no limite.</p></article>
        </section>

        <section className={`${cardClass} mb-8`}>
          <div className="flex items-center gap-3"><Building2 className="h-7 w-7 text-[#00b4ff]" /><h2 className="text-2xl font-black">Categorias em formação</h2></div>
          <p className="mt-3 text-white/65">Wallbox e energia solar participam do piloto gratuito em SP. O cadastro também está aberto para limpeza de sistemas solares, com encaminhamento sujeito à cobertura operacional. Seguro EV, financiamento, compra de veículos, frotas e documentação permanecem em formação. A operação começa manual, limitada a 1 lead qualificado e aceito por parceiro, sem custo e sem promessa de volume ou conversão.</p>
        </section>
      </div>
    </main>
  );
}
