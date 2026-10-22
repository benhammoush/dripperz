/**
 * Verify the static command allowlist, bounded text output and ephemeral keyboard history.
 * @packageDocumentation
 */

import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ShowcaseTerminal } from '../../src/ShowcaseTerminal';

/**
 * Submit one literal string through the prompt's real form.
 * @param command - Input to echo and interpret locally.
 */
function run(command: string) {
  const input = screen.getByRole('textbox', { name: 'Command' });
  fireEvent.change(input, { target: { value: command } });
  fireEvent.submit(input.closest('form')!);
}

test('help and document commands expose only fixed, explicitly followed public links', () => {
  render(<ShowcaseTerminal />);
  run(' HELP ');
  expect(screen.getByRole('log')).toHaveTextContent('report — Club lore PDF');
  run('report');
  run('mugshot');
  const links = within(screen.getByRole('log')).getAllByRole('link');
  expect(links).toHaveLength(2);
  expect(links[0]!.getAttribute('href')).toBe(
    'https://dripperzcyberclub.mypinata.cloud/ipfs/QmNSwRjCrKQDuqc1CthMDX39v1qrWWzFtGU5d445k41tYK',
  );
  expect(links[1]!.getAttribute('href')).toBe(
    'https://dripperzcyberclub.mypinata.cloud/ipfs/QmPfGUovpmDNRJAWGnnkfc543uyoZE4R6FaPWrwyWk1e8L',
  );
  for (const link of links) {
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link).toHaveTextContent('new tab');
  }
  run('clear');
  expect(screen.getByRole('log').childElementCount).toBe(0);
});

test('removed commands, arguments and markup remain inert text', () => {
  const { container } = render(<ShowcaseTerminal />);
  for (const command of [
    'password',
    'song',
    'report https://example.invalid',
    '<img src=x onerror=alert(1)>',
    'constructor',
    '__proto__',
  ])
    run(command);
  expect(screen.getAllByText('Wrong command, type help instead.')).toHaveLength(
    6,
  );
  expect(container.querySelector('img')).toBeNull();
  expect(screen.queryByRole('link')).toBeNull();
  run('   ');
  expect(screen.getAllByText('Wrong command, type help instead.')).toHaveLength(
    6,
  );
});

test('history restores the draft and never intercepts unrelated keys', () => {
  render(<ShowcaseTerminal />);
  run('help');
  run('report');
  const input = screen.getByRole<HTMLInputElement>('textbox', {
    name: 'Command',
  });
  fireEvent.change(input, { target: { value: 'unfinished' } });
  fireEvent.keyDown(input, { key: 'ArrowUp' });
  expect(input.value).toBe('report');
  fireEvent.keyDown(input, { key: 'ArrowUp' });
  expect(input.value).toBe('help');
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  expect(input.value).toBe('report');
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  expect(input.value).toBe('unfinished');
  fireEvent.keyDown(input, { key: 'ArrowUp', ctrlKey: true });
  expect(input.value).toBe('unfinished');
});

test('output and history are bounded and disappear on remount', () => {
  const { unmount } = render(<ShowcaseTerminal />);
  for (let i = 0; i < 35; i++) run(`unknown-${i}`);
  expect(screen.getAllByText('Wrong command, type help instead.')).toHaveLength(
    30,
  );
  expect(screen.queryByText('Terminal/ unknown-0', { exact: true })).toBeNull();
  const input = screen.getByRole<HTMLInputElement>('textbox', {
    name: 'Command',
  });
  for (let i = 0; i < 35; i++) fireEvent.keyDown(input, { key: 'ArrowUp' });
  expect(input.value).toBe('unknown-5');
  expect(input.getAttribute('maxlength')).toBe('160');
  unmount();
  render(<ShowcaseTerminal />);
  expect(screen.getByRole('log').childElementCount).toBe(0);
});

test('the console remains available with no minimize or submit buttons', () => {
  render(<ShowcaseTerminal />);
  run('help');
  expect(screen.queryByRole('button')).toBeNull();
  expect(screen.getByRole('textbox', { name: 'Command' })).toBeInTheDocument();
  expect(screen.getByRole('log')).toHaveTextContent('help — List commands');
});

test('the persistent prompt replaces the welcome message', () => {
  const { container } = render(<ShowcaseTerminal />);
  expect(screen.queryByText(/Welcome/)).toBeNull();
  expect(container.querySelector('label')?.textContent).toBe(
    'Terminal/Command',
  );
});
