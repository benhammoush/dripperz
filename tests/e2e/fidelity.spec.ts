/**
 * Verify the restored source layout, typography, neon layers and explicit motion control.
 * @packageDocumentation
 */

import { expect, test } from '@playwright/test';
import { openShowcase } from './openShowcase';

for (const width of [1440, 768, 390]) {
  test(`standalone presentation and cinematic artwork at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openShowcase(page);
    const featured = page.getByRole('region', { name: 'Featured collection' });
    for (const artwork of await featured.getByRole('button').all()) {
      const alt = await artwork.locator('img').getAttribute('alt');
      await expect(artwork).toHaveAccessibleName(`Next slide: ${alt}`);
    }
    const collection = page.locator('#collection');
    const characters = page.getByRole('region', {
      name: 'Character gallery',
    });
    await expect(page.locator('.gallery-controls')).toHaveCount(0);
    await collection.scrollIntoViewIfNeeded();
    await expect(collection.getByRole('region')).toHaveCount(0);
    await expect(collection.locator('.accent-purple')).toHaveCSS(
      'color',
      'rgb(209, 139, 232)',
    );
    await expect(collection.locator('h2')).toHaveCSS(
      'text-decoration-line',
      'underline',
    );
    const sequence = await page.evaluate(() => {
      const intro = document.getElementById('collection')!;
      const claims = document.querySelector('.collection-headlines')!;
      const gallery = document.querySelector('.character-showcase')!;
      return {
        introBeforeClaims: Boolean(
          intro.compareDocumentPosition(claims) &
          Node.DOCUMENT_POSITION_FOLLOWING,
        ),
        claimsBeforeGallery: Boolean(
          claims.compareDocumentPosition(gallery) &
          Node.DOCUMENT_POSITION_FOLLOWING,
        ),
        containsGallery: intro.contains(gallery),
      };
    });
    expect(sequence).toEqual({
      introBeforeClaims: true,
      claimsBeforeGallery: true,
      containsGallery: false,
    });
    await characters.scrollIntoViewIfNeeded();
    const portrait = await characters.locator('.gallery-artwork').boundingBox();
    const caption = await characters.locator('figcaption').boundingBox();
    expect(portrait).not.toBeNull();
    expect(caption).not.toBeNull();
    if (width > 768) expect(caption!.x).toBeLessThan(portrait!.x);
    else
      expect(caption!.y).toBeGreaterThanOrEqual(portrait!.y + portrait!.height);
    await characters.focus();
    await characters.getByRole('button', { name: 'Next slide' }).click();
    await expect(
      characters.getByRole('heading', {
        name: 'Glitching signal',
        exact: true,
      }),
    ).toBeVisible();
    await expect(characters.locator('.character-entering')).toHaveCSS(
      'animation-name',
      'none',
    );
    await page.keyboard.press('ArrowUp');
    await expect(
      characters.getByRole('heading', { name: 'DRIP-X', exact: true }),
    ).toBeVisible();
    const artwork = characters.locator('.gallery-artwork');
    await artwork.dispatchEvent('pointerdown', {
      pointerType: 'touch',
      clientX: 200,
      clientY: 100,
    });
    await artwork.dispatchEvent('pointerup', {
      pointerType: 'touch',
      clientX: 100,
      clientY: 100,
    });
    await artwork.dispatchEvent('click', { detail: 1 });
    await expect(
      characters.getByRole('heading', {
        name: 'Glitching signal',
        exact: true,
      }),
    ).toBeVisible();
    await artwork.dispatchEvent('pointerdown', {
      pointerType: 'touch',
      clientX: 100,
      clientY: 100,
    });
    await artwork.dispatchEvent('pointerup', {
      pointerType: 'touch',
      clientX: 200,
      clientY: 100,
    });
    await expect(
      characters.getByRole('heading', { name: 'DRIP-X', exact: true }),
    ).toBeVisible();
    await artwork.dispatchEvent('pointerdown', {
      pointerType: 'touch',
      clientX: 100,
      clientY: 100,
    });
    await artwork.dispatchEvent('pointerup', {
      pointerType: 'touch',
      clientX: 100,
      clientY: 240,
    });
    await expect(
      characters.getByRole('heading', { name: 'DRIP-X', exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test('neon layers pause offscreen and the effects control also stops gallery autoplay', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openShowcase(page);
  const collection = page.locator('#collection');
  const layer = collection.locator('.glitch-layer').first();
  await collection.scrollIntoViewIfNeeded();
  await expect(layer).toHaveCSS('animation-play-state', 'running');
  await expect(layer).toHaveAttribute('aria-hidden', 'true');
  await page.locator('#faq').scrollIntoViewIfNeeded();
  await expect(layer).toHaveCSS('animation-play-state', 'paused');
  const gallery = page.getByRole('region', { name: 'Featured collection' });
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery).toHaveAttribute('data-playing', 'true');
  await page
    .getByRole('button', { name: 'Pause effects', exact: true })
    .click();
  await expect(page.locator('.atmosphere')).toHaveAttribute(
    'data-paused',
    'true',
  );
  await expect(page.locator('canvas.matrix')).toHaveAttribute(
    'data-running',
    'false',
  );
  await expect(gallery).toHaveAttribute('data-playing', 'false');
  await gallery.focus();
  await page.keyboard.press('ArrowRight');
  await expect(gallery.getByRole('img').first()).toHaveAttribute(
    'src',
    '/artwork/showcase-02.jpg',
  );
  await expect(gallery.locator('.gallery-strip-track')).toHaveCSS(
    'animation-name',
    'none',
  );
  await page
    .getByRole('button', { name: 'Resume effects', exact: true })
    .click();
  await expect(gallery).toHaveAttribute('data-playing', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(layer).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.welcome-track')).toHaveCSS(
    'animation-name',
    'none',
  );
  await expect(gallery).toHaveAttribute('data-playing', 'false');
});
