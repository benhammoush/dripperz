# Contributing

## Local foundation workflow

Use Node `24.21.0` and npm `11.19.0` (`.nvmrc`, `packageManager` and strict npm engines). Run `npm ci` from the repository root. Direct dependencies use exact pins; review compatibility and lockfile changes together.

- `npm run dev`: local development at <http://127.0.0.1:5173>.
- `npm run check`: version alignment, blocking lint/documentation, formatting, strict types, tooling-rule tests, component tests and production build.
- `npx --no-install playwright install chromium firefox webkit`: install the pinned harness's browsers locally. On Linux CI, add `--with-deps` for system dependencies.
- `npm run test:browser`: rebuild and test the production bundle in Chromium, Firefox and WebKit, at desktop and mobile viewport sizes. Port 4173 must be free; no existing server is reused.
- `npm run format`: format handwritten files; inspect the resulting diff.

Build and test artifacts are local and ignored. The public runtime version in `src/appVersion.ts` must exactly match `package.json`; `check:version` blocks drift before builds. `tests/tooling/version.test.mjs` proves pass/fail behavior. No environment variables, wallet access or external services are required for this foundation.

The pinned jest-dom `7.0.1` `/vitest` entry has incompatible assertion generics with Vitest `5.0.4`. The unit setup registers its standalone matchers with `expect.extend`; `tests/unit/dom-matchers.d.ts` augments Vitest 5's `Matchers<R, T>` for the two DOM assertions currently used. Add typings there if adopting more DOM matchers; remove the adapter after a verified upstream-compatible update. Full dependency type checking remains enabled (no `skipLibCheck`).

## English documentation is a blocking gate

Use JSDoc for JavaScript and TSDoc-compatible docblocks for TypeScript. Document each module (`@file` in JS; `@packageDocumentation` in TS), class, interface/type contract, named function, internal helper, hook and component. Include a descriptive body before the module tag; a tag alone is insufficient. Named arrows, callable object/class properties, method contracts and `memo`/`forwardRef` component declarations require docblocks too. For exported wrapped components, put the declaration's purpose above `export const` and the callable's parameter/result documentation immediately before the callback inside the wrapper. This gives the structure rules access to its actual signature instead of only the outer declaration. Anonymous trivial callbacks and declarative test cases are exempt, not wrapped components, handwritten test helpers or scripts.

Explain purpose, meaningful parameters/results, errors, side effects and assumptions. Use `@param name - Meaning` and `@returns Meaning`; keep TypeScript types in signatures, not repeated in docblocks. JavaScript may use JSDoc types. Document important failure/cleanup choices inline. Comments must stay accurate and useful; lint cannot prove that, so read-only review checks both.

ESLint flat configuration combines JSDoc presence/structure rules with blocking TSDoc syntax validation. Missing comments/descriptions, undocumented parameters/results and malformed TSDoc are errors, not warnings. The tooling fixture suite uses the actual configuration; only type-aware rules are disabled for in-memory fixture paths that do not exist in the TypeScript project. There are no changed-file baselines or blanket suppressions.

Explicit generated/artifact exclusions: `node_modules/`, `dist/`, `coverage/`, `playwright-report/`, `test-results/`, and `src/generated/` (reserved for generated source, currently absent). Never put handwritten code in those locations to evade lint. Formatting also excludes the generated lockfile; its correctness is verified by reproducible installation.

## Review and release boundaries

Work on short-lived branches targeting `main`. Require strict **Quality and build**, **Browser smoke** (GitHub Actions) and **CodeRabbit** checks bound to their respective apps, at least one approving review, stale-review dismissal, independent last-push approval and resolved conversations. Enforce protections for administrators and block force pushes/deletion. Verify these native settings separately; source files alone do not configure them. A successful CodeRabbit status alone is not current-head approval.

The owner explicitly assigns a bounded task and authorizes its endpoint. The assistant owns implementation, affected checks, authorized PR publication and valid CI/CodeRabbit review repairs; resume paused reviews when needed. Run automated checks, obtain read-only review and request the user's localhost acceptance (or explicit skip) before publication. `.coderabbit.yaml` enables approvals after completed review and disables author-triggered approval/resolve overrides. The owner decides when to merge after current-head checks and approval pass. No automatic merger, merge PAT, backlog pickup or orchestration service is required. Dependabot updates follow the same manual merge boundary.

An authorized merge triggers CI and then the existing main-only dev delivery workflow when enabled. Verify the exact deployed source/provider identity and affected dev behavior; smoke and green CI do not replace acceptance. Production is a separate manual promotion of the exact dev-accepted SHA with native approval and recovery evidence. Do not change the existing Netlify site or copy legacy assets without publication approval. Canonical requirements and milestone dependencies live in [the specification](spec/dripperz.md).

The [delivery contract and runbook](docs/delivery.md) own exact-source selection, setup prerequisites, approval gates, identity smoke and recovery boundaries. Delivery contract tests are included in `npm run test:rules` and therefore `npm run check`; they use synthetic data and never deploy. Do not enable repository delivery variables as part of ordinary publication or merging.
