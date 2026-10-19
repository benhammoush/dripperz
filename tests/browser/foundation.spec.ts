/**
 * Smoke-test the production bundle at desktop and mobile viewport sizes.
 * @packageDocumentation
 */

import { expect, test } from '@playwright/test';
import { APP_VERSION } from '../../src/appVersion';
import { openShowcase } from './openShowcase';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
]) {
  test(`foundation at ${viewport.width}px`, async ({ page }, testInfo) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.setViewportSize(viewport);
    await openShowcase(page);
    await expect(page).toHaveTitle('Dripperz — Phase 3 showcase');
    await expect(
      page.getByRole('heading', { level: 1, name: /Dripperz.*ENTER THE/ }),
    ).toBeVisible();
    await expect(page.getByTestId('app-version')).toHaveText(APP_VERSION);
    const alignment = await page.locator('.local-hero').evaluate((panel) => {
      const section = panel.closest('.hero')!;
      const hero = section.getBoundingClientRect();
      const box = panel.getBoundingClientRect();
      return {
        horizontal: Math.abs(
          box.left + box.width / 2 - hero.left - hero.width / 2,
        ),
        titleBottom: document
          .getElementById('hero-title')!
          .getBoundingClientRect().bottom,
        modelTop: box.top,
        modelBottom: box.bottom,
        descriptionTop: section
          .querySelector('.hero-description')!
          .getBoundingClientRect().top,
        stageHeight: panel
          .querySelector('.local-hero-stage')!
          .getBoundingClientRect().height,
      };
    });
    expect(alignment.horizontal).toBeLessThan(2);
    expect(alignment.modelTop).toBeGreaterThanOrEqual(alignment.titleBottom);
    expect(alignment.descriptionTop).toBeGreaterThanOrEqual(
      alignment.modelBottom,
    );
    expect(alignment.stageHeight).toBeGreaterThanOrEqual(viewport.height * 0.5);
    expect(pageErrors).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath('visual-shell.png'),
      animations: 'disabled',
      fullPage: true,
    });
  });
}
