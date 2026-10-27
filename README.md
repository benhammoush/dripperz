# Dripperz

A cyberpunk showcase for the Dripperz collection, combining animated artwork,
collection galleries, an offline rarity explorer and an interactive terminal.
Visitors can explore without an account, wallet connection or transaction signature.

## Tech stack

| Layer               | Technology                          |
| ------------------- | ----------------------------------- |
| Interface and build | React, TypeScript, Vite             |
| 3D rendering        | Three.js, React Three Fiber         |
| Collection data     | Local JSON and layered artwork      |
| Testing             | Vitest, Testing Library, Playwright |

## Features

### 3D introduction

An animated model fills the opening viewport, layered with an oversized Cyberclub
headline. A scrolling welcome strip and a separate Enter the Cyberclub link lead
into the collection. The animated mouse-shaped scroll link sits at the bottom of
the hero. The loading screen shows download progress and prepares the scene before
revealing the page. Escape continues immediately without 3D; a visible skip button
appears after ten seconds. Graphics or loading failures use a static poster.

The model rotates with a fixed camera. Reduced motion stops continuous animation;
hidden or offscreen scenes stop rendering work. A cyan Matrix backdrop runs behind
the page and pauses during loading.

### Collection and characters

The featured collection cycles through local artwork every five seconds, showing
three images on desktop and one on narrower screens. Resizing preserves the
selected artwork. A standalone Cyberclub presentation introduces the fashion
universe before the collection headlines and separate character carousel.
Character profiles pair each image with its title and story, advancing every
eight seconds through synchronized vertical transitions. Desktop profiles put
the story on the left and portrait on the right; narrow screens stack them.

Both galleries support Left/Right keyboard navigation; character profiles also
support Up/Down. Tap or click the artwork to advance, or swipe horizontally in
either direction on touchscreens. There are no separate arrow buttons. Manual
navigation remains available when motion is paused. Focus, reduced motion,
hidden tabs and offscreen content pause automatic cycling. Failed artwork does
not block navigation or descriptions.

### Rarity explorer

Enter a Dripperz ID from 1 to 5,555 and choose Find Dripperz to view its attributes, stored rank and rarity
score. The preview composes local image layers for that token. Data loads near the
section, with manual entry available; invalid IDs, unavailable data and failed
images have separate recovery states. Submit Find Dripperz again to retry a failed
composed preview; there is no separate artwork-reload control.

Scores and ranks come from the bundled collection snapshot, not a live service or
new scoring model.

The expandable rarity catalog presents all 128 traits with their local artwork,
stored component score and occurrence count. Search by trait name and filter by
category without changing the selected token. Catalog previews load only after
opening the catalog, with offscreen images loaded lazily. Failed previews can be
retried without hiding their trait facts.

### Terminal

A small command prompt provides help, clears output and links to two collection
documents. It supports command history and keyboard input, without running shell
commands or storing a session. The terminal is hidden on phones to keep content
and navigation unobstructed.

### DAO reader — disconnected

The original DAO reader displayed Safe treasury balances and the latest Snapshot
proposal, including its title, status, description and choices. Active proposal
choices linked to Snapshot for voting.

This showcase preserves the treasury and proposal layout with masked values.
The DAO integration is disconnected: it does not fetch balances or proposals,
connect a wallet or submit votes. The displayed choices are disabled placeholder
buttons, not voting controls.

### Cybermap and FAQ

The Cybermap quotes the original seven-stage roadmap. Its prices, allocations and
proposed benefits are historical wording, not current offers or commitments.
Historical context is explained in the FAQ rather than a separate roadmap notice.
The FAQ introduces the collection, characters, trait combinations, rarity lookup,
Cybermap and original community treasury. It distinguishes historical features
from the disconnected showcase without repeating obsolete mint instructions or
granting artwork rights.

## Interface and accessibility

One responsive page uses black, cyan, purple, magenta, Goldman typography and
translucent neon-edged panels. Large underlined headings, colored inline emphasis,
varied section widths and generous spacing follow the original visual reference.
The Cybermap uses illustrated markers and purple arrows, alternating around its
timeline on desktop and stacking on narrow screens.

Decorative heading copies produce sliced, displaced neon layers without
duplicating the accessible heading. Glitch layers, welcome scrolling and the
mouse-shaped scroll cue stop offscreen or in hidden tabs. Reduced motion keeps
these effects static. Pause effects in the navigation also stops the Matrix,
model animation and gallery autoplay; manual gallery navigation remains usable.

Fixed navigation links to each section; the mobile menu supports keyboard use
and Escape. A skip link leads directly to the main content.

The motion toggle, disabled treasury choices, Find Dripperz and rarity-catalog
toggle share the original pale-grey, rounded action-button treatment. The cyan
label is darker on the pale fill for readable contrast. The character gallery has
an accessible name but no visible heading or slide counter. There is no footer;
the runtime version remains available on the page shell's `data-app-version`.

Loading uses a modal dialog. When it closes for the first time, focus moves to
the visible terminal or main content on phones. Reloading 3D returns focus to
main content; resizing never moves it. Content remains usable without WebGL,
canvas or animation support.

## System design

Dripperz is a static React frontend. Artwork, model files, fonts, token data and
image layers are served from the same origin. There is no application backend,
authentication service or blockchain integration. Only explicit external links
leave the site: the terminal PDFs.

Shared content lives in `src/showcaseContent.ts` and `src/sections.ts`. Shared
visual primitives and tokens live in the [design system](src/design-system/README.md).

## Boundaries

The showcase does not connect wallets, mint tokens, sell assets, move funds or
request marketplace, ownership or live governance data. It has no radio, password
gate or private-document access. Viewing the artwork does not grant its rights.

The current 3D model is an interim, large download. A static alternative keeps
the rest of the site usable without loading or rendering it.
