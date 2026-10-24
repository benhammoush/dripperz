/**
 * Verify the native loading screen, keyboard escape, motion preference and static continuation.
 * @packageDocumentation
 */

import { expect, test } from '@playwright/test';
import { openShowcase } from './openShowcase';

test('static continuation releases loading to a working model-specific view', async ({
  page,
}) => {
  await openShowcase(page);
  const hero = page.getByRole('figure', { name: 'Wattson 3D hero' });
  const poster = hero.getByRole('img', { name: 'Wattson character on black' });
  await expect(poster).toBeVisible();
  await expect
    .poll(() =>
      poster.evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
  const posterAlpha = await poster.evaluate(async (image: HTMLImageElement) => {
    // Intrinsic dimensions can be available before WebKit has decoded drawable pixels.
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    return {
      corners: [
        0,
        canvas.width - 1,
        (canvas.height - 1) * canvas.width,
        canvas.width * canvas.height - 1,
      ].map((pixel) => pixels[pixel * 4 + 3]),
      hasModel: pixels.some((value, index) => index % 4 === 3 && value > 0),
    };
  });
  expect(posterAlpha.corners).toEqual([0, 0, 0, 0]);
  expect(posterAlpha.hasModel).toBe(true);
  await expect(hero.locator('canvas')).toHaveCount(0);
  await expect(hero.getByRole('checkbox')).toHaveCount(0);
  await expect(page.locator('#terminal-command')).toBeFocused();
  await expect(hero).toHaveCSS('text-align', 'center');
  await expect(hero).toHaveCSS('border-top-width', '0px');
  await expect(hero.getByText('Wattson · Interim hero')).toHaveCount(0);
  await expect(hero.locator('.local-hero-stage')).toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  );
  await expect(page.locator('.atmosphere')).toHaveCSS(
    'background-color',
    'rgb(0, 0, 0)',
  );
  const matrix = page.locator('canvas.matrix');
  await expect(matrix).toHaveAttribute('aria-hidden', 'true');
  await expect(matrix).toHaveCSS('pointer-events', 'none');
  await expect(matrix).toHaveCSS('opacity', '0.4');
  await expect(matrix).toHaveAttribute('data-running', 'true');
  await expect(hero.locator('.local-hero-controls')).toHaveCSS(
    'justify-content',
    'center',
  );
  // Verify actual glyph pixels, not just a running flag or an empty drawing surface.
  const hasGlyphs = await matrix.evaluate((canvas: HTMLCanvasElement) => {
    const pixels = canvas
      .getContext('2d')!
      .getImageData(0, 0, canvas.width, canvas.height).data;
    return pixels.some((value, index) => index % 4 === 1 && value > 10);
  });
  expect(hasGlyphs).toBe(true);
});

test('loading is modal and Escape continues before the delayed button appears', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let release: (() => void) | undefined;
  const skipped = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/assets/LocalHeroScene-*.js', async (route) => {
    await skipped;
    await route.abort();
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const dialog = page.getByRole('dialog', { name: 'Loading Experience' });
  await expect(dialog).toBeVisible();
  await expect(page.locator('.shell')).toHaveAttribute('inert', '');
  await expect(page.locator('canvas.matrix')).toHaveAttribute(
    'data-running',
    'false',
  );
  await expect(
    dialog.getByRole('button', { name: 'Continue without 3D' }),
  ).toHaveCount(0);
  await expect(dialog).toBeFocused();
  await expect(
    dialog.getByRole('progressbar', { name: '3D model download' }),
  ).toHaveAttribute('value', '0');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  release?.();
  await expect(page.locator('.shell')).not.toHaveAttribute('inert');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('continue without 3D becomes visible after ten seconds of pending loading', async ({
  page,
}) => {
  let release: (() => void) | undefined;
  const skipped = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/assets/LocalHeroScene-*.js', async (route) => {
    await skipped;
    await route.abort();
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const dialog = page.getByRole('dialog', { name: 'Loading Experience' });
  await expect(dialog).toBeVisible();
  const button = dialog.getByRole('button', { name: 'Continue without 3D' });
  await expect(button).toHaveCount(0);
  await expect(button).toBeVisible({ timeout: 12000 });
  await page.keyboard.press('Tab');
  await expect(button).toBeFocused();
  await button.click();
  await expect(dialog).not.toBeVisible();
  release?.();
  await expect(page.locator('#terminal-command')).toBeFocused();
});
