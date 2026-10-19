/**
 * Exercise local-only lookup/composition, keyboard use, responsive layout and recoverable failures.
 * @packageDocumentation
 */

import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { openShowcase } from './openShowcase';

const snapshot = readFileSync('public/rarity/collection.json', 'utf8');

for (const width of [1440, 768, 390]) {
  test(`offline rarity lookup and composition at ${width}px`, async ({
    page,
    baseURL,
  }, testInfo) => {
    const external: string[] = [];
    const metadata: string[] = [];
    page.on('request', (request) => {
      if (new URL(request.url()).origin !== new URL(baseURL!).origin)
        external.push(request.url());
      if (request.url().endsWith('/rarity/collection.json'))
        metadata.push(request.url());
    });
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1024 });
    await openShowcase(page);
    expect(metadata).toEqual([]);
    const region = page.locator('#rarity');
    await region.scrollIntoViewIfNeeded();
    await expect(
      region.getByRole('heading', { name: 'Dripperz #0001' }),
    ).toBeVisible();
    await expect(
      region.getByText('3056 / 5555', { exact: true }),
    ).toBeVisible();
    await expect(region.getByText('110.0', { exact: true })).toBeVisible();
    await expect(
      region.getByRole('img', { name: 'Dripperz #0001 composed artwork' }),
    ).toHaveAttribute('aria-busy', 'false');
    const input = region.getByRole('textbox', { name: 'Token ID' });
    for (const [id, rank, score] of [
      ['2940', '1 / 5555', '3019.8'],
      ['5555', '2988 / 5555', '111.4'],
      ['54', '2207 / 5555', '127.0'],
    ]) {
      await input.fill(id!);
      await input.press('Enter');
      await expect(
        region.getByRole('heading', {
          name: `Dripperz #${id!.padStart(4, '0')}`,
        }),
      ).toBeVisible();
      await expect(region.getByText(rank!, { exact: true })).toBeVisible();
      await expect(region.getByText(score!, { exact: true })).toBeVisible();
    }
    await expect(
      region.getByRole('cell', { name: 'Sailor Tee', exact: true }),
    ).toBeVisible();
    await expect(
      region.getByRole('img', { name: 'Dripperz #0054 composed artwork' }),
    ).toHaveAttribute('aria-busy', 'false');
    await input.fill('5556');
    await input.press('Enter');
    await expect(region.getByRole('alert')).toContainText('whole token ID');
    await expect(
      region.getByRole('heading', { name: 'Dripperz #0054' }),
    ).toBeVisible();
    expect(metadata).toHaveLength(1);
    expect(external).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await region.screenshot({
      path: testInfo.outputPath('rarity-explorer.png'),
    });
  });
}

test('unavailable local data retries only through user action', async ({
  page,
}) => {
  let attempts = 0;
  await page.route('**/rarity/collection.json', (route) => {
    attempts += 1;
    return route.fulfill({
      status: attempts === 1 ? 503 : 200,
      contentType: 'application/json',
      body: attempts === 1 ? '{}' : snapshot,
    });
  });
  await openShowcase(page);
  const region = page.locator('#rarity');
  await region.scrollIntoViewIfNeeded();
  await expect(region.getByRole('alert')).toContainText('data is unavailable');
  expect(attempts).toBe(1);
  await region.getByRole('button', { name: 'Retry rarity data' }).click();
  await expect(
    region.getByRole('heading', { name: 'Dripperz #0001' }),
  ).toBeVisible();
  expect(attempts).toBe(2);
});

test('a failed layer leaves attributes and rankings usable', async ({
  page,
}) => {
  await page.route('**/rarity/layers/*.png', (route) => route.abort());
  await openShowcase(page);
  const region = page.locator('#rarity');
  await region.scrollIntoViewIfNeeded();
  await expect(region.getByText(/Artwork unavailable/)).toBeVisible();
  await expect(region.getByText('3056 / 5555', { exact: true })).toBeVisible();
  await expect(
    region.getByRole('cell', { name: 'Midas Vest', exact: true }),
  ).toBeVisible();
});
