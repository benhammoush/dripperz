# Dev → production delivery foundation

## Versioned CI/CD entry points

Automation 3.0 removes production deployment opt-ins; dev remains automatic.
The verified immutable v3.0.0 release is pinned below. Delete obsolete live
deployment flags only after this consumer adoption is merged and verified.

The [shared contract](https://github.com/benhammoush/ci-cd-workflows/blob/main/docs/contract.md)
is pinned by immutable SHA in `.github/ci-cd.json`. Generated `ci.yml` verifies
PRs/main and delivers successful exact main commits to dev without an opt-in switch. Separate
manual `deploy-production.yml` selects a full merged `sha`, verifies retained dev
delivery and the candidate, then waits for native approval. CI dispatch is the
exact-SHA manual dev recovery path. These supersede older Delivery-workflow
invocations below; existing transport, identity, acceptance and recovery guards
remain mandatory. Historical sources without versioned hooks fail closed; inspect
eligible immutable recovery artifacts rather than weakening checks.

All Ubuntu jobs use `ubuntu-24.04`. Quality builds once; `ci:browser` runs browser
and hero suites against that output sequentially without rebuilding. Standalone
`test:browser` and `test:hero` build first so they also work on a clean checkout.
Artifact integrity is checked before deployment.
The adapter retains the bounded controller and original evidence fields, adding
the shared versioned release-record fields. Failed/uncertain records cannot
authorize promotion. Existing required-check names remain compatibility gates for
shared checks. This migration removes the production deployment opt-in but changes no
manual dispatch, approval, credentials or provider settings; passing PR checks does
not establish live deployment acceptance.

This is the PR 2 delivery contract, **not evidence of configured environments or an operational showcase**. Local development remains unchanged. There is no staging target. Legacy Drip, Netlify, domains and other projects must remain untouched.

## Agreed ownership and triggers

- Owner/configuration custodian/production approver: `benhammoush`.
- Vercel team: `benhammoushs-projects`, Hobby, for the user-confirmed strictly personal non-commercial historical showcase. Reassess the plan before commercial use or paid development/hosting.
- Isolated projects: `dripperz-dev` and `dripperz-production`; each uses its own Vercel **production** target and default project domain. A provider target named production in the dev project is still the shared **dev** environment.
- After protected-main push CI succeeds, automatically select that exact SHA for dev. Superseded automatic runs fail before mutation. Manual dev redeployment and production dispatch run from main and accept a full merged SHA, including an older merged revision for recovery. They do not resolve a branch/tag to its latest commit.
- Every delivery reruns the existing quality/build and three-browser checks on that source. Trusted control scripts come from the main workflow revision, independently of the selected candidate. Test jobs receive no provider credentials. Deployment secrets are scoped to GitHub environments.
- Hero-capable candidates additionally run the built-hero GPU/fallback suite. The trusted controller detects the hero script/config/source/model and rejects a missing or altered test command. Historical candidates with none of those markers skip only this later-added suite, preserving exact-source recovery.
- The existing CI quality job validates workflow syntax/expressions using checksum-verified actionlint `1.7.12`; validation failure blocks that check. Embedded shell/Python analyzer integrations are disabled; this does not claim a separate shell security audit.
- Production needs native explicit owner approval; self-review is allowed; administrator bypass is disabled. A manual dispatch is not approval. GitHub enforces the environment gate before the delivery job starts. The operator must verify actual protection settings during setup/readiness and before authorizing enablement or promotion; missing enforcement/readback blocks that authorization. The controller does not query GitHub administration APIs or detect later policy drift automatically.

## Automatic dev and gated production

Delivery has no `DEPLOY_ENABLED` opt-in: absent/false values do not prevent deployment. Complete dev configuration before merging for automatic dev delivery after successful main verification. Missing credentials/configuration fail delivery rather than producing a successful disabled no-op. Production still requires a new manual dispatch, native environment approval and the recovery prerequisites below; production never deploys automatically.

The old repository-level delivery switches are no longer read. Remote settings changes require separate authorization. Hold production by not dispatching it until authorized; retain native approval.

Provisioning, environment/secret configuration, workflow dispatch, deployment, publication and merging are separately authorized operations. An assistant implementing this milestone does not perform deployment or rollback mutations.

### Setup checklist for the authorized operator

1. Read back main protection using the owner's authenticated CLI/API. Existing baseline: required checks `Quality and build` / `Browser smoke`, bound to GitHub Actions, strict up-to-date checks, administrator enforcement, force-push/deletion disabled, conversations resolved. Recorded solo policy has zero required approving PR reviews; do not silently substitute another review policy. This is an operator readiness prerequisite, not an automated delivery preflight check; contribution review requirements still apply.
2. Create the two approved projects in the agreed team, with no Git integration. Do not connect the repository and merely assume that Git auto-deployment is disabled. Preflight rejects any linked repository.
3. Configure dedicated static hosting: framework **Other/null**, build and install commands explicitly empty, output directory `.`, root directory unset, Node `24.x`, no project environment variables. Only the default `<project>.vercel.app` domain is supported. Do not import legacy credentials or redirect/migrate Netlify domains. Hosted smoke expects publicly readable static content; decide access changes explicitly and revalidate.
4. Record the actual team ID and two distinct project IDs as repository variables `VERCEL_TEAM_ID`, `VERCEL_DEV_PROJECT_ID`, `VERCEL_PRODUCTION_PROJECT_ID`. IDs are not tokens. Never guess them from slugs.
5. Create GitHub environments `dev` and `production`, with deployment branch policies allowing branch `main` only (not a tag or wildcard). For production set required reviewer `benhammoush`, allow self-review, disable administrator bypass. Read settings back. Do not rely on automatic environment creation by a job: that has no approval protection.
6. Put a distinct project-scoped `VERCEL_TOKEN` in each environment, never a repository-wide secret: dev's token is limited to `dripperz-dev`, production's to `dripperz-production`. Production needs no dev-verification credential: the owner reviews dev acceptance and recovery before native approval. Vercel project tokens grant project read/write access, not provider-enforced read-only access. Do not substitute team/full-account tokens. Choose explicit expirations and record rotation ownership without values. Use password-manager labels `<project>-<environment>-<provider>-<purpose>`, for example `dripperz-production-vercel-deploy`; GitHub still uses `VERCEL_TOKEN`. Create tokens through the owner's secure dashboard interaction. Inventory consumers before separately authorized obsolete-token cleanup; this source change does not revoke anything. No token values or credential paths belong in source, artifacts or evidence.
   No additional GitHub personal access token is required. Workflow source ancestry/freshness checks use the built-in read-only `GITHUB_TOKEN`; it is not used for administration readback. Keep the owner's broader CLI login local for authorized setup/readiness inspection; never copy it into Actions secrets as a substitute. The contract's policy validators support read-only setup checks, not automatic policy enforcement by the controller.
7. Verify actual provider settings, Git trigger disconnection and native environment/approval enforcement; do not call a target operational because variables exist. Retain dated, non-secret main/environment policy evidence and recheck before merging or production promotion and after any policy/access change. Missing/uncertain evidence blocks authorization; if drift is discovered, do not merge dev-affecting changes, and keep production disabled pending separately authorized correction. Do not cancel an active mutation. The controller cannot enforce this operator prerequisite or detect weakened/deleted/recreated GitHub environments; native gates are only as strong as their current settings. Record each target independently as not configured, partial, configured-unverified, or operationally verified.
8. A successful main run automatically delivers to dev without setting an enable flag. Do not dispatch production until execution is separately authorized after acceptance/recovery prerequisites below are complete; no variable acts as an enable gate. For an empty production target, explicitly acknowledge the no-predecessor limitation before native approval; source selection does not prove dev acceptance or a completed rehearsal.

## Identity, concurrency and failure handling

The static bundle contains `/delivery.json`: schema, full source SHA, app version, target, GitHub run ID and content digest. The digest includes sorted file names/bytes (including delivery configuration), excluding only the identity document. Both environments remain `noindex, nofollow`, with disallow-all robots and no-store response headers until the later indexing-policy milestone. No application-version bump is made merely for foundation work.

The job uploads only tested `dist` files through Vercel's [deployment API](https://vercel.com/docs/rest-api/reference/endpoints/deployments/create-a-new-deployment), using inline base64 for files up to **64,000 bytes** and SHA-1/size references for larger files uploaded via the documented [binary file endpoint](https://vercel.com/docs/rest-api/deployments/upload-deployment-files). The owner approved lowering the former 1,000,000-byte selection threshold after local rarity acceptance: many sub-megabyte layers otherwise exceed the combined JSON budget. This changes file selection only, not the upload API, credentials or limits. Keep the 4,000,000-byte deployment JSON guard; bound individual files to 100,000,000 bytes and total static bytes to 200,000,000. Even many tiny inline files must fail closed if their combined JSON exceeds the guard. Bounds and captured-byte bundle integrity are checked before any mutation. These are transport limits, not performance budgets. A root [`vercel.json`](https://vercel.com/docs/project-configuration/vercel-json) retains explicit static settings and headers; no package source is uploaded. The original binary path was verified on hosted dev for the interim hero; the rarity-sized batch and lower selection threshold still require an authorized dev delivery for hosted verification. Do not broaden credentials if rejected. Smoke establishes shell, headers, robots and exact identity at immutable/stable URLs, not model rendering or user acceptance.

Per-target job concurrency covers preflight, mutation and smoke, without cancelling an active job. GitHub may replace pending runs; the final latest-main check prevents an obsolete automatic dev deployment. Manual deliveries may deliberately deploy older merged source. Do not mutate the same project through competing CLI, dashboard, Git or other workflows during validation/promotion. A different dev deployment or configuration change invalidates acceptance; restore and repeat affected acceptance. Provider APIs do not offer an atomic cross-project lock: final checks narrow, but cannot eliminate, races from out-of-band operators.

Before mutation the delivery script rechecks main ancestry/freshness, selected project/team identity, domain/static settings, configuration digest and current target identity. GitHub protection settings are operator-verified prerequisites, not runtime checks. Team ownership uses the selected project's `accountId`, not a team endpoint inaccessible to project-scoped tokens. The owner manually checks the accepted dev source/version/deployment/configuration, applicable restored rehearsal evidence and prior production recovery identity after acceptance and immediately before native approval. Production never queries dev resources or receives a dev credential. Configuration hashing is bounded, not a complete provider-policy audit. Synthetic tests enforce target-only credential routing; actual scoped-token access still needs setup verification.

There is exactly one deployment POST, with no retry. Large files first receive one binary POST each, using the selected target's token, the verified team query, raw bytes, byte length and a computed SHA-1 integrity header. Only HTTP 200 is accepted; success may have an empty body. Response URLs are never followed. Before each upload, `delivery-record.json` records file/path/SHA/size and `upload-requested`; successful completion changes that entry to `uploaded`. A rejected, lost or interrupted upload stops before deployment without retry. Recheck main freshness and target/configuration/recovery identity after uploads as well as before them. Uploaded files can remain unreferenced after a failure; do not infer a deployment exists. Before the deployment POST the record becomes `mutation-requested`, then retains the provider ID before waiting for READY. A timeout, lost response or interrupted job means **uncertain mutation**, not permission to rerun. Inspect the provider and retained file/deployment evidence before another action. Never automatically rollback production after a smoke failure.

## Dev acceptance and recovery rehearsal

1. Retain the `tested-delivery-bundle` (14-day default) and `delivery-record-dev` (90-day default), exact source/version, provider ID/URL, config digest and run URL. Copy durable, non-secret release evidence into the chosen release record before artifact expiry; expiration invalidates artifact-only evidence. There is no auto-commit/synchronization.
2. Verify the actual browser experience on the dev stable URL at representative desktop/mobile sizes, keyboard navigation, identity and noindex behavior. Automated hosted smoke is only a shell/identity check, not a user walkthrough or acceptance of the completed showcase.
3. If recovery evidence is missing/invalidated, separately authorize a dev-only rehearsal: manually select a known earlier merged source, rerun quality/browser checks, deliver it, and verify its identity and browser behavior. Retain that immutable recovery deployment and record. Do not alter persistent data.
4. Restore the selected candidate through manual dev delivery; this produces a **new provider identity**. Verify it again and repeat the user's affected acceptance on that restored candidate. Record the restored identity, source/version/build/config digest, owner, UTC acceptance time and evidence run URLs. Acceptance of the pre-rehearsal deployment is not acceptance of the restored one.
5. Keep accepted dev quiescent during promotion. Check source/version/provider/config identity after acceptance and immediately before promotion. Any interrupting deployment/config change requires repeated affected validation.

## Production promotion input

Dispatch from `main`, target `production`, with the same full `sha` accepted in dev. The workflow reruns the existing checks against that source and waits for native environment approval. The owner reviews the exact run inputs, dev source/version/provider/configuration, acceptance and recovery records before approval. No custom JSON promotion manifest or cross-project verification token is used. Same source does not imply identical environment artifacts. A selected SHA or green CI does not prove acceptance. Production reruns are rejected: diagnose failures, inspect provider state, then start a new dispatch and obtain fresh approval.

### First-production checkpoint

An empty production project has no prior immutable production recovery identity. The approved policy is:

1. Before first production, validate the exact dev candidate and rehearse dev rollback. Restore the selected candidate and repeat affected acceptance on its new deployment identity as described above.
2. Explicitly accept and record that the first production deployment has no previous production version to restore. Do not invent a predecessor or describe this as verified production rollback capability.
3. If first production fails, stop and inspect actual provider state, including any uncertain mutation. Recover only through a fresh, separately authorized dispatch with native production approval, deploying an exact dev-accepted revision. Revalidate affected acceptance if source or configuration changes. Never blindly retry, rerun production jobs or bypass approval.
4. Retain the first accepted immutable production deployment and its source/version/configuration/acceptance evidence as the rollback candidate for later releases. Reverify its identity and suitability before using it; rollback remains separately authorized.

The controller permits an absent production target under this policy, but rejects an existing target with a missing/malformed deployment ID and rejects target/configuration changes during preflight. Before mutation it records `productionBootstrap=true` and `priorDeploymentId=null` when no production target exists; failures retain that disclosure where possible. This is not proof that provider history is empty or that dev acceptance/rehearsal occurred: the owner must inspect actual state and evidence before native approval, including after any failed or uncertain attempt. Existing production targets record their prior ID without claiming it is an accepted rollback candidate.

**Implementation does not authorize publication, enablement or deployment.** Native approval and all operator prerequisites remain mandatory. A configured dev target does not make production operational.

## Application rollback guidance

Rollback is a separately authorized mutation, never a side effect of smoke. Identify the exact recorded prior immutable deployment, same project/team, READY state, source/version/build/config and public identity first. Review whether configuration or provider changes invalidate it. Preserve the failed/new deployment identity for diagnosis. Never select “latest” or infer recovery from a branch name.

For dev, use the manual exact-source workflow to rehearse/recover, recording the new provider identity. For production, prefer the provider's supported rollback of the verified prior immutable deployment, performed by the authorized operator under the same explicit approval and target exclusion policy. Do not use an unreviewed dashboard or CLI action as a substitute for that policy. The PR 2 workflow does not automate provider rollback. If recovery instead rebuilds an older merged source, first validate/accept that exact candidate in dev and use the normal approved production promotion contract; rebuilds are not the original immutable deployment.

After rollback, read back the provider's active production target and check both immutable and stable URL source/version identity, shell and browser behavior. Retain the action/approver/time/prior-and-restored identities and recovery smoke evidence. Restore/revalidate a newer candidate only with separate authorization. None of these operations permits persistent-data changes.
