/**
 * Verify native unsupported-WebGL fallback without faking a successful model render.
 * @packageDocumentation
 */

import { expect, test } from '@playwright/test';

test('disabled WebGL preserves the static fallback and normal page controls', async ({
  page,
}) => {
  await page.goto('/');
  const preview = page.getByRole('figure', {
    name: 'Wattson 3D hero',
  });
  await expect(preview.getByRole('status')).toContainText('WebGL unavailable');
  await expect(
    page.getByRole('dialog', { name: 'Loading Experience' }),
  ).not.toBeVisible();
  await expect(
    preview.getByRole('img', { name: 'Wattson character on black' }),
  ).toBeVisible();
  await preview.getByRole('button', { name: 'Use static view' }).click();
  await expect(
    preview.getByRole('img', { name: 'Wattson character on black' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
