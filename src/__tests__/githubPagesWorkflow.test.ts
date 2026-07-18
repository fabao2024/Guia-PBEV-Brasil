import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const workflow = readFileSync(
  resolve(process.cwd(), '.github/workflows/deploy.yml'),
  'utf8',
);

const deployJob = workflow.slice(workflow.indexOf('\n  deploy:'));

describe('GitHub Pages workflow hardening', () => {
  it('pins only official Actions to immutable SHAs', () => {
    expect(workflow).toContain(
      'actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7.0.0',
    );
    expect(workflow).toContain(
      'actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0',
    );
    expect(workflow).toContain(
      'actions/configure-pages@45bfe0192ca1faeb007ade9deae92b16b8254a0d # v6.0.0',
    );
    expect(workflow).toContain(
      'actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9 # v5.0.0',
    );
    expect(workflow).toContain(
      'actions/deploy-pages@cd2ce8fcbc39b97be8ca5fce6e763baed58fa128 # v5.0.0',
    );
    expect(workflow).not.toContain('JamesIves/');
    expect(workflow).not.toMatch(/uses:\s+[^\s@]+@v\d/);
  });

  it('uses fixed runners, timeouts and non-cancelling concurrency', () => {
    expect(workflow.match(/runs-on: ubuntu-24\.04/g)?.length).toBe(2);
    expect(workflow.match(/timeout-minutes:/g)?.length).toBe(2);
    expect(workflow).toContain('cancel-in-progress: false');
  });

  it('keeps global permissions read-only and scopes Pages writes to deploy', () => {
    expect(workflow).toMatch(/permissions:\n  contents: read/);
    expect(deployJob).toContain('pages: write');
    expect(deployJob).toContain('id-token: write');
    expect(deployJob).not.toContain('contents: write');
  });

  it('builds PRs but deploys only main push or manual runs', () => {
    expect(deployJob).toContain("github.ref == 'refs/heads/main'");
    expect(deployJob).toContain("github.event_name != 'pull_request'");
    expect(workflow).toContain('path: dist');
  });

  it('fails the build if the custom domain is absent from the artifact', () => {
    expect(workflow).toContain('test -f dist/CNAME');
    expect(workflow).toContain(
      'test "$(cat dist/CNAME)" = "guiapbev.cloud"',
    );
  });
});
