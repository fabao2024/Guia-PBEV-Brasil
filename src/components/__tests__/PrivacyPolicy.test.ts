import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const policy = readFileSync(resolve(process.cwd(), 'public/privacy.html'), 'utf8');

describe('Política de Privacidade do piloto de leads', () => {
  it('declara o limite handoff-only sem prometer identificação prévia do parceiro', () => {
    expect(policy).toMatch(
      /não acompanha se o parceiro entrou em contato, apresentou proposta, realizou venda, contratação ou executou o serviço/i,
    );
    expect(policy).toMatch(
      /tratamento posterior pelo parceiro segue a relação direta dele com o titular/i,
    );
    expect(policy).not.toMatch(/informado antes do compartilhamento/i);
    expect(policy).not.toMatch(/o parceiro usará os dados apenas para entrar em contato/i);
  });
});
