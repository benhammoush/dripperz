/**
 * Exercise terminal keyboard/mobile interactions without requesting external documents.
 * @packageDocumentation
 */

import { expect, test } from '@playwright/test';
import { openShowcase } from './openShowcase';

for (const width of [1440, 390]) {
  test(`archive terminal at ${width}px stays local until a document link is followed`, async ({
    page,
    baseURL,
  }) => {
    const external: string[] = [];
    const popups: string[] = [];
    page.on('request', (request) => {
      if (new URL(request.url()).origin !== new URL(baseURL!).origin)
        external.push(request.url());
    });
    page.on('popup', (popup) => popups.push(popup.url()));
    await page.setViewportSize({ width, height: 900 });
    await openShowcase(page);
    const region = page.locator('#terminal');
    await region.scrollIntoViewIfNeeded();
    const input = region.getByRole('textbox', { name: 'Command' });
    await input.fill('help');
    await input.press('Enter');
    await expect(region.getByRole('log')).toContainText(
      'clear — Clear the screen',
    );
    for (const command of ['report', 'mugshot']) {
      await input.fill(command);
      await input.press('Enter');
    }
    const links = region.getByRole('link');
    await expect(links).toHaveCount(2);
    await expect(links.nth(0)).toHaveAttribute(
      'href',
      'https://dripperzcyberclub.mypinata.cloud/ipfs/QmNSwRjCrKQDuqc1CthMDX39v1qrWWzFtGU5d445k41tYK',
    );
    await expect(links.nth(1)).toContainText('58 MB');
    await input.fill('draft');
    await input.press('ArrowUp');
    await expect(input).toHaveValue('mugshot');
    await input.press('ArrowDown');
    await expect(input).toHaveValue('draft');
    await input.fill('password');
    await input.press('Enter');
    await expect(region.getByRole('log')).toContainText(
      'Wrong command, type help instead.',
    );
    await input.fill('clear');
    await input.press('Enter');
    await expect(region.getByRole('log')).toBeEmpty();
    await input.fill('report');
    await input.press('Enter');
    await expect(links).toHaveCount(1);
    await expect(
      region.getByRole('button', { name: 'Run command' }),
    ).toHaveCount(0);
    const dock = await region.evaluate((element) => ({
      position: getComputedStyle(element).position,
      background: getComputedStyle(element).backgroundColor,
      font: getComputedStyle(element).fontFamily,
      width: element.getBoundingClientRect().width,
      bottom: element.getBoundingClientRect().bottom,
    }));
    expect(dock.position).toBe('fixed');
    expect(dock.background).toBe('rgba(0, 0, 0, 0)');
    expect(dock.font).toContain('Goldman');
    expect(dock.bottom).toBe(900);
    if (width === 1440) expect(dock.width).toBeCloseTo(width * 0.3, 0);
    await page.locator('#faq').scrollIntoViewIfNeeded();
    await expect(input).toBeVisible();
    await region.getByRole('button', { name: 'Minimize terminal' }).click();
    await expect(input).toBeHidden();
    await region
      .getByRole('button', { name: 'Terminal /', exact: true })
      .press('Enter');
    await expect(input).toBeVisible();
    await expect(links).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    expect(external).toEqual([]);
    expect(popups).toEqual([]);
  });
}
