import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ELETRIBRASIL_MODEL } from '../config/aiModels';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('EletriBrasil model configuration', () => {
  it('uses Gemini 3.5 Flash-Lite for consultant conversations', () => {
    expect(ELETRIBRASIL_MODEL).toBe('gemini-3.5-flash-lite');
  });

  it('uses the current Google Gen AI SDK instead of the legacy package', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));

    expect(packageJson.dependencies['@google/genai']).toBeDefined();
    expect(packageJson.dependencies['@google/generative-ai']).toBeUndefined();
  });

  it('uses the shared consultant model in both the API call and tracing', () => {
    const widget = fs.readFileSync(path.join(repoRoot, 'src/components/ChatWidget.tsx'), 'utf8');

    expect(widget).toContain("from '@google/genai'");
    expect(widget).toContain('model: ELETRIBRASIL_MODEL');
    expect(widget).toContain('model: ELETRIBRASIL_MODEL, lang:');
    expect(widget).toContain('temperature: 0.3');
    expect(widget).not.toContain('gemini-2.5-flash-lite');
  });

  it('describes the source as the current Guia PBEV catalog in both languages', () => {
    const widget = fs.readFileSync(path.join(repoRoot, 'src/components/ChatWidget.tsx'), 'utf8');

    expect(widget).not.toContain('PBEV 2025');
    expect(widget).toContain('current Guia PBEV Brasil catalog');
    expect(widget).toContain('catálogo atual do Guia PBEV Brasil');
    expect(widget).toContain('exclusivamente em português do Brasil');
  });
});
