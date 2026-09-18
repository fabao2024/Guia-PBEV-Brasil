import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import CarDetailsModal from '../components/CarDetailsModal';
import { CAR_DB } from '../constants';
import { powertrainLabel } from '../utils/powertrain';
import '../i18n';

const kwid = CAR_DB.find(car => car.model === 'Kwid E-Tech')!;
const dolphin = CAR_DB.find(car => car.model === 'Dolphin Mini GS')!;
const originalShare = Object.getOwnPropertyDescriptor(navigator, 'share');
const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

function renderDetails(overrides: Partial<ComponentProps<typeof CarDetailsModal>> = {}) {
  const props = {
    car: kwid,
    onClose: vi.fn(),
    isSelectedForCompare: false,
    onToggleCompare: vi.fn(),
    isFavorite: false,
    onToggleFavorite: vi.fn(),
    ...overrides,
  };
  const view = render(<CarDetailsModal {...props} />);
  return { ...view, props };
}

function mockSharing(share?: ReturnType<typeof vi.fn>) {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'share', { configurable: true, value: share });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  return { writeText };
}

beforeEach(() => {
  window.history.replaceState(null, '', '/?utm_source=teste#catalogo');
});

afterEach(() => {
  if (originalShare) Object.defineProperty(navigator, 'share', originalShare);
  else Reflect.deleteProperty(navigator, 'share');
  if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
  else Reflect.deleteProperty(navigator, 'clipboard');
  vi.useRealTimers();
  window.history.replaceState(null, '', '/');
});

const shareCases = [
  { car: kwid, url: 'https://guiapbev.cloud/carro/renault-kwid-e-tech/' },
  { car: dolphin, url: 'https://guiapbev.cloud/carro/byd-dolphin-mini-gs/' },
];

describe('CarDetailsModal — compartilhamento canônico', () => {
  it.each(shareCases)('envia o payload nativo de $car.model, não a URL do catálogo', async ({ car, url }) => {
    const share = vi.fn().mockResolvedValue(undefined);
    const { writeText } = mockSharing(share);
    renderDetails({ car });

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Compartilhar' })));

    expect(share).toHaveBeenCalledExactlyOnceWith({
      title: car.model,
      text: `${car.model} – R$ ${car.price.toLocaleString('pt-BR')} – ${car.range} km | ${powertrainLabel(car)} | Guia PBEV`,
      url,
    });
    expect(writeText).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe('/');
  });

  it.each(shareCases)('copia apenas a URL canônica de $car.model no fallback', async ({ car, url }) => {
    vi.useFakeTimers();
    const { writeText } = mockSharing();
    renderDetails({ car });

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Compartilhar' })));

    expect(writeText).toHaveBeenCalledExactlyOnceWith(url);
    expect(screen.getByText('Copiado!')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(3500));
    expect(screen.queryByText('Copiado!')).not.toBeInTheDocument();
  });

  it('não copia o link ao cancelar o compartilhamento nativo', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('Cancelado', 'AbortError'));
    const { writeText } = mockSharing(share);
    renderDetails();

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Compartilhar' })));

    expect(share).toHaveBeenCalledOnce();
    expect(writeText).not.toHaveBeenCalled();
    expect(screen.queryByText('Copiado!')).not.toBeInTheDocument();
  });
});

describe('CarDetailsModal — contrato mobile das ações', () => {
  // happy-dom não calcula layout: estas asserções protegem as regras responsivas,
  // não substituem a medição visual de overflow em um navegador.
  it('permite quebra das ações e reserva uma linha inteira para wallbox', () => {
    renderDetails({ onLeadRequest: vi.fn() });
    const wallbox = screen.getByRole('button', { name: 'Solicitar wallbox para este EV' });
    const actions = wallbox.parentElement!;
    const details = screen.getByRole('heading', { name: kwid.model }).parentElement!;

    expect(actions).toHaveClass('flex', 'flex-wrap', 'min-w-0');
    expect(details).toHaveClass('min-w-0');
    expect(wallbox).toHaveClass('w-full', 'basis-full', 'min-w-0', 'min-h-[44px]');
    expect(wallbox).not.toHaveClass('whitespace-nowrap');
  });

  it('mantém as ações compactas com alvos mínimos de 44px', () => {
    renderDetails();
    for (const name of ['Comparar', 'Favoritar', 'Compartilhar']) {
      const button = screen.getByRole('button', { name });
      expect(button).toHaveClass('min-h-[44px]', 'min-w-[44px]');
    }
    expect(screen.getByRole('button', { name: 'Favoritar' })).toHaveClass('shrink-0');
    expect(screen.getByRole('button', { name: 'Compartilhar' })).toHaveClass('shrink-0');
  });

  it('preserva os callbacks de comparação, favorito e interesse', () => {
    const onLeadRequest = vi.fn();
    const { props } = renderDetails({ onLeadRequest });

    fireEvent.click(screen.getByRole('button', { name: 'Comparar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Favoritar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar wallbox para este EV' }));

    expect(props.onToggleCompare).toHaveBeenCalledOnce();
    expect(props.onToggleFavorite).toHaveBeenCalledOnce();
    expect(onLeadRequest).toHaveBeenCalledOnce();
  });

  it('não oferece wallbox sem o callback autorizado pelo componente pai', () => {
    renderDetails({ isSelectedForCompare: true, isFavorite: true });

    expect(screen.queryByRole('button', { name: /solicitar wallbox/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Comparando' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remover Favorito' })).toBeInTheDocument();
  });

  it('nomeia o fechamento da ficha e garante alvo de 44px', () => {
    const { props } = renderDetails();
    const close = screen.getByRole('button', { name: 'Fechar ficha técnica' });

    expect(close).toHaveClass('min-h-[44px]', 'min-w-[44px]');
    fireEvent.click(close);
    expect(props.onClose).toHaveBeenCalledOnce();
  });
});
