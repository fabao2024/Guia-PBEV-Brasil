import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { CAR_DB } from '../constants';
import CarCard from '../components/CarCard';
import { primaryCarMetric } from '../utils/powertrain';
import i18n from '../i18n';

const civic = CAR_DB.find(car => car.model === 'Civic Advanced Hybrid')!;
const registry = JSON.parse(readFileSync('.github/data/catalog-provenance.json', 'utf8'));

beforeEach(async () => { await i18n.changeLanguage('pt-BR'); });

describe('Honda Civic Advanced Hybrid — fontes oficiais brasileiras', () => {
  it('usa a potência elétrica publicada sem somar o motor a gasolina ou estimar pelo preço', () => {
    expect(civic).toMatchObject({
      brand: 'Honda', powertrain: 'HEV', fuelType2: 'gasolina', cat: 'Sedan',
      power: 184, torque: 32.1, battery: 1.05, traction: 'FWD',
      lengthMm: 4687, widthMm: 1802, heightMm: 1432, wheelbaseMm: 2735,
      weightKg: 1449, trunkLiters: 495, fuelConsumptionKml: 18.4,
      range: 0, chargeDC: null, warrantyYears: 3, warrantyBatteryYears: 8,
    });
    expect(civic.power).not.toBe(184 + 143);
    expect(civic.chargeAC).toBeUndefined();
    expect(civic.electricRangeKm).toBeUndefined();
    expect(civic.fuelConsumptionKmlEthanol).toBeUndefined();
    expect(civic.energyMJkm).toBeUndefined();
    expect(civic.pbeRating).toBeUndefined();
    expect(primaryCarMetric(civic).unit).toBe('km/l');
  });

  it('especifica equipamentos e limites de garantia sem generalizar fabricação 2026', () => {
    const features = civic.features!.join(' ');
    expect(features).toContain('32,1 kgfm');
    expect(features).toContain('15,9 km/l');
    expect(features).toContain('Google');
    expect(features).toContain('Bose');
    expect(features).toContain('12 alto-falantes');
    expect(features).toContain('8 airbags');
    expect(features).toContain('160.000 km');
    expect(features).toMatch(/6 anos.*fabricados a partir de 2026/);
    expect(features).toMatch(/2025\/2026.*3 anos/);
  });

  it('não promove o preço legado a preço oficial vigente', () => {
    expect(civic.price).toBe(266500);
    expect(civic.features!.join(' ')).toMatch(/preço.*pendente/i);
    const entry = registry.vehicles['honda-civic-advanced-hybrid'];
    expect(entry.fields.price.verificationStatus).toBe('legacy_unverified');
    expect(entry.fields.price.verifiedAt).toBeNull();
    expect(registry.legacyExceptions['honda-civic-advanced-hybrid.price'].reviewCondition).toMatch(/vigente/);
    // A massa não consta no catálogo consultado; não promover dado legado a fonte oficial.
    expect(entry.fields.weight.verificationStatus).toBe('legacy_unverified');
    expect(registry.legacyExceptions['honda-civic-advanced-hybrid.weight'].reason).toContain('1.449');
    for (const field of ['range_km', 'consumption', 'power', 'battery', 'charging', 'availability', 'dimensions', 'trunk']) {
      expect(entry.fields[field].verificationStatus, field).toBe('verified');
      expect(entry.fields[field].sourceType, field).toMatch(/^official_/);
      expect(entry.fields[field].sourceUrl, field).toContain('honda.com.br');
    }
  });

  it('mostra 184 cv no card, em vez dos 89 cv inferidos do preço pelo fallback', () => {
    render(
      <MemoryRouter>
        <CarCard car={civic} onClick={vi.fn()} isSelectedForCompare={false}
          onToggleCompare={vi.fn()} isFavorite={false} onToggleFavorite={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByText('184', { exact: false })).toBeInTheDocument();
    expect(screen.queryByText('89', { exact: true })).not.toBeInTheDocument();
  });
});
