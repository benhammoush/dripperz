/**
 * Exercise the built interim hero and deliberate asset failures without touching hosting.
 * @packageDocumentation
 */

import { expect, test } from '@playwright/test';

test('built interim hero renders on black without HDR controls or requests', async ({
  page,
}) => {
  const assets: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => {
    if (/\.(glb|hdr)(?:\?|$)/.test(request.url())) assets.push(request.url());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const preview = page.getByRole('figure', {
    name: 'Wattson 3D hero',
  });
  await expect(
    page.getByRole('dialog', { name: 'Loading Experience' }),
  ).toBeVisible();
  await expect(preview).toHaveAttribute('data-rendered', 'true', {
    timeout: 90000,
  });
  await expect(
    page.getByRole('dialog', { name: 'Loading Experience' }),
  ).not.toBeVisible();
  await expect(
    page.getByRole('progressbar', {
      name: '3D model download',
      includeHidden: true,
    }),
  ).toHaveAttribute('value', '70102064');
  await expect(preview.locator('.local-hero-stage')).toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  );
  await expect(preview.locator('canvas')).toBeVisible();
  await expect(preview).toHaveAttribute('data-playing', 'true');
  expect(
    assets.filter((url) => url.endsWith('/hero/wattson.glb')),
  ).toHaveLength(1);
  await expect(preview.getByRole('checkbox')).toHaveCount(0);
  await page.getByRole('button', { name: 'Pause effects' }).click();
  await expect(preview).toHaveAttribute('data-playing', 'false');
  await page.getByRole('button', { name: 'Resume effects' }).click();
  await expect(preview).toHaveAttribute('data-playing', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(preview).toHaveAttribute('data-playing', 'false');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(preview).toHaveAttribute('data-playing', 'true');
  await page.locator('#faq').scrollIntoViewIfNeeded();
  await expect(preview).toHaveAttribute('data-playing', 'false');
  await preview.scrollIntoViewIfNeeded();
  await expect(preview).toHaveAttribute('data-playing', 'true');
  await preview.getByRole('button', { name: 'Use static view' }).click();
  await expect(preview.locator('canvas')).toHaveCount(0);
  await expect(
    preview.getByRole('img', { name: 'Wattson character on black' }),
  ).toBeVisible();
  await preview.getByRole('button', { name: /View in 3D/ }).click();
  await expect(preview).toHaveAttribute('data-rendered', 'true', {
    timeout: 30000,
  });
  await expect(preview.getByRole('checkbox')).toHaveCount(0);
  expect(assets.some((url) => /\.hdr(?:\?|$)/.test(url))).toBe(false);
  expect(errors).toEqual([]);
});

test('an unavailable model fails without breaking the showcase or retrying', async ({
  page,
}) => {
  let attempts = 0;
  await page.route('**/hero/wattson.glb', (route) => {
    attempts += 1;
    return route.abort();
  });
  await page.goto('/');
  const preview = page.getByRole('figure', {
    name: 'Wattson 3D hero',
  });
  await expect(preview.getByRole('status')).toContainText('3D unavailable');
  await expect(
    page.getByRole('dialog', { name: 'Loading Experience' }),
  ).not.toBeVisible();
  await expect(
    preview.getByRole('img', { name: 'Wattson character on black' }),
  ).toBeVisible();
  expect(attempts).toBe(1);
  await preview.getByRole('button', { name: 'Use static view' }).click();
  await expect(
    preview.getByRole('img', { name: 'Wattson character on black' }),
  ).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
});

test('HQ rendering uses 2x backing resolution and does not degrade after sustained frames', async ({
  browser,
  baseURL,
}) => {
  const page = await browser.newPage({
    viewport: { width: 960, height: 900 },
    deviceScaleFactor: 2,
  });
  try {
    await page.goto(`${baseURL!}/`);
    const hero = page.getByRole('figure', { name: 'Wattson 3D hero' });
    await expect(hero).toHaveAttribute('data-rendered', 'true', {
      timeout: 90000,
    });
    await expect(hero).toHaveAttribute('data-playing', 'true');
    const canvas = hero.locator('canvas');
    const initial = await canvas.evaluate(
      (element: HTMLCanvasElement) => element.width / element.clientWidth,
    );
    expect(initial).toBeCloseTo(2, 2);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          let count = 0;
          /** Observe enough animation frames to exceed the removed 30-frame downgrade threshold. */
          function frame() {
            count += 1;
            if (count >= 40) resolve();
            else requestAnimationFrame(frame);
          }
          requestAnimationFrame(frame);
        }),
    );
    await expect(hero).toHaveAttribute('data-playing', 'true');
    const sustained = await canvas.evaluate(
      (element: HTMLCanvasElement) => element.width / element.clientWidth,
    );
    expect(sustained).toBeCloseTo(2, 2);
  } finally {
    await page.close();
  }
});

test('reduced-motion mobile startup loads automatically and reveals a static rendered model', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const preview = page.getByRole('figure', { name: 'Wattson 3D hero' });
  await expect(preview).toHaveAttribute('data-rendered', 'true', {
    timeout: 90000,
  });
  await expect(
    page.getByRole('dialog', { name: 'Loading Experience' }),
  ).not.toBeVisible();
  await expect(preview).toHaveAttribute('data-playing', 'false');
  await expect(preview.locator('canvas')).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('mobile-static-model.png'),
    fullPage: false,
  });
});

test('continue without 3D releases a stalled model download without waiting or retrying', async ({
  page,
}) => {
  let attempts = 0;
  let release: (() => void) | undefined;
  const skipped = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/hero/wattson.glb', async (route) => {
    attempts += 1;
    await skipped;
    await route.abort();
  });
  await page.goto('/');
  const dialog = page.getByRole('dialog', { name: 'Loading Experience' });
  await expect(dialog).toBeVisible();
  await expect.poll(() => attempts).toBe(1);
  await dialog.getByRole('button', { name: 'Continue without 3D' }).click();
  await expect(dialog).not.toBeVisible();
  release?.();
  const preview = page.getByRole('figure', { name: 'Wattson 3D hero' });
  await expect(
    preview.getByRole('img', { name: 'Wattson character on black' }),
  ).toBeVisible();
  await expect(preview.locator('canvas')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  expect(attempts).toBe(1);
});
