/**
 * A synchronized local-artwork carousel with keyboard navigation and automatic playback.
 * @packageDocumentation
 */

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import type { GallerySlide } from './showcaseContent';
import { ScrambledSignal } from './design-system';

/** Configuration for one independently controlled, nonempty local gallery. */
interface GalleryProps {
  id: string;
  title: string;
  slides: readonly GallerySlide[];
  intervalMs: number;
  visibleSlides?: number;
  compact?: boolean;
  paused?: boolean;
}

/**
 * Follow the same small-screen breakpoint as the stacked character gallery.
 * @returns Whether only one artwork fits the current viewport comfortably.
 */
function isSmallViewport() {
  return window.matchMedia?.('(max-width: 48rem)').matches ?? false;
}

/**
 * Update artwork count when resizing or rotating, and release the media listener on unmount.
 * @param notify - React's external-store change callback.
 * @returns Cleanup for the viewport subscription.
 */
function subscribeViewport(notify: () => void) {
  const media = window.matchMedia?.('(max-width: 48rem)');
  media?.addEventListener('change', notify);
  return () => media?.removeEventListener('change', notify);
}

/**
 * Keep one selected slide for artwork and description; never change keyboard focus automatically.
 * @param props - Unique accessible identity, nonempty ordered slides and autoplay interval.
 * @returns The local gallery, keyboard navigation, image fallback and automatic slideshow.
 */
export function Gallery(props: GalleryProps) {
  const smallViewport = useSyncExternalStore(
    subscribeViewport,
    isSmallViewport,
  );
  const [selection, setSelection] = useState({
    index: 0,
    previous: 0,
    direction: 1,
  });
  const { index, previous, direction } = selection;
  const [animateStrip, setAnimateStrip] = useState(false);
  const [failedSrc, setFailedSrc] = useState('');
  const regionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const slide = props.slides[index]!;
  const count = props.slides.length;
  const TitleTag = props.id === 'characters' ? 'h3' : 'h4';
  const visibleCount = Math.min(
    smallViewport ? 1 : (props.visibleSlides ?? 1),
    count,
  );
  const visibleSlides = Array.from(
    { length: visibleCount + (visibleCount > 1 ? 1 : 0) },
    (_, offset) =>
      props.slides[
        ((animateStrip && direction > 0 ? previous : index) + offset) % count
      ]!,
  );

  useLayoutEffect(() => {
    if (!animateStrip) return;
    // Restart the retained track from the prior window, including consecutive moves in one direction.
    trackRef.current?.getAnimations?.().forEach((animation) => {
      animation.cancel();
      animation.play();
    });
  }, [selection, animateStrip]);

  useEffect(() => {
    const region = regionRef.current;
    if (!region || !('IntersectionObserver' in window)) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = false;
    let hasFocus = region.contains(document.activeElement);
    let timer: ReturnType<typeof setInterval> | undefined;

    /** Recreate at most one timer, only when the gallery is safe to advance. */
    function updateTimer() {
      clearInterval(timer);
      timer = undefined;
      if (
        inView &&
        !document.hidden &&
        !media.matches &&
        !hasFocus &&
        !props.paused
      ) {
        timer = setInterval(() => {
          setAnimateStrip(true);
          setSelection((current) => ({
            index: (current.index + 1) % count,
            previous: current.index,
            direction: 1,
          }));
        }, props.intervalMs);
      }
      if (region) region.dataset.playing = String(timer !== undefined);
    }

    /**
     * Track the next focus owner because activeElement may still be stale during focusout.
     * @param event - Native focus transition within or out of the gallery.
     */
    function updateFocus(event: FocusEvent) {
      hasFocus =
        event.type === 'focusin' ||
        (event.relatedTarget instanceof Node &&
          !!region?.contains(event.relatedTarget));
      updateTimer();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? false;
        region.dataset.visible = String(inView);
        updateTimer();
      },
      { threshold: 0.25 },
    );
    observer.observe(region);
    region.addEventListener('focusin', updateFocus);
    region.addEventListener('focusout', updateFocus);
    document.addEventListener('visibilitychange', updateTimer);
    media.addEventListener('change', updateTimer);
    return () => {
      clearInterval(timer);
      region.dataset.playing = 'false';
      region.dataset.visible = 'false';
      observer.disconnect();
      region.removeEventListener('focusin', updateFocus);
      region.removeEventListener('focusout', updateFocus);
      document.removeEventListener('visibilitychange', updateTimer);
      media.removeEventListener('change', updateTimer);
    };
  }, [count, props.intervalMs, props.paused]);

  /**
   * Navigate with wraparound while leaving automatic playback enabled.
   * @param offset - Signed number of slides to move from the current selection.
   */
  function move(offset: number) {
    regionRef.current?.focus({ preventScroll: true });
    setAnimateStrip(true);
    setSelection((current) => ({
      index: (current.index + offset + count) % count,
      previous: current.index,
      direction: offset,
    }));
  }

  return (
    <div
      className="gallery"
      id={props.id}
      data-playing="false"
      data-visible="false"
      data-direction={direction > 0 ? 'next' : 'previous'}
      ref={regionRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={props.id === 'characters' ? props.title : undefined}
      aria-labelledby={
        props.id === 'characters' ? undefined : `${props.id}-heading`
      }
      tabIndex={0}
      onPointerDown={(event) => {
        swiped.current = false;
        touchStart.current =
          event.pointerType === 'touch' &&
          event.target instanceof Element &&
          event.target.closest('.gallery-artwork')
            ? { x: event.clientX, y: event.clientY }
            : null;
      }}
      onPointerUp={(event) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) {
          swiped.current = true;
          move(dx < 0 ? 1 : -1);
        }
      }}
      onPointerCancel={() => {
        touchStart.current = null;
      }}
      onKeyDown={(event) => {
        if (
          event.key === 'ArrowRight' ||
          event.key === 'ArrowLeft' ||
          (props.id === 'characters' &&
            (event.key === 'ArrowDown' || event.key === 'ArrowUp'))
        ) {
          event.preventDefault();
          move(
            event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1,
          );
        }
      }}
    >
      {props.id !== 'characters' && (
        <div className="gallery-heading">
          <h3
            className={props.compact ? 'sr-only' : undefined}
            id={`${props.id}-heading`}
          >
            {props.title}
          </h3>
          {!props.compact && (
            <span>
              {visibleCount > 1
                ? `${index + 1}–${((index + visibleCount - 1) % count) + 1} / ${count}`
                : `${index + 1} / ${count}`}
            </span>
          )}
        </div>
      )}
      {visibleCount > 1 ? (
        <div className="gallery-strip" aria-live="off">
          <div
            className={`gallery-strip-track${animateStrip ? (direction > 0 ? ' is-advancing' : ' is-reversing') : ''}`}
            ref={trackRef}
          >
            {visibleSlides.map((visibleSlide, offset) => (
              <button
                type="button"
                aria-label="Next slide"
                onClick={(event) => {
                  if (event.detail === 0 || !swiped.current) move(1);
                }}
                aria-hidden={
                  animateStrip && direction > 0
                    ? offset === 0
                    : offset >= visibleCount
                }
                inert={
                  animateStrip && direction > 0
                    ? offset === 0
                    : offset >= visibleCount
                }
                className="gallery-artwork"
                key={visibleSlide.src}
              >
                {failedSrc === visibleSlide.src ? (
                  <span
                    className="artwork-unavailable"
                    role="img"
                    aria-label={`${visibleSlide.alt}. Artwork unavailable.`}
                  >
                    Artwork unavailable
                  </span>
                ) : (
                  <img
                    src={visibleSlide.src}
                    alt={visibleSlide.alt}
                    width="1000"
                    height="1000"
                    loading="lazy"
                    decoding="async"
                    onError={() => setFailedSrc(visibleSlide.src)}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <figure aria-live="off" aria-atomic="true">
          <button
            className="gallery-artwork"
            type="button"
            aria-label="Next slide"
            onClick={(event) => {
              if (event.detail === 0 || !swiped.current) move(1);
            }}
          >
            {animateStrip && (
              <img
                className="character-previous"
                key={`previous-${index}`}
                src={props.slides[previous]!.src}
                alt=""
                aria-hidden="true"
                width="1000"
                height="1000"
              />
            )}
            {failedSrc === slide.src ? (
              <span
                className="artwork-unavailable"
                role="img"
                aria-label={`${slide.alt}. Artwork unavailable.`}
              >
                Artwork unavailable
              </span>
            ) : (
              <img
                key={slide.src}
                className={animateStrip ? 'character-entering' : undefined}
                src={slide.src}
                alt={slide.alt}
                width="1000"
                height="1000"
                loading="lazy"
                decoding="async"
                onError={() => setFailedSrc(slide.src)}
              />
            )}
          </button>
          {!props.compact && (
            <figcaption key={slide.src} data-animated={animateStrip}>
              <p className="eyebrow">
                {props.id === 'characters'
                  ? 'Character profile'
                  : 'Original collection artwork'}
              </p>
              <TitleTag className="gallery-title">
                {slide.scrambled ? (
                  <ScrambledSignal label={slide.title} />
                ) : (
                  slide.title
                )}
              </TitleTag>
              <p>
                {slide.scrambled ? (
                  <ScrambledSignal label={slide.description} multiline />
                ) : (
                  slide.description
                )}
              </p>
            </figcaption>
          )}
        </figure>
      )}
    </div>
  );
}
