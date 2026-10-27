/**
 * Automatically loaded interim hero with a model-specific poster and bounded motion.
 * @packageDocumentation
 */

import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useCallback,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import './LocalHero.css';

const Scene = lazy(() => import('./LocalHeroScene'));

/** Model loading state, lifecycle callbacks and actual transfer progress. */
interface LocalHeroProps {
  enabled: boolean;
  paused?: boolean;
  /** Reveal the application after the renderer samples a completed frame. */
  onReady: () => void;
  /** Reveal the application after a handled model or graphics failure. */
  onUnavailable: () => void;
  /** Start an explicit model reload and show the loading screen. */
  onLoad: () => void;
  /**
   * Update model download progress without treating transfer completion as renderer readiness.
   * @param loaded - Actual response-body bytes received by the loader.
   */
  onDownload: (loaded: number) => void;
}

/** Local renderer evidence, not a device-independent performance claim. */
export interface HeroStats {
  loadMs: number;
  triangles: number;
  drawCalls: number;
  dpr: number;
}

/** Error boundary properties keep the rest of the showcase usable after a renderer failure. */
interface BoundaryProps {
  children: ReactNode;
  /** Release the loading screen when a child renderer cannot continue. */
  onUnavailable: () => void;
}

/** Capture asset, WebGL and lazy-module errors without automatically retrying them. */
class HeroBoundary extends Component<
  BoundaryProps,
  { failed: boolean; webgl: boolean }
> {
  state = { failed: false, webgl: false };

  /**
   * Switch to static explanatory content after any child renderer failure.
   * @param error - Local failure used only to distinguish graphics support from asset failure.
   * @returns Failure state without retaining asset internals or error details.
   */
  static getDerivedStateFromError(error: unknown) {
    return {
      failed: true,
      webgl:
        error instanceof Error && /webgl|graphics context/i.test(error.message),
    };
  }

  /** Notify the parent after React commits the static error fallback. */
  componentDidCatch() {
    this.props.onUnavailable();
  }

  /**
   * Keep the page usable if the temporary model or graphics context fails.
   * @returns Children or a static, accessible error state.
   */
  render() {
    return this.state.failed ? (
      <div className="local-hero-placeholder">
        <img
          src="/hero/wattson-poster.png"
          width="640"
          height="640"
          alt="Wattson character on black"
        />
        <p role="status">
          {this.state.webgl ? 'WebGL unavailable.' : '3D unavailable.'} You can
          continue with the poster image; the showcase still works.
        </p>
      </div>
    ) : (
      this.props.children
    );
  }
}

/**
 * Subscribe to browser motion/visibility changes without polling or global scroll handlers.
 * @param notify - React snapshot invalidation callback.
 * @returns Cleanup for both native event subscriptions.
 */
function subscribePlayback(notify: () => void) {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', notify);
  document.addEventListener('visibilitychange', notify);
  return () => {
    media.removeEventListener('change', notify);
    document.removeEventListener('visibilitychange', notify);
  };
}

/**
 * Read whether the browser permits continuous decorative motion right now.
 * @returns False for hidden documents or reduced-motion preferences.
 */
function browserPlayback() {
  return (
    !document.hidden && !matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Default to a static state outside a mounted browser.
 * @returns A disabled playback snapshot for server rendering.
 */
function staticPlayback() {
  return false;
}

/**
 * Automatically load the owner-approved interim model while retaining its fallback poster.
 * @param props - Model loading state, lifecycle callbacks and actual transfer progress.
 * @returns Automatic model loading, a fallback poster, reload control and local evidence.
 */
export function LocalHero(props: LocalHeroProps) {
  const { onReady } = props;
  const [inView, setInView] = useState(false);
  const [stats, setStats] = useState<HeroStats | null>(null);
  const [startedAt, setStartedAt] = useState(() => performance.now());
  const region = useRef<HTMLElement>(null);
  const browserAllowsMotion = useSyncExternalStore(
    subscribePlayback,
    browserPlayback,
    staticPlayback,
  );
  const playing = inView && browserAllowsMotion && !props.paused;

  /**
   * Retain local evidence and reveal the experience only after a completed frame sample.
   * @param sample - Counters sampled by the mounted renderer.
   */
  const captureStats = useCallback(
    (sample: HeroStats) => {
      setStats(sample);
      onReady();
    },
    [onReady],
  );

  useEffect(() => {
    if (!region.current || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry?.isIntersecting ?? false),
    );
    observer.observe(region.current);
    return () => observer.disconnect();
  }, []);

  /** Start a new, explicit loading sample before importing the renderer and fetching assets. */
  function load() {
    setStartedAt(performance.now());
    setStats(null);
    props.onLoad();
  }

  return (
    <figure
      className="local-hero"
      ref={region}
      aria-label="Wattson 3D hero"
      data-playing={playing}
      data-rendered={props.enabled && Boolean(stats)}
    >
      <div className="local-hero-stage">
        {!props.enabled ? (
          <div className="local-hero-placeholder">
            <img
              src="/hero/wattson-poster.png"
              width="640"
              height="640"
              alt="Wattson character on black"
            />
            <p className="sr-only">3D preview is currently unloaded.</p>
          </div>
        ) : (
          <HeroBoundary onUnavailable={props.onUnavailable}>
            <Suspense
              fallback={
                <p role="status">
                  Loading 3D model… the showcase remains usable.
                </p>
              }
            >
              <Scene
                playing={playing}
                onStats={captureStats}
                startedAt={startedAt}
                onDownload={props.onDownload}
              />
            </Suspense>
          </HeroBoundary>
        )}
      </div>
      {!props.enabled && (
        <div className="local-hero-controls">
          <button
            type="button"
            onClick={load}
            aria-label="View in 3D (70.10 MB)"
          >
            View in 3D
          </button>
        </div>
      )}
    </figure>
  );
}
