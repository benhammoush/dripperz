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
    if (
      await page.evaluate(() => CSS.supports('scrollbar-color', 'red black'))
    ) {
      await expect(page.locator('html')).toHaveCSS(
        'scrollbar-color',
        'rgb(209, 139, 232) rgb(0, 0, 0)',
      );
    } else {
      expect(
        await page
          .locator('html')
          .evaluate(
            (element) =>
              getComputedStyle(element, '::-webkit-scrollbar-thumb')
                .backgroundColor,
          ),
      ).toBe('rgb(209, 139, 232)');
      expect(
        await page
          .locator('html')
          .evaluate(
            (element) =>
              getComputedStyle(element, '::-webkit-scrollbar-track')
                .backgroundColor,
          ),
      ).toBe('rgb(0, 0, 0)');
    }
    await expect(page.locator('.site-header')).toHaveCSS(
      'border-bottom-color',
      'rgb(6, 148, 193)',
    );
    await expect(page.locator('.content-panel').first()).toHaveCSS(
      'border-radius',
      width < 600 ? '32px' : '48px',
    );
    await expect(page.locator('.content-panel').first()).toHaveCSS(
      'background-color',
      'rgba(0, 0, 0, 0.6)',
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
