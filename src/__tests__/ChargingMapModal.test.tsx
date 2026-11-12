import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ChargingMapModal } from '../components/ChargingMapModal';
import { searchOsmChargers } from '../services/overpassService';
import { SOURCED_CHARGERS } from '../data/sourcedChargers';
import { CHARGER_SOURCE_SUMMARIES, LOCAL_MAP_CHARGERS } from '../data/localChargers';
import { stubExternalFrames } from '../test/stubExternalFrames';
import '../i18n';

stubExternalFrames();

const mocks = vi.hoisted(() => {
  const layers: unknown[] = [];
  const map = { remove: vi.fn(), closePopup: vi.fn(), setView: vi.fn(), fitBounds: vi.fn(), on: vi.fn(), invalidateSize: vi.fn(),
    latLngToLayerPoint: vi.fn(([lat, lng]: [number, number]) => ({ x: lng * 1000, y: lat * 1000 })),
    eachLayer: (fn: (layer: unknown) => void) => layers.forEach(fn), removeLayer: vi.fn(),
    getSize: () => ({ x: 960, y: 480 }), getZoom: vi.fn(() => 4), getBounds: () => ({ getSouth: () => -24, getNorth: () => -23, getWest: () => -48, getEast: () => -47 }) };
  return { map, icons: vi.fn((options: { html: HTMLElement }) => options), tiles: vi.fn(() => ({ addTo: vi.fn() })), markers: vi.fn((_point: [number, number], _options: { title?: string; icon: { html: HTMLElement } }) => ({
    bindPopup: vi.fn(), addTo: vi.fn(), openPopup: vi.fn(), on: vi.fn((_event: string, _callback: () => void) => {}), setIcon: vi.fn((_icon: { html: HTMLElement }) => {}), setZIndexOffset: vi.fn(),
    bindTooltip: vi.fn(), unbindTooltip: vi.fn(), openTooltip: vi.fn(), getElement: () => document.createElement('div'),
  })) };
});
vi.mock('leaflet', () => ({
  Icon: { Default: { prototype: {}, mergeOptions: vi.fn() } },
  map: () => mocks.map,
  tileLayer: mocks.tiles, marker: mocks.markers, divIcon: mocks.icons,
}));
vi.mock('../services/overpassService', () => ({ searchOsmChargers: vi.fn() }));
vi.mock('../data/localChargers', async () => {
  const { SOURCED_CHARGERS } = await import('../data/sourcedChargers');
  return { LOCAL_MAP_CHARGERS: [...SOURCED_CHARGERS], LOCAL_CHARGER_RETRIEVED_AT: '2026-11-09',
    CHARGER_SOURCE_SUMMARIES: [{ id: 'ocm-archive', kind: 'archive', source: 'Open Charge Map', retrievedAt: '2026-11-09', snapshotAt: '2026-04-22', count: 7 }] };
});
beforeEach(() => {
  vi.clearAllMocks(); mocks.map.getZoom.mockReturnValue(4);
  mocks.map.latLngToLayerPoint.mockImplementation(([lat, lng]) => ({ x: lng * 1000, y: lat * 1000 }));
  LOCAL_MAP_CHARGERS.splice(0, LOCAL_MAP_CHARGERS.length, ...SOURCED_CHARGERS);
  CHARGER_SOURCE_SUMMARIES.splice(0, CHARGER_SOURCE_SUMMARIES.length, { id: 'ocm-archive', kind: 'archive', source: 'Open Charge Map', retrievedAt: '2026-11-09', snapshotAt: '2026-04-22', count: 7 });
});

it('opens locally without Carregados requests and preserves local filters and selection across source changes', async () => {
  const { container } = render(<ChargingMapModal onClose={vi.fn()} />);
  const local = screen.getByRole('button', { name: 'Base local' });
  const other = screen.getByRole('button', { name: 'Carregados · mapa externo' });
  expect(local).toHaveAttribute('aria-pressed', 'true');
  expect(container.querySelector('iframe')).toBeNull();
  await waitFor(() => expect(screen.getByLabelText('Abrir estação')).toBeEnabled());
  fireEvent.change(screen.getByLabelText('Operador informado'), { target: { value: 'Copel' } });
  fireEvent.change(screen.getByLabelText('Abrir estação'), { target: { value: String(SOURCED_CHARGERS[1].id) } });
  fireEvent.click(other);
  expect(other).toHaveAttribute('aria-pressed', 'true');
  expect(screen.queryByRole('button', { name: 'Buscar nesta área' })).not.toBeInTheDocument();
  expect(container.querySelector('iframe')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Carregar mapa Carregados' }));
  expect(container.querySelectorAll('iframe')).toHaveLength(1);
  fireEvent.click(local);
  expect(container.querySelector('iframe')).toBeNull();
  expect(screen.getByLabelText('Operador informado')).toHaveValue('Copel');
  expect(screen.getByLabelText('Abrir estação')).toHaveValue(String(SOURCED_CHARGERS[1].id));
  expect(screen.getByText('1 aproximadas · 0 confirmadas')).toBeInTheDocument();
  expect(mocks.map.remove).not.toHaveBeenCalled();
  expect(searchOsmChargers).not.toHaveBeenCalled();
  fireEvent.click(other);
  expect(container.querySelector('iframe')).toBeNull();
  expect(screen.getByRole('button', { name: 'Carregar mapa Carregados' })).toBeInTheDocument();
});

it('distinguishes the archive date, public-listing observation and OSM extract rather than calling everything an April export', () => {
  CHARGER_SOURCE_SUMMARIES.push(
    { id: 'ocm-current', kind: 'listings', source: 'Open Charge Map', retrievedAt: '2026-11-09', snapshotAt: '2026-11-09', count: 100 },
    { id: 'osm', kind: 'extract', source: 'OpenStreetMap', retrievedAt: '2026-11-09', snapshotAt: '2026-11-08', count: 1 },
  );
  render(<ChargingMapModal onClose={vi.fn()} />);
  expect(screen.getByLabelText('Fontes e datas da base')).toHaveTextContent('Arquivo OCM: 2026-04-22');
  expect(screen.getByLabelText('Fontes e datas da base')).toHaveTextContent('Fichas OCM: 2026-11-09');
  expect(screen.getByLabelText('Fontes e datas da base')).toHaveTextContent('Extrato OSM: 2026-11-08');
  expect(screen.getByText(/Base local: Open Charge Map \+ OpenStreetMap/)).toBeInTheDocument();
  expect(searchOsmChargers).not.toHaveBeenCalled();
});

it('hides legacy claims by default and only shows them in a clearly labeled review mode', async () => {
  render(<ChargingMapModal onClose={vi.fn()} />);
  expect(screen.getByText(/159 registros legados/)).toBeInTheDocument();
  expect(screen.getByText(/7 registros de locais com fonte disponíveis sem consulta externa/)).toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Buscar nesta área' })).toBeEnabled());
  expect(mocks.tiles).toHaveBeenCalledWith('https://tile.openstreetmap.org/{z}/{x}/{y}.png', expect.objectContaining({ attribution: expect.stringContaining('OpenStreetMap') }));
  await waitFor(() => expect(mocks.markers).toHaveBeenCalledTimes(7));
  expect(searchOsmChargers).not.toHaveBeenCalled();
  const station = SOURCED_CHARGERS[0];
  fireEvent.change(screen.getByLabelText('Abrir estação'), { target: { value: String(station.id) } });
  expect(mocks.map.setView).toHaveBeenCalledWith([station.lat, station.lng], 14, { animate: false });
  expect(mocks.markers.mock.results[0].value.openPopup).toHaveBeenCalled();
  mocks.markers.mockClear();
  fireEvent.change(screen.getByLabelText('Qualidade da localização'), { target: { value: 'unverified' } });
  await waitFor(() => expect(mocks.markers.mock.calls.reduce((sum, [, options]) =>
    sum + (options.icon.html.dataset.chargerId ? 1 : Number(options.icon.html.textContent)), 0)).toBe(159));
  expect(mocks.markers.mock.calls.every(([, options]) => !options.title?.includes('kW'))).toBe(true);
  expect(screen.getByLabelText('Potência mínima')).toBeDisabled();
  expect(screen.getByText(/Não use os registros em revisão para navegar/)).toBeInTheDocument();
});

it('frames stations on first load and offers a reset without fetching or discarding filters', async () => {
  render(<ChargingMapModal onClose={vi.fn()} />);
  await waitFor(() => expect(mocks.markers).toHaveBeenCalledTimes(7));
  expect(mocks.map.fitBounds).toHaveBeenCalledWith(SOURCED_CHARGERS.map(e => [e.lat, e.lng]), expect.objectContaining({ padding: [52, 52] }));
  mocks.map.fitBounds.mockClear();
  fireEvent.change(screen.getByLabelText('Operador informado'), { target: { value: 'Copel' } });
  await waitFor(() => expect(screen.getByText('1 aproximadas · 0 confirmadas')).toBeInTheDocument());
  expect(mocks.map.fitBounds).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Ver todas' }));
  expect(mocks.map.fitBounds).toHaveBeenCalledWith([[SOURCED_CHARGERS[1].lat, SOURCED_CHARGERS[1].lng]], expect.any(Object));
  expect(screen.getByLabelText('Operador informado')).toHaveValue('Copel');
  expect(searchOsmChargers).not.toHaveBeenCalled();
});

it('lets a pin click select the matching station and highlight it with a power label', async () => {
  render(<ChargingMapModal onClose={vi.fn()} />);
  await waitFor(() => expect(mocks.markers).toHaveBeenCalledTimes(7));
  const marker = mocks.markers.mock.results[0].value;
  const opened = marker.on.mock.calls.find(([event]) => event === 'popupopen')![1];
  act(() => opened());
  expect(screen.getByLabelText('Abrir estação')).toHaveValue(String(SOURCED_CHARGERS[0].id));
  await waitFor(() => expect(marker.setZIndexOffset).toHaveBeenCalledWith(1000));
  expect(marker.bindTooltip).toHaveBeenCalledWith(expect.any(HTMLElement), expect.objectContaining({ permanent: true }));
  expect(marker.setIcon.mock.calls.at(-1)?.[0].html.dataset.selected).toBe('true');
});

it('groups overlapping pins with a count and zooms to their coordinates on click', async () => {
  mocks.map.latLngToLayerPoint.mockReturnValue({ x: 0, y: 0 });
  render(<ChargingMapModal onClose={vi.fn()} />);
  await waitFor(() => expect(mocks.markers).toHaveBeenCalledTimes(1));
  const options = mocks.markers.mock.calls[0][1];
  expect(options.title).toContain('7');
  expect(options.icon.html.textContent).toContain('7');
  const marker = mocks.markers.mock.results[0].value;
  expect(marker.bindPopup).not.toHaveBeenCalled();
  mocks.map.fitBounds.mockClear();
  act(() => marker.on.mock.calls.find(([event]) => event === 'click')![1]());
  expect(mocks.map.fitBounds).toHaveBeenCalledWith(SOURCED_CHARGERS.map(e => [e.lat, e.lng]), expect.any(Object));
});

it('requires zoom before searching and displays external locations without claiming physical verification', async () => {
  vi.mocked(searchOsmChargers).mockResolvedValue({ status: 'success', stations: [{
    id: -246, nome: 'Estação teste', operador: 'Rede', cidade: 'São Paulo', uf: 'SP', lat: -23.5, lng: -47.5, potenciaDC: 150, conector: 'CCS2',
    location: { status: 'approximate', source: 'OSM', sourceUrl: 'https://www.openstreetmap.org/node/123', externalId: 'node/123', consultedAt: '2026-11-09' },
  }] });
  render(<ChargingMapModal onClose={vi.fn()} />);
  const search = screen.getByRole('button', { name: 'Buscar nesta área' });
  await waitFor(() => expect(search).toBeEnabled());
  fireEvent.click(search);
  expect(searchOsmChargers).not.toHaveBeenCalled();
  expect(screen.getByRole('status')).toHaveTextContent('Aproxime o mapa');
  mocks.map.getZoom.mockReturnValue(12);
  fireEvent.click(search);
  await waitFor(() => expect(screen.getByText('8 aproximadas · 0 confirmadas')).toBeInTheDocument());
  fireEvent.change(screen.getByLabelText('Qualidade da localização'), { target: { value: 'confirmed' } });
  expect(screen.getByText(/Nenhum ponto com fonte nesta seleção/)).toBeInTheDocument();
});

it('does not silently restore legacy destinations when an external search returns nothing', async () => {
  mocks.map.getZoom.mockReturnValue(12);
  vi.mocked(searchOsmChargers).mockResolvedValue({ status: 'success', stations: [] });
  render(<ChargingMapModal onClose={vi.fn()} />);
  const search = screen.getByRole('button', { name: 'Buscar nesta área' });
  await waitFor(() => expect(search).toBeEnabled());
  fireEvent.click(search);
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Consulta concluída sem novos locais'));
  expect(screen.getByText('7 aproximadas · 0 confirmadas')).toBeInTheDocument();
  expect(screen.queryByText(/registros em revisão$/)).not.toBeInTheDocument();
});

it('opens with local AC and unknown-power records, filters by current and access, and shows the export date separately', async () => {
  LOCAL_MAP_CHARGERS.push(
    { ...SOURCED_CHARGERS[0], id: 990001, nome: 'Local AC', lat: -20, lng: -40, potenciaDC: null, conector: 'Type 2', access: 'customers',
      connections: [{ current: 'AC', powerKw: 22, connector: 'Type 2', quantity: 2 }],
      location: { ...SOURCED_CHARGERS[0].location!, externalId: '890001', sourceUrl: 'https://openchargemap.org/poi/details/890001' } },
    { ...SOURCED_CHARGERS[0], id: 990002, nome: 'Local sem potência', lat: -21, lng: -41, potenciaDC: null, conector: null, connections: [], access: 'unknown',
      location: { ...SOURCED_CHARGERS[0].location!, externalId: '890002', sourceUrl: 'https://openchargemap.org/poi/details/890002' } },
  );
  render(<ChargingMapModal onClose={vi.fn()} />);
  await waitFor(() => expect(mocks.markers).toHaveBeenCalledTimes(9));
  expect(searchOsmChargers).not.toHaveBeenCalled();
  expect(screen.getByText(/Arquivo OCM: 2026-04-22/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Tipo de recarga'), { target: { value: 'AC' } });
  expect(screen.getByText('1 aproximadas · 0 confirmadas')).toBeInTheDocument();
  expect(screen.getByRole('option', { name: /Local AC/ })).toBeInTheDocument();
  expect(screen.queryByRole('option', { name: /Local sem potência/ })).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Acesso informado'), { target: { value: 'public' } });
  expect(screen.getByText(/Nenhum ponto com fonte nesta seleção/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Acesso informado'), { target: { value: 'all' } });
  fireEvent.change(screen.getByLabelText('Tipo de recarga'), { target: { value: 'unknown' } });
  expect(screen.getByRole('option', { name: /Local sem potência/ })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Potência mínima'), { target: { value: '22' } });
  expect(screen.getByText(/Nenhum ponto com fonte nesta seleção/)).toBeInTheDocument();
});

it('does not erase points from earlier searched areas after a successful empty lookup elsewhere', async () => {
  mocks.map.getZoom.mockReturnValue(12);
  const station = { ...SOURCED_CHARGERS[0], id: -888, lat: -20, lng: -40,
    location: { ...SOURCED_CHARGERS[0].location!, source: 'OSM', externalId: 'node/888', sourceUrl: 'https://www.openstreetmap.org/node/888' } };
  vi.mocked(searchOsmChargers).mockResolvedValueOnce({ status: 'success', stations: [station] }).mockResolvedValueOnce({ status: 'success', stations: [] });
  render(<ChargingMapModal onClose={vi.fn()} />);
  const button = screen.getByRole('button', { name: 'Buscar nesta área' });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  await waitFor(() => expect(screen.getByText('8 aproximadas · 0 confirmadas')).toBeInTheDocument());
  fireEvent.click(button);
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Consulta concluída sem novos locais'));
  expect(screen.getByText('8 aproximadas · 0 confirmadas')).toBeInTheDocument();
});

it('refreshes coordinates when successive searches return the same number of stations', async () => {
  mocks.map.getZoom.mockReturnValue(12);
  const station = { id: -246, nome: 'Teste', operador: 'Rede', cidade: '', uf: '', lat: -23.5, lng: -47.5, potenciaDC: 150, conector: 'CCS2' as const,
    location: { status: 'approximate' as const, source: 'OSM', sourceUrl: 'https://www.openstreetmap.org/node/123', externalId: 'node/123', consultedAt: '2026-11-09' } };
  vi.mocked(searchOsmChargers).mockResolvedValueOnce({ status: 'success', stations: [station] }).mockResolvedValueOnce({ status: 'success', stations: [{ ...station, lat: -23.6 }] });
  render(<ChargingMapModal onClose={vi.fn()} />);
  const search = screen.getByRole('button', { name: 'Buscar nesta área' });
  await waitFor(() => expect(search).toBeEnabled());
  fireEvent.click(search);
  await waitFor(() => expect(mocks.markers).toHaveBeenCalledWith([-23.5, -47.5], expect.any(Object)));
  fireEvent.click(search);
  await waitFor(() => expect(mocks.markers).toHaveBeenCalledWith([-23.6, -47.5], expect.any(Object)));
});

it('aborts an in-flight search when the map is closed', async () => {
  mocks.map.getZoom.mockReturnValue(12);
  vi.mocked(searchOsmChargers).mockReturnValue(new Promise(() => {}));
  const { unmount } = render(<ChargingMapModal onClose={vi.fn()} />);
  const search = screen.getByRole('button', { name: 'Buscar nesta área' });
  await waitFor(() => expect(search).toBeEnabled());
  fireEvent.click(search);
  const signal = vi.mocked(searchOsmChargers).mock.calls[0][1]!;
  expect(signal.aborted).toBe(false);
  unmount();
  expect(signal.aborted).toBe(true);
});

it.each(['http', 'network', 'timeout'] as const)('reports %s errors without erasing local or previously retrieved points', async reason => {
  mocks.map.getZoom.mockReturnValue(12);
  const station = { ...SOURCED_CHARGERS[0], id: -999, lat: -23.5, lng: -47.5,
    location: { ...SOURCED_CHARGERS[0].location!, source: 'OSM', externalId: 'node/999', sourceUrl: 'https://www.openstreetmap.org/node/999' } };
  vi.mocked(searchOsmChargers).mockResolvedValueOnce({ status: 'success', stations: [station] })
    .mockResolvedValueOnce({ status: 'error', reason });
  render(<ChargingMapModal onClose={vi.fn()} />);
  const search = screen.getByRole('button', { name: 'Buscar nesta área' });
  await waitFor(() => expect(search).toBeEnabled());
  fireEvent.click(search);
  await waitFor(() => expect(screen.getByText('8 aproximadas · 0 confirmadas')).toBeInTheDocument());
  fireEvent.click(search);
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/Não foi possível|tempo limite/));
  expect(screen.getByText('8 aproximadas · 0 confirmadas')).toBeInTheDocument();
  expect(screen.getByRole('status')).not.toHaveTextContent('Consulta concluída sem novos pontos');
});
