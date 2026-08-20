import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ChatWidget from '../ChatWidget';

vi.mock('../../utils/analytics', () => ({ track: vi.fn() }));

describe('ChatWidget WhatsApp CTA', () => {
  it('shows a direct WhatsApp link after opening the widget', async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('link', { name: /continuar no whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/551133958879'),
    );
  });
});
