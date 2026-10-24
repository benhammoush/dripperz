/**
 * Exercise the real static escape path before unrelated showcase regression checks.
 * @packageDocumentation
 */

import { expect, type Page } from '@playwright/test';

/**
 * Hold the renderer chunk until the visitor dismisses loading, avoiding GPU work in shell tests.
 * @param page - Production-preview browser page receiving the native loading dialog.
 * @returns A revealed static showcase; actual automatic GPU loading is covered in the hero suite.
 */
export async function openShowcase(page: Page) {
  let release: (() => void) | undefined;
  const skipped = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/assets/LocalHeroScene-*.js', async (route) => {
    await skipped;
    await route.abort();
  });
  // Firefox's load event can wait on the deliberately held dynamic script request.
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const dialog = page.getByRole('dialog', { name: 'Loading Experience' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  release?.();
}
