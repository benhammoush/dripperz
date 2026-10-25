# Interim Wattson hero

## Authority and assets

On 2026-10-17 the owner confirmed publication rights for the current Wattson
model and approved using it on hosted dev pending replacement, including the
large-file transport change. This supersedes the earlier local-only prototype
restriction. Rights are owner-confirmed, not an independent license audit.
Production still requires its existing separate manual approval; preparing this
PR does not authorize merge, deployment or provider-setting changes.

`public/hero/wattson.glb` is an unchanged copy of the temporary model:
70,102,064 bytes, SHA-256
`3320181d562d490eab7ffb3adfb61e9b31a1f50655085dd59720a93b95c9c9e3`.
It contains 9 meshes, about 46,000 triangles, 31 embedded images and the roughly
62-second `All Animations` clip. `public/hero/wattson-poster.png` is a captured
rendering of that model with original renderer alpha, not black color removal
or a separate third-party image. This preserves opaque black armor while
letting the Matrix backdrop show through the surrounding empty pixels.
Original legacy assets remain untouched. Ignored `.local-hero/` copies are not
published; the special loopback middleware has been removed.

## Behavior

- Wattson is the large central figure, not a side card: no border, interim
  label or printed diagnostics. The centered headline sits above the character,
  introduction and Explore CTA below; static-view and pause controls remain
  secondary. The same composition stacks naturally on mobile and tablet.
- The Matrix backdrop follows the actual legacy `Phase_3.tsx` / `Phase_3_Mb.tsx`
  canvas, not repeated CSS text columns: random ASCII 0–127, `#0694c1`, 20px
  spacing, 15pt monospace and `#0001` trail fading as the visual reference.
  The latest owner-selected variation uses 160ms drawing cadence and 40px
  column spacing, calmer and sparser than the archive and the earlier 80ms trial.
  The owner subsequently requested 50% smaller characters: both seeded and animated
  glyphs now use 7.5pt monospace, without changing spacing, cadence or safeguards.
  A subsequent request tightens same-column glyph spacing to 10px. Two rows are
  drawn per unchanged 20px advance/160ms frame, retaining falling speed; seeded
  trails retain their physical length and fade profile with twice as many rows.
  Its
  opacity is the desktop source's 0.4. It remains hero-scoped rather than a
  fixed overlay on the rest of the archive. Responsive sizing, a DPR cap of 1.5,
  immediate seeded trails and viewport-relative recycling replace the old
  hard-coded surface, delayed entry and unbounded reset range. One owned,
  throttled animation-frame loop replaces the legacy leaking interval.
  Manual pause, loading, hidden/offscreen and reduced-motion gates stop animated
  drawing. Size changes may refresh the static seed. A static field remains when motion is disabled; missing 2D
  support leaves the page usable on plain black. Resize/media listeners and
  outstanding requests are released on unmount. The rain stays visible through
  the transparent live stage and static poster; HDR remains absent.
- The hero appears on the normal page without a query parameter. On entry it
  automatically imports the renderer and loads the 70.10 MB same-origin GLB
  behind a full-screen native modal and the original **Loading Experience**
  wording. Its download bar uses real loader response-body bytes against the
  pinned 70,102,064-byte uncompressed model size, independent of potentially
  compressed or missing HTTP Content-Length. It is not a time-based simulation.
  At 100% it says **Download complete · Preparing 3D…** until a completed frame;
  decoding and GPU preparation are not counted as downloaded bytes. Cached
  reloads may emit no new transfer events. **Continue without 3D** appears after
  10 seconds of pending loading, with a fresh delay on explicit reload;
  keyboard Escape remains immediately available. The page is inert until a
  completed frame, handled failure or static continuation releases it. Focus
  moves to the main content after dismissal. The bar has no animated spinner.
  There is no decoder CDN or remote preset.
- The selected design uses a pure black background with local ambient and
  directional lights. HDR has no control, loader, route or environment map.
- Asset/renderer errors and unavailable WebGL automatically reveal the page with
  a model-specific poster. Continue without 3D or unload restores that static
  view immediately, without waiting for loading. Skipping does not promise to
  abort an in-flight loader transfer or release cached data. Explicit reload
  uses the loading screen again and may reuse the session's model cache.
- Reduced motion, hidden tabs and offscreen state gate model animation and slow
  rotation; static scenes use demand rendering. The camera is locked, with no
  manual orbit listeners. Animation mixers have owned cleanup.
- HQ-first model rendering uses device DPR clamped to 1.5–3, without the former
  automatic reduction after slow frames.
  This prioritizes sharpness at increased GPU cost; it does not upgrade the
  model's original geometry/textures or establish a hardware frame-rate guarantee.
  Bounds-based camera framing replaces the legacy arbitrary world offset. These
  are safeguards, not physical-device performance or exact legacy fidelity claims.
- Renderer counters remain internal readiness evidence, not visible hero copy. The model remains a large interim
  download and can use substantial CPU/GPU memory. Final asset optimization,
  final poster and physical-device acceptance remain open.

## Delivery and checks

The public GLB is intentionally included in the tested static build and Git
source (below GitHub's 100 MiB individual-file limit). No Git LFS service or
external storage is introduced. Vercel's binary file upload API avoids embedding
the large model as base64 inside deployment JSON. The JSON guard stays at 4 MB;
file/bundle transport bounds, integrity and uncertain-upload handling are
specified in [delivery](delivery.md). Scoped-token binary upload support still
requires an authorized hosted run; mocks are not provider verification.

`npm run check` covers strict lint/documentation, formatting, types, asset
integrity, tooling/unit tests, workflow lint, dependency audits and the production
build. `npm run test:e2e` (also available as `npm run test:browser`)
checks native loading, keyboard/static continuation and the rest of the page
across three engines, including delayed continuation and immediate Escape,
holding the renderer chunk while exercising the real static escape path.
Unit checks exercise the exact 9,999/10,000 ms threshold and separate download
completion from frame readiness. `npm run test:hero` checks the built app with automatic
real-model rendering/reloading on Chromium software WebGL, stalled-download
continuation, asset failure and disabled WebGL. Both CI and pre-delivery verification run the
hero suite for hero-capable sources; pre-hero exact-source recovery candidates
remain supported. These are not physical-GPU benchmarks or owner visual acceptance.

The accepted compatibility adjustment remains Fiber `9.8.2` plus Three's
official loaders/controls (`three` `0.186.1`, types `0.186.0`), without Drei's
incompatible strict declarations. No strict compiler checks were weakened.
Internal `LocalHero*` filenames are retained to minimize migration churn; their
rendered component is no longer restricted to local development.
