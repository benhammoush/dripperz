/**
 * Verify that canvas resize and motion subscriptions have balanced mount/unmount ownership.
 * @packageDocumentation
 */

import { StrictMode } from 'react';
import { render } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { MatrixRain } from '../../src/MatrixRain';
import { createMatrixRain } from '../../src/matrixRainRenderer';

const controls = vi.hoisted(() => ({
  resize: vi.fn(),
  setActive: vi.fn(),
  setReducedMotion: vi.fn(),
  dispose: vi.fn(),
}));
vi.mock('../../src/matrixRainRenderer', () => ({
  createMatrixRain: vi.fn(() => controls),
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

test('resize, live motion and parent permission update one controller and clean up subscriptions', () => {
  vi.stubGlobal('CanvasRenderingContext2D', {});
  let resized: ResizeObserverCallback | undefined;
  const disconnect = vi.fn();
  vi.stubGlobal(
    'ResizeObserver',
    vi.fn(function (callback: ResizeObserverCallback) {
      resized = callback;
      return { observe: vi.fn(), disconnect };
    }),
  );
  const box = {
    width: 390,
    height: 844,
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 390,
    bottom: 844,
    toJSON: vi.fn(),
  };
  vi.spyOn(
    HTMLCanvasElement.prototype,
    'getBoundingClientRect',
  ).mockReturnValue(box);
  const media = {
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => media),
  );
  const remove = vi.spyOn(window, 'removeEventListener');
  const { rerender, unmount } = render(<MatrixRain active />);
  expect(createMatrixRain).toHaveBeenCalledOnce();
  expect(controls.resize).toHaveBeenCalledWith(
    390,
    844,
    window.devicePixelRatio,
  );
  expect(controls.setActive).toHaveBeenLastCalledWith(true);
  rerender(<MatrixRain active={false} />);
  expect(controls.setActive).toHaveBeenLastCalledWith(false);
  expect(createMatrixRain).toHaveBeenCalledOnce();
  media.matches = true;
  const notify = media.addEventListener.mock.calls[0]![1] as () => void;
  notify();
  expect(controls.setReducedMotion).toHaveBeenLastCalledWith(true);
  box.width = 768;
  resized?.([], {} as ResizeObserver);
  expect(controls.resize).toHaveBeenLastCalledWith(
    768,
    844,
    window.devicePixelRatio,
  );
  unmount();
  expect(controls.dispose).toHaveBeenCalledOnce();
  expect(disconnect).toHaveBeenCalledOnce();
  expect(media.removeEventListener).toHaveBeenCalledWith('change', notify);
  expect(remove).toHaveBeenCalledWith('resize', expect.any(Function));
});

test('StrictMode setup/cleanup leaves no orphan controller', () => {
  vi.stubGlobal('CanvasRenderingContext2D', {});
  const { unmount } = render(
    <StrictMode>
      <MatrixRain active />
    </StrictMode>,
  );
  expect(createMatrixRain).toHaveBeenCalledTimes(2);
  expect(controls.dispose).toHaveBeenCalledOnce();
  unmount();
  expect(controls.dispose).toHaveBeenCalledTimes(2);
});
