/**
 * A synchronized local-artwork carousel with keyboard navigation and automatic playback.
 * @packageDocumentation
 */

import { useEffect, useRef, useState } from 'react';
import type { GallerySlide } from './showcaseContent';
import { ScrambledSignal } from './ScrambledSignal';

/** Configuration for one independently controlled, nonempty local gallery. */
interface GalleryProps {
  id: string;
  title: string;
  slides: readonly GallerySlide[];
  intervalMs: number;
  visibleSlides?: number;
  compact?: boolean;
}

/**
 * Keep one selected slide for artwork and description; never change keyboard focus automatically.
 * @param props - Unique accessible identity, nonempty ordered slides and autoplay interval.
 * @returns The local gallery, keyboard navigation, image fallback and automatic slideshow.
 */
export function Gallery(props: GalleryProps) {
  const [selection, setSelection] = useState({ index: 0, previous: 0 });
  const { index, previous } = selection;
  const [animateStrip, setAnimateStrip] = useState(false);
  const [failedSrc, setFailedSrc] = useState('');
  const regionRef = useRef<HTMLDivElement>(null);
  const slide = props.slides[index]!;
  const count = props.slides.length;
  const visibleCount = Math.min(props.visibleSlides ?? 1, count);
  const visibleSlides = Array.from(
    { length: visibleCount + (visibleCount > 1 ? 1 : 0) },
    (_, offset) => props.slides[(index + offset) % count]!,
  );

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
      if (inView && !document.hidden && !media.matches && !hasFocus) {
        timer = setInterval(() => {
          setAnimateStrip(true);
          setSelection((current) => ({
            index: (current.index + 1) % count,
            previous: current.index,
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
  }, [count, props.intervalMs]);

  /**
   * Navigate with wraparound while leaving automatic playback enabled.
   * @param offset - Signed number of slides to move from the current selection.
   */
  function move(offset: number) {
    setAnimateStrip(true);
    setSelection((current) => ({
      index: (current.index + offset + count) % count,
      previous: current.index,
    }));
  }

  return (
    <div
      className="gallery"
      data-playing="false"
      data-visible="false"
      ref={regionRef}
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={`${props.id}-heading`}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          move(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}
    >
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
      {visibleCount > 1 ? (
        <div className="gallery-strip" aria-live="off">
          <div
            className={`gallery-strip-track${animateStrip ? ' is-advancing' : ''}`}
            key={index}
          >
            {visibleSlides.map((visibleSlide, offset) => (
              <div
                aria-hidden={offset >= visibleCount}
                className="gallery-artwork"
                key={visibleSlide.src}
              >
                {failedSrc === visibleSlide.src ? (
                  <div
                    className="artwork-unavailable"
                    role="img"
                    aria-label={`${visibleSlide.alt}. Artwork unavailable.`}
                  >
                    Artwork unavailable
                  </div>
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
              </div>
            ))}
          </div>
        </div>
      ) : (
        <figure aria-live="off" aria-atomic="true">
          <div className="gallery-artwork">
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
              <div
                className="artwork-unavailable"
                role="img"
                aria-label={`${slide.alt}. Artwork unavailable.`}
              >
                Artwork unavailable
              </div>
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
          </div>
          <figcaption>
            <p className="eyebrow">
              {props.id === 'characters'
                ? 'Character profile'
                : 'Original collection artwork'}
            </p>
            <h4>
              {slide.scrambled ? (
                <ScrambledSignal label={slide.title} />
              ) : (
                slide.title
              )}
            </h4>
            <p>
              {slide.scrambled ? (
                <ScrambledSignal label={slide.description} multiline />
              ) : (
                slide.description
              )}
            </p>
          </figcaption>
        </figure>
      )}
    </div>
  );
}
