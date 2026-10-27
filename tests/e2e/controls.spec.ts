/**
 * Keep requested action styling, renamed rarity lookup and removed presentation chrome in sync.
 * @packageDocumentation
 */

import { expect, test } from '@playwright/test';
import { openShowcase } from './openShowcase';

for (const width of [1440, 768, 390]) {
  test(`original action treatment and simplified content at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openShowcase(page);
    const motion = page.getByRole('button', {
      name: /^(Pause|Resume) effects$/,
      includeHidden: true,
    });
    if (width <= 1024)
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await motion.click();
    await expect(motion).toHaveText('Resume effects');
    await motion.click();
    await expect(motion).toHaveText('Pause effects');
    if (width <= 1024) await page.keyboard.press('Escape');

    await expect(page.getByRole('contentinfo')).toHaveCount(0);
    await expect(
      page.getByText('Meet the characters', { exact: true }),
    ).toHaveCount(0);
    await expect(page.locator('#characters .gallery-heading')).toHaveCount(0);
    await expect(
      page.getByRole('region', { name: 'Character gallery' }),
    ).toHaveCount(1);
    await expect(
      page.getByText(
        'Original roadmap wording—not current offers or commitments.',
        { exact: true },
      ),
    ).toHaveCount(0);
    const choices = page.locator('.treasury-choices button');
    await expect(choices).toHaveCount(3);
    for (const choice of await choices.all()) {
      await expect(choice).toBeDisabled();
      await expect(choice).toHaveText('XXXX');
    }

    await page.locator('#rarity').scrollIntoViewIfNeeded();
    const input = page.getByRole('textbox', {
      name: 'Dripperz ID',
      exact: true,
    });
    await input.fill('2940');
    const find = page.getByRole('button', {
      name: 'Find Dripperz',
      exact: true,
    });
    await find.click();
    await expect(
      page.getByRole('heading', { name: 'Dripperz #2940', exact: true }),
    ).toBeVisible();
    await expect(page.getByText('1 / 5555', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Reload artwork' }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Find token', exact: true }),
    ).toHaveCount(0);

    const catalog = page.getByRole('button', {
      name: /^(Display|Hide) rarity catalog$/,
    });
    await catalog.click();
    await expect(catalog).toHaveAttribute('aria-expanded', 'true');
    await page.mouse.move(0, 0);
    for (const button of [motion, find, catalog, ...(await choices.all())]) {
      await expect(button).toHaveCSS('background-color', 'rgb(237, 242, 247)');
      await expect(button).toHaveCSS('color', 'rgb(0, 107, 142)');
      await expect(button).toHaveCSS('border-radius', '6px');
      await expect(button).toHaveCSS('border-top-width', '0px');
      await expect(button).toHaveCSS('font-weight', '600');
      await expect(button).toHaveCSS('min-height', '44px');
    }
    await find.hover();
    await expect(find).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(find).toHaveCSS('color', 'rgb(6, 148, 193)');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
