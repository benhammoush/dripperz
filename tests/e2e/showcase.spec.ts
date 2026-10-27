/**
 * Exercise responsive artwork synchronization, safe autoplay and the approved historical content.
 * @packageDocumentation
 */

import { expect, test } from '@playwright/test';
import { openShowcase } from './openShowcase';
import {
  ARCHIVED_ROADMAP,
  CHARACTER_SLIDES,
  SHOWCASE_FAQ,
} from '../../src/showcaseContent';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
]) {
  test.describe(`showcase at ${viewport.width}px`, () => {
    test.use({ viewport });
    let externalRequests: string[];

    test.beforeEach(async ({ page, baseURL }) => {
      externalRequests = [];
      page.on('request', (request) => {
        if (new URL(request.url()).origin !== new URL(baseURL!).origin)
          externalRequests.push(request.url());
      });
      await openShowcase(page);
    });

    test.afterEach(async ({ page }) => {
      expect(externalRequests).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    });

    test('galleries preserve artwork, descriptions and keyboard navigation', async ({
      page,
    }) => {
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
      await expect(page.locator('.welcome-strip')).toBeVisible();
      await expect(page.locator('.welcome-strip')).toHaveAttribute(
        'aria-hidden',
        'true',
      );
      const featured = page.getByRole('region', {
        name: 'Featured collection',
      });
      await featured.scrollIntoViewIfNeeded();
      await expect(featured).toBeVisible();
      await expect(
        featured.getByRole('heading', { name: 'Featured collection' }),
      ).toHaveClass('sr-only');
      await expect(featured.locator('.gallery-heading > span')).toHaveCount(0);
      const visibleCount = viewport.width <= 768 ? 1 : 3;
      await expect(featured.getByRole('img')).toHaveCount(visibleCount);
      await expect(featured.locator('figcaption')).toHaveCount(0);
      const artworkBox = await featured.getByRole('img').first().boundingBox();
      const galleryBox = await featured.boundingBox();
      expect(artworkBox!.width).toBeGreaterThan(
        Math.min(galleryBox!.width * (visibleCount === 1 ? 0.8 : 0.25), 500),
      );
      await expect(featured).toHaveAttribute('data-playing', 'true');
      expect(
        (await page.locator('.site-header').boundingBox())?.height,
      ).toBeLessThanOrEqual(70);
      await expect(
        page.getByRole('button', { name: /Static view/ }),
      ).toHaveCount(0);
      const characters = page.getByRole('region', {
        name: 'Character gallery',
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
        'character-vertical-enter',
      );
      await expect(
        characters.getByRole('heading', { name: 'L1L-X', exact: true }),
      ).toBeVisible();
    });

    test('historical roadmap and treasury retain approved content and layout', async ({
      page,
    }) => {
      const cybermap = page.locator('#cybermap');
      await expect(cybermap.getByRole('listitem')).toHaveCount(7);
      await expect(cybermap.getByText(/Archived roadmap/)).toHaveCount(0);
      await expect(
        cybermap.getByText(
          'Original roadmap wording—not current offers or commitments.',
        ),
      ).toHaveCount(0);
      for (const [index, stage] of ARCHIVED_ROADMAP.entries()) {
        const item = cybermap.getByRole('listitem').nth(index);
        await expect(item.getByRole('heading')).toHaveText(stage.title);
        await expect(item.locator('blockquote p')).toHaveText(
          stage.description,
        );
        await expect(item.locator('blockquote p')).toHaveCSS(
          'white-space',
          'pre-line',
        );
      }
      await expect(cybermap.locator('a, button, del, s')).toHaveCount(0);
      const treasury = page.getByRole('region', {
        name: 'Treasury',
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
      await expect(
        treasury.getByText('XXXX-XX-XX', { exact: true }),
      ).toHaveCount(2);
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
      await expect(treasury.locator('.treasury-choices button')).toHaveCount(3);
      for (const choice of await treasury
        .locator('.treasury-choices button')
        .all())
        await expect(choice).toBeDisabled();
      await expect(treasury).not.toContainText(
        '0xaad0102aed9213c09af3e7a1dfa4b8a055845e1c',
      );
      await expect(treasury).not.toContainText('dripperzcyberclub.eth');
      await expect(treasury.getByRole('link')).toHaveCount(0);
      await expect(treasury.getByRole('button')).toHaveCount(3);
      await expect(page.locator('body')).not.toContainText(/archive/i);
      // Measure layout only after the panel's scroll-reveal transform has settled.
      await expect(treasury).toHaveCSS('transform', 'none');
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
      expect(proposalBox!.y).toBeGreaterThan(
        summaryBox!.y + summaryBox!.height,
      );
      expect(proposalBox!.height).toBeGreaterThan(summaryBox!.height);
      expect(proposalBox!.x + proposalBox!.width / 2).toBeCloseTo(
        gridBox!.x + gridBox!.width / 2,
        0,
      );
    });

    test('FAQ remains keyboard accessible without a footer', async ({
      page,
    }) => {
      for (const item of SHOWCASE_FAQ) {
        const question = page.getByText(item.question, { exact: true });
        await question.scrollIntoViewIfNeeded();
        await question.focus();
        await page.keyboard.press('Enter');
        await expect(
          page.getByText(item.answer, { exact: true }),
        ).toBeVisible();
      }
      await expect(page.getByRole('contentinfo')).toHaveCount(0);
      await expect(page.locator('a[href^="https://"]')).toHaveCount(0);
      await expect(page.getByText(/Guillaume|AMMOUCHE/)).toHaveCount(0);
    });
  });
}

test('featured carousel resizes between one and three artworks while retaining selection', async ({
  page,
}) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 60_000));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await openShowcase(page);
  const gallery = page.getByRole('region', { name: 'Featured collection' });
  await gallery.scrollIntoViewIfNeeded();
  await gallery.focus();
  await expect(gallery.getByRole('img')).toHaveCount(1);
  await page.keyboard.press('ArrowRight');
  await expect(gallery.getByRole('img')).toHaveAttribute(
    'src',
    '/artwork/showcase-02.jpg',
  );
  await expect(gallery.locator('.character-entering')).toHaveCSS(
    'animation-name',
    'none',
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(gallery.getByRole('img')).toHaveCount(3);
  await expect(gallery.getByRole('img').first()).toHaveAttribute(
    'src',
    '/artwork/showcase-02.jpg',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(gallery.getByRole('img')).toHaveCount(1);
  await expect(gallery.getByRole('img')).toHaveAttribute(
    'src',
    '/artwork/showcase-02.jpg',
  );
  await page.keyboard.press('ArrowLeft');
  await expect(gallery.getByRole('img')).toHaveAttribute(
    'src',
    '/artwork/showcase-01.jpg',
  );
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.keyboard.press('ArrowRight');
  await expect(gallery.locator('.character-entering')).toHaveCSS(
    'animation-name',
    'character-enter',
  );
  await page.locator('#faq summary').first().focus();
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery).toHaveAttribute('data-playing', 'true');
  await page.clock.fastForward(5100);
  await expect(gallery.getByRole('img')).toHaveAttribute(
    'src',
    '/artwork/showcase-03.jpg',
  );
});

test('slideshow advances on schedule and pauses for focus, reduced motion and offscreen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.clock.install();
  // Freeze wall time so each interval assertion advances only the time it controls.
  await page.clock.pauseAt(new Date(Date.now() + 60_000));
  await openShowcase(page);
  const gallery = page.getByRole('region', { name: 'Featured collection' });
  const images = gallery.getByRole('img');
  /**
   * Read the visible image order to verify each automatic and keyboard step.
   * @returns Current artwork source paths.
   */
  const sources = () =>
    images.evaluateAll((items) =>
      items.map((item) => item.getAttribute('src')),
    );
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery.locator('.gallery-controls')).toHaveCount(0);
  await expect(gallery.getByRole('button', { name: 'Next slide' })).toHaveCount(
    3,
  );
  await page.mouse.move(0, 0);
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await expect(gallery).toHaveAttribute('data-playing', 'true');
  const beforeAdvance = await sources();
  await page.clock.fastForward(4999);
  expect(await sources()).toEqual(beforeAdvance);
  await page.clock.fastForward(1);
  await expect(images.first()).not.toHaveAttribute('src', beforeAdvance[0]!);
  await expect(gallery.locator('.gallery-strip-track')).toHaveCSS(
    'animation-name',
    'hero-carousel-glide',
  );
  await gallery.hover();
  await expect(gallery).toHaveAttribute('data-playing', 'true');
  const whileHovered = await sources();
  await page.clock.fastForward(5100);
  await expect(images.first()).not.toHaveAttribute('src', whileHovered[0]!);
  await page.mouse.move(0, 0);
  await gallery.focus();
  const whileFocused = await sources();
  await page.clock.fastForward(6000);
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
  await page.clock.fastForward(6000);
  expect(await sources()).toEqual(reducedMotionSources);
  await page.locator('#faq').scrollIntoViewIfNeeded();
  // IntersectionObserver updates asynchronously, outside the mocked clock.
  await expect(gallery).toHaveAttribute('data-visible', 'false');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(gallery).toHaveAttribute('data-playing', 'false');
  const offscreenSources = await sources();
  await page.clock.fastForward(6000);
  expect(await sources()).toEqual(offscreenSources);
  await gallery.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(gallery).toHaveAttribute('data-playing', 'true');
  const afterResume = await sources();
  await page.clock.fastForward(5100);
  await expect(images.first()).not.toHaveAttribute('src', afterResume[0]!);
  await gallery.focus();
  const beforeKeyboard = await sources();
  await page.keyboard.press('ArrowRight');
  await expect(images.first()).not.toHaveAttribute('src', beforeKeyboard[0]!);
  await page.keyboard.press('ArrowLeft');
  await expect(images.first()).toHaveAttribute('src', beforeKeyboard[0]!);
  await expect(gallery.locator('.gallery-strip-track')).toHaveCSS(
    'animation-name',
    'hero-carousel-reverse',
  );
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
  await expect(gallery.getByRole('img').first()).toHaveAttribute(
    'src',
    '/artwork/showcase-02.jpg',
  );
  await expect(page.locator('#faq')).toBeVisible();
});
