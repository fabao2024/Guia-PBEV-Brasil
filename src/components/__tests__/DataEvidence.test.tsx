import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import DataEvidence from '../DataEvidence';

describe('DataEvidence', () => {
  it('shows official reference, market freshness and source link', () => {
    render(<DataEvidence />);

    expect(screen.getByText(/PBEV\/Inmetro/i)).toBeInTheDocument();
    expect(screen.getByText(/2026_14_AGOd/i)).toBeInTheDocument();
    expect(screen.getByText(/julho\/2026/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /fonte oficial do inmetro/i })).toHaveAttribute(
      'href',
      'https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/veiculos-automotivos-pbe-veicular',
    );
  });

  it('can render a compact variant for comparison headers', () => {
    render(<DataEvidence compact />);

    expect(screen.getByText(/preços indicativos/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /fonte oficial do inmetro/i })).toBeInTheDocument();
  });
});
