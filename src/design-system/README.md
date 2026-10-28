# Dripperz design system

This module owns shared tokens, base styles and reusable components for Dripperz.

- `tokens.css` owns shared color roles, font, spacing, surface treatments and the
  decorative signal duration. Existing `--cyan`, `--muted`, `--line` and
  `--magenta` names are aliases, not a second palette.
- `base.css` owns the Goldman font, global defaults, focus and screen-reader utility.
- `styles.css` loads shared CSS before product rules in `src/styles.css`.
- `components/ActionButton.css` owns the pale, rounded action treatment. Apply
  `.action-button` only to the controls using this variant; normal-size labels
  use a darker cyan for contrast and retain a 44px minimum touch target.
- `components/ScrambledSignal.*` owns the reusable decorative signal. Use the
  public `index.ts` export; its caller provides stable meaning and visual size.
- `components/GlitchText.*` owns layered neon heading typography. Its real label
  remains readable and its visual copies are inaccessible decoration. The product
  supplies visible `.motion-region` containers and the atmosphere's playback gate;
  reduced-motion preferences always disable the layers.

Galleries, rarity, terminal behavior, content and page layout remain product-owned.
The Matrix canvas, 3D scene and their calibrated animation/renderer constants stay
with their feature. Hero, rarity and terminal CSS remain colocated with those
features; unique artwork geometry is not a shared token. The dark-only showcase
does not need a theme provider. Structural extraction does not approve visual
fidelity or change the existing responsive acceptance requirements.

Keep shared component CSS independent of product CSS and preserve visibility,
hidden-tab, reduced-motion and cleanup behavior. The signal's existing unit tests
and three-engine browser test cover those contracts. Run `npm run check` and the
affected browser suites; retain separate WebGL/fallback checks when scene-facing
styles change. Automated coverage is not owner visual acceptance or real-device
certification.
