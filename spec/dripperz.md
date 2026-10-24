# Dripperz — Phase 3 showcase rebuild

## 1. Status and authority

**Status: accepted by the user, 2026-10-14.** This document consolidates accepted planning scope; it does not claim implementation or deployment. Section 7's unresolved decisions remain open.

The user authorized drafting this specification and then explicitly selected “Accept specification”. Acceptance does not authorize execution. Application implementation, branch preparation, staging, commits, pushes, PR creation, repository governance changes, provider provisioning and deployment remain separately authorized actions. An Accepted board card is direction approval, not permission to execute it.

This is the canonical product-specification location selected by the user. Requirements changes must be reflected here. Board cards track delivery and evidence; operational memory tracks verified state, not a second requirements backlog.

### Sources

- Product board: <https://github.com/users/benhammoush/projects/4>.
- Product direction: [Roadmap](https://github.com/users/benhammoush/projects/4/views/1).
- Execution entry point: [Delivery by outcome](https://github.com/users/benhammoush/projects/4/views/5).
- New source repository: <https://github.com/benhammoush/Dripperz>.
- Deployed visual reference: <https://dripperzcyberclub.netlify.app/>.
- Legacy reference only: `C:/Work/Drip/src/Phase_3.tsx`, `Phase_3_Mb.tsx` and related components/assets. Do not copy private material or generated builds into the new source repository.
- Accepted board scope inspected on 2026-10-14: three Outcome cards, PR 1–8 delivery cards and two Setup cards; all Accepted / Planned. No Horizon commitment or actual PR links were recorded.
- User decisions on 2026-10-14: repository-local specification, initial application version `0.1.0`, and separately authorized README-only `main` bootstrap before PR 1.

Legacy code and the live site are reference material, not authority to retain obsolete integrations, security mechanisms or content claims. Conflicts with this specification's exclusions must be surfaced rather than silently copied.

## 2. What we will deliver

A responsive showcase that preserves Dripperz Phase 3's cyberpunk identity and interactive character without wallet, minting or blockchain-data integrations.

| Outcome                              | Visitor or maintainer value                                                                 | Supporting planned delivery         |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ----------------------------------- |
| Faithful Phase 3 across devices      | Recognizable visuals, artwork, navigation and content on desktop and mobile                 | PRs 3–5                             |
| Interactive showcase without Web3    | Local rarity exploration, decorative terminal, opt-in radio and clearly historical treasury | PRs 6–7                             |
| Maintainable and verifiable delivery | Documented source, automated checks, reviewable changes and traceable, recoverable releases | PRs 1–2 and 8; separate setup tasks |

No new business promises, launch dates, adoption targets or Now/Next/Later priorities are introduced by this specification.

## 3. Product requirements

### 3.1 Visual identity and responsive shell

- Owner accepted the current desktop design for PR publication on October 22, 2026. Responsive/tablet/mobile owner acceptance remains pending; automated browser coverage is not a substitute. This authorizes PR preparation, not merge or production deployment.

- Preserve the black/cyan palette, Goldman font, borders, Matrix/glitch effects, marquees and Phase 3 layout identity.
- Capture representative desktop/mobile references and extract visual tokens before reconstructing the visual shell.
- Preserve intentional desktop/mobile differences without duplicating entire pages.
- Provide responsive navigation with correct section targets, keyboard operation and visible focus behavior.
- Respect reduced-motion preferences. Animations must use lifecycle cleanup and visibility-aware behavior rather than unmanaged timers or global scroll handlers.
- Once approved reference captures are available, verify representative desktop/mobile visual fidelity against them at the provisional target viewports below. Reference captures, comparison criteria and responsive owner acceptance remain outstanding in section 7.
- PR 3 provisional review criteria agreed 2026-10-16: source-first review targeting desktop 1440×900, tablet 768×1024 and mobile 390×844, requiring owner localhost acceptance of layout/identity rather than pixel-exact matching. Usable reference captures and responsive owner acceptance remain outstanding; see [visual baseline and branding provenance](../docs/core-showcase.md#visual-baseline-and-branding). Logo/branding publication approval is distinct from the confirmed publication rights for all ten audited Phase 3 collection/character images and their optimized derivatives in [core showcase provenance](../docs/core-showcase.md). Owner visual acceptance of those derivatives remains pending; publication rights do not establish visual acceptance. Neither rights approval extends to later models or private documents, which require their own evidence.
- Latest visual refinement: keep the compact 54px fixed navigation visible, use translucent cyan-glow section panels with scroll reveal/hover effects, and show a local artwork carousel immediately after the hero. Keep the removed welcome ribbon and Pause/Static controls absent. The carousel and reveals must respect focus, offscreen/hidden-tab and reduced-motion safeguards; inaccessible IntersectionObserver falls back to visible panels.

### 3.2 Core showcase

- Rebuild collection artwork, synchronized image/description galleries, cybermap timeline, FAQ and footer in the reference section order and styling.
- Keep content and approved public links in shared configuration rather than divergent desktop/mobile copies.
- Support gallery keyboard controls and autoplay pause; keep image and description selection synchronized.
- Verify navigation, galleries, FAQ and public links at mobile, tablet and desktop sizes.
- Clearly distinguish historical milestones from current commitments. Do not invent new promises or publish sensitive legacy material.
- PR 4 content decisions approved 2026-10-16: publication rights confirmed for the ten audited Phase 3 artwork files and optimized derivatives; use shared desktop collection order and the original character mapping, preserve lore redactions, label all seven cybermap stages as archived proposals without claiming completion, replace sales/wallet/ownership FAQ claims with showcase-focused answers, retain only the approved Dripperz X link, and omit personal footer attribution. See [core-showcase provenance and behavior](../docs/core-showcase.md). Galleries are manual by default with optional pausable autoplay; no delivery-limit increase is approved.
- Owner clarification: the second character's running text was a decorative glitch, not redacted information. Restore cycling synthetic characters for that title/description, with stable accessible labels, reduced-motion/static fallback, pause control and hidden/offscreen suspension; do not invent an identity or claim that content was withheld.
- Latest visual refinement: add a featured collection carousel directly after the hero using three simultaneous approved local artworks and the existing accessible gallery behavior, advancing every 3 seconds. It replaces the separate collection-portraits gallery; retain the character gallery.

### 3.3 3D hero

- Preserve the animated Wattson hero using React Three Fiber/Drei after asset inventory and publication-rights review.
- The candidate reference model is `Wattson_Animated.glb`; its presence in legacy sources is not publication permission. HDR assets and environment maps are excluded from the selected hero.
- Match the approved reference model and animation on a pure black background using local lights, without HDR or remote environment presets.
- Lazy-load the hero, use adaptive pixel ratio and control rendering work when offscreen or hidden.
- Provide loading/error UI, a static poster and an unsupported-WebGL fallback. The page must remain usable without the model.
- Verify reduced-motion behavior, desktop/mobile fidelity, asset loading and error/no-WebGL paths.
- Measure asset/rendering cost before making performance claims. Numerical budgets are not yet specified.
- Interim publication approved 2026-10-17: the owner confirmed publication rights for the current Wattson model and approved its use on hosted dev pending later replacement, including a large-asset delivery change. This supersedes the earlier local-only asset restriction, not production's manual approval gate. Include the unchanged GLB and a captured model-specific poster in `public/hero/`. Owner-selected loading flow supersedes click-to-load: automatically import the renderer and load the 70.10 MB model on entry behind a full-screen “Loading Experience” screen; reveal the page after a completed frame. The 2026-10-18 refinement replaces the spinner with actual response-body download progress against the pinned uncompressed model size (not elapsed time or item counts); transfer completion says “Preparing 3D…” until rendering is ready. Show the “Continue without 3D” button only after 10 seconds of pending loading, reset the delay on explicit reload and retain immediate keyboard Escape. Release the loading screen on handled model/graphics failure and keep a model-specific static view. Reduced motion stops continuous model/orbit motion, not the automatic download; the bar has no artificial motion. Do not claim that skipping cancels an already-started loader transfer or clears its cache. Use the same deployable application build locally and for hosted dev, without the old query gate or private streaming route. Stop at checked, reviewed code and affected local acceptance before PR publication; no merge or deployment is authorized by this implementation step. See [interim hero behavior](../docs/local-hero-prototype.md).
- Prototype compatibility adjustment: use Fiber with Three's official loaders/controls instead of Drei for this temporary local viewer, preserving strict TypeScript checks. Reassess the final hero library choice when selecting the final asset.
- Selected appearance: the temporary model on a pure black background. HDR support remains completely removed; preserve original legacy files. The interim poster is captured from the current model; final model/poster selection may be deferred while separately approved feature work continues.
- Character-led hero direction supersedes the side panel: remove the card border, interim label and visible technical diagnostics; use a large, centered Wattson figure on black with the readable headline and Explore CTA at desktop/tablet/mobile sizes. Remove the Pause effects and Static view controls; preserve automatic download/progress/delayed continuation, error/poster fallback and motion safeguards. Keep Matrix rain viewport-fixed behind the full page, including the footer, and pause it while the loading dialog makes the page inert. Seed visible trails immediately; hidden-tab, offscreen and reduced-motion behavior still apply.
- Archived Matrix direction supersedes repeated CSS columns: adapt the legacy Phase_3 desktop/mobile canvas effect's random ASCII range, cyan `#0694c1`, 20px column/row spacing, 15pt monospace, `#0001` fading trails and 40ms drawing cadence at the desktop source's 0.4 opacity. Keep it behind the full page, responsive rather than fixed at 1920×1080, with viewport-fixed coverage that remains visible while scrolling through the footer; seed visible trails immediately and recycle columns relative to the viewport rather than the legacy unbounded reset range. Use one owned, throttled animation-frame loop, a bounded device ratio, proper resize/media/unmount cleanup and no continuous drawing while loading, hidden, offscreen or reduced-motion. Reduced motion/unsupported observation retain a static field, with a new seed only on size changes; unavailable 2D context leaves usable plain-black content. Preserve the transparent live stage/model-specific poster so no opaque rectangle returns, with the overall black background and no HDR.
- Latest Matrix speed/density refinement supersedes the 80ms trial: use a 160ms drawing interval and 40px column spacing, slowing travel by another half and roughly halving the column count. Retain the 20px vertical step and per-step trail fading. All motion gates and cleanup behavior remain unchanged.
- HQ-first model rendering: supersample device DPR within 1.5–3 and remove the automatic slow-frame resolution reduction, accepting higher GPU cost for sharpness. Preserve the original model bytes, transparent rendering, pause/offscreen/hidden/reduced-motion gates and static fallback; this is not a geometry/texture upgrade or a physical-device performance claim. The decorative Matrix canvas retains its separate DPR policy.
- Latest hero motion refinement: keep the camera fixed with no user orbit controls and rotate the outer Wattson model group at 0.12 radians/second. Rotation and the embedded model animation both stop while hidden, offscreen or reduced-motion is active.
- Approved large-asset transport: retain the 4,000,000-byte deployment JSON guard; send files above 1,000,000 bytes through Vercel's documented binary file endpoint with SHA-1/size references. Bound individual files to 100,000,000 bytes and total static bytes to 200,000,000; these are transport limits, not performance acceptance. Verify tested bundle integrity before any upload, record upload intent, never automatically retry uncertain uploads, and recheck source/target drift after uploads before the single deployment POST. Keep target credentials, concurrency and native production approval unchanged. Actual scoped-token upload behavior remains unverified until separately authorized delivery.

### 3.4 Local rarity explorer

- Use validated local legacy data for token lookup, attributes, rank, score display and trait-image composition.
- Document and validate the legacy rank/score/formatting/layer-order rules before rewriting them. This specification defines no replacement formulas, thresholds, units or rounding.
- Known token IDs must reproduce approved reference attributes, rank, score formatting and composition.
- Provide safe invalid-ID, missing-data and loading states; support lazy loading, keyboard use and mobile layouts.
- Do not request OpenSea APIs, RPC, ownership or pricing data. Network verification must confirm the absence of blockchain/marketplace data requests.
- Approved local implementation: use the audited active 5,555-token snapshot, with token IDs 1–5555 mapped consistently to the same record (not the old UI's next-token rank). Preserve stored scores/ranks, source tie order and one-decimal formatting. Owner confirmed rights for all 128 trait images and selected B, the striped catalog Sailor Tee artwork, without changing token metadata or rankings. Use optimized transparent layers in generator order. The audit, exact component arithmetic, provenance, ID/score/rank fixtures and art exception are documented in [rarity rules](../docs/rarity-explorer.md) before runtime implementation. No new scoring formula is introduced.
- Local explorer behavior is owner-accepted. The owner separately approved lowering the inline file-selection threshold from 1,000,000 to 64,000 bytes so the rarity batch uses the existing binary upload path. Keep the 4 MB deployment JSON, 100 MB per-file and 200 MB aggregate guards, integrity and approval checks unchanged. Local checks and read-only review are complete; the owner subsequently authorized a commit and PR. Stop at PR/CI verification, without merging or deploying. Hosted verification of the rarity batch remains outstanding.

### 3.5 Showcase extras

- Provide a decorative terminal with audited public commands and document links, without the legacy password gate or secrets.
- Terminal presentation correction approved by the owner: use the original transparent fixed bottom-left console at 30% desktop width, green Goldman text and `/` prompt, not a standalone section or bordered panel with a Run button. Use a width-bounded mobile dock and a small minimize/restore control so content can be accessed. Keep command behavior and the no-password/no-radio boundaries below.
- Subsequent hosted-review revision: change terminal text to white, replace the welcome message and `/` prompt with persistent `Terminal/` followed directly by input, and remove the white input focus box. Focus the input once after the initial loading dialog closes, without scrolling or repeatedly stealing focus after 3D reloads. The owner accepted the final smaller, non-minimizable prompt without an underline locally and authorized commit/PR preparation for dev delivery. Stop at PR/CI verification without merging or manually deploying; hosted acceptance remains pending and production is unchanged. Command and external-link behavior remain unchanged.
- Latest local correction supersedes the earlier minimize control: remove minimize/restore entirely and keep the prompt visible, using the smaller 0.7rem size of the former minimized label consistently for terminal text and input on desktop/mobile. Preserve native browser zoom and the mobile input's 44px target height.
- The owner also removed the input underline: no white focus box or underline, just the native caret. Other controls retain their existing keyboard focus indicators.
- Radio/audio is excluded at the owner's request. Do not add streams, soundtrack commands or playback controls.
- Present treasury information as static, dated historical content with approved sources, visibly distinguished from current balances.
- Do not query live Safe, Snapshot or RPC services, or fabricate treasury figures when sources are unavailable.
- Historical treasury layout approved for local expansion: restore the Safe balance and Snapshot proposal panel layout, replacing every data value—including identifiers, balances, proposal fields and dates—with `XXXX`. Omit the on-page historical disclaimer and any separate placeholder label, live request, link or voting control. See [treasury provenance](../docs/treasury.md).
- Verify commands, links, keyboard/mobile behavior and absence of blockchain requests.
- Approved terminal-only scope: green-on-black `/` prompt with `help`, `clear`, `report` and `mugshot`; keyboard history and mobile input; no password/Discord gate, secrets, radio, shell execution or automatic external requests/popups. Document commands return explicit clickable external PDF links with a new-tab warning. Both original URLs responded successfully during audit; `report` is the six-page fictional lore dossier. The 57.5 MB mugshot PDF exceeds the local document reader's inspection limit and is linked, not bundled or claimed fully reviewed. The owner approved these original links and local implementation after this audit. Keep archive-host availability explicit. See [terminal audit](../docs/terminal.md). The owner accepted the corrected docked terminal and Matrix presentation locally and authorized a commit and PR. Stop at PR/CI verification without merging or deploying. Historical treasury authorization is separate, as recorded above.

### 3.6 Release-wide acceptance

- Complete visual/browser regression, accessibility checks, content/link/public-asset audit and a no-Web3 network audit.
- Measure performance and document refinements without claiming unmeasured improvements.
- Review metadata, social preview and non-production indexing behavior. Exact metadata and indexing policy remain unresolved.
- Identify the accepted release candidate by exact source revision, application version and deployment identity.
- Require the user's dev candidate walkthrough and verified recovery identity before production readiness. Production action requires separate approval; an operational foundation page is not acceptance of the completed showcase.

## 4. Scope boundaries

### Included technical direction

- React + Vite + strict TypeScript, with a compatible pinned toolchain and lockfile.
- New maintainable source rather than wholesale migration of legacy implementation.
- Unit and browser-test harnesses, lint/format/type checks, production-build CI, version alignment and Dependabot for package dependencies and GitHub Actions.
- Useful English TSDoc-compatible docblocks for TypeScript and JSDoc for JavaScript from the first handwritten code.
- Separate intended Vercel dev and production projects, with local development retained. Their names, suitability, configuration and operational readiness are not verified by this specification.

### Excluded

- Wallet connections, minting, sales, blockchain/marketplace data integrations and live ownership/pricing/balance claims.
- Legacy passwords, secrets, private DCC material and generated builds.
- Unapproved publication of legacy assets or documents.
- Changes to the existing Netlify deployment, domain migration or its removal.
- Automatic merging, ungated production-on-push or any implication that merged YAML proves an operational environment.

## 5. Engineering and delivery acceptance

### 5.1 Source foundation

- Reproducible installation and relevant lint, format, type, unit/browser and build checks must pass for the milestone's scope.
- Documentation checks must cover modules, classes, public contracts and substantial named functions, including internal helpers, hooks/components, scripts and test helpers. Trivial callbacks and declarative test cases need not each have a docblock.
- Documentation must explain purpose and meaningful parameters, results, errors, side effects and assumptions without duplicating TypeScript signature types. Complex decisions and failure handling need useful inline explanations.
- Configure maintained, compatible documentation-presence/structure checks plus TSDoc syntax validation. Syntax validation alone is insufficient.
- Documentation violations must be blocking local-lint/CI errors from PR 1. Do not use warning-only adoption, a changed-files baseline or blanket suppressions.
- Explicitly exclude generated code/build artifacts, not difficult handwritten code. Keep conventions and generated-file exclusions explicit in the lint configuration.
- Rule tests must prove missing/malformed documentation fails, valid documentation passes, substantive named arrow functions/hooks/components are covered and generated artifacts are excluded.
- Read-only review must also inspect comment usefulness and accuracy; lint cannot establish those qualities.
- Initial application version is `0.1.0`, aligned across package metadata and runtime reporting. This specification-only change does not create an application or bump a version.

#### Selected PR 1 toolchain — 2026-10-14

The user selected the following candidate stack after documentation and published npm engine/peer inspection. Selection is not proof of installation, runtime compatibility or enforcement. Use exact direct-dependency pins and a committed `package-lock.json`; CI must use reproducible installs. Revalidate package metadata when implementation begins and surface incompatibilities before changing the selected plan.

| Area                        | Selected versions                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime and package manager | Node `24.21.0`; npm `11.19.0`                                                                                                               |
| UI                          | `react` and `react-dom` `19.3.0`                                                                                                            |
| Build                       | `vite` `8.3.4`; `@vitejs/plugin-react` `6.1.2`                                                                                              |
| Type checking               | `typescript` `6.0.3`, strict mode                                                                                                           |
| Type declarations           | `@types/node` `24.19.2`; `@types/react` and `@types/react-dom` `19.3.0`                                                                     |
| Unit/component tests        | `vitest` `5.0.4`; `jsdom` `30.1.2`; `@testing-library/react` `16.3.3`; `@testing-library/dom` `10.4.2`; `@testing-library/jest-dom` `7.0.1` |
| Browser tests               | `@playwright/test` `1.64.1`; Chromium, Firefox and WebKit projects                                                                          |
| Lint                        | `eslint` `10.12.0`; `typescript-eslint` `8.71.2`; `eslint-plugin-react-hooks` `7.1.1`; `eslint-plugin-react-refresh` `0.5.7`                |
| Documentation lint          | `eslint-plugin-jsdoc` `65.3.4` for presence/structure; `eslint-plugin-tsdoc` `0.5.4` for TypeScript documentation syntax; both blocking     |
| Formatting                  | `prettier` `3.9.10`                                                                                                                         |

- Keep TypeScript on the selected `6.0.3`: inspected `typescript-eslint` `8.71.2` declares TypeScript `>=4.8.4 <6.1.0`. Do not automatically adopt the inspected latest TypeScript `7.0.2` or add a dual-TypeScript setup.
- Use ESLint flat configuration with TypeScript-aware rules and documentation contexts that cover named arrow functions, hooks/components and the other handwritten surfaces required above. Test plugin behavior on the selected ESLint version; declared peer support alone is not sufficient.
- Keep TypeScript types in signatures, not duplicated in docblocks. Verify JSDoc structure rules and TSDoc syntax rules work together on valid comments.
- A blocking version-alignment check must compare package metadata with the exported runtime application version (`0.1.0` initially). No runtime-version module exists yet.
- The selected browser harness must cover Chromium, Firefox and WebKit; its results do not replace user localhost acceptance.
- Additional direct support dependencies, if needed, require compatible exact pins and lockfile review during PR 1. No packages or browser binaries were installed during selection.

#### Approved PR 1 compatibility adjustment — 2026-10-14

Execution exposed incompatible declaration merging between `@testing-library/jest-dom` `7.0.1`'s `/vitest` entry (one assertion generic) and Vitest `5.0.4` (return and received generics). The user selected a small local adapter rather than changing the selected pins or suppressing dependency type checks. Register the standalone jest-dom matchers with `expect.extend`, and augment the documented Vitest 5 `Matchers<R, T>` interface for the DOM assertions used by the tests. Retain strict checking without `skipLibCheck`; document the adapter and remove it after an upstream-compatible integration is verified.

Compatible direct support pins added for the ESLint configuration: `@eslint/js` `10.0.1` and `globals` `17.13.0`. Published engine/peer metadata was revalidated during PR 1; execution/check results are separate evidence, not guaranteed by declared compatibility.

Evidence: local `node --version` and `npm --version`; published npm registry metadata inspected on 2026-10-14; current [Vite documentation](https://vite.dev/guide/), [Vitest documentation](https://vitest.dev/guide/), [typescript-eslint compatibility guidance](https://typescript-eslint.io/users/dependency-versions/), [JSDoc plugin documentation](https://github.com/gajus/eslint-plugin-jsdoc), [TSDoc plugin documentation](https://github.com/microsoft/tsdoc/tree/main/eslint-plugin) and [Playwright documentation](https://playwright.dev/docs/intro). These are selection evidence, not an executed installation/test result.

### 5.2 Git governance and review checkpoints

- Agreed bootstrap plan: with separate authorization, publish a minimal README-only initial commit on `main`; then implement PR 1 on a short-lived branch through ordinary PR review.
- Use protected `main` and short-lived milestone branches rather than environment branches. Agree and read back the actual governance policy after the base branch and required CI check names exist.
- Review requirements, required checks, stale-approval/up-to-date behavior, administrator/bypass enforcement and force-push/deletion restrictions need explicit policy decisions and enforcement evidence.
- For each substantive implementation milestone: run relevant checks, obtain read-only review, resolve blocking findings and obtain user localhost acceptance or an explicit skip before publication.
- Reach PR-ready only after applicable checks/review/manual acceptance. Stop at that milestone; publication does not authorize starting the next one.

### 5.3 Environment and release foundations

- Approved topology (2026-10-14): local → shared dev → manually approved production, with isolated Vercel dev/production projects. Proposed names are `dripperz-dev` and `dripperz-production`, subject to availability and approval. Removing staging and completing these foundations is the user's main priority, ahead of unrelated feature work.
- Verify account/plan capability and explicitly agree triggers/access before provisioning. PR 2 defines the delivery contract; provisioning, secret configuration and deployments are separately authorized operational work.
- Use exact reviewed source revisions, least-privilege secret references without values, per-target concurrency and fail-closed handling for missing configuration, credentials or verification.
- Shared manual-production flow: each environment's `VERCEL_TOKEN` is restricted to its own project. Production holds no dev-verification credential and does not automatically query dev acceptance/recovery. The owner reviews exact dev source/version/deployment/configuration and recovery evidence after acceptance and immediately before native production approval; drift invalidates affected acceptance. No custom promotion manifest or additional GitHub PAT is required. Vercel project tokens grant project read/write access, not provider-enforced read-only access; neither environment may use team/full-account tokens. Token creation, cleanup and endpoint-access verification remain separately authorized setup actions.
- Approved Iris-style GitHub authentication adjustment: workflow source checks use the built-in read-only `GITHUB_TOKEN`, without an additional GitHub personal access token or copying the owner's CLI credential into Actions. The owner reads back main/environment policies through the local authenticated CLI/API during setup/readiness, before authorizing enablement or promotion and after policy/access changes. Native GitHub environment approval remains mandatory. The delivery controller does not recheck GitHub protection settings or detect policy drift automatically; missing/uncertain operator evidence blocks authorization rather than claiming runtime fail-closed policy verification.
- Record each target independently as not configured, partially configured, configured but unverified, or operationally verified with dated evidence. Inspect actual branch protection separately from CI results.
- Protected-main merges deploy dev after existing quality checks. Manual dev redeployment and production workflows run from main, select an exact merged source revision and rerun existing checks against that revision; never substitute latest main. Production selects the same source accepted in dev, with native explicit approval, self-review allowed and administrator bypass disabled. Keep production disabled if enforcement is unavailable pending an explicitly approved alternative. Disable competing Vercel Git auto-deployment; serialize each target without cancelling an active mutation and reject superseded automatic dev runs before mutation.
- Record dev candidate source/version/provider identity and relevant configuration; recheck them after acceptance and before promotion. If another deployment or configuration change interrupts validation, repeat affected acceptance on the selected candidate. Evidence is reviewed manually; source selection alone does not prove dev acceptance. Rehearse application rollback in dev when required recovery evidence is missing or invalidated, then restore and revalidate the selected candidate. Production smoke checks remain read-only.
- Remove staging from active delivery targets and instructions. Inventory any existing resource/credential consumers, triggers and recovery evidence before separately authorized retirement; preserve historical evidence and do not automatically delete resources or revoke shared credentials. Existing Netlify hosting remains untouched.
- Record revision/version/deployment identity and the prior immutable recovery identity. Validate promotion/rollback runbooks and verify behavior/version after rollback; rollback is not permission to alter persistent data.
- Missing governance or environment evidence blocks applicable merge/release/promotion readiness, not necessarily bounded local drafting or implementation.

#### Hosting suitability checkpoint — 2026-10-15

- Read-only CLI inspection identified account `benhammoush`, active team `benhammoushs-projects` and its Hobby plan. Neither proposed Dripperz project appeared in that team's project inventory; this is not a global name-availability check or provisioning evidence.
- The user confirmed strictly personal, non-commercial historical-showcase use, without sales promotion or compensated development/hosting. Vercel's [Hobby usage policy](https://vercel.com/docs/plans/hobby) restricts the plan to personal, non-commercial use. Reassess suitability before introducing commercial use; capacity and configuration still require setup verification.
- GitHub reported `benhammoush/Dripperz` as public. GitHub's [environment protection documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments) supports required reviewers with self-review allowed and administrator bypass disabled for public repositories on Free, Pro and Team plans. This establishes documented capability, not configured or verified enforcement.
- Final target names, access/configuration ownership, actual protection settings and operational deployment/recovery evidence remain unresolved. No provisioning, secret changes or deployments were performed at this checkpoint.

#### PR 2 setup contract — 2026-10-15

- The user confirmed team `benhammoushs-projects`, project names `dripperz-dev` and `dripperz-production`, and `benhammoush` as configuration owner and production approver. The previously agreed protected-main dev trigger and manual production/self-review/no-administrator-bypass policy stand.
- Read-only main protection showed strict required `Quality and build` / `Browser smoke` checks bound to GitHub Actions, administrator enforcement, force-push/deletion disabled and conversation resolution enabled. The existing solo-maintainer policy requires zero approving PR reviews; contribution read-only review and user acceptance requirements remain separate. No deployment environments existed at inspection. These are dated observations, not deployment readiness.
- PR 2's [delivery contract](../docs/delivery.md) keeps delivery disabled pending separately authorized setup, validates delivery identities, requires operator readback of native production enforcement, and preserves manual acceptance/recovery evidence. Static foundation hosting has no project environment variables or Git integration; only the two default project domains are in scope. Both remain nonindexable pending the later indexing decision.
- Approved first-production policy: validate the exact dev candidate and rehearse dev rollback before first production; restore and repeat affected acceptance on the selected candidate. Explicitly accept that the first production deployment has no previous production version to restore. On failure, stop and inspect actual provider state, then recover only through a fresh, separately authorized and natively approved deployment of an exact dev-accepted revision. Never blindly retry or bypass approval. Retain the first accepted immutable production deployment as the rollback candidate for later releases, subject to renewed identity/configuration verification. Implementation is separately approved; publication, enablement and deployment remain unauthorized. The controller permits an absent production target, records the bootstrap/no-prior-identity limitation before mutation, and rejects malformed existing target identities or preflight drift. Absence of a predecessor is not successful recovery verification; dev acceptance/rehearsal and provider history remain owner-verified before native approval.
- Approved activation alignment: neither GitHub environment uses `DEPLOY_ENABLED` or a repository/organization-wide fallback. Successful exact-main verification automatically delivers dev. Hold production by not dispatching its separate workflow until authorized; it still requires a new manual dispatch, native environment approval and the approved recovery prerequisites, including explicit no-predecessor acknowledgement for first production. Remote settings migration follows verified shared-release adoption, not this local implementation.

## 6. Planned delivery units and dependencies

These are board delivery cards, not existing pull requests or authorization to execute them. No dates or Horizon assignments are implied.

| Unit                        | Included scope                                                                                                                       | Prerequisites and stopping boundary                                                                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PR 1 — Source foundation    | Scaffold, compatible pinned tooling, checks/test harnesses, build CI, Dependabot, documentation enforcement, README and initial spec | Scope/spec agreement; bootstrap plan resolved before Git mutation. Stop at PR-ready; no visual feature work, provisioning or deployment.                                                    |
| PR 2 — Delivery foundation  | Workflow/configuration validation, exact-revision delivery identity, concurrency, smoke checks and promotion/rollback guidance       | PR 1 merged; account/plan capability and trigger/access policy agreed. No provisioning, secret changes or deployment.                                                                       |
| PR 3 — Visual shell         | References/tokens, font/palette, responsive layout/navigation and controlled effects                                                 | PRs 1–2 merged unless a dependency change or stacked workflow is explicitly accepted. Stop at PR-ready.                                                                                     |
| PR 4 — Core showcase        | Artwork, synchronized galleries, cybermap, FAQ, footer and approved public links                                                     | PR 3 merged. No 3D, rarity or extras. Stop at PR-ready.                                                                                                                                     |
| PR 5 — 3D hero              | Approved model/animation, black background, resilient loading/fallbacks and measured rendering baseline                              | PR 4 merged; reference and asset rights approved. Stop at PR-ready.                                                                                                                         |
| PR 6 — Rarity explorer      | Validated local data/rules, lookup/traits/composition and deterministic fixtures                                                     | PR 5 merged under the accepted sequential roadmap; calculation rules documented before rewriting. Stop at PR-ready.                                                                         |
| PR 7 — Showcase extras      | Public terminal/documents, opt-in radio and approved historical treasury                                                             | PR 6 merged; sources, documents and stream verified. Stop at PR-ready.                                                                                                                      |
| PR 8 — Release readiness    | Full regression/audits, metadata/indexing, measured refinements and release/recovery records                                         | PRs 1–7 merged/accepted; governance/environment readiness and content gaps resolved. Stop at PR-ready; dev candidate deployment/acceptance is separately authorized; no production cutover. |
| Setup — GitHub governance   | Agreed ruleset and actual enforcement readback; board views are already configured                                                   | Base branch and PR 1's actual required check names; separate remote-setup authorization.                                                                                                    |
| Setup — Vercel provisioning | Approved isolated targets, configuration ownership and gated trigger/access policy                                                   | PR 2 contract and explicit account/setup authorization. Operational deployment/browser/rollback verification remains separate.                                                              |

## 7. Unresolved decisions and evidence gaps

Do not silently choose defaults or claim these items are verified. Resolve each before its dependent implementation or release checkpoint; later feature gaps do not automatically block a foundation-only scaffold.

| Gap                              | Required decision or evidence                                                                                                                                                                  | Dependent checkpoint                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Toolchain execution verification | Stack and version-check contract selected in section 5.1; verify reproducible install, actual plugin/parser behavior, documentation-rule fixtures, type checks, unit/browser tests and build   | PR 1                                                 |
| Git governance                   | Approved review/check/up-to-date/bypass policy and actual enforcement readback                                                                                                                 | Governance setup; applicable merge/release readiness |
| Hosting topology details         | Names, ownership and trigger policy agreed above; verify actual access/token scope, capacity, configuration and native approval enforcement                                                    | Separate provisioning and enablement                 |
| Visual acceptance                | PR 3 provisional viewport/walkthrough criteria agreed in section 3.1; usable reference captures and later 3D/visual-regression comparison criteria remain outstanding                          | PRs 3–5; release regression                          |
| Assets and public content        | Inventory, publication rights, public links and historical-vs-current content approval                                                                                                         | Relevant PRs 3–7; release audit                      |
| Rarity rules                     | Dataset provenance, ID bounds, exact scoring/ranking/formatting/layer rules and known-ID fixtures                                                                                              | PR 6                                                 |
| Extras                           | Public command/document inventory, verified stream and sourced/dated treasury content                                                                                                          | PR 7                                                 |
| Release acceptance details       | Browser/accessibility acceptance criteria, measured performance baseline/budgets, metadata/social preview and indexing policy                                                                  | PR 8                                                 |
| Operational readiness            | Dated branch-policy evidence plus each target's deployment, browser smoke, revision/version identity and recovery evidence                                                                     | Applicable release/promotion checkpoint              |
| First-production recovery        | Policy and local implementation approved above; operationally verify dev acceptance/rehearsal, provider state and no-predecessor acknowledgement before separately authorized first production | First production release                             |

No application code, CI enforcement, usable environments, production acceptance or recovery capability is established merely by writing or accepting this document.
