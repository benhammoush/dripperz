/**
 * Verify archive drawing cadence, bounded pixel ratio and owned canvas scheduling without a GPU.
 * @packageDocumentation
 */

import { afterEach, expect, test, vi } from 'vitest';
import { createMatrixRain } from '../../src/matrixRainRenderer';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/**
 * Supply a deterministic 2D context and manually driven animation requests.
 * @returns The owned controller, synthetic drawing calls and pending frame harness.
 */
function setupRain() {
  const canvas = document.createElement('canvas');
  const context = {
    fillStyle: '',
    font: '',
    fillRect: vi.fn(),
    fillText: vi.fn(),
    setTransform: vi.fn(),
  };
  vi.spyOn(canvas, 'getContext').mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
  const pending = new Map<number, FrameRequestCallback>();
  let id = 0;
  const schedule = vi.fn((callback: FrameRequestCallback) => {
    id += 1;
    pending.set(id, callback);
    return id;
  });
  const cancel = vi.fn((key: number) => {
    pending.delete(key);
  });
  vi.stubGlobal('requestAnimationFrame', schedule);
  vi.stubGlobal('cancelAnimationFrame', cancel);
  const controller = createMatrixRain(canvas, () => 0.5)!;
  return {
    canvas,
    context,
    controller,
    pending,
    schedule,
    cancel,
    /**
     * Execute only the currently pending frame, leaving its successor for the next step.
     * @param time - Synthetic browser animation timestamp.
     */
    step(this: void, time: number) {
      const callbacks = [...pending.values()];
      pending.clear();
      callbacks.forEach((callback) => callback(time));
    },
  };
}

test('resize seeds archive-font glyphs immediately with a capped backing ratio and no automatic loop', () => {
  const { controller, canvas, context, pending } = setupRain();
  controller.resize(200, 100, 3);
  expect(canvas.width).toBe(300);
  expect(canvas.height).toBe(150);
  expect(context.setTransform).toHaveBeenLastCalledWith(1.5, 0, 0, 1.5, 0, 0);
  expect(context.font).toBe('7.5pt monospace');
  expect(context.fillRect).toHaveBeenCalledWith(0, 0, 200, 100);
  expect(context.fillText).toHaveBeenCalledWith('@', 200, 40);
  expect(context.fillText).toHaveBeenCalledWith('@', 200, 30);
  expect(context.fillText).toHaveBeenCalledTimes(6 * 65);
  expect(canvas.dataset.frames).toBe('1');
  expect(pending.size).toBe(0);
  controller.resize(200, 100, 3);
  expect(canvas.dataset.frames).toBe('1');
  controller.dispose();
});

test('one owned loop advances at slower 160ms intervals without catching up hidden-tab time', () => {
  const { controller, canvas, context, pending, step } = setupRain();
  controller.resize(200, 100, 1);
  controller.setReducedMotion(false);
  expect(pending.size).toBe(0);
  controller.setActive(true);
  controller.setActive(true);
  expect(pending.size).toBe(1);
  step(0);
  expect(canvas.dataset.frames).toBe('2');
  expect(context.fillStyle).toBe('#0694c1');
  expect(context.font).toBe('7.5pt monospace');
  expect(context.fillText).toHaveBeenNthCalledWith(6 * 65 + 11, '@', 200, 30);
  expect(context.fillText).toHaveBeenLastCalledWith('@', 200, 40);
  step(20);
  expect(canvas.dataset.frames).toBe('2');
  step(40);
  expect(canvas.dataset.frames).toBe('2');
  step(79);
  expect(canvas.dataset.frames).toBe('2');
  step(80);
  expect(canvas.dataset.frames).toBe('2');
  step(159);
  expect(canvas.dataset.frames).toBe('2');
  step(160);
  expect(canvas.dataset.frames).toBe('3');
  expect(context.fillText).toHaveBeenLastCalledWith('@', 200, 60);
  step(10000);
  expect(canvas.dataset.frames).toBe('4');
  expect(pending.size).toBe(1);
  controller.dispose();
});

test('manual/offscreen suspension freezes pixels and reduced motion prevents rescheduling', () => {
  const { controller, canvas, context, pending, step, cancel } = setupRain();
  controller.resize(200, 100, 1);
  controller.setReducedMotion(false);
  controller.setActive(true);
  step(0);
  const draws = context.fillRect.mock.calls.length;
  controller.setActive(false);
  expect(cancel).toHaveBeenCalledOnce();
  expect(pending.size).toBe(0);
  expect(canvas.dataset.running).toBe('false');
  step(100);
  expect(context.fillRect).toHaveBeenCalledTimes(draws);
  controller.setReducedMotion(true);
  controller.setActive(true);
  expect(pending.size).toBe(0);
  controller.setReducedMotion(false);
  expect(pending.size).toBe(1);
  controller.setReducedMotion(true);
  expect(pending.size).toBe(0);
  expect(context.fillRect).toHaveBeenCalledTimes(draws);
  controller.dispose();
});

test('zero-size and invalid surfaces suspend work; disposal ignores late frames and callbacks', () => {
  const { controller, canvas, context, pending } = setupRain();
  controller.resize(200, 100, 1);
  controller.setReducedMotion(false);
  controller.setActive(true);
  controller.resize(0, 0, 1);
  expect(pending.size).toBe(0);
  controller.resize(Number.NaN, 100, 1);
  expect(canvas.width).toBe(0);
  controller.resize(200, 100, 1);
  const late = [...pending.values()][0]!;
  controller.dispose();
  const draws = context.fillRect.mock.calls.length;
  late(1000);
  controller.setActive(true);
  controller.setReducedMotion(false);
  controller.resize(300, 200, 1);
  expect(context.fillRect).toHaveBeenCalledTimes(draws);
  expect(pending.size).toBe(0);
  expect(canvas.dataset.running).toBe('false');
});

test('a canceled callback cannot duplicate a resumed loop or mutate its frame count', () => {
  const { controller, canvas, pending } = setupRain();
  controller.resize(200, 100, 1);
  controller.setReducedMotion(false);
  controller.setActive(true);
  const canceled = [...pending.values()][0]!;
  controller.setActive(false);
  controller.setActive(true);
  const before = canvas.dataset.frames;
  canceled(100);
  expect(canvas.dataset.frames).toBe(before);
  expect(pending.size).toBe(1);
  controller.dispose();
});

test('an unavailable 2D context has no renderer or scheduling side effects', () => {
  const canvas = document.createElement('canvas');
  vi.spyOn(canvas, 'getContext').mockReturnValue(null);
  expect(createMatrixRain(canvas)).toBeNull();
});
