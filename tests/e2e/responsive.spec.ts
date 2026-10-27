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
      page.getByRole('heading', { level: 1, name: /Dripperz.*CYBERCLUB/ }),
    ).toBeVisible();
    await expect(page.locator('.shell')).toHaveAttribute(
      'data-app-version',
      APP_VERSION,
    );
    await expect(page.getByRole('contentinfo')).toHaveCount(0);
    const alignment = await page.locator('.local-hero').evaluate((panel) => {
      const section = panel.closest('.hero')!;
      const hero = section.getBoundingClientRect();
      const box = panel.getBoundingClientRect();
      const title = document
        .getElementById('hero-title')!
        .getBoundingClientRect();
      return {
        horizontal: Math.abs(
          box.left + box.width / 2 - hero.left - hero.width / 2,
        ),
        titleBottom: title.bottom,
        titleCenter: title.y + title.height / 2,
        heroCenter: hero.y + hero.height / 2,
        modelTop: box.top,
        stageHeight: panel
          .querySelector('.local-hero-stage')!
          .getBoundingClientRect().height,
        heroHeight: hero.height,
        heroBottom: hero.bottom,
        titleSize: parseFloat(
          getComputedStyle(document.getElementById('hero-title')!).fontSize,
        ),
        enterTop: document
          .querySelector('.enter-section')!
          .getBoundingClientRect().top,
        scrollCueBottom: section
          .querySelector('.hero-scroll-link')!
          .getBoundingClientRect().bottom,
      };
    });
    expect(alignment.horizontal).toBeLessThan(2);
    expect(Math.abs(alignment.titleCenter - alignment.heroCenter)).toBeLessThan(
      1,
    );
    expect(alignment.modelTop).toBeLessThan(alignment.titleBottom);
    expect(alignment.stageHeight).toBeGreaterThanOrEqual(
      viewport.height * 0.85,
    );
    expect(alignment.titleSize).toBeGreaterThan(
      viewport.width > 1000 ? 180 : 45,
    );
    expect(alignment.heroHeight).toBeGreaterThanOrEqual(viewport.height - 55);
    expect(alignment.enterTop).toBeGreaterThanOrEqual(alignment.heroBottom);
    expect(alignment.heroBottom - alignment.scrollCueBottom).toBeCloseTo(40, 0);
    await expect(page.locator('.enter-section .scroll-hint')).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: 'Scroll to Cyberclub' }),
    ).toHaveAttribute('href', '#collection');
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
