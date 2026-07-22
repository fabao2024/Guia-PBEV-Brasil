import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), 'utf8');

const weekly = read('.github/workflows/weekly-ev-suggestions.yml');
const monthly = read('.github/workflows/monthly-maintenance.yml');
const anpScript = read('.github/scripts/update-anp-prices.mjs');
const aneelScript = read('.github/scripts/update-aneel-tariffs.mjs');
const newsScript = read('.github/scripts/check-ev-news.mjs');

const assertImmutableActionPins = (workflow: string) => {
  const refs = [...workflow.matchAll(/uses:\s+([^\s@]+)@([^\s]+)/g)];
  expect(refs.length).toBeGreaterThan(0);
  for (const [, action, ref] of refs) {
    expect(`${action}@${ref}`).toMatch(/^[^@]+@[0-9a-f]{40}$/);
  }
};

const job = (workflow: string, name: string, nextName?: string) => {
  const start = workflow.indexOf(`\n  ${name}:`);
  const end = nextName ? workflow.indexOf(`\n  ${nextName}:`, start + 1) : workflow.length;
  return workflow.slice(start, end);
};

describe('scheduled automation workflow hardening', () => {
  it('pins every Action to an immutable SHA', () => {
    assertImmutableActionPins(weekly);
    assertImmutableActionPins(monthly);
    expect(weekly).toContain(
      'actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7.0.0',
    );
    expect(monthly).toContain(
      'actions/github-script@3a2844b7e9c422d3c10d287c895573f7108da1b3 # v9.0.0',
    );
  });

  it('uses fixed runners, timeouts and serialized schedules', () => {
    expect(weekly).not.toContain('ubuntu-latest');
    expect(monthly).not.toContain('ubuntu-latest');
    expect(weekly).toContain('runs-on: ubuntu-24.04');
    expect(weekly).toContain('timeout-minutes: 15');
    expect(weekly).toContain('cancel-in-progress: false');
    expect(monthly.match(/runs-on: ubuntu-24\.04/g)?.length).toBe(4);
    expect(monthly.match(/timeout-minutes:/g)?.length).toBe(4);
    expect(monthly).toContain('cancel-in-progress: false');
  });

  it('always checks out main for scheduled write automation', () => {
    expect(weekly.match(/ref: main/g)?.length).toBe(1);
    expect(monthly.match(/ref: main/g)?.length).toBe(4);
  });

  it('scopes weekly permissions to the only write job', () => {
    expect(weekly).toMatch(/permissions:\n  contents: read/);
    const processJob = job(weekly, 'process-suggestions');
    expect(processJob).toContain('contents: write');
    expect(processJob).toContain('issues: write');
    expect(processJob).toContain('pull-requests: write');
  });

  it('scopes monthly permissions by actual side effect', () => {
    expect(monthly).toMatch(/permissions:\n  contents: read/);

    const anp = job(monthly, 'update-fuel-prices', 'check-pbev');
    expect(anp).toContain('contents: write');
    expect(anp).toContain('pull-requests: write');
    expect(anp).not.toContain('issues: write');

    const pbev = job(monthly, 'check-pbev', 'update-aneel-tariffs');
    expect(pbev).toContain('contents: read');
    expect(pbev).toContain('issues: write');
    expect(pbev).not.toContain('contents: write');

    const aneel = job(monthly, 'update-aneel-tariffs', 'create-maintenance-issue');
    expect(aneel).toContain('contents: write');
    expect(aneel).toContain('pull-requests: write');
    expect(aneel).not.toContain('issues: write');

    const report = job(monthly, 'create-maintenance-issue');
    expect(report).toContain('contents: read');
    expect(report).toContain('issues: write');
    expect(report).toContain('if: always()');
  });

  it('does not mask data job failures or push metadata directly to main', () => {
    expect(monthly.match(/continue-on-error: true/g)?.length).toBe(2);
    expect(aneelScript).not.toContain("run('git push origin main')");
  });

  it('runs Git and GitHub CLI without shell command interpolation', () => {
    for (const script of [anpScript, aneelScript]) {
      expect(script).not.toContain('execSync(');
      expect(script).not.toMatch(/run\(`|run\('git |run\(`gh /);
      expect(script).toContain('runFile(');
    }
  });

  it('keeps remotely derived pull-request bodies out of command-line arguments', () => {
    for (const script of [anpScript, aneelScript]) {
      expect(script).toContain("'--body-file', '-'");
      expect(script).not.toContain("'--body', prBody");
      expect(script).toMatch(/runFile\('gh',[\s\S]*\{ input: prBody \}\);/);
    }
  });

  it('uses a single-pass XML entity decoder for RSS content', () => {
    expect(newsScript).toContain("from './security-utils.mjs'");
    expect(newsScript).not.toMatch(/\.replace\(\/&amp;\/g/);
  });
});
