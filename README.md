# Dripperz

A cyberpunk showcase for the Dripperz collection, with an animated 3D hero,
collection galleries, an offline rarity explorer and an interactive terminal.
No wallet connection, minting or blockchain-data integration is required.

## Tech stack and system design

| Layer               | Tools                               |
| ------------------- | ----------------------------------- |
| Interface and build | React, TypeScript, Vite             |
| 3D rendering        | Three.js, React Three Fiber         |
| Collection data     | Local JSON and layered artwork      |
| Testing             | Vitest, Testing Library, Playwright |

The site is a static frontend with no application backend. Collection data and
artwork are served with the site; rarity lookups do not query a blockchain or
external API. The optional 3D hero loads separately, with a static alternative
that keeps the rest of the showcase accessible without WebGL.
