/**
 * Verify token lookup, metadata/image failures and cancellation without fetching remote data.
 * @packageDocumentation
 */

import { readFileSync } from 'node:fs';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
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
  const input = screen.getByRole('textbox', { name: 'Dripperz ID' });
  fireEvent.change(input, { target: { value: '2940' } });
  fireEvent.submit(input.closest('form')!);
  expect(
    screen.getByRole('heading', { name: 'Dripperz #2940' }),
  ).toBeInTheDocument();
  expect(screen.getByText('1 / 5555')).toBeInTheDocument();
  expect(screen.getByText('3019.8')).toBeInTheDocument();
  fireEvent.change(input, { target: { value: '1.5' } });
  fireEvent.submit(input.closest('form')!);
  expect(screen.getByRole('alert').textContent).toContain('whole Dripperz ID');
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
  expect(screen.queryByRole('button', { name: 'Reload artwork' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Find Dripperz' }));
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

test('catalog opens on demand, searches every trait and preserves token selection', async () => {
  const request = vi.fn().mockResolvedValue(Response.json(fixture));
  vi.stubGlobal('fetch', request);
  const { container } = render(<RarityExplorer />);
  await screen.findByRole('heading', { name: 'Dripperz #0001' });
  expect(container.querySelector('.rarity-catalog img')).toBeNull();
  const toggle = screen.getByRole('button', { name: 'Display rarity catalog' });
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  fireEvent.click(toggle);
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
  const results = screen.getByRole('list', { name: 'Trait catalog results' });
  expect(within(results).getAllByRole('listitem')).toHaveLength(128);
  expect(screen.getByText('128 of 128 traits')).toBeInTheDocument();
  const search = screen.getByRole('searchbox', {
    name: 'Search by trait name',
  });
  fireEvent.change(search, { target: { value: '  kArTiEr  ' } });
  const card = within(results).getByRole('listitem');
  expect(
    within(card).getByRole('heading', { name: 'Kartier' }),
  ).toBeInTheDocument();
  expect(within(card).getByText('2777.5')).toBeInTheDocument();
  expect(within(card).getByText('2 / 5555')).toBeInTheDocument();
  fireEvent.change(screen.getByRole('combobox', { name: 'Category' }), {
    target: { value: 'BODY' },
  });
  expect(screen.getByText('0 of 128 traits')).toBeInTheDocument();
  expect(screen.getByText(/No matching traits/)).toBeInTheDocument();
  fireEvent.change(search, { target: { value: '' } });
  expect(screen.getByText('6 of 128 traits')).toBeInTheDocument();
  expect(
    within(
      screen.getByRole('list', { name: 'Trait catalog results' }),
    ).getAllByRole('listitem'),
  ).toHaveLength(6);
  fireEvent.click(toggle);
  expect(container.querySelector('.rarity-catalog img')).toBeNull();
  expect(
    screen.getByRole('heading', { name: 'Dripperz #0001' }),
  ).toBeInTheDocument();
  expect(screen.getByText('3056 / 5555')).toBeInTheDocument();
  expect(request).toHaveBeenCalledOnce();
});

test('catalog image failure keeps trait facts visible and allows retry', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(fixture)));
  render(<RarityExplorer />);
  await screen.findByRole('heading', { name: 'Dripperz #0001' });
  fireEvent.click(
    screen.getByRole('button', { name: 'Display rarity catalog' }),
  );
  fireEvent.change(
    screen.getByRole('searchbox', { name: 'Search by trait name' }),
    {
      target: { value: 'Kartier' },
    },
  );
  const image = screen.getByRole('img', { name: 'HEAD: Kartier' });
  const asset = image.getAttribute('src');
  expect(image.getAttribute('loading')).toBe('lazy');
  fireEvent.error(image);
  expect(screen.getByText('Preview unavailable')).toBeInTheDocument();
  expect(screen.getByText('2777.5')).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', { name: 'Retry Kartier preview' }),
  );
  expect(
    screen.getByRole('img', { name: 'HEAD: Kartier' }).getAttribute('src'),
  ).toBe(asset);
});
