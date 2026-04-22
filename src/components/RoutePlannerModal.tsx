import React, { useEffect, useRef, useState } from 'react';
import {
  X, Route, MapPin, Navigation, Zap, Key, AlertCircle,
  CheckCircle, Loader2, ChevronDown, ExternalLink, Info,
  BatteryCharging, Battery, Wifi, WifiOff,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CAR_DB } from '../constants';
import { useRoutePlanner, CONDITION_FACTORS } from '../hooks/useRoutePlanner';
import type { ConditionTemp, ConditionTerrain, ConditionDriving } from '../hooks/useRoutePlanner';
import { useNominatimAutocomplete } from '../hooks/useNominatimAutocomplete';
import { fetchChargersStatus, type OcmError } from '../services/ocmService';
import { gmapsUrl, plugshareUrl, OPERADOR_COLOR, DEFAULT_OPERADOR_COLOR } from '../data/eletropostosData';
import type { Car } from '../types';
import type { GeoSuggestion, ChargingStop, NearbyCharger, ChargerStatus } from '../types/routePlanner';

interface RoutePlannerModalProps {
  onClose: () => void;
}

// ─── Cidades brasileiras — capitais + principais municípios por estado ────────
// Ordenadas por UF para facilitar agrupamento no dropdown
const CIDADES = [
  // AC
  { name: 'Rio Branco',          uf: 'AC', lat:  -9.9754, lng: -67.8249, capital: true  },
  { name: 'Cruzeiro do Sul',     uf: 'AC', lat:  -7.6269, lng: -72.6726, capital: false },
  // AL
  { name: 'Maceió',              uf: 'AL', lat:  -9.6662, lng: -35.7356, capital: true  },
  { name: 'Arapiraca',           uf: 'AL', lat:  -9.7528, lng: -36.6614, capital: false },
  // AM
  { name: 'Manaus',              uf: 'AM', lat:  -3.1190, lng: -60.0217, capital: true  },
  { name: 'Parintins',           uf: 'AM', lat:  -2.6287, lng: -56.7358, capital: false },
  // AP
  { name: 'Macapá',              uf: 'AP', lat:   0.0355, lng: -51.0664, capital: true  },
  { name: 'Santana',             uf: 'AP', lat:  -0.0581, lng: -51.1783, capital: false },
  // BA
  { name: 'Salvador',            uf: 'BA', lat: -12.9714, lng: -38.5014, capital: true  },
  { name: 'Feira de Santana',    uf: 'BA', lat: -12.2664, lng: -38.9663, capital: false },
  { name: 'Vitória da Conquista',uf: 'BA', lat: -14.8619, lng: -40.8444, capital: false },
  { name: 'Ilhéus',              uf: 'BA', lat: -14.7892, lng: -39.0489, capital: false },
  { name: 'Porto Seguro',        uf: 'BA', lat: -16.4497, lng: -39.0647, capital: false },
  // CE
  { name: 'Fortaleza',           uf: 'CE', lat:  -3.7172, lng: -38.5433, capital: true  },
  { name: 'Caucaia',             uf: 'CE', lat:  -3.7361, lng: -38.6531, capital: false },
  { name: 'Juazeiro do Norte',   uf: 'CE', lat:  -7.2136, lng: -39.3153, capital: false },
  { name: 'Sobral',              uf: 'CE', lat:  -3.6880, lng: -40.3497, capital: false },
  // DF
  { name: 'Brasília',            uf: 'DF', lat: -15.7942, lng: -47.8822, capital: true  },
  // ES
  { name: 'Vitória',             uf: 'ES', lat: -20.3155, lng: -40.3128, capital: true  },
  { name: 'Serra',               uf: 'ES', lat: -20.1289, lng: -40.3079, capital: false },
  { name: 'Vila Velha',          uf: 'ES', lat: -20.3297, lng: -40.2922, capital: false },
  { name: 'Guarapari',           uf: 'ES', lat: -20.6718, lng: -40.5006, capital: false },
  // GO
  { name: 'Goiânia',             uf: 'GO', lat: -16.6799, lng: -49.2556, capital: true  },
  { name: 'Aparecida de Goiânia',uf: 'GO', lat: -16.8234, lng: -49.2479, capital: false },
  { name: 'Anápolis',            uf: 'GO', lat: -16.3281, lng: -48.9534, capital: false },
  { name: 'Rio Verde',           uf: 'GO', lat: -17.7981, lng: -50.9290, capital: false },
  // MA
  { name: 'São Luís',            uf: 'MA', lat:  -2.5307, lng: -44.3068, capital: true  },
  { name: 'Imperatriz',          uf: 'MA', lat:  -5.5264, lng: -47.4919, capital: false },
  // MG
  { name: 'Belo Horizonte',      uf: 'MG', lat: -19.9191, lng: -43.9386, capital: true  },
  { name: 'Contagem',            uf: 'MG', lat: -19.9317, lng: -44.0536, capital: false },
  { name: 'Betim',               uf: 'MG', lat: -19.9681, lng: -44.1983, capital: false },
  { name: 'Uberlândia',          uf: 'MG', lat: -18.9113, lng: -48.2622, capital: false },
  { name: 'Juiz de Fora',        uf: 'MG', lat: -21.7642, lng: -43.3503, capital: false },
  { name: 'Uberaba',             uf: 'MG', lat: -19.7489, lng: -47.9317, capital: false },
  { name: 'Montes Claros',       uf: 'MG', lat: -16.7282, lng: -43.8634, capital: false },
  { name: 'Poços de Caldas',     uf: 'MG', lat: -21.7872, lng: -46.5614, capital: false },
  // MS
  { name: 'Campo Grande',        uf: 'MS', lat: -20.4428, lng: -54.6461, capital: true  },
  { name: 'Dourados',            uf: 'MS', lat: -22.2211, lng: -54.8056, capital: false },
  { name: 'Corumbá',             uf: 'MS', lat: -19.0078, lng: -57.6539, capital: false },
  // MT
  { name: 'Cuiabá',              uf: 'MT', lat: -15.6014, lng: -56.0979, capital: true  },
  { name: 'Várzea Grande',       uf: 'MT', lat: -15.6461, lng: -56.1322, capital: false },
  { name: 'Rondonópolis',        uf: 'MT', lat: -16.4736, lng: -54.6358, capital: false },
  // PA
  { name: 'Belém',               uf: 'PA', lat:  -1.4558, lng: -48.5044, capital: true  },
  { name: 'Ananindeua',          uf: 'PA', lat:  -1.3644, lng: -48.3722, capital: false },
  { name: 'Santarém',            uf: 'PA', lat:  -2.4426, lng: -54.7082, capital: false },
  { name: 'Marabá',              uf: 'PA', lat:  -5.3686, lng: -49.1178, capital: false },
  // PB
  { name: 'João Pessoa',         uf: 'PB', lat:  -7.1195, lng: -34.8450, capital: true  },
  { name: 'Campina Grande',      uf: 'PB', lat:  -7.2306, lng: -35.8811, capital: false },
  // PE
  { name: 'Recife',              uf: 'PE', lat:  -8.0522, lng: -34.9286, capital: true  },
  { name: 'Olinda',              uf: 'PE', lat:  -8.0089, lng: -34.8553, capital: false },
  { name: 'Caruaru',             uf: 'PE', lat:  -8.2760, lng: -35.9753, capital: false },
  { name: 'Petrolina',           uf: 'PE', lat:  -9.3986, lng: -40.5007, capital: false },
  // PI
  { name: 'Teresina',            uf: 'PI', lat:  -5.0892, lng: -42.8019, capital: true  },
  { name: 'Parnaíba',            uf: 'PI', lat:  -2.9044, lng: -41.7767, capital: false },
  // PR
  { name: 'Curitiba',            uf: 'PR', lat: -25.4284, lng: -49.2733, capital: true  },
  { name: 'Londrina',            uf: 'PR', lat: -23.3045, lng: -51.1696, capital: false },
  { name: 'Maringá',             uf: 'PR', lat: -23.4205, lng: -51.9333, capital: false },
  { name: 'Ponta Grossa',        uf: 'PR', lat: -25.0945, lng: -50.1633, capital: false },
  { name: 'Cascavel',            uf: 'PR', lat: -24.9578, lng: -53.4595, capital: false },
  { name: 'Foz do Iguaçu',       uf: 'PR', lat: -25.5478, lng: -54.5882, capital: false },
  // RJ
  { name: 'Rio de Janeiro',      uf: 'RJ', lat: -22.9068, lng: -43.1729, capital: true  },
  { name: 'Niterói',             uf: 'RJ', lat: -22.8832, lng: -43.1036, capital: false },
  { name: 'Duque de Caxias',     uf: 'RJ', lat: -22.7892, lng: -43.3119, capital: false },
  { name: 'Nova Iguaçu',         uf: 'RJ', lat: -22.7592, lng: -43.4511, capital: false },
  { name: 'Petrópolis',          uf: 'RJ', lat: -22.5050, lng: -43.1787, capital: false },
  { name: 'Volta Redonda',       uf: 'RJ', lat: -22.5231, lng: -44.1040, capital: false },
  { name: 'Campos dos Goytacazes',uf:'RJ', lat: -21.7542, lng: -41.3244, capital: false },
  { name: 'Angra dos Reis',      uf: 'RJ', lat: -23.0067, lng: -44.3181, capital: false },
  { name: 'Cabo Frio',           uf: 'RJ', lat: -22.8794, lng: -42.0189, capital: false },
  // RN
  { name: 'Natal',               uf: 'RN', lat:  -5.7945, lng: -35.2110, capital: true  },
  { name: 'Mossoró',             uf: 'RN', lat:  -5.1878, lng: -37.3438, capital: false },
  // RO
  { name: 'Porto Velho',         uf: 'RO', lat:  -8.7612, lng: -63.9004, capital: true  },
  { name: 'Ji-Paraná',           uf: 'RO', lat: -10.8781, lng: -61.9463, capital: false },
  // RR
  { name: 'Boa Vista',           uf: 'RR', lat:   2.8235, lng: -60.6758, capital: true  },
  // RS
  { name: 'Porto Alegre',        uf: 'RS', lat: -30.0346, lng: -51.2177, capital: true  },
  { name: 'Caxias do Sul',       uf: 'RS', lat: -29.1681, lng: -51.1794, capital: false },
  { name: 'Pelotas',             uf: 'RS', lat: -31.7719, lng: -52.3425, capital: false },
  { name: 'Canoas',              uf: 'RS', lat: -29.9178, lng: -51.1839, capital: false },
  { name: 'Santa Maria',         uf: 'RS', lat: -29.6842, lng: -53.8069, capital: false },
  { name: 'Novo Hamburgo',       uf: 'RS', lat: -29.6783, lng: -51.1306, capital: false },
  { name: 'São Leopoldo',        uf: 'RS', lat: -29.7594, lng: -51.1494, capital: false },
  { name: 'Gramado',             uf: 'RS', lat: -29.3789, lng: -50.8753, capital: false },
  // SC
  { name: 'Florianópolis',       uf: 'SC', lat: -27.5954, lng: -48.5480, capital: true  },
  { name: 'Joinville',           uf: 'SC', lat: -26.3044, lng: -48.8487, capital: false },
  { name: 'Blumenau',            uf: 'SC', lat: -26.9195, lng: -49.0661, capital: false },
  { name: 'Balneário Camboriú',  uf: 'SC', lat: -26.9781, lng: -48.6344, capital: false },
  { name: 'Criciúma',            uf: 'SC', lat: -28.6775, lng: -49.3697, capital: false },
  { name: 'Chapecó',             uf: 'SC', lat: -27.1007, lng: -52.6152, capital: false },
  // SE
  { name: 'Aracaju',             uf: 'SE', lat: -10.9472, lng: -37.0731, capital: true  },
  // SP
  { name: 'São Paulo',           uf: 'SP', lat: -23.5505, lng: -46.6333, capital: true  },
  { name: 'Guarulhos',           uf: 'SP', lat: -23.4628, lng: -46.5333, capital: false },
  { name: 'Campinas',            uf: 'SP', lat: -22.9056, lng: -47.0608, capital: false },
  { name: 'São Bernardo do Campo',uf:'SP', lat: -23.6939, lng: -46.5650, capital: false },
  { name: 'Santo André',         uf: 'SP', lat: -23.6639, lng: -46.5383, capital: false },
  { name: 'Ribeirão Preto',      uf: 'SP', lat: -21.1767, lng: -47.8208, capital: false },
  { name: 'São José dos Campos', uf: 'SP', lat: -23.1794, lng: -45.8869, capital: false },
  { name: 'Santos',              uf: 'SP', lat: -23.9619, lng: -46.3044, capital: false },
  { name: 'Sorocaba',            uf: 'SP', lat: -23.5015, lng: -47.4526, capital: false },
  { name: 'Osasco',              uf: 'SP', lat: -23.5329, lng: -46.7919, capital: false },
  { name: 'Mogi das Cruzes',     uf: 'SP', lat: -23.5228, lng: -46.1875, capital: false },
  { name: 'Bauru',               uf: 'SP', lat: -22.3147, lng: -49.0608, capital: false },
  { name: 'São José do Rio Preto',uf:'SP', lat: -20.8197, lng: -49.3794, capital: false },
  { name: 'Limeira',             uf: 'SP', lat: -22.5636, lng: -47.4017, capital: false },
  { name: 'Jundiaí',             uf: 'SP', lat: -23.1864, lng: -46.8964, capital: false },
  { name: 'Piracicaba',          uf: 'SP', lat: -22.7253, lng: -47.6492, capital: false },
  // TO
  { name: 'Palmas',              uf: 'TO', lat: -10.2491, lng: -48.3243, capital: true  },
  { name: 'Araguaína',           uf: 'TO', lat:  -7.1919, lng: -48.2044, capital: false },
] as const;

// ─── Operator app links ────────────────────────────────────────────────────────
const OPERATOR_APPS: Record<string, { url: string; label: string }> = {
  'Shell Recharge':  { url: 'https://www.shell.com.br/motoristas/shell-recharge.html', label: 'Shell Recharge' },
  'Electra':         { url: 'https://electra.io/app', label: 'App Electra' },
  'Tupinambá':       { url: 'https://tupinamba.com.br', label: 'Tupinambá' },
  'Tesla':           { url: 'https://www.tesla.com/pt_BR/charging', label: 'App Tesla' },
  'BYD':             { url: 'https://byd.com/br/byd-care', label: 'BYD Care' },
  'Zletric':         { url: 'https://zletric.com.br', label: 'App Zletric' },
  'Volvo Cars':      { url: 'https://www.volvocars.com/pt-br/support/car/charging', label: 'Volvo Cars' },
  'Be Charge':       { url: 'https://becharge.com.br', label: 'Be Charge' },
  'EDP Smart':       { url: 'https://www.edpsmart.com.br', label: 'EDP Smart' },
  'ChargeHouse':     { url: 'https://chargehouse.com.br', label: 'ChargeHouse' },
  'BMW Charging':    { url: 'https://www.bmw.com.br/pt/topics/offers-and-services/charging.html', label: 'BMW Charging' },
  'Mercedes EQ':     { url: 'https://www.mercedes-benz.com.br/veiculos/eq.html', label: 'Mercedes EQ' },
  'CPFL Energia':    { url: 'https://www.cpfl.com.br/mobi', label: 'CPFL Mobi' },
  'Neoenergia':      { url: 'https://www.neoenergia.com', label: 'Neoenergia' },
  'Copel EV':        { url: 'https://www.copel.com/ev', label: 'Copel EV' },
  'WEG':             { url: 'https://www.weg.net/br', label: 'WEG' },
  'Porsche':         { url: 'https://www.porsche.com/brazil/pt/models/e-performance/charging/', label: 'Porsche Charging' },
  'Itaipu':          { url: 'https://www.itaipu.gov.br/energia/eletroposto', label: 'Itaipu' },
};

// ─── Connector label ───────────────────────────────────────────────────────────
const CONNECTOR_LABEL: Record<string, string> = {
  'CCS2':           'CCS2',
  'CHAdeMO':        'CHAdeMO',
  'CCS2+CHAdeMO':   'CCS2 + CHAdeMO',
  'CCS2+Type2':     'CCS2 + Type2',
  'Supercharger':   'Tesla SC',
  'GB/T':           'GB/T',
};

// ─── ORS Key Panel ────────────────────────────────────────────────────────────
function OrsKeyPanel({ onSave }: { onSave: (key: string) => void }) {
  const [input, setInput] = useState('');
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
      <div className="bg-[#00b4ff]/10 border border-[#00b4ff]/30 p-4 rounded-2xl">
        <Key className="w-8 h-8 text-[#00b4ff]" />
      </div>
      <div>
        <h3 className="text-white font-black text-xl mb-2">Chave API OpenRouteService</h3>
        <p className="text-[#a0a0a0] text-sm max-w-sm leading-relaxed">
          Para calcular rotas você precisa de uma chave gratuita do{' '}
          <a
            href="https://openrouteservice.org/dev/#/signup"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00b4ff] underline"
          >
            OpenRouteService
          </a>
          . Crie sua conta (2.000 rotas/dia gratuitas).
        </p>
      </div>
      <div className="w-full max-w-sm flex flex-col gap-3">
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Cole sua chave aqui..."
          className="w-full bg-[#0a0b12] border border-white/20 rounded-xl px-4 py-3 text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#00b4ff]/60 focus:ring-1 focus:ring-[#00b4ff]/30"
          onKeyDown={(e) => e.key === 'Enter' && input.trim() && onSave(input)}
        />
        <button
          disabled={!input.trim()}
          onClick={() => onSave(input)}
          className="bg-[#00b4ff] hover:bg-[#33c9ff] disabled:opacity-40 disabled:cursor-not-allowed text-black font-black py-3 rounded-xl transition-all text-sm uppercase tracking-wider"
        >
          Salvar chave localmente
        </button>
        <p className="text-[#555] text-xs">A chave fica salva apenas no seu navegador.</p>
      </div>
    </div>
  );
}

// ─── Location Input ───────────────────────────────────────────────────────────
function LocationInput({
  label, icon: Icon, value, onChange, onSelect, placeholder,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  onSelect: (s: GeoSuggestion) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const { suggestions, isLoading } = useNominatimAutocomplete(value, value.length >= 3);

  const q = value.trim().toLowerCase();
  // Filtra cidades: por nome, sigla exata ou "cidade, uf"
  const filteredCidades = q.length === 0
    ? CIDADES
    : CIDADES.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.uf.toLowerCase() === q ||
        `${c.name.toLowerCase()}, ${c.uf.toLowerCase()}`.includes(q),
      );

  const cidadesParaExibir = filteredCidades;

  // Agrupa por UF quando o resultado tem mais de 1 UF
  const ufs = [...new Set(cidadesParaExibir.map((c) => c.uf))];
  const groupByUf = ufs.length > 1;

  const showCidades = open && cidadesParaExibir.length > 0;
  const showNominatim = open && suggestions.length > 0;

  const selectCidade = (c: typeof CIDADES[number]) => {
    onSelect({ displayName: `${c.name}, ${c.uf}`, lat: c.lat, lng: c.lng, placeId: 0, type: 'city' });
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1 relative">
      <label className="text-[#a0a0a0] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="w-full bg-[#0a0b12] border border-white/15 rounded-xl px-3 py-2.5 text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#00b4ff]/50 focus:ring-1 focus:ring-[#00b4ff]/20 pr-8"
        />
        {isLoading && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00b4ff] animate-spin" />
        )}
      </div>

      {(showCidades || showNominatim) && (
        <div className="absolute top-full mt-1 w-full bg-[#111827] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar-dark">

          {/* Cidades agrupadas por UF */}
          {showCidades && (
            <>
              {groupByUf ? (
                // Múltiplos estados: cabeçalho único com label
                <>
                  <div className="sticky top-0 px-3 py-1.5 bg-[#0d1117] border-b border-white/5 flex items-center justify-between">
                    <span className="text-[#555] text-[10px] font-bold uppercase tracking-wider">Cidades</span>
                    {q.length === 0 && <span className="text-[#333] text-[10px]">capitais e principais cidades</span>}
                  </div>
                  {ufs.map((uf) => {
                    const cidades = cidadesParaExibir.filter((c) => c.uf === uf);
                    return (
                      <div key={uf}>
                        <div className="px-3 py-1 bg-[#0a0b12]/60 border-b border-white/5">
                          <span className="text-[#00b4ff]/50 text-[10px] font-black">{uf}</span>
                        </div>
                        {cidades.map((c) => (
                          <button
                            key={`${c.uf}-${c.name}`}
                            onMouseDown={() => selectCidade(c)}
                            className="w-full text-left px-4 py-1.5 flex items-center gap-2 hover:bg-[#00b4ff]/10 transition-colors border-b border-white/5 last:border-0"
                          >
                            <span className="text-sm text-white/80">{c.name}</span>
                            {c.capital && <span className="text-[9px] text-[#00b4ff]/50 font-semibold">capital</span>}
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </>
              ) : (
                // Um único estado: lista plana
                <>
                  <div className="sticky top-0 px-3 py-1.5 bg-[#0d1117] border-b border-white/5">
                    <span className="text-[#00b4ff]/70 text-[10px] font-black">{ufs[0]}</span>
                    <span className="text-[#555] text-[10px] ml-2">— {cidadesParaExibir.length} cidades</span>
                  </div>
                  {cidadesParaExibir.map((c) => (
                    <button
                      key={`${c.uf}-${c.name}`}
                      onMouseDown={() => selectCidade(c)}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#00b4ff]/10 transition-colors border-b border-white/5 last:border-0"
                    >
                      <span className="text-sm text-white/80">{c.name}</span>
                      {c.capital && <span className="text-[9px] text-[#00b4ff]/50 font-semibold">capital</span>}
                    </button>
                  ))}
                </>
              )}
            </>
          )}

          {/* Nominatim — outras cidades não listadas */}
          {showNominatim && (
            <>
              <div className="sticky top-0 px-3 py-1.5 bg-[#0d1117] border-b border-white/5">
                <span className="text-[#555] text-[10px] font-bold uppercase tracking-wider">Outros resultados</span>
              </div>
              {suggestions.map((s) => (
                <button
                  key={s.placeId}
                  onMouseDown={() => { onSelect(s); setOpen(false); }}
                  className="w-full text-left px-3 py-2.5 text-sm text-white/80 hover:bg-[#00b4ff]/10 hover:text-white transition-colors border-b border-white/5 last:border-0 truncate"
                  title={s.displayName}
                >
                  {s.displayName}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Car Selector ─────────────────────────────────────────────────────────────
function CarSelector({ selected, onSelect }: { selected: Car | null; onSelect: (car: Car) => void }) {
  const dcCars = CAR_DB.filter((c) => c.chargeDC != null);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[#a0a0a0] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
        <Zap className="w-3.5 h-3.5" />
        Veículo elétrico
      </label>
      <div className="relative">
        <select
          value={selected?.model ?? ''}
          onChange={(e) => {
            const car = dcCars.find((c) => c.model === e.target.value);
            if (car) onSelect(car);
          }}
          className="w-full appearance-none bg-[#0a0b12] border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00b4ff]/50 pr-8"
        >
          {dcCars.map((c) => (
            <option key={c.model} value={c.model}>
              {c.brand} {c.model} — {c.range} km
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555] pointer-events-none" />
      </div>
      {selected && (
        <p className="text-[#555] text-xs ml-1">
          Autonomia PBEV: <span className="text-white/60">{selected.range} km</span>
          {selected.chargeDC && (
            <> · DC máx: <span className="text-[#00b4ff]">{selected.chargeDC} kW</span></>
          )}
        </p>
      )}
    </div>
  );
}

// ─── Status badge config ──────────────────────────────────────────────────────
const STATUS_CFG: Record<ChargerStatus, { label: string; textCls: string; dot: string }> = {
  available:   { label: 'Disponível',         textCls: 'text-[#00e5a0]', dot: '#00e5a0' },
  maintenance: { label: 'Em manutenção',       textCls: 'text-orange-400', dot: '#ff8c52' },
  unknown:     { label: 'Status desconhecido', textCls: 'text-[#555]',    dot: '#555' },
};

/** Formata minutos → "~23 min" ou "~1h 30min" */
function formatChargeTime(minutes: number): string {
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `~${h}h` : `~${h}h ${String(m).padStart(2, '0')}min`;
}

/** Tempo estimado de carregamento em uma parada (melhor carregador disponível vs. limite do carro) */
function calcStopChargeMinutes(
  nearbyChargers: NearbyCharger[],
  arrivalPct: number,
  departurePct: number,
  car: Car,
): number | null {
  if (!nearbyChargers.length || car.battery == null) return null;
  const energyKwh = car.battery * 0.93 * (departurePct - arrivalPct) / 100;
  if (energyKwh <= 0) return null;
  const bestPowerRaw = Math.max(...nearbyChargers.map(c => c.potenciaDC));
  const effectivePower = car.chargeDC != null ? Math.min(bestPowerRaw, car.chargeDC) : bestPowerRaw;
  return Math.round((energyKwh / effectivePower) * 60);
}

// ─── Nearby Charger Item ───────────────────────────────────────────────────────
function ChargerItem({
  c, status, energyNeededKwh, carMaxDcKw, departurePct,
}: {
  c: NearbyCharger;
  status: ChargerStatus;
  energyNeededKwh: number | null;
  carMaxDcKw: number | undefined;
  departurePct: number;
}) {
  const color = OPERADOR_COLOR[c.operador] ?? DEFAULT_OPERADOR_COLOR;
  const app = OPERATOR_APPS[c.operador];
  const maps = gmapsUrl(c.lat, c.lng, c.nome, c.operador);
  const plugshare = plugshareUrl(c.lat, c.lng);
  const st = STATUS_CFG[status];

  // Tempo estimado de carregamento
  let chargeTimeStr: string | null = null;
  let effectivePowerKw: number | null = null;
  let powerLimitedBy: 'charger' | 'car' | null = null;
  if (energyNeededKwh !== null && carMaxDcKw !== undefined) {
    effectivePowerKw = Math.min(c.potenciaDC, carMaxDcKw);
    powerLimitedBy = c.potenciaDC <= carMaxDcKw ? 'charger' : 'car';
    const minutes = Math.round((energyNeededKwh / effectivePowerKw) * 60);
    chargeTimeStr = formatChargeTime(minutes);
  }

  return (
    <div className="bg-[#0d1117] border border-white/8 rounded-xl p-3 flex flex-col gap-2">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-white text-xs font-semibold leading-tight truncate">{c.nome}</p>
          <p className="text-[#666] text-[10px] mt-0.5">{c.cidade}/{c.uf}</p>
        </div>
        <div
          className="text-black text-xs font-black px-2 py-1 rounded-lg whitespace-nowrap flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {c.potenciaDC} kW DC
        </div>
      </div>

      {/* Charge summary — uma linha limpa */}
      {chargeTimeStr && effectivePowerKw !== null && energyNeededKwh !== null && (
        <div className="flex items-center gap-1.5 text-[10px] flex-wrap">
          <Zap className="w-3 h-3 text-[#00b4ff] flex-shrink-0" />
          <span className="text-white font-semibold">{chargeTimeStr}</span>
          <span className="text-[#444]">·</span>
          <span className="text-[#00b4ff] font-semibold">{energyNeededKwh.toFixed(1)} kWh</span>
          <span className="text-[#444]">a</span>
          <span className="text-[#a0a0a0]">{effectivePowerKw} kW</span>
          {powerLimitedBy === 'car' && (
            <span className="text-orange-400 text-[9px]">(limitado pelo carro)</span>
          )}
        </div>
      )}
      {departurePct > 80 && chargeTimeStr && (
        <p className="text-[#444] text-[9px] flex items-center gap-1 -mt-0.5">
          <Info className="w-2.5 h-2.5 flex-shrink-0" />
          Acima de 80% a carga DC desacelera (tapering).
        </p>
      )}

      {/* Status + connector + distance */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`flex items-center gap-1 text-[10px] font-semibold ${st.textCls}`}>
          <span
            className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: st.dot }}
          />
          {st.label}
        </span>
        <span className="text-[#333] text-[10px]">·</span>
        <span className="bg-white/8 text-[#a0a0a0] text-[10px] font-semibold px-2 py-0.5 rounded-full">
          {CONNECTOR_LABEL[c.conector] ?? c.conector}
        </span>
        <span className="text-[#555] text-[10px]">
          {c.distanceKm.toFixed(1)} km da parada
        </span>
      </div>

      {/* Links */}
      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={maps}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-[#00b4ff] hover:text-white transition-colors"
        >
          <MapPin className="w-3 h-3" /> Google Maps
        </a>
        <a
          href={plugshare}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-[#a0a0a0] hover:text-white transition-colors"
        >
          <ExternalLink className="w-3 h-3" /> PlugShare
        </a>
        {app && (
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-[#a0a0a0] hover:text-white transition-colors"
          >
            <ExternalLink className="w-3 h-3" /> {app.label}
          </a>
        )}
      </div>

      {/* Pricing notice */}
      <p className="text-[#444] text-[10px] flex items-center gap-1">
        <Info className="w-3 h-3 flex-shrink-0" />
        Preço/kWh e disponibilidade: consulte o app do operador.
      </p>
    </div>
  );
}

// ─── Charging Stop Card ───────────────────────────────────────────────────────
function ChargingStopCard({
  stop, radiusKm, active, onFocus, chargerStatuses, arrivalPct, arrivalKwh, departurePct, car,
}: {
  stop: ChargingStop;
  radiusKm: number;
  active: boolean;
  onFocus: () => void;
  chargerStatuses: Map<number, ChargerStatus>;
  arrivalPct: number;
  arrivalKwh: number | null;  // null para carros sem battery cadastrada
  departurePct: number;
  car: Car;
}) {
  const chargeMinutes = calcStopChargeMinutes(stop.nearbyChargers, arrivalPct, departurePct, car);

  return (
    <div
      data-stop-index={stop.index}
      className={`rounded-xl p-3 flex flex-col gap-2.5 border transition-all ${
        active
          ? 'bg-[#0d1520] border-[#00b4ff]/50 shadow-[0_0_12px_rgba(0,180,255,0.15)]'
          : 'bg-[#0a0b12] border-orange-500/20'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
            active
              ? 'bg-[#00b4ff]/20 border-[#00b4ff]/40 text-[#00b4ff]'
              : 'bg-orange-500/20 border-orange-500/40 text-orange-400'
          }`}>
            Parada {stop.index}
          </div>
          <span className="text-[#a0a0a0] text-xs">{Math.round(stop.distanceFromStartKm)} km</span>
          {/* Chegada / carga / saída */}
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="text-[#555]">Chega</span>
            <span className="text-[#ff8c52] font-black">{arrivalPct}%</span>
            {arrivalKwh !== null && (
              <span className="text-[#ff8c52]/70">{arrivalKwh} kWh</span>
            )}
            {chargeMinutes !== null && (
              <>
                <span className="text-[#333]">·</span>
                <Zap className="w-2.5 h-2.5 text-[#00b4ff] flex-shrink-0" />
                <span className="text-[#00b4ff] font-semibold">{formatChargeTime(chargeMinutes)}</span>
              </>
            )}
            <span className="text-[#333]">·</span>
            <span className="text-[#555]">Sai</span>
            <span className="text-[#00e5a0] font-black">{departurePct}%</span>
          </div>
        </div>
        {/* Ver no mapa */}
        <button
          onClick={onFocus}
          className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition-all ${
            active
              ? 'bg-[#00b4ff]/20 text-[#00b4ff]'
              : 'text-[#555] hover:text-[#00b4ff] hover:bg-[#00b4ff]/10'
          }`}
          title="Centralizar no mapa"
        >
          <MapPin className="w-3 h-3" />
          {active ? 'no mapa ✓' : 'ver no mapa'}
        </button>
      </div>

      {stop.nearbyChargers.length === 0 ? (
        <div className="bg-[#1a0a00] border border-orange-500/20 rounded-lg p-3 text-center">
          <p className="text-orange-400/80 text-xs font-semibold">Nenhum eletroposto DC em {radiusKm} km</p>
          <p className="text-[#555] text-[10px] mt-1">
            Nossa base cobre 159 pontos. Use PlugShare para cobertura completa.
          </p>
          <a
            href={`https://www.plugshare.com/?latitude=${stop.position[0]}&longitude=${stop.position[1]}&radius=25000`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-[10px] text-[#00b4ff] hover:text-white transition-colors"
          >
            <ExternalLink className="w-3 h-3" /> Ver no PlugShare
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-[#555] text-[10px]">
            {stop.nearbyChargers.length} eletroposto{stop.nearbyChargers.length > 1 ? 's' : ''} encontrado{stop.nearbyChargers.length > 1 ? 's' : ''} · raio {radiusKm} km
          </p>
          {stop.nearbyChargers.map((c) => (
            <ChargerItem
              key={c.id}
              c={c}
              status={chargerStatuses.get(c.id) ?? 'unknown'}
              energyNeededKwh={car.battery != null
                ? parseFloat((car.battery * 0.93 * (departurePct - arrivalPct) / 100).toFixed(2))
                : null}
              carMaxDcKw={car.chargeDC ?? undefined}
              departurePct={departurePct}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Route Stats ──────────────────────────────────────────────────────────────
function RouteStats({ distanceKm, durationMin, stops, kwhEstimated, finalBatteryPct, chargeTimeMin }: {
  distanceKm: number;
  durationMin: number;
  stops: number;
  kwhEstimated: number | null;
  finalBatteryPct: number;
  chargeTimeMin: number | null;
}) {
  const hours = Math.floor(durationMin / 60);
  const mins = durationMin % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  const finalColor = finalBatteryPct >= 20 ? '#00e5a0' : finalBatteryPct >= 10 ? '#ff8c52' : '#ff6b6b';

  const stats = [
    { label: 'Distância',  value: `${Math.round(distanceKm)} km` },
    { label: 'Condução',   value: timeStr },
    ...(chargeTimeMin != null && chargeTimeMin > 0
      ? [{ label: 'Recarga total', value: formatChargeTime(chargeTimeMin) }]
      : []),
    { label: 'Paradas',    value: stops === 0 ? 'Nenhuma' : String(stops) },
    ...(kwhEstimated !== null
      ? [{ label: 'Consumo est.', value: `~${kwhEstimated.toFixed(1)} kWh` }]
      : []),
  ];

  const cols = stats.length <= 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div className="flex flex-col gap-2">
      <div className={`grid gap-2 ${cols}`}>
        {stats.map((s) => (
          <div key={s.label} className="bg-[#0a0b12] border border-white/10 rounded-xl p-2.5 text-center">
            <div className="text-[#555] text-[10px] font-bold uppercase tracking-wider">{s.label}</div>
            <div className="text-white font-black text-sm mt-0.5">{s.value}</div>
          </div>
        ))}
      </div>
      {/* Chegada ao destino */}
      <div className="bg-[#0a0b12] border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between">
        <span className="text-[#555] text-[10px] font-bold uppercase tracking-wider">Bateria no destino</span>
        <span className="font-black text-sm" style={{ color: finalColor }}>~{Math.max(0, finalBatteryPct)}%</span>
      </div>
    </div>
  );
}

// ─── Battery Slider ────────────────────────────────────────────────────────────
/**
 * Controle de percentual de bateria — slider no desktop, botões +/− no mobile.
 * `color`: 'green' (saída) | 'orange' (chegada)
 */
function BatterySlider({
  label, sublabel, icon: Icon, value, onChange,
  min, max, step = 5, color,
}: {
  label: string;
  sublabel: string;
  icon: React.ElementType;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  color: 'green' | 'orange';
}) {
  const accent = color === 'green' ? '#00e5a0' : '#ff8c52';
  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[#a0a0a0] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
          {label}
        </label>
        {/* Badge de valor */}
        <span
          className="text-sm font-black px-2.5 py-0.5 rounded-lg"
          style={{ backgroundColor: `${accent}22`, color: accent }}
        >
          {value}%
        </span>
      </div>
      <p className="text-[#444] text-[10px]">{sublabel}</p>

      {/* Desktop: slider */}
      <div className="hidden md:block">
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${accent} 0%, ${accent} ${((value - min) / (max - min)) * 100}%, #1e2030 ${((value - min) / (max - min)) * 100}%, #1e2030 100%)`,
            accentColor: accent,
          }}
        />
        <div className="flex justify-between text-[#333] text-[10px] mt-0.5">
          <span>{min}%</span><span>{max}%</span>
        </div>
      </div>

      {/* Mobile: +/− buttons */}
      <div className="flex md:hidden items-center justify-between gap-2">
        <button
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= min}
          className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 text-white font-black text-lg flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all"
        >−</button>
        <div className="flex-1 text-center">
          <span className="text-white font-black text-lg">{value}%</span>
        </div>
        <button
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= max}
          className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 text-white font-black text-lg flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all"
        >+</button>
      </div>
    </div>
  );
}

// ─── Radius Selector ──────────────────────────────────────────────────────────
const RADIUS_OPTIONS = [20, 30, 50, 100];

function RadiusSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[#a0a0a0] text-xs font-bold uppercase tracking-wider">
        Raio de busca por carregadores
      </label>
      <div className="flex gap-1.5">
        {RADIUS_OPTIONS.map((r) => (
          <button
            key={r}
            onClick={() => onChange(r)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              value === r
                ? 'bg-[#00b4ff]/20 border-[#00b4ff]/50 text-[#00b4ff]'
                : 'bg-white/5 border-white/10 text-[#555] hover:text-white hover:border-white/20'
            }`}
          >
            {r} km
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Stop marker icon (divIcon com número) ────────────────────────────────────
function makeStopIcon(L: typeof import('leaflet'), index: number, active: boolean) {
  const bg    = active ? '#00b4ff' : '#ff8c52';
  const color = active ? '#000'    : '#fff';
  const size  = active ? 30        : 26;
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};border:2px solid rgba(255,255,255,0.85);
      display:flex;align-items:center;justify-content:center;
      color:${color};font-weight:900;font-size:11px;
      box-shadow:0 2px 8px rgba(0,0,0,0.55);
      transition:all 0.25s;
    ">${index}</div>`,
    className: '',
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor:[0, -(size / 2)],
  });
}

// ─── Conditions Panel ─────────────────────────────────────────────────────────
function ConditionRow<T extends string>({
  label, options, value, onChange,
}: {
  label: string;
  options: Record<T, { factor: number; label: string; icon: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[#a0a0a0] text-[10px] font-bold uppercase tracking-wider">{label}</span>
      <div className="flex gap-1">
        {(Object.entries(options) as [T, { factor: number; label: string; icon: string }][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-lg text-[9px] font-semibold transition-all border ${
              value === key
                ? 'bg-[#00b4ff]/20 border-[#00b4ff]/50 text-[#00b4ff]'
                : 'bg-white/5 border-white/10 text-[#555] hover:text-white hover:border-white/20'
            }`}
          >
            <span className="text-base leading-none mb-0.5">{cfg.icon}</span>
            <span className="leading-tight text-center">{cfg.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ConditionsPanel({
  temp, terrain, driving, multiplier, adjustedKm, effectiveKm,
  setTemp, setTerrain, setDriving,
}: {
  temp: ConditionTemp; terrain: ConditionTerrain; driving: ConditionDriving;
  multiplier: number; adjustedKm: number; effectiveKm: number;
  setTemp: (v: ConditionTemp) => void;
  setTerrain: (v: ConditionTerrain) => void;
  setDriving: (v: ConditionDriving) => void;
}) {
  const isIdeal = multiplier === 1.0;
  const pct = Math.round((multiplier - 1) * 100);
  const pctStr = pct >= 0 ? `+${pct}%` : `${pct}%`;
  const pctColor = multiplier >= 1 ? '#00e5a0' : multiplier >= 0.85 ? '#ff8c52' : '#ff6b6b';

  return (
    <div className="flex flex-col gap-2.5">
      <ConditionRow
        label="🌡 Temperatura"
        options={CONDITION_FACTORS.temp}
        value={temp}
        onChange={setTemp}
      />
      <ConditionRow
        label="⛰ Relevo"
        options={CONDITION_FACTORS.terrain}
        value={terrain}
        onChange={setTerrain}
      />
      <ConditionRow
        label="🏎 Condução"
        options={CONDITION_FACTORS.driving}
        value={driving}
        onChange={setDriving}
      />
      {/* Resumo do impacto */}
      <div className="bg-[#0d1117] border border-white/8 rounded-lg px-3 py-2 flex items-center justify-between">
        <div className="text-[10px] text-[#555]">
          Autonomia ajustada:
          <span className="text-white font-semibold ml-1">{adjustedKm} km</span>
          {!isIdeal && (
            <span className="text-[#444] ml-1">(base {effectiveKm} km)</span>
          )}
        </div>
        <span className="text-[10px] font-black" style={{ color: pctColor }}>
          {isIdeal ? '×1.00' : pctStr}
        </span>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export const RoutePlannerModal: React.FC<RoutePlannerModalProps> = ({ onClose }) => {
  useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);
  const stopMarkersRef = useRef<Map<number, import('leaflet').Marker>>(new Map());
  const panelRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const [activeStopIndex, setActiveStopIndex] = useState<number | null>(null);

  // OCM status state
  const [chargerStatuses, setChargerStatuses] = useState<Map<number, ChargerStatus>>(new Map());
  const [ocmLoading, setOcmLoading] = useState(false);
  const [ocmError, setOcmError] = useState<string | null>(null);
  const [showOcmKey, setShowOcmKey] = useState(false);
  const [ocmKeyInput, setOcmKeyInput] = useState('');

  const {
    form, status, errorMessage, result,
    chargerRadiusKm, setChargerRadiusKm,
    departPct, setDepartPct,
    arrivePct, setArrivePct,
    suggestedRangeKm, effectiveRangeKm, adjustedRangeKm,
    baseConsumptionKwh, customConsumptionKwh, effectiveConsumptionKwh, setCustomConsumptionKwh,
    conditionsMultiplier, conditionTemp, conditionTerrain, conditionDriving,
    setConditionTemp, setConditionTerrain, setConditionDriving,
    customRangeKm, setCustomRangeKm,
    orsHasKey, setOrsKey,
    ocmApiKey, ocmHasKey, setOcmKey, removeOcmKey,
    setSelectedCar, setOrigin, setDestination,
    setOriginQuery, setDestinationQuery,
    calculate, reset,
  } = useRoutePlanner();

  // Reset active stop when route changes
  useEffect(() => { setActiveStopIndex(null); }, [result]);

  // Fetch OCM status when route is ready and OCM key is set
  useEffect(() => {
    if (!result || !ocmHasKey) {
      setChargerStatuses(new Map());
      setOcmError(null);
      return;
    }

    // Collect all unique nearby chargers across all stops
    const seen = new Map<number, { id: number; lat: number; lng: number }>();
    result.chargingStops.forEach((stop) => {
      stop.nearbyChargers.forEach((c) => {
        if (!seen.has(c.id)) seen.set(c.id, { id: c.id, lat: c.lat, lng: c.lng });
      });
    });

    if (seen.size === 0) return;

    const ctrl = new AbortController();
    setOcmLoading(true);
    setOcmError(null);

    fetchChargersStatus(Array.from(seen.values()), ocmApiKey, ctrl.signal)
      .then((statuses) => setChargerStatuses(statuses))
      .catch((err: OcmError | Error) => {
        if ('kind' in err) {
          if (err.kind === 'unauthorized') {
            removeOcmKey();
            setOcmError('Chave OCM inválida — removida.');
          } else {
            setOcmError(err.message);
          }
        }
        // AbortError is silently ignored
      })
      .finally(() => setOcmLoading(false));

    return () => ctrl.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, ocmApiKey, ocmHasKey]);

  // ── Scroll panel card into view ──────────────────────────────────────────────
  const scrollToCard = (stopIdx: number) => {
    const el = panelRef.current?.querySelector<HTMLElement>(`[data-stop-index="${stopIdx}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // ── Focus a stop: fly map + open popup ──────────────────────────────────────
  const focusStop = (stopIdx: number) => {
    setActiveStopIndex(stopIdx);
    const marker = stopMarkersRef.current.get(stopIdx);
    const map = mapInstanceRef.current;
    if (!marker || !map) return;
    map.flyTo(marker.getLatLng(), 12, { duration: 0.6 });
    setTimeout(() => marker.openPopup(), 650);
  };

  // ── Update marker icons when activeStopIndex changes ────────────────────────
  useEffect(() => {
    const L = leafletRef.current;
    if (!L) return;
    stopMarkersRef.current.forEach((marker, idx) => {
      const active = idx === activeStopIndex;
      marker.setIcon(makeStopIcon(L, idx, active));
    });
  }, [activeStopIndex]);

  // ── Init Leaflet map ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      if (!mapRef.current) return;
      leafletRef.current = L;

      const map = L.map(mapRef.current, {
        center: [-15.8, -47.9],
        zoom: 4,
        zoomControl: true,
        attributionControl: true,
      });
      mapInstanceRef.current = map;
      setMapReady(true);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // ── Draw/update route on map ─────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!mapReady || !map || !result) return;

    stopMarkersRef.current.clear();

    import('leaflet').then((L) => {
      map.eachLayer((layer) => {
        if ((layer as unknown as { _isRoute?: boolean })._isRoute) map.removeLayer(layer);
      });

      const routeLine = L.polyline(result.polyline, { color: '#00b4ff', weight: 4, opacity: 0.85 });
      (routeLine as unknown as { _isRoute: boolean })._isRoute = true;
      routeLine.addTo(map);

      // Origin
      const originMarker = L.circleMarker(result.polyline[0], {
        radius: 9, color: '#00e5a0', fillColor: '#00e5a0', fillOpacity: 1, weight: 2,
      });
      (originMarker as unknown as { _isRoute: boolean })._isRoute = true;
      originMarker.bindPopup(
        `<b>Origem</b><br><span style="font-size:11px">${result.origin.displayName}</span>`
      ).addTo(map);

      // Destination
      const destPt = result.polyline[result.polyline.length - 1];
      const destMarker = L.circleMarker(destPt, {
        radius: 9, color: '#ff6b6b', fillColor: '#ff6b6b', fillOpacity: 1, weight: 2,
      });
      (destMarker as unknown as { _isRoute: boolean })._isRoute = true;
      destMarker.bindPopup(
        `<b>Destino</b><br><span style="font-size:11px">${result.destination.displayName}</span>`
      ).addTo(map);

      // Charging stop markers — stored in ref for bidirectional sync
      result.chargingStops.forEach((stop) => {
        const marker = L.marker(stop.position, {
          icon: makeStopIcon(L, stop.index, false),
        });
        (marker as unknown as { _isRoute: boolean })._isRoute = true;

        const chargerRows = stop.nearbyChargers.length > 0
          ? stop.nearbyChargers.slice(0, 3)
              .map((c) =>
                `<div style="font-size:11px;margin-top:3px"><b>${c.potenciaDC} kW</b> · ${c.nome} · ${c.distanceKm.toFixed(1)} km</div>`
              ).join('')
          : `<div style="font-size:11px;color:#999;margin-top:3px">Nenhum eletroposto DC em ${chargerRadiusKm} km</div>`;

        marker.bindPopup(
          `<b>Parada ${stop.index}</b> — ${Math.round(stop.distanceFromStartKm)} km${chargerRows}`
        );

        // Click marker → highlight card + scroll panel
        marker.on('click', () => {
          setActiveStopIndex(stop.index);
          scrollToCard(stop.index);
        });

        marker.addTo(map);
        stopMarkersRef.current.set(stop.index, marker);
      });

      map.fitBounds(routeLine.getBounds(), { padding: [30, 30] });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, mapReady, chargerRadiusKm]);

  const canCalculate = !!form.originLocation && !!form.destinationLocation && !!form.selectedCar;

  // ── Energy calculations (only when route is ready) ───────────────────────────
  const energyInfo = React.useMemo(() => {
    if (!result) return null;
    const { car, totalDistanceKm, chargingStops } = result;

    // Consumo real = consumo efetivo (custom ou PBEV) ajustado pelas condições
    // conditionsMultiplier < 1 → mais consumo → divide para aumentar kWh/100km
    const kwhEstimated = effectiveConsumptionKwh != null
      ? parseFloat((effectiveConsumptionKwh / conditionsMultiplier / 100 * totalDistanceKm).toFixed(1))
      : null;

    // % ao chegar no destino: última parada → destino (ou origem → destino se sem paradas)
    const lastStopDist = chargingStops.length > 0
      ? chargingStops[chargingStops.length - 1].distanceFromStartKm
      : 0;
    const lastSegmentKm = totalDistanceKm - lastStopDist;
    // range real = car.range × multiplier
    const realRange = car.range * conditionsMultiplier;
    const finalBatteryPct = Math.round(departPct - (lastSegmentKm / realRange) * 100);

    return { kwhEstimated, finalBatteryPct };
  }, [result, departPct, conditionsMultiplier, effectiveConsumptionKwh]);

  const totalChargeMin = React.useMemo(() => {
    if (!result || result.chargingStops.length === 0) return null;
    const total = result.chargingStops.reduce((acc, stop, idx) => {
      const prevDist = idx === 0 ? 0 : result.chargingStops[idx - 1].distanceFromStartKm;
      const segmentKm = stop.distanceFromStartKm - prevDist;
      const pctConsumed = result.effectiveRangeKm > 0
        ? segmentKm * (departPct - arrivePct) / result.effectiveRangeKm
        : 0;
      const stopArrivalPct = Math.max(0, Math.round(departPct - pctConsumed));
      return acc + (calcStopChargeMinutes(stop.nearbyChargers, stopArrivalPct, departPct, result.car) ?? 0);
    }, 0);
    return total > 0 ? total : null;
  }, [result, departPct, arrivePct]);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-stretch bg-black/80 backdrop-blur-sm">
      <div className="w-full h-full flex flex-col bg-[#0a0b12] text-white">

        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/10 bg-[#0a0b12]/90 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#00b4ff]/10 border border-[#00b4ff]/30 p-2 rounded-xl">
              <Route className="w-5 h-5 text-[#00b4ff]" />
            </div>
            <div>
              <h2 className="text-white font-black text-base leading-tight">Planejar Rota EV</h2>
              <p className="text-[#555] text-xs">Paradas de recarga calculadas automaticamente</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#666] hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">

          {/* Left panel */}
          <div
            ref={panelRef}
            className="w-full md:w-[320px] md:flex-shrink-0 border-b md:border-b-0 md:border-r border-white/10 md:overflow-y-auto md:custom-scrollbar-dark"
          >
            {!orsHasKey ? (
              <OrsKeyPanel onSave={setOrsKey} />
            ) : (
              <div className="p-4 flex flex-col gap-4">

                <CarSelector selected={form.selectedCar} onSelect={setSelectedCar} />

                {/* Consumo kWh/100km — exibição e override manual */}
                {form.selectedCar && (
                  <div className="bg-[#0d1117] border border-white/8 rounded-xl px-3 py-2.5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[#a0a0a0] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" /> Consumo
                      </span>
                      {customConsumptionKwh !== null && baseConsumptionKwh !== null && (
                        <button
                          onClick={() => setCustomConsumptionKwh(null)}
                          className="text-[10px] text-orange-400 hover:text-orange-300 transition-colors"
                          title="Voltar para o consumo padrão do veículo"
                        >
                          ↺ padrão ({baseConsumptionKwh.toFixed(1)} kWh/100km)
                        </button>
                      )}
                    </div>
                    {baseConsumptionKwh !== null ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={5} max={60} step={0.5}
                          value={(customConsumptionKwh ?? baseConsumptionKwh).toFixed(1)}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            if (v >= 5 && v <= 60) setCustomConsumptionKwh(v);
                          }}
                          className="w-20 bg-[#0a0b12] border border-white/15 rounded-lg px-3 py-1.5 text-[#00b4ff] font-black text-sm text-center focus:outline-none focus:border-[#00b4ff]/50"
                        />
                        <span className="text-[#555] text-xs">kWh/100km</span>
                        <span className={`text-[10px] ${customConsumptionKwh === null ? 'text-[#444] italic' : 'text-orange-400 font-semibold'}`}>
                          {customConsumptionKwh === null ? 'PBEV/Inmetro' : 'personalizado'}
                        </span>
                      </div>
                    ) : (
                      <p className="text-[#444] text-[10px]">Bateria não cadastrada — consumo estimado indisponível</p>
                    )}
                  </div>
                )}

                <LocationInput
                  label="Origem"
                  icon={MapPin}
                  value={form.originQuery}
                  onChange={setOriginQuery}
                  onSelect={(s) => setOrigin(
                    { displayName: s.displayName, lat: s.lat, lng: s.lng, placeId: s.placeId },
                    s.displayName,
                  )}
                  placeholder="Ex: São Paulo, SP"
                />

                <LocationInput
                  label="Destino"
                  icon={Navigation}
                  value={form.destinationQuery}
                  onChange={setDestinationQuery}
                  onSelect={(s) => setDestination(
                    { displayName: s.displayName, lat: s.lat, lng: s.lng, placeId: s.placeId },
                    s.displayName,
                  )}
                  placeholder="Ex: Rio de Janeiro, RJ"
                />

                <div className="border-t border-white/8" />

                <BatterySlider
                  label="Saída com"
                  sublabel="Carga da bateria ao iniciar cada trecho"
                  icon={BatteryCharging}
                  value={departPct}
                  onChange={(v) => { if (v > arrivePct + 5) setDepartPct(v); }}
                  min={30} max={100} step={5}
                  color="green"
                />

                <BatterySlider
                  label="Chegada com mín."
                  sublabel="Reserva ao chegar no destino ou em cada parada"
                  icon={Battery}
                  value={arrivePct}
                  onChange={(v) => { if (v < departPct - 5) setArrivePct(v); }}
                  min={5} max={40} step={5}
                  color="orange"
                />

                {/* Autonomia por trecho — editável */}
                {form.selectedCar && (
                  <div className="bg-[#0d1117] border border-white/8 rounded-xl px-3 py-2.5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[#a0a0a0] text-xs font-bold uppercase tracking-wider">
                        Autonomia por trecho
                      </span>
                      {customRangeKm !== null && (
                        <button
                          onClick={() => setCustomRangeKm(null)}
                          className="text-[10px] text-orange-400 hover:text-orange-300 transition-colors"
                          title="Voltar para sugestão automática"
                        >
                          ↺ sugestão ({suggestedRangeKm} km)
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex md:hidden items-center gap-2 flex-1">
                        <button
                          onClick={() => setCustomRangeKm(Math.max(50, effectiveRangeKm - 10))}
                          className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 text-white font-black text-lg flex items-center justify-center active:scale-95 transition-all"
                        >−</button>
                        <div className="flex-1 text-center">
                          <span className="text-[#00b4ff] font-black text-lg">{effectiveRangeKm}</span>
                          <span className="text-[#555] text-xs ml-1">km</span>
                        </div>
                        <button
                          onClick={() => setCustomRangeKm(Math.min(form.selectedCar!.range, effectiveRangeKm + 10))}
                          className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 text-white font-black text-lg flex items-center justify-center active:scale-95 transition-all"
                        >+</button>
                      </div>
                      <div className="hidden md:flex items-center gap-2 flex-1">
                        <input
                          type="number"
                          min={50} max={form.selectedCar.range} step={10}
                          value={effectiveRangeKm}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            if (v >= 50 && v <= form.selectedCar!.range) setCustomRangeKm(v);
                          }}
                          className="w-24 bg-[#0a0b12] border border-white/15 rounded-lg px-3 py-1.5 text-[#00b4ff] font-black text-sm focus:outline-none focus:border-[#00b4ff]/50 text-center"
                        />
                        <span className="text-[#555] text-xs">km</span>
                      </div>
                      <span className={`text-[10px] ${customRangeKm === null ? 'text-[#444] italic' : 'text-orange-400 font-semibold'}`}>
                        {customRangeKm === null ? 'sugestão automática' : 'personalizado'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="border-t border-white/8" />

                {/* Condições de viagem */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#a0a0a0] text-xs font-bold uppercase tracking-wider">
                    Condições de viagem
                  </label>
                  <ConditionsPanel
                    temp={conditionTemp}
                    terrain={conditionTerrain}
                    driving={conditionDriving}
                    multiplier={conditionsMultiplier}
                    adjustedKm={adjustedRangeKm}
                    effectiveKm={effectiveRangeKm}
                    setTemp={setConditionTemp}
                    setTerrain={setConditionTerrain}
                    setDriving={setConditionDriving}
                  />
                </div>

                <div className="border-t border-white/8" />

                <RadiusSelector value={chargerRadiusKm} onChange={setChargerRadiusKm} />

                {/* OCM key — status em tempo real */}
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => setShowOcmKey((v) => !v)}
                    className="flex items-center justify-between w-full group"
                  >
                    <span className="text-[#a0a0a0] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      {ocmHasKey
                        ? <Wifi className="w-3.5 h-3.5 text-[#00e5a0]" />
                        : <WifiOff className="w-3.5 h-3.5 text-[#555]" />
                      }
                      Status dos carregadores (OCM)
                    </span>
                    <span className={`text-[10px] font-semibold ${ocmHasKey ? 'text-[#00e5a0]' : 'text-[#555] group-hover:text-white'} transition-colors`}>
                      {ocmHasKey ? '✓ conectado' : 'configurar →'}
                    </span>
                  </button>

                  {showOcmKey && (
                    <div className="bg-[#0d1117] border border-white/8 rounded-xl p-3 flex flex-col gap-2.5">
                      {ocmHasKey ? (
                        <>
                          <p className="text-[#00e5a0] text-[10px] font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Chave OCM salva — status atualiza a cada rota
                          </p>
                          <button
                            onClick={() => { removeOcmKey(); setShowOcmKey(false); }}
                            className="text-[10px] text-red-400 hover:text-red-300 transition-colors text-left"
                          >
                            Remover chave OCM
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-[#a0a0a0] text-[10px] leading-relaxed">
                            Chave gratuita em{' '}
                            <a
                              href="https://openchargemap.org/site/profile/apikeyrequest"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#00b4ff] underline"
                            >
                              openchargemap.org
                            </a>
                            . Mostra disponível / em manutenção por ponto.
                          </p>
                          <p className="text-[#444] text-[10px]">
                            Ocupação em tempo real não está disponível — as operadoras brasileiras não publicam via OCM.
                          </p>
                          <div className="flex gap-2">
                            <input
                              type="password"
                              value={ocmKeyInput}
                              onChange={(e) => setOcmKeyInput(e.target.value)}
                              placeholder="Cole sua chave OCM..."
                              className="flex-1 bg-[#0a0b12] border border-white/15 rounded-lg px-3 py-1.5 text-white placeholder-[#444] text-xs focus:outline-none focus:border-[#00b4ff]/50"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && ocmKeyInput.trim()) {
                                  setOcmKey(ocmKeyInput);
                                  setOcmKeyInput('');
                                  setShowOcmKey(false);
                                }
                              }}
                            />
                            <button
                              disabled={!ocmKeyInput.trim()}
                              onClick={() => { setOcmKey(ocmKeyInput); setOcmKeyInput(''); setShowOcmKey(false); }}
                              className="bg-[#00b4ff] hover:bg-[#33c9ff] disabled:opacity-40 text-black text-xs font-black px-3 rounded-lg transition-all"
                            >
                              Salvar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <button
                  disabled={!canCalculate || status === 'routing'}
                  onClick={calculate}
                  className="w-full bg-[#00b4ff] hover:bg-[#33c9ff] disabled:opacity-40 disabled:cursor-not-allowed text-black font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                >
                  {status === 'routing'
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Calculando...</>
                    : <><Route className="w-4 h-4" /> Calcular Rota</>
                  }
                </button>

                {status === 'error' && errorMessage && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-300 text-xs">{errorMessage}</p>
                  </div>
                )}

                {status === 'ready' && result && (
                  <>
                    <div className="flex items-center gap-2 bg-[#00b4ff]/10 border border-[#00b4ff]/30 rounded-xl p-3">
                      <CheckCircle className="w-4 h-4 text-[#00b4ff] flex-shrink-0" />
                      <p className="text-[#00b4ff] text-xs font-semibold">Rota calculada com sucesso</p>
                    </div>

                    <RouteStats
                      distanceKm={result.totalDistanceKm}
                      durationMin={result.estimatedDurationMin}
                      stops={result.chargingStops.length}
                      kwhEstimated={energyInfo?.kwhEstimated ?? null}
                      finalBatteryPct={energyInfo?.finalBatteryPct ?? arrivePct}
                      chargeTimeMin={totalChargeMin}
                    />

                    {result.chargingStops.length === 0 ? (
                      <div className="bg-[#00e5a0]/10 border border-[#00e5a0]/30 rounded-xl p-3 flex flex-col gap-1.5">
                        <p className="text-[#00e5a0] text-sm font-black text-center">Rota cabe em uma carga!</p>
                        <p className="text-[#555] text-xs text-center">
                          {Math.round(result.totalDistanceKm)} km &lt; {Math.round(result.effectiveRangeKm)} km
                        </p>
                        <div className="flex items-center justify-center gap-3 mt-0.5 text-xs flex-wrap">
                          <span className="text-[#00e5a0] font-semibold">Saída: {departPct}%</span>
                          <span className="text-[#333]">→</span>
                          <span
                            className="font-semibold"
                            style={{ color: (energyInfo?.finalBatteryPct ?? arrivePct) >= 20 ? '#00e5a0' : '#ff8c52' }}
                          >
                            Chegada: ~{Math.max(0, energyInfo?.finalBatteryPct ?? arrivePct)}%
                          </span>
                          {energyInfo?.kwhEstimated != null && (
                            <span className="text-[#a0a0a0]">· ~{energyInfo.kwhEstimated} kWh</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[#a0a0a0] text-xs font-bold uppercase tracking-wider">
                            Paradas de recarga ({result.chargingStops.length})
                          </p>
                          {/* OCM status indicator */}
                          {ocmLoading && (
                            <span className="flex items-center gap-1 text-[10px] text-[#00b4ff]">
                              <Loader2 className="w-3 h-3 animate-spin" /> status...
                            </span>
                          )}
                          {!ocmLoading && ocmHasKey && chargerStatuses.size > 0 && !ocmError && (
                            <span className="flex items-center gap-1 text-[10px] text-[#00e5a0]">
                              <Wifi className="w-3 h-3" /> status OCM
                            </span>
                          )}
                          {!ocmLoading && !ocmHasKey && (
                            <button
                              onClick={() => setShowOcmKey(true)}
                              className="text-[10px] text-[#555] hover:text-[#00b4ff] transition-colors"
                            >
                              + ver status
                            </button>
                          )}
                        </div>
                        {ocmError && (
                          <p className="text-orange-400 text-[10px] flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {ocmError}
                          </p>
                        )}
                        {result.chargingStops.map((stop, idx) => {
                          // % real de chegada nesta parada, baseado na distância do trecho percorrido
                          const prevDist = idx === 0 ? 0 : result.chargingStops[idx - 1].distanceFromStartKm;
                          const segmentKm = stop.distanceFromStartKm - prevDist;
                          const pctConsumed = result.effectiveRangeKm > 0
                            ? segmentKm * (departPct - arrivePct) / result.effectiveRangeKm
                            : 0;
                          const stopArrivalPct = Math.max(0, Math.round(departPct - pctConsumed));
                          // kWh de chegada (null para carros sem battery cadastrada)
                          const stopArrivalKwh = result.car.battery != null
                            ? parseFloat((result.car.battery * 0.93 * stopArrivalPct / 100).toFixed(1))
                            : null;
                          return (
                            <ChargingStopCard
                              key={stop.index}
                              stop={stop}
                              radiusKm={chargerRadiusKm}
                              active={activeStopIndex === stop.index}
                              onFocus={() => focusStop(stop.index)}
                              chargerStatuses={chargerStatuses}
                              arrivalPct={stopArrivalPct}
                              arrivalKwh={stopArrivalKwh}
                              departurePct={departPct}
                              car={result.car}
                            />
                          );
                        })}
                      </div>
                    )}

                    <button
                      onClick={reset}
                      className="text-[#444] hover:text-white text-xs underline text-center transition-colors"
                    >
                      Calcular nova rota
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="flex-1 relative min-h-[40vh] md:min-h-0">
            <div ref={mapRef} className="absolute inset-0" />
            {!mapReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0a0b12]">
                <Loader2 className="w-8 h-8 text-[#00b4ff] animate-spin" />
              </div>
            )}
            {mapReady && !result && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                <div className="bg-[#0a0b12]/80 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-2.5 text-center">
                  <p className="text-[#555] text-xs">Preencha os campos e calcule a rota</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
