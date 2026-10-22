/**
 * Exercise responsive artwork synchronization, safe autoplay and the approved historical content.
 * @packageDocumentation
 */

import { expect, test } from '@playwright/test';
import { openShowcase } from './openShowcase';
import {
  CHARACTER_SLIDES,
  PUBLIC_LINKS,
  SHOWCASE_FAQ,
} from '../../src/showcaseContent';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
]) {
  test(`core showcase interaction at ${viewport.width}px`, async ({
    page,
    baseURL,
  }) => {
    const externalRequests: string[] = [];
    page.on('request', (request) => {
      if (new URL(request.url()).origin !== new URL(baseURL!).origin)
        externalRequests.push(request.url());
    });
    await page.setViewportSize(viewport);
    await openShowcase(page);
    await expect(
      page.getByRole('link', { name: /Explore the club/ }),
    ).toHaveCSS('border-bottom-style', 'none');
    await expect(
      page.getByText('Cyberpunk style. Individuality without limits.', {
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      page.getByText('Historical showcase · No Web3 integration', {
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      page.getByText(
        'Slides advance automatically · Use Left / Right to explore.',
        { exact: true },
      ),
    ).toHaveCount(0);
    await expect(page.locator('.marquee')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText(
      'WELCOME TO THE CYBERCLUB / DRIPPERZ',
    );
    const featured = page.getByRole('region', { name: 'Featured collection' });
    await featured.scrollIntoViewIfNeeded();
    await expect(featured).toBeVisible();
    await expect(
      featured.getByRole('heading', { name: 'Featured collection' }),
    ).toHaveClass('sr-only');
    await expect(featured.locator('.gallery-heading > span')).toHaveCount(0);
    await expect(
      featured.locator('.gallery-artwork[aria-hidden="false"]'),
    ).toHaveCount(3);
    await expect(featured.getByRole('img')).toHaveCount(3);
    await expect(featured.locator('.gallery-strip-track')).toHaveCSS(
      'animation-name',
      'none',
    );
    await expect(featured).toHaveAttribute('data-playing', 'true');
    expect(
      (await page.locator('.site-header').boundingBox())?.height,
    ).toBeLessThanOrEqual(70);
    await expect(
      page.getByRole('button', {
        name: /Pause effects|Resume effects|Static view/,
      }),
    ).toHaveCount(0);
    const characters = page.getByRole('region', {
      name: 'Meet the characters',
    });
    await characters.scrollIntoViewIfNeeded();
    await characters.focus();
    for (const slide of CHARACTER_SLIDES) {
      await expect(
        characters.getByRole('heading', { name: slide.title, exact: true }),
      ).toBeVisible();
      await expect(characters.getByRole('img')).toHaveAttribute(
        'src',
        slide.src,
      );
      await expect(characters.getByRole('img')).toBeVisible();
      await expect
        .poll(() =>
          characters
            .getByRole('img')
            .evaluate(
              (image: HTMLImageElement) =>
                image.complete && image.naturalWidth === 1000,
            ),
        )
        .toBe(true);
      await expect(
        characters.getByText(slide.description, { exact: true }),
      ).toBeVisible();
      await page.keyboard.press('ArrowRight');
    }
    await expect(
      characters.getByRole('heading', { name: 'DRIP-X', exact: true }),
    ).toBeVisible();
    await page.keyboard.press('ArrowLeft');
    await expect(characters.locator('.character-entering')).toHaveCSS(
      'animation-name',
      'character-enter',
    );
    await expect(
      characters.getByRole('heading', { name: 'L1L-X', exact: true }),
    ).toBeVisible();
    const cybermap = page.locator('#cybermap');
    await expect(cybermap.getByRole('listitem')).toHaveCount(7);
    await expect(cybermap.getByText(/Archived roadmap/)).toHaveCount(0);
    const treasury = page.getByRole('region', {
      name: 'Decentralized Autonomous Organization',
    });
    await treasury.scrollIntoViewIfNeeded();
    await expect(
      treasury.getByText(
        'Historical reference—not current balances or active governance.',
      ),
    ).toHaveCount(0);
    await expect(
      treasury.getByRole('heading', { name: 'Community treasury' }),
    ).toBeVisible();
    await expect(
      treasury.getByRole('heading', { name: 'Latest proposal' }),
    ).toBeVisible();
    await expect(
      treasury.getByText('0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'),
    ).toBeVisible();
    await expect(treasury.getByText('XXXX-XX-XX', { exact: true })).toHaveCount(
      2,
    );
    await expect(treasury.getByText('XXXX.XXXX ETH')).toBeVisible();
    await expect(treasury.getByText('XXX.XXX,XX USD')).toBeVisible();
    await expect(
      treasury.getByText('XXXX.XXXX', { exact: true }),
    ).toBeVisible();
    await expect(
      treasury.getByText('XXXX XXXX XXXX', { exact: true }),
    ).toBeVisible();
    await expect(
      treasury.getByText(
        'XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX',
      ),
    ).toBeVisible();
    await expect(treasury.locator('.treasury-choices span')).toHaveCount(3);
    await expect(treasury).not.toContainText(
      '0xaad0102aed9213c09af3e7a1dfa4b8a055845e1c',
    );
    await expect(treasury).not.toContainText('dripperzcyberclub.eth');
    await expect(treasury.getByRole('link')).toHaveCount(0);
    await expect(treasury.getByRole('button')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText(/archive/i);
    const summaryBox = await treasury
      .locator('.treasury-overview')
      .boundingBox();
    const proposalBox = await treasury
      .locator('.treasury-proposal')
      .boundingBox();
    const gridBox = await treasury.locator('.treasury-grid').boundingBox();
    expect(summaryBox).not.toBeNull();
    expect(proposalBox).not.toBeNull();
    expect(gridBox).not.toBeNull();
    expect(proposalBox!.y).toBeGreaterThan(summaryBox!.y + summaryBox!.height);
    expect(proposalBox!.height).toBeGreaterThan(summaryBox!.height);
    expect(proposalBox!.x + proposalBox!.width / 2).toBeCloseTo(
      gridBox!.x + gridBox!.width / 2,
      0,
    );
    for (const item of SHOWCASE_FAQ) {
      const question = page.getByText(item.question, { exact: true });
      await question.scrollIntoViewIfNeeded();
      await question.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByText(item.answer, { exact: true })).toBeVisible();
    }
    await expect(
      page.getByRole('link', { name: /Dripperz on X/ }),
    ).toHaveAttribute('href', PUBLIC_LINKS[0].href);
    await expect(page.locator('a[href^="https://"]')).toHaveCount(1);
    await expect(page.getByText(/Guillaume|AMMOUCHE/)).toHaveCount(0);
    expect(externalRequests).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test('slideshow advances quickly on hover and pauses for focus, reduced motion and offscreen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.clock.install();
  await openShowcase(page);
  const gallery = page.getByRole('region', { name: 'Featured collection' });
  const images = gallery.locator('.gallery-artwork img');
  /**
   * Read the visible image order to verify each automatic and keyboard step.
   * @returns Current artwork source paths.
   */
  const sources = () =>
    images.evaluateAll((items) =>
      items.map((item) => item.getAttribute('src')),
    );
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery.getByRole('button')).toHaveCount(0);
  await page.mouse.move(0, 0);
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await expect(gallery).toHaveAttribute('data-playing', 'true');
  const beforeAdvance = await sources();
  await page.clock.runFor(3100);
  await expect(images.first()).not.toHaveAttribute('src', beforeAdvance[0]!);
  await expect(gallery.locator('.gallery-strip-track')).toHaveCSS(
    'animation-name',
    'hero-carousel-glide',
  );
  await gallery.hover();
  await expect(gallery).toHaveAttribute('data-playing', 'true');
  const whileHovered = await sources();
  await page.clock.runFor(3100);
  await expect(images.first()).not.toHaveAttribute('src', whileHovered[0]!);
  await page.mouse.move(0, 0);
  await gallery.focus();
  const whileFocused = await sources();
  await page.clock.runFor(4000);
  expect(await sources()).toEqual(whileFocused);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Media emulation reaches WebKit asynchronously; observe it before ticking timers.
  await expect
    .poll(() =>
      page.evaluate(
        () => matchMedia('(prefers-reduced-motion: reduce)').matches,
      ),
    )
    .toBe(true);
  await expect(gallery.locator('.gallery-strip-track')).toHaveCSS(
    'animation-name',
    'none',
  );
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await expect(gallery).toHaveAttribute('data-playing', 'false');
  const reducedMotionSources = await sources();
  await page.clock.runFor(4000);
  expect(await sources()).toEqual(reducedMotionSources);
  await page.locator('#faq').scrollIntoViewIfNeeded();
  // IntersectionObserver updates asynchronously, outside the mocked clock.
  await expect(gallery).toHaveAttribute('data-visible', 'false');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(gallery).toHaveAttribute('data-playing', 'false');
  const offscreenSources = await sources();
  await page.clock.runFor(4000);
  expect(await sources()).toEqual(offscreenSources);
  await gallery.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(gallery).toHaveAttribute('data-playing', 'true');
  const afterResume = await sources();
  await page.clock.runFor(3100);
  await expect(images.first()).not.toHaveAttribute('src', afterResume[0]!);
  await gallery.focus();
  const beforeKeyboard = await sources();
  await page.keyboard.press('ArrowRight');
  await expect(images.first()).not.toHaveAttribute('src', beforeKeyboard[0]!);
});

test('failed artwork does not block captions, controls or FAQ', async ({
  page,
}) => {
  await page.route('**/artwork/showcase-01.jpg', (route) => route.abort());
  await openShowcase(page);
  const gallery = page.getByRole('region', { name: 'Featured collection' });
  await gallery.scrollIntoViewIfNeeded();
  await expect(
    gallery.getByRole('img', { name: /Artwork unavailable/ }),
  ).toBeVisible();
  await gallery.focus();
  await page.keyboard.press('ArrowRight');
  await expect(gallery.locator('.gallery-artwork img').first()).toHaveAttribute(
    'src',
    '/artwork/showcase-02.jpg',
  );
  await expect(page.locator('#faq')).toBeVisible();
});
