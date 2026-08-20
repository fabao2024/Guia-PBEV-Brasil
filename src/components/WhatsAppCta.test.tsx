import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, expect, it } from 'vitest';
import WhatsAppCta from './WhatsAppCta';

const { trackMock } = vi.hoisted(() => ({ trackMock: vi.fn() }));
vi.mock('../utils/analytics', () => ({ track: trackMock }));

describe('WhatsAppCta', () => {
  it('renders a consumer link with the approved label and destination', () => {
    render(<WhatsAppCta audience="consumer" placement="home" />);

    const link = screen.getByRole('link', { name: /continuar no whatsapp/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('https://wa.me/551133958879'));
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('tracks the placement and audience without contact data', async () => {
    const user = userEvent.setup();
    render(<WhatsAppCta audience="partner" placement="partner">Falar com a Guia pelo WhatsApp</WhatsAppCta>);

    await user.click(screen.getByRole('link', { name: /falar com a guia/i }));

    expect(trackMock).toHaveBeenCalledWith('whatsapp_cta_click', {
      placement: 'partner',
      audience: 'partner',
    });
  });
});
