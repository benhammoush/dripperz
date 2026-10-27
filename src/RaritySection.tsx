/**
 * Defer the explorer code and data until the section approaches view or is explicitly opened.
 * @packageDocumentation
 */

import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

const Explorer = lazy(() => import('./RarityExplorer'));

/** Only the explorer subtree is replaced if its lazy module cannot load. */
interface BoundaryProps {
  children: ReactNode;
}

/** Keep missing JavaScript chunks from breaking unrelated showcase sections. */
class RarityBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };
  /**
   * Select a static local failure message rather than automatically retrying imports.
   * @returns The failed boundary state.
   */
  static getDerivedStateFromError() {
    return { failed: true };
  }
  /**
   * Render the explorer or an explanation with a manual page-reload recovery path.
   * @returns Safe content scoped to this section.
   */
  render() {
    return this.state.failed ? (
      <p role="alert">
        Rarity explorer unavailable. Reload this page to retry; the rest of the
        showcase still works.
      </p>
    ) : (
      this.props.children
    );
  }
}

/**
 * Activate once near the viewport, with a manual fallback for unsupported observation.
 * @returns Deferred entry controls or the lazy explorer with loading/error containment.
 */
export function RaritySection() {
  const [opened, setOpened] = useState(false);
  const region = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (opened || !region.current || typeof IntersectionObserver !== 'function')
      return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setOpened(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(region.current);
    return () => observer.disconnect();
  }, [opened]);
  return (
    <div ref={region}>
      {opened ? (
        <RarityBoundary>
          <Suspense fallback={<p role="status">Loading rarity explorer…</p>}>
            <Explorer />
          </Suspense>
        </RarityBoundary>
      ) : (
        <>
          <p>
            Explore the collection by Dripperz ID using its original traits and
            rarity data.
          </p>
          <button
            className="motion-toggle"
            type="button"
            onClick={() => setOpened(true)}
          >
            Open rarity explorer
          </button>
        </>
      )}
    </div>
  );
}
