/**
 * Archive-derived ASCII rain with a bounded pixel ratio and an owned animation loop.
 * @packageDocumentation
 */

// Owner-selected calmer, sparser variation; retain the archive's 20px vertical step.
const MATRIX_FRAME_MS = 160;
const MATRIX_COLUMN_PX = 40;

/** Resource controls keep drawing separate from React and visibility subscriptions. */
export interface MatrixRainController {
  /**
   * Resize the drawing surface and seed visible trails, without restarting paused animation.
   * @param width - CSS-pixel width of the decorative region.
   * @param height - CSS-pixel height of the decorative region.
   * @param pixelRatio - Device pixel ratio, bounded internally for this decorative surface.
   */
  resize: (width: number, height: number, pixelRatio: number) => void;
  /**
   * Combine viewport/tab visibility with the page's manual pause and loading state.
   * @param active - Whether page lifecycle currently permits motion.
   */
  setActive: (active: boolean) => void;
  /**
   * Freeze existing pixels when the browser requests less motion.
   * @param reduced - Whether continuous decoration must remain disabled.
   */
  setReducedMotion: (reduced: boolean) => void;
  /** Cancel outstanding animation and ignore any late lifecycle callbacks. */
  dispose: () => void;
}

/**
 * Adapt Phase_3's cyan ASCII, 15pt monospace and #0001 trails with selected spacing and safe scheduling.
 * @param canvas - Owned, inaccessible decorative canvas; no page content is drawn here.
 * @param random - Random sample source, injectable for deterministic lifecycle tests.
 * @returns Resource controls, or null when a 2D context cannot be created.
 */
export function createMatrixRain(
  canvas: HTMLCanvasElement,
  random: () => number = Math.random,
): MatrixRainController | null {
  const context = canvas.getContext('2d');
  if (!context) return null;
  let width = 0;
  let height = 0;
  let ratio = 0;
  let drops: number[] = [];
  let active = false;
  let reduced = true;
  let disposed = false;
  let request: number | null = null;
  let previous: number | null = null;
  let generation = 0;
  let frames = 0;
  canvas.dataset.running = 'false';
  canvas.dataset.frames = '0';

  /** Record actual pixel drawing, independently of whether an animation request is pending. */
  function recordFrame() {
    frames += 1;
    canvas.dataset.frames = String(frames);
  }

  /**
   * Draw an archive-range ASCII sample; nonprintable samples intentionally retain its irregular gaps.
   * @param x - Column coordinate in CSS pixels.
   * @param y - Glyph baseline in CSS pixels.
   */
  function glyph(x: number, y: number) {
    context!.fillText(String.fromCharCode(Math.floor(random() * 128)), x, y);
  }

  /** Seed faded trails immediately so loading completion does not introduce a second empty-screen wait. */
  function seed() {
    context!.fillStyle = '#000';
    context!.fillRect(0, 0, width, height);
    context!.font = '15pt monospace';
    drops = Array.from(
      { length: Math.floor(width / MATRIX_COLUMN_PX) + 1 },
      () => Math.floor((random() * height) / 20) * 20,
    );
    drops.forEach((y, column) => {
      for (let tail = 32; tail >= 0; tail -= 1) {
        context!.fillStyle = `rgba(6, 148, 193, ${Math.pow(14 / 15, tail)})`;
        glyph(column * MATRIX_COLUMN_PX, y - tail * 20);
      }
    });
    recordFrame();
  }

  /** Fade the prior surface and advance every column by the archive's 20px step. */
  function draw() {
    context!.fillStyle = '#0001';
    context!.fillRect(0, 0, width, height);
    context!.fillStyle = '#0694c1';
    context!.font = '15pt monospace';
    drops.forEach((y, column) => {
      glyph(column * MATRIX_COLUMN_PX, y);
      // Recycle after leaving the responsive surface, not the archive's unbounded offscreen range.
      drops[column] = y > height && random() > 0.975 ? 0 : y + 20;
    });
    recordFrame();
  }

  /**
   * Draw at the selected slower cadence without replaying work accumulated in hidden tabs.
   * @param time - Animation-frame timestamp in milliseconds.
   * @param token - Scheduler generation that owns this callback.
   */
  function tick(time: number, token: number) {
    if (token !== generation) return;
    request = null;
    if (disposed || !active || reduced || width === 0 || height === 0) return;
    if (previous === null) previous = time - MATRIX_FRAME_MS;
    const elapsed = time - previous;
    if (elapsed >= MATRIX_FRAME_MS) {
      draw();
      previous = time - (elapsed % MATRIX_FRAME_MS);
    }
    scheduleFrame();
  }

  /** Capture ownership so a canceled callback cannot restart a later generation's loop. */
  function scheduleFrame() {
    const token = generation;
    request = requestAnimationFrame((time) => tick(time, token));
  }

  /** Reconcile the single owned animation request after a lifecycle or size change. */
  function reconcile() {
    const running = !disposed && active && !reduced && width > 0 && height > 0;
    canvas.dataset.running = String(running);
    if (running && request === null) scheduleFrame();
    if (!running) {
      generation += 1;
      if (request !== null) cancelAnimationFrame(request);
      request = null;
      previous = null;
    }
  }

  return {
    /**
     * Bound the backing store and redraw a static seed after an actual surface change.
     * @param nextWidth - CSS-pixel surface width.
     * @param nextHeight - CSS-pixel surface height.
     * @param pixelRatio - Requested device ratio, capped to 1.5.
     */
    resize(nextWidth, nextHeight, pixelRatio) {
      if (
        disposed ||
        !Number.isFinite(nextWidth) ||
        !Number.isFinite(nextHeight) ||
        nextWidth < 0 ||
        nextHeight < 0
      )
        return;
      const nextRatio = Number.isFinite(pixelRatio)
        ? Math.min(1.5, Math.max(1, pixelRatio))
        : 1;
      const w = Math.ceil(nextWidth);
      const h = Math.ceil(nextHeight);
      if (w === width && h === height && nextRatio === ratio) return;
      width = w;
      height = h;
      ratio = nextRatio;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      previous = null;
      if (width > 0 && height > 0) seed();
      reconcile();
    },
    /**
     * Apply combined visibility, loading and manual-pause permission without changing existing pixels.
     * @param value - Current lifecycle permission.
     */
    setActive(value) {
      if (disposed) return;
      active = value;
      reconcile();
    },
    /**
     * Apply the browser motion preference without recreating the controller.
     * @param value - Whether motion should be reduced.
     */
    setReducedMotion(value) {
      if (disposed) return;
      reduced = value;
      reconcile();
    },
    /** Cancel the owned request; late callbacks cannot draw or restart it. */
    dispose() {
      disposed = true;
      reconcile();
    },
  };
}
