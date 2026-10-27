/**
 * Readable source-derived heading treatment with decorative, motion-gated color layers.
 * @packageDocumentation
 */

import './GlitchText.css';

/** One meaningful text label; the two visual copies are hidden from assistive technology. */
interface GlitchTextProps {
  text: string;
}

/**
 * Retain one readable label while adding sliced, displaced neon copies.
 * @param props - The complete heading or decorative statement.
 * @returns Inline typography; the containing motion region controls playback.
 */
export function GlitchText(props: GlitchTextProps) {
  return (
    <span className="glitch">
      <span className="glitch-label">{props.text}</span>
      <span
        className="glitch-layer glitch-layer--green"
        aria-hidden="true"
        data-text={props.text}
      />
      <span
        className="glitch-layer glitch-layer--purple"
        aria-hidden="true"
        data-text={props.text}
      />
    </span>
  );
}
