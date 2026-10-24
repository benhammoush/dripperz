/**
 * Verify synchronized manual navigation and usable local-artwork error states.
 * @packageDocumentation
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { Gallery } from '../../src/Gallery';
import { CHARACTER_SLIDES, COLLECTION_SLIDES } from '../../src/showcaseContent';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/**
 * Render the character gallery with its production timing for isolated interactions.
 * @returns The mounted gallery and its cleanup controls.
 */
function renderCharacterGallery() {
  return render(
    <Gallery
      id="characters"
      title="Characters"
      slides={CHARACTER_SLIDES}
      intervalMs={8000}
    />,
  );
}

test('manual navigation wraps and changes image, title and description together', () => {
  renderCharacterGallery();
  expect(screen.getByRole('img').getAttribute('src')).toBe(
    CHARACTER_SLIDES[0]!.src,
  );
  const gallery = screen.getByRole('region');
  fireEvent.keyDown(gallery, { key: 'ArrowRight' });
  expect(
    screen.getByRole('heading', { name: 'Glitching signal' }),
  ).toBeInTheDocument();
  expect(
    screen.getByText(CHARACTER_SLIDES[1]!.description),
  ).toBeInTheDocument();
  expect(screen.getByRole('img').getAttribute('src')).toBe(
    CHARACTER_SLIDES[1]!.src,
  );
  fireEvent.keyDown(gallery, { key: 'ArrowLeft' });
  fireEvent.keyDown(gallery, { key: 'ArrowLeft' });
  expect(screen.getByRole('heading', { name: 'L1L-X' })).toBeInTheDocument();
  expect(screen.getByRole('img').getAttribute('src')).toBe(
    CHARACTER_SLIDES[4]!.src,
  );
});

test('a failed artwork leaves the caption and navigation usable', () => {
  renderCharacterGallery();
  fireEvent.error(screen.getByRole('img'));
  expect(
    screen.getByRole('img', { name: /Artwork unavailable/ }),
  ).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'DRIP-X' })).toBeInTheDocument();
  fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });
  expect(screen.getByRole('img').getAttribute('src')).toBe(
    CHARACTER_SLIDES[1]!.src,
  );
});

test('strip retains its track and exposes the selected window in both directions', () => {
  const { container } = render(
    <Gallery
      id="featured"
      title="Featured collection"
      slides={COLLECTION_SLIDES}
      intervalMs={3000}
      visibleSlides={3}
    />,
  );
  const track = container.querySelector('.gallery-strip-track');
  const gallery = screen.getByRole('region');
  fireEvent.keyDown(gallery, { key: 'ArrowRight' });
  expect(container.querySelector('.gallery-strip-track')).toBe(track);
  expect(track?.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
  expect(
    screen.getAllByRole('img').map((image) => image.getAttribute('src')),
  ).toEqual(COLLECTION_SLIDES.slice(1, 4).map((slide) => slide.src));
  fireEvent.keyDown(gallery, { key: 'ArrowLeft' });
  expect(container.querySelector('.gallery-strip-track')).toBe(track);
  expect(track?.classList.contains('is-reversing')).toBe(true);
  expect(
    screen.getAllByRole('img').map((image) => image.getAttribute('src')),
  ).toEqual(COLLECTION_SLIDES.slice(0, 3).map((slide) => slide.src));
});

test('autoplay stops in a hidden tab and releases its timer and subscriptions', () => {
  vi.useFakeTimers();
  let notify: IntersectionObserverCallback | undefined;
  const disconnects: ReturnType<typeof vi.fn>[] = [];
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn(function (callback: IntersectionObserverCallback) {
      // Keep the gallery observer; the selected glitch slide mounts its own decorations.
      notify ??= callback;
      const disconnect = vi.fn();
      disconnects.push(disconnect);
      return { observe: vi.fn(), disconnect };
    }),
  );
  const media = {
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => media),
  );
  const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  const remove = vi.spyOn(document, 'removeEventListener');
  const { unmount } = renderCharacterGallery();
  expect(screen.queryByRole('button')).toBeNull();
  // jsdom does not model a real pointer position; browser tests cover hover.
  vi.spyOn(screen.getByRole('region'), 'matches').mockReturnValue(false);
  act(() => {
    notify?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    vi.advanceTimersByTime(8000);
  });
  expect(
    screen.getByRole('heading', { name: 'Glitching signal' }),
  ).toBeInTheDocument();
  hidden.mockReturnValue(true);
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    vi.advanceTimersByTime(16000);
  });
  expect(
    screen.getByRole('heading', { name: 'Glitching signal' }),
  ).toBeInTheDocument();
  hidden.mockReturnValue(false);
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    vi.advanceTimersByTime(8000);
  });
  expect(screen.getByRole('heading', { name: 'C1V1L-X' })).toBeInTheDocument();
  unmount();
  for (const disconnect of disconnects)
    expect(disconnect).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
  expect(remove).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  expect(media.removeEventListener).toHaveBeenCalledWith(
    'change',
    expect.any(Function),
  );
});
