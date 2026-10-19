/**
 * Verify token lookup, metadata/image failures and cancellation without fetching remote data.
 * @packageDocumentation
 */

import { readFileSync } from 'node:fs';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import RarityExplorer from '../../src/RarityExplorer';

const fixture: unknown = JSON.parse(
  readFileSync('public/rarity/collection.json', 'utf8'),
);
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test('keyboard submission selects the same token for name, traits, score and rank', async () => {
  const request = vi.fn().mockResolvedValue(Response.json(fixture));
  vi.stubGlobal('fetch', request);
  render(<RarityExplorer />);
  expect(
    await screen.findByRole('heading', { name: 'Dripperz #0001' }),
  ).toBeInTheDocument();
  expect(screen.getByText('3056 / 5555')).toBeInTheDocument();
  const input = screen.getByRole('textbox', { name: 'Token ID' });
  fireEvent.change(input, { target: { value: '2940' } });
  fireEvent.submit(input.closest('form')!);
  expect(
    screen.getByRole('heading', { name: 'Dripperz #2940' }),
  ).toBeInTheDocument();
  expect(screen.getByText('1 / 5555')).toBeInTheDocument();
  expect(screen.getByText('3019.8')).toBeInTheDocument();
  fireEvent.change(input, { target: { value: '1.5' } });
  fireEvent.submit(input.closest('form')!);
  expect(screen.getByRole('alert').textContent).toContain('whole token ID');
  expect(
    screen.getByRole('heading', { name: 'Dripperz #2940' }),
  ).toBeInTheDocument();
  expect(request).toHaveBeenCalledOnce();
});

test('failed or malformed metadata can be retried explicitly', async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ bad: true }))
    .mockResolvedValueOnce(Response.json(fixture));
  vi.stubGlobal('fetch', request);
  render(<RarityExplorer />);
  expect(await screen.findByRole('alert')).toBeInTheDocument();
  expect(request).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('button', { name: 'Retry rarity data' }));
  expect(
    await screen.findByRole('heading', { name: 'Dripperz #0001' }),
  ).toBeInTheDocument();
  expect(request).toHaveBeenCalledTimes(2);
});

test('image failures do not hide stored facts and artwork can be retried', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(() => Promise.resolve(Response.json(fixture))),
  );
  const { container } = render(<RarityExplorer />);
  await screen.findByRole('heading', { name: 'Dripperz #0001' });
  fireEvent.error(container.querySelector('.rarity-art img')!);
  expect(screen.getByRole('status').textContent).toContain(
    'Artwork unavailable',
  );
  expect(screen.getByText('3056 / 5555')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Reload artwork' }));
  for (const image of container.querySelectorAll('.rarity-art img'))
    fireEvent.load(image);
  expect(screen.queryByText(/Artwork unavailable/)).toBeNull();
  expect(
    screen
      .getByRole('img', { name: 'Dripperz #0001 composed artwork' })
      .getAttribute('aria-busy'),
  ).toBe('false');
});

test('unmount aborts the owned metadata request', async () => {
  const request = vi
    .fn()
    .mockImplementation(() => new Promise<Response>(() => {}));
  vi.stubGlobal('fetch', request);
  const { unmount } = render(<RarityExplorer />);
  await waitFor(() => expect(request).toHaveBeenCalledOnce());
  const signal = (request.mock.calls[0]![1] as RequestInit).signal!;
  expect(signal.aborted).toBe(false);
  unmount();
  expect(signal.aborted).toBe(true);
});
