import { ExternalLink, ShieldCheck } from 'lucide-react';
import { CATALOG_EVIDENCE } from '../constants/catalogEvidence';

interface DataEvidenceProps {
  compact?: boolean;
}

export default function DataEvidence({ compact = false }: DataEvidenceProps) {
  return (
    <aside
      aria-label="Evidência e atualização dos dados"
      className={compact
        ? 'rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2 text-[11px] text-white/45'
        : 'rounded-2xl border border-[#00b4ff]/15 bg-[#00b4ff]/[0.04] px-4 py-3 text-xs text-white/55'}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <ShieldCheck className="h-3.5 w-3.5 text-[#00b4ff]" aria-hidden="true" />
        <span>
          <strong className="text-white/75">{CATALOG_EVIDENCE.officialSourceLabel}</strong>{' '}
          · referência {CATALOG_EVIDENCE.officialReference}
        </span>
        <span aria-hidden="true" className="text-white/20">·</span>
        <span>
          Preços indicativos · histórico até {CATALOG_EVIDENCE.marketHistoryThrough}
        </span>
        <a
          href={CATALOG_EVIDENCE.officialSourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-[#72d7ff] hover:text-white"
        >
          Fonte oficial do Inmetro
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
      {!compact && (
        <p className="mt-1 text-[11px] text-white/35">{CATALOG_EVIDENCE.priceDisclaimer}</p>
      )}
    </aside>
  );
}
