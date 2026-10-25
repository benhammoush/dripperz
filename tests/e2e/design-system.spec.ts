/**
 * Token extraction preserves the showcase's shared palette and panel treatments.
 * @packageDocumentation
 */

import { expect, test } from '@playwright/test';
import { openShowcase } from './openShowcase';

for (const width of [390, 1440]) {
  test(`preserves showcase foundations at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openShowcase(page);
    await expect(page.locator('html')).toHaveCSS(
      'background-color',
      'rgb(0, 0, 0)',
    );
    await expect(page.locator('body')).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(page.locator('body')).toHaveCSS('font-family', /Goldman/);
    await expect(page.locator('.site-header')).toHaveCSS(
      'border-bottom-color',
      'rgb(6, 148, 193)',
    );
    await expect(page.locator('.content-panel').first()).toHaveCSS(
      'border-radius',
      width < 600 ? '0px' : '48px',
    );
    await expect(page.locator('.content-panel').first()).toHaveCSS(
      'background-color',
      width < 600 ? 'rgba(3, 9, 12, 0.6)' : 'rgba(3, 9, 12, 0.8)',
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
