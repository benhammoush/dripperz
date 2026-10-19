/**
 * Lifecycle bindings for the archive-derived decorative canvas, with a static reduced-motion view.
 * @packageDocumentation
 */

import { useEffect, useRef } from 'react';
import {
  createMatrixRain,
  type MatrixRainController,
} from './matrixRainRenderer';

/** Parent lifecycle permission excludes manual pause, loading, hidden tabs and offscreen regions. */
interface MatrixRainProps {
  active: boolean;
}

/**
 * Own one canvas, resize subscription and motion-preference subscription per mounted backdrop.
 * @param props - Current lifecycle permission supplied by Atmosphere.
 * @returns An inaccessible, pointer-transparent canvas; unsupported contexts remain plain black.
 */
export function MatrixRain(props: MatrixRainProps) {
  const { active } = props;
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<MatrixRainController | null>(null);

  useEffect(() => {
    if (!canvas.current || typeof CanvasRenderingContext2D === 'undefined')
      return;
    const element = canvas.current;
    const rain = createMatrixRain(element);
    if (!rain) return;
    controller.current = rain;
    const media =
      typeof matchMedia === 'function'
        ? matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    /** Apply a live browser preference, conservatively disabling motion without preference support. */
    function updateMotion() {
      rain!.setReducedMotion(media?.matches ?? true);
    }
    /** Reconcile CSS size and device ratio without resetting an unchanged surface. */
    function resize() {
      const box = element.getBoundingClientRect();
      rain!.resize(box.width, box.height, window.devicePixelRatio);
    }
    updateMotion();
    resize();
    const observer =
      typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
    observer?.observe(element);
    window.addEventListener('resize', resize);
    media?.addEventListener('change', updateMotion);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', resize);
      media?.removeEventListener('change', updateMotion);
      rain.dispose();
      controller.current = null;
    };
  }, []);

  useEffect(() => {
    controller.current?.setActive(active);
  }, [active]);

  return (
    <canvas
      className="matrix"
      ref={canvas}
      aria-hidden="true"
      data-running="false"
    />
  );
}
