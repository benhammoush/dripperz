# Dripperz

A cyberpunk showcase for the Dripperz collection, combining animated artwork,
collection galleries, an offline rarity explorer and an interactive terminal.

## Tech stack

| Layer               | Technology                          |
| ------------------- | ----------------------------------- |
| Interface and build | React, TypeScript, Vite             |
| 3D rendering        | Three.js, React Three Fiber         |
| Collection data     | Local JSON and layered artwork      |
| Testing             | Vitest, Testing Library, Playwright |

## Features

- Explore the collection through galleries and an animated 3D introduction.
- Look up collection traits and rarity using bundled data.
- Browse the cybermap, collection information and FAQ.
- Use a local command-driven terminal to explore the showcase.
- Continue without 3D when graphics support or model loading is unavailable.

## Boundaries and integration

Shared tokens and reusable visual presentation are organized in the
[Dripperz design system](src/design-system/README.md).

Dripperz is a static frontend with no application backend. Artwork, models and
collection data are served with the site; rarity lookups do not query a blockchain
or external API.

The showcase does not connect wallets, mint tokens or move funds. Treasury content
is historical, not a live balance feed or financial commitment. The optional 3D
experience has a static alternative so the rest of the site remains accessible
without WebGL.

See [the showcase specification](docs/spec/dripperz.md) for the product scope and
[collection provenance](docs/core-showcase.md) for artwork and content boundaries.
