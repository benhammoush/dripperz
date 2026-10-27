/**
 * Verify disclosure navigation, automatic motion safeguards and local-only resources.
 * @packageDocumentation
 */

import { expect, test } from '@playwright/test';
import { openShowcase } from './openShowcase';
import { SECTIONS } from '../../src/sections';

test('mobile disclosure supports keyboard navigation and escape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openShowcase(page);
  await expect(page.locator('.site-header')).toBeInViewport();
  // Loading continuation focuses the terminal; start header traversal from the brand.
  await page.getByRole('link', { name: 'Dripperz home' }).focus();
  await page.keyboard.press('Shift+Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  const menu = page.getByRole('button', { name: /menu/i });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('navigation').getByRole('link').first(),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('navigation').getByRole('link').first(),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#collection$/);
  await expect(page.locator('#collection')).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  for (const section of SECTIONS) {
    await menu.click();
    await page
      .getByRole('navigation')
      .getByRole('link', { name: section.label, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`#${section.id}$`));
    await expect(page.locator(`#${section.id}`)).toBeInViewport();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
  }
});

test('matrix spans the whole page and reduced motion keeps it still', async ({
  page,
}) => {
  await openShowcase(page);
  const rain = page.locator('canvas.matrix');
  const atmosphere = page.locator('.atmosphere');
  await expect(atmosphere).toHaveAttribute('data-active', 'true');
  await expect(rain).toHaveAttribute('data-running', 'true');
  await expect(rain).toHaveCSS('position', 'fixed');
  await page.locator('#faq').scrollIntoViewIfNeeded();
  await expect(atmosphere).toHaveAttribute('data-active', 'true');
  await expect(rain).toHaveAttribute('data-running', 'true');
  const canvasHeight = await rain.evaluate(
    (canvas) => canvas.getBoundingClientRect().height,
  );
  expect(canvasHeight).toBeCloseTo(await page.evaluate(() => innerHeight), 0);
  expect(canvasHeight).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.glitch-layer').first()).toHaveCSS(
    'animation-name',
    'none',
  );
  await expect(rain).toHaveAttribute('data-running', 'false');
  await page.locator('#home').scrollIntoViewIfNeeded();
  await expect(atmosphere).toHaveAttribute('data-active', 'true');
  await expect(rain).toHaveAttribute('data-running', 'false');
});

test('shell assets load locally without remote integrations', async ({
  page,
  baseURL,
}) => {
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== new URL(baseURL!).origin)
      externalRequests.push(request.url());
  });
  await openShowcase(page);
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  expect(await page.evaluate(() => document.fonts.check('16px Goldman'))).toBe(
    true,
  );
  expect(
    await page
      .locator('.brand img')
      .evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
      ),
  ).toBe(true);
  await page
    .getByRole('link', { name: 'ENTER THE CYBERCLUB', exact: true })
    .click();
  expect(externalRequests).toEqual([]);
});
