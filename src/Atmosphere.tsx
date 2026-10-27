/**
 * Decorative CSS effects with visibility-aware lifecycle control and static fallback.
 * @packageDocumentation
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MatrixRain } from './MatrixRain';

/** Properties for the single decorative region; its content remains semantic HTML. */
interface AtmosphereProps {
  children: ReactNode;
  paused?: boolean;
}

/**
 * Suspend the hero's effects while hidden or offscreen; CSS separately honors reduced motion.
 * @param props - Semantic hero content, rendered above an inaccessible decorative layer.
 * @returns A static-by-default region that animates only after visibility is established.
 */
export function Atmosphere(props: AtmosphereProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const region = ref.current;
    if (!region || !('IntersectionObserver' in window)) return;
    let inView = false;

    /** Combine viewport and tab visibility without polling or scroll listeners. */
    function updateVisibility() {
      setActive(inView && !document.hidden);
    }

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      updateVisibility();
    });
    observer.observe(region);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', updateVisibility);
      region.dataset.active = 'false';
    };
  }, []);

  return (
    <div
      className="atmosphere"
      ref={ref}
      data-active={active && !props.paused}
      data-paused={Boolean(props.paused)}
    >
      <MatrixRain active={active && !props.paused} />
      {props.children}
    </div>
  );
}
