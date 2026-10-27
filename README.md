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

An animated model sits above the collection, with a headline and Explore
link. The loading screen shows download progress and prepares the scene before
revealing the page. Escape continues immediately without 3D; a visible skip button
appears after ten seconds. Graphics or loading failures use a static poster.

The model rotates with a fixed camera. Reduced motion stops continuous animation;
hidden or offscreen scenes stop rendering work. A cyan Matrix backdrop runs behind
the page and pauses during loading.

### Collection and characters

The featured collection cycles through local artwork every three seconds, showing
three images on desktop and one on narrower screens. Resizing preserves the
selected artwork. Character profiles pair each image with its title and story,
advancing every 3.5 seconds.

Both galleries support Left/Right keyboard navigation. Focus, reduced motion,
hidden tabs and offscreen content pause automatic cycling. Failed artwork does
not block navigation or descriptions.

### Rarity explorer

Look up any token from 1 to 5,555 to view its attributes, stored rank and rarity
score. The preview composes local image layers for that token. Data loads near the
section, with manual entry available; invalid IDs, unavailable data and failed
images have separate recovery states.

Scores and ranks come from the bundled collection snapshot, not a live service or
new scoring model.

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
connect a wallet or submit votes. The displayed choices are static placeholders.

### Cybermap and FAQ

The Cybermap quotes the original seven-stage roadmap. Its prices, allocations and
proposed benefits are historical wording, not current offers or commitments.
The FAQ explains the collection showcase and its limitations.

## Interface and accessibility

One responsive page uses black, cyan, Goldman typography and translucent panels.
Fixed navigation links to each section; the mobile menu supports keyboard use
and Escape. A skip link leads directly to the main content.

Loading uses a modal dialog. When it closes for the first time, focus moves to
the visible terminal or main content on phones. Reloading 3D returns focus to
main content; resizing never moves it. Content remains usable without WebGL,
canvas or animation support.

## System design

Dripperz is a static React frontend. Artwork, model files, fonts, token data and
image layers are served from the same origin. There is no application backend,
authentication service or blockchain integration. Only explicit external links
leave the site: the Dripperz X profile and terminal PDFs.

Shared content lives in `src/showcaseContent.ts` and `src/sections.ts`. Shared
visual primitives and tokens live in the [design system](src/design-system/README.md).

## Boundaries

The showcase does not connect wallets, mint tokens, sell assets, move funds or
request marketplace, ownership or live governance data. It has no radio, password
gate or private-document access. Viewing the artwork does not grant its rights.

The current 3D model is an interim, large download. A static alternative keeps
the rest of the site usable without loading or rendering it.
