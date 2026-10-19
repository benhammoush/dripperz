/**
 * Verify automatic hero mounting and controlled static recovery without creating a GPU renderer.
 * @packageDocumentation
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { LocalHero } from '../../src/LocalHero';

const callbacks = {
  onReady: vi.fn(),
  onUnavailable: vi.fn(),
  onLoad: vi.fn(),
  onDisable: vi.fn(),
  onDownload: vi.fn(),
};

vi.mock('../../src/LocalHeroScene', () => ({
  /**
   * Stand in for a successful lazy renderer without requiring a test GPU.
   * @returns A visible marker for explicit loading and unloading assertions.
   */
  default: () => <p>Mock local scene</p>,
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test('hero loads automatically and the parent can switch to its model poster', async () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  const { rerender } = render(
    <LocalHero paused={false} enabled {...callbacks} />,
  );
  expect(await screen.findByText('Mock local scene')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Use static view' }));
  expect(callbacks.onDisable).toHaveBeenCalledOnce();
  rerender(<LocalHero paused={false} enabled={false} {...callbacks} />);
  expect(
    screen
      .getByRole('img', { name: 'Wattson character on black' })
      .getAttribute('src'),
  ).toBe('/hero/wattson-poster.png');
  expect(screen.getByText(/3D is unloaded/)).toBeInTheDocument();
  expect(screen.queryByText('Mock local scene')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /View in 3D/ }));
  expect(callbacks.onLoad).toHaveBeenCalledOnce();
  rerender(<LocalHero paused={false} enabled {...callbacks} />);
  expect(await screen.findByText('Mock local scene')).toBeInTheDocument();
});

test('visibility and parent pause gate playback and unmount removes subscriptions', () => {
  let notify: IntersectionObserverCallback | undefined;
  const disconnect = vi.fn();
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn(function (callback: IntersectionObserverCallback) {
      notify = callback;
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
  const { rerender, unmount } = render(
    <LocalHero paused={false} enabled {...callbacks} />,
  );
  const preview = screen.getByRole('figure');
  act(() =>
    notify?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ),
  );
  expect(preview.getAttribute('data-playing')).toBe('true');
  hidden.mockReturnValue(true);
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(preview.getAttribute('data-playing')).toBe('false');
  hidden.mockReturnValue(false);
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(preview.getAttribute('data-playing')).toBe('true');
  rerender(<LocalHero paused enabled {...callbacks} />);
  expect(preview.getAttribute('data-playing')).toBe('false');
  unmount();
  expect(disconnect).toHaveBeenCalledOnce();
  expect(remove).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  expect(media.removeEventListener).toHaveBeenCalledWith(
    'change',
    expect.any(Function),
  );
});
