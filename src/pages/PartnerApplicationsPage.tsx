import React, { useState } from 'react';
import { ArrowLeft, Building2, CheckCircle2, ClipboardCheck, Handshake, Send, ShieldCheck, Target, Timer, Users } from 'lucide-react';
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
  leadPriceByModality: {},
  matchCodes: [],
  notes: '',
  lgpdAcceptance: false,
};

const inputClass = 'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder-white/35 outline-none focus:border-[#00b4ff] focus:ring-2 focus:ring-[#00b4ff]/20';
const labelClass = 'block text-sm font-bold text-white/80 mb-2';
const cardClass = 'rounded-3xl border border-white/10 bg-white/[0.035] p-5 md:p-6 shadow-[0_0_35px_rgba(0,180,255,0.08)]';

const steps = [
  ['1', 'Sua empresa se candidata', 'Você informa contato, categoria, cobertura e faixa comercial.'],
  ['2', 'O Guia PBEV revisa', 'A avaliação é humana. Verificamos aderência, LGPD, cobertura e qualidade de atendimento.'],
  ['3', 'Parceiros aprovados entram no piloto', 'Só fornecedores aprovados poderão receber oportunidades qualificadas quando o funil de consumidores for religado.'],
  ['4', 'Leads são atribuídos com controle', 'Cada lead terá status, parceiro responsável, SLA e trilha de auditoria antes de virar cobrança.'],
] as const;

const approvalCriteria = [
  'Atendimento real em veículos elétricos ou infraestrutura de recarga.',
  'Cobertura geográfica objetiva por UF/cidade.',
  'SLA de primeiro contato compatível com lead qualificado.',
  'WhatsApp, email comercial e responsável operacional claros.',
  'Aceite LGPD e uso dos dados apenas para o interesse informado pelo consumidor.',
  'Modelo comercial compatível com piloto manual e CPL por lead qualificado.',
];

const categoryCards = [
  ['Seguro EV', 'Corretoras e seguradoras com produto aderente a elétricos.'],
  ['Wallbox / recarga', 'Instaladores, energia solar, recarga residencial e empresarial.'],
  ['Financiamento', 'Crédito, consórcio e instituições com oferta para EVs.'],
  ['Compra / frota', 'Concessionárias, locadoras, frotas e atendimento B2B.'],
] as const;

const ecosystemAssets = [
  ['Catálogo curado de EVs', 'Modelos BEV disponíveis no Brasil com preço, autonomia, categoria e dados técnicos para comparação.'],
  ['Simulador de custo total de propriedade', 'Usuários avaliam economia, custo mensal, combustível, energia e viabilidade antes de decidir.'],
  ['Pontos de recarga e contexto de uso', 'O Guia ajuda o interessado a entender recarga, autonomia, infraestrutura e rotina real de uso.'],
  ['Conteúdo educativo no Instagram', 'Posts, comparativos, dicas e interações por comentários/DMs ampliam descoberta e intenção.'],
  ['Consultor IA dentro da plataforma', 'O agente orienta escolha, TCO, comparações e redireciona parceiro ou lead sem misturar fluxos.'],
  ['Curadoria antes do encaminhamento', 'O usuário não chega frio: chega pesquisando, comparando e sinalizando uma necessidade prática.'],
] as const;

function deriveMatchCodes(form: PartnerApplicationFormData): string[] {
  const codes = new Set<string>();
  if (form.coverageStates.length) codes.add('uf_exact');
  if (form.coverageCities.trim()) codes.add('city_priority');
  if (form.servesPf) codes.add('serves_pf');
  if (form.servesPj) codes.add('serves_pj_fleet');
  if (form.servesRemote) codes.add('remote_ok');
  if (form.serviceCategories.includes('wallbox')) codes.add('home_charging');
  if (form.serviceCategories.includes('energia_solar_recarga')) codes.add('solar_cross_sell');
  if (form.serviceCategories.includes('seguro')) codes.add('insurance_ev');
  if (form.serviceCategories.includes('financiamento')) codes.add('financing_ev');
  if (form.serviceCategories.includes('compra_veiculo')) codes.add('dealer_quote');
  if (form.serviceCategories.includes('frota_b2b')) codes.add('commercial_fleet');
  if (form.slaHours === '2' || form.slaHours === '4') codes.add('fast_sla_4h');
  return Array.from(codes);
}

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
      const result = await submitPartnerApplication({
        ...form,
        leadPriceByModality: {},
        matchCodes: deriveMatchCodes(form),
      });
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
            cobertura, SLA e aderência às regras comerciais antes de ativar qualquer parceiro.
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
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4" /> Voltar ao Guia PBEV
        </Link>

        <section className="relative overflow-hidden rounded-[2rem] border border-[#00b4ff]/20 bg-gradient-to-br from-[#07111f] via-[#070a12] to-[#002b44] p-6 md:p-10 shadow-[0_0_55px_rgba(0,180,255,0.16)] mb-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#00b4ff]/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-[#37f29b]/10 blur-3xl" />
          <div className="relative max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#00b4ff]">Programa de parceiros</p>
            <h1 className="text-4xl md:text-6xl font-black mt-3 leading-[0.96]">Programa de parceiros: receba oportunidades qualificadas do ecossistema de veículos elétricos.</h1>
            <p className="text-white/70 mt-5 max-w-3xl text-lg leading-relaxed">
              O Guia PBEV Brasil está estruturando uma rede de fornecedores para seguro, wallbox, financiamento, compra e frota.
              O cadastro é simples e passa por revisão humana antes de qualquer envio de leads.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#formulario-parceiro" className="rounded-xl bg-[#00b4ff] px-5 py-3 font-black text-black">Preencher candidatura</a>
              <a href="#como-funciona" className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white/85">Ver como funciona</a>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><strong className="text-2xl text-[#37f29b]">0</strong><p className="mt-1 text-sm text-white/60">lead enviado sem revisão humana</p></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><strong className="text-2xl text-[#37f29b]">CPL</strong><p className="mt-1 text-sm text-white/60">modelo inicial por lead qualificado</p></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><strong className="text-2xl text-[#37f29b]">LGPD</strong><p className="mt-1 text-sm text-white/60">uso limitado ao interesse do consumidor</p></div>
            </div>
          </div>
        </section>

        <section className={`${cardClass} mb-8`}>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00b4ff]">Ecossistema de decisão</p>
          <h2 className="mt-2 text-2xl md:text-3xl font-black">O que é o Guia PBEV Brasil</h2>
          <p className="mt-3 max-w-4xl text-white/68 leading-relaxed">
            O Guia PBEV Brasil combina site, catálogo, simuladores, conteúdo no Instagram e atendimento por IA para ajudar pessoas e empresas
            a pesquisar veículos elétricos antes de buscar produtos e serviços complementares. O usuário não chega frio: chega em contexto de
            decisão sobre compra, recarga, seguro, financiamento, TCO e operação.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ecosystemAssets.map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="font-black text-white">{title}</h3>
                <p className="mt-2 text-sm text-white/62 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4 mb-8">
          {categoryCards.map(([title, description]) => (
            <article key={title} className={cardClass}>
              <Building2 className="h-6 w-6 text-[#00b4ff] mb-3" />
              <h2 className="text-lg font-black">{title}</h2>
              <p className="mt-2 text-sm text-white/62 leading-relaxed">{description}</p>
            </article>
          ))}
        </section>

        <section id="como-funciona" className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] mb-8">
          <div className={cardClass}>
            <div className="flex items-center gap-3 mb-5">
              <Handshake className="h-7 w-7 text-[#00b4ff]" />
              <h2 className="text-2xl md:text-3xl font-black">Como funciona</h2>
            </div>
            <div className="grid gap-4">
              {steps.map(([number, title, description]) => (
                <div key={number} className="flex gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#00b4ff] font-black text-black">{number}</div>
                  <div>
                    <h3 className="font-black">{title}</h3>
                    <p className="mt-1 text-sm text-white/62 leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <section className={cardClass}>
              <div className="flex items-center gap-3 mb-4">
                <ClipboardCheck className="h-7 w-7 text-[#37f29b]" />
                <h2 className="text-2xl font-black">Critérios de aprovação</h2>
              </div>
              <ul className="space-y-3 text-sm text-white/70">
                {approvalCriteria.map(item => <li key={item} className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#37f29b]" /> {item}</li>)}
              </ul>
            </section>

            <section className={cardClass}>
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-7 w-7 text-[#00b4ff]" />
                <h2 className="text-2xl font-black">Modelo comercial inicial</h2>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                Começamos com <strong className="text-white">piloto manual</strong>, validação de qualidade e CPL por lead qualificado. Sem exclusividade automática,
                sem cobrança por lead inválido e sem promessa de volume antes de medir demanda real.
              </p>
            </section>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3 mb-8">
          <div className={cardClass}><Timer className="h-7 w-7 text-[#00b4ff] mb-3" /><h2 className="font-black">SLA controlado</h2><p className="mt-2 text-sm text-white/62">Parceiros precisam informar tempo de primeiro contato para proteger a experiência do usuário.</p></div>
          <div className={cardClass}><Users className="h-7 w-7 text-[#00b4ff] mb-3" /><h2 className="font-black">Revisão humana</h2><p className="mt-2 text-sm text-white/62">Candidaturas entram como submitted e só avançam após avaliação interna.</p></div>
          <div className={cardClass}><ShieldCheck className="h-7 w-7 text-[#00b4ff] mb-3" /><h2 className="font-black">Dados protegidos</h2><p className="mt-2 text-sm text-white/62">O parceiro só poderá usar dados para a modalidade informada pelo consumidor.</p></div>
        </section>

        <form id="formulario-parceiro" onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 md:p-8 space-y-8 scroll-mt-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00b4ff]">Candidatura</p>
            <h2 className="mt-2 text-3xl font-black">Dados para avaliação</h2>
            <p className="mt-2 max-w-3xl text-white/60">Preencha só o essencial. Os critérios técnicos serão refinados manualmente depois da primeira conversa.</p>
          </div>

          <section>
            <h2 className="text-xl font-black mb-4">Contato</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <label><span className={labelClass}>Nome da empresa *</span><input required className={inputClass} value={form.companyName} onChange={e => updateField('companyName', e.target.value)} /></label>
              <label><span className={labelClass}>Site</span><input className={inputClass} value={form.website} onChange={e => updateField('website', e.target.value)} placeholder="https://" /></label>
              <label><span className={labelClass}>Nome do responsável *</span><input required className={inputClass} value={form.contactName} onChange={e => updateField('contactName', e.target.value)} /></label>
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
            <h2 className="text-xl font-black mb-4">Atuação e cobertura</h2>
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
            <h2 className="text-xl font-black mb-4">Operação comercial</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <label>
                <span className={labelClass}>SLA de primeiro contato</span>
                <select className={inputClass} value={form.slaHours} onChange={e => updateField('slaHours', e.target.value)}>
                  <option value="">Selecione</option><option value="2">Até 2h úteis</option><option value="4">Até 4h úteis</option><option value="24">Até 24h úteis</option><option value="48">Até 48h úteis</option>
                </select>
              </label>
              <label>
                <span className={labelClass}>Faixa viável por lead</span>
                <select className={inputClass} value={form.acceptablePriceRange} onChange={e => updateField('acceptablePriceRange', e.target.value)}>
                  <option value="">Selecione</option><option>até R$ 30</option><option>R$ 31–R$ 80</option><option>R$ 81–R$ 150</option><option>R$ 151–R$ 300</option><option>acima de R$ 300</option><option>depende da categoria</option>
                </select>
              </label>
            </div>
            <label className="block mt-4"><span className={labelClass}>Observações</span><textarea className={`${inputClass} min-h-28`} value={form.notes} onChange={e => updateField('notes', e.target.value)} placeholder="Ex: categoria principal, regiões fortes, diferenciais ou restrições comerciais." /></label>
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
