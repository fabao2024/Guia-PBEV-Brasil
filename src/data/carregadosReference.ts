/** Cited aggregate reference, not an imported station dataset or a live counter.
 * Observed on the public market-data page on 2026-11-09. No automated collector.
 */
export const CARREGADOS_REFERENCE = {
  consultedAt: '2026-11-09',
  totalStations: 12_775,
  publicAndFastStations: 9_900,
  marketUrl: 'https://carregados.com.br/dados-sobre-o-mercado-eletrico',
  integrationUrl: 'https://carregados.com.br/compartilhar',
  privacyUrl: 'https://carregados.com.br/politica-de-privacidade',
  mapUrl: 'https://carregados.com.br/mapa',
  embedUrl: 'https://carregados.com.br/embed?lat=-16.7414&lng=-51.9653&z=4&theme=dark&mode=homepage',
} as const;
