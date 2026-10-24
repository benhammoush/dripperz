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
  test(`showcase fits a ${viewport.width}px viewport`, async ({
    page,
  }, testInfo) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.setViewportSize(viewport);
    await openShowcase(page);
    await expect(page).toHaveTitle('Dripperz Cyberclub');
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
        stageHeight: panel
          .querySelector('.local-hero-stage')!
          .getBoundingClientRect().height,
        heroHeight: hero.height,
        heroBottom: hero.bottom,
        exploreBottom: section
          .querySelector('.enter-link')!
          .getBoundingClientRect().bottom,
      };
    });
    expect(alignment.horizontal).toBeLessThan(2);
    expect(alignment.modelTop).toBeGreaterThanOrEqual(alignment.titleBottom);
    expect(alignment.stageHeight).toBeGreaterThanOrEqual(viewport.height * 0.5);
    expect(alignment.heroHeight).toBeGreaterThanOrEqual(viewport.height - 55);
    expect(alignment.heroBottom - alignment.exploreBottom).toBeLessThanOrEqual(
      32,
    );
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
