/**
 * Verify the approved brand favicon is linked, served and decodable.
 * @packageDocumentation
 */
import { expect, test } from '@playwright/test';

test('serves the square brand favicon from the document head', async ({
  page,
}) => {
  await page.goto('/');
  const icon = page.locator('link[rel="icon"]');
  await expect(icon).toHaveAttribute('href', '/favicon.png');
  await expect(icon).toHaveAttribute('type', 'image/png');
  await expect(icon).toHaveAttribute('sizes', '64x64');
  const response = await page.request.get('/favicon.png');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/png');
  const dimensions = await page.evaluate(async () => {
    const image = new Image();
    image.src = '/favicon.png';
    await image.decode();
    return [image.naturalWidth, image.naturalHeight];
  });
  expect(dimensions).toEqual([64, 64]);
});
