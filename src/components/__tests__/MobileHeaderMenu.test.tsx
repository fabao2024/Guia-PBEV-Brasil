import { render, screen, fireEvent } from '@testing-library/react';
import '../../i18n';
import MobileHeaderMenu from '../MobileHeaderMenu';

it('preserves partner/language/suggestion access in a dismissible secondary menu', () => {
  const onSuggestChat = vi.fn();
  render(<MobileHeaderMenu onSuggestChat={onSuggestChat} />);
  const toggle = screen.getByRole('button', { name: 'Mais opções' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('link', { name: 'Programa de parceiros' })).toHaveAttribute('href', '/parceiros/');
  expect(screen.getByRole('link', { name: 'Sugerir EV pelo GitHub' })).toHaveAttribute('href', expect.stringContaining('template=sugestao-ev.yml'));
  expect(screen.getByTitle('Switch to English')).toBeInTheDocument();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(toggle).toHaveFocus();
  fireEvent.click(toggle);
  fireEvent.click(screen.getByRole('button', { name: 'Sugerir EV pelo Consultor IA' }));
  expect(onSuggestChat).toHaveBeenCalledOnce();
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
});
it('dismisses the menu when a pointer is pressed outside', () => {
  render(<MobileHeaderMenu onSuggestChat={vi.fn()} />);
  const toggle = screen.getByRole('button', { name: 'Mais opções' });
  fireEvent.click(toggle);
  fireEvent.pointerDown(document.body);
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
});
