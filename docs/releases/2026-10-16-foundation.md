# Foundation candidate — 2026-10-16

## Scope and authority

This record covers the operational foundation page, not acceptance of the completed Phase 3 showcase. The [delivery contract](../delivery.md) remains authoritative. This record does not authorize production activation, dispatch, approval or deployment.

Setup, protection and deployment observations below describe the dated checkpoints, not current policy or readiness. The later retention update qualifies the historical recovery evidence; it does not establish a currently available backup.

Owner and approver: `benhammoush`. Acceptance and acknowledgement below were supplied in the working conversation on 2026-10-16; exact UTC message timestamps were not captured. Workflow timestamps identify machine events, not the owner's acceptance time.

## Accepted restored dev candidate

| Identity                     | Value                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Source                       | `ff821fdc92f54ed9269ed5979c1ea4fb7a9f4edf`                                      |
| Application version          | `0.1.0`                                                                         |
| Project                      | `dripperz-dev` / `prj_U2857H7HBU0wOCRQQCiSlIkCEQoS`                             |
| Team                         | `team_WmXGY6jB1bmGyOzq1wxJBnE0`                                                 |
| Deployment                   | `dpl_CRWMX3BphHDnXXyGx8FpuodH2r8m`                                              |
| Immutable URL                | <https://dripperz-b03a7j451-benhammoushs-projects.vercel.app>                   |
| Stable URL                   | <https://dripperz-dev.vercel.app/>                                              |
| Bundle digest                | `733c7aa4cfef387df791a3543887ed5b36c7ac59bf79d2f65777bbf2dfde2aac`              |
| Configuration digest         | `ce313c7e12606f454b4810b53c07a0245cb50ed35c67a1db7e72ea3c827e34c3`              |
| Restore run                  | [38887163688](https://github.com/benhammoush/dripperz/actions/runs/38887163688) |
| Mutation-request record time | `2026-10-16T10:27:54.147Z`                                                      |

The restore run passed source checks, quality/build checks, browser tests and automated hosted smoke. Its `delivery-record-dev` artifact reports `smoke-verified-not-user-accepted`; the owner subsequently replied “works” to the requested restored-candidate desktop/mobile walkthrough. This is owner-reported browser acceptance, not an independent manual browser audit. A later read-only check in the same session found the stable public identity and provider target still matched this deployment.

## Dev recovery rehearsal

1. Initial candidate: [run 38885244281](https://github.com/benhammoush/dripperz/actions/runs/38885244281), source `ff821fdc92f54ed9269ed5979c1ea4fb7a9f4edf`, deployment `dpl_5ybkmkR2LqaenPDPShQcoAwcQgaQ`. Automated smoke passed; the owner confirmed the foundation page worked.
2. Earlier merged source: [run 38886661909](https://github.com/benhammoush/dripperz/actions/runs/38886661909), source `3fd8ae3d84e8fd363973793166d68f472a816602`, version `0.1.0`, deployment `dpl_5wuNb7VsycE9JohzXz9wmCU2E1r4`, immutable URL <https://dripperz-rfbqp7pxv-benhammoushs-projects.vercel.app>. Mutation-request record time: `2026-10-16T10:23:27.262Z`. Checks and hosted smoke passed; stable identity was verified and the owner confirmed the page worked.
3. Restored the selected candidate through the new deployment listed above. The owner repeated acceptance after restoration. The restore record identifies the earlier-source deployment as its predecessor.

Both rehearsal bundles have the same content and configuration digests listed above: the two source revisions differ in delivery tooling rather than application output. This proves exact-source selection, deployment and restoration for the foundation, not recovery from a visually different application or a provider-native immutable rollback.

## First-production checkpoint

Read-only setup review on 2026-10-16 found:

- Main requires strict `Quality and build` and `Browser smoke` checks bound to GitHub Actions, administrator enforcement and resolved conversations; force-push/deletion are disabled. The agreed solo policy requires zero approving PR reviews.
- Production permits branch `main` only, requires reviewer `benhammoush`, allows self-review and disables administrator bypass.
- Production's environment-level `DEPLOY_ENABLED` is `false`.
- `dripperz-production` / `prj_XG9Fg7VC4MSM02fcdKxO7B3aZy0W` belongs to the team above, has no Git link, no project environment variables and the agreed static hosting settings. Its only domain is `dripperz-production.vercel.app`.
- Production has no target deployment and its deployment inventory was empty. There is no prior production recovery identity.
- Distinct environment-level `VERCEL_TOKEN` secrets exist. The owner confirmed project-only scope, expirations and rotation ownership. Scope was not independently tested, and production credential access has not been exercised by deployment.

The owner acknowledged: **the first production deployment has no previous production version to restore**. On failure or uncertain mutation, stop and inspect actual provider state. Recovery requires a fresh, separately authorized dispatch with native approval of an exact dev-accepted revision; never blindly retry or bypass approval. Retain the first accepted immutable production deployment as a future recovery candidate, subject to renewed verification.

### Subsequent first-production result

Owner-run [production run 38888640138](https://github.com/benhammoush/dripperz/actions/runs/38888640138) completed successfully after the readiness readback. Source is `ff821fdc92f54ed9269ed5979c1ea4fb7a9f4edf`, version `0.1.0`, deployment `dpl_71qz3FZnvwmGijyhBatXcNahkuW7`, immutable URL <https://dripperz-production-ego3v1lp1-benhammoushs-projects.vercel.app>, stable URL <https://dripperz-production.vercel.app/>. The delivery record's mutation-request timestamp is `2026-10-16T10:44:49.136Z`; it records `productionBootstrap=true`, `priorDeploymentId=null` and `smoke-verified-not-user-accepted`.

Quality/browser checks and hosted smoke passed. Stable public identity matches this source, version, production target and run. Bundle digest matches the accepted dev bundle; production configuration digest is `279e45119e41734b22969c243ba9b6c3c65bc53152aaf3e1bf32da7a73cef253`. Both production artifacts were downloaded beside the dev evidence under run directory `38888640138`. The owner subsequently replied “works” to the requested production desktop/mobile walkthrough on 2026-10-16; the exact UTC message timestamp was not captured. This is acceptance of the foundation page only. Retain this first accepted immutable production deployment as the recovery candidate for later releases, subject to renewed identity/configuration verification; no production rollback has been rehearsed. The assistant did not activate, dispatch or approve production; independent approval-history evidence has not been retained in this record.

## Evidence retention and remaining gates

- **Retention update (2026-10-20):** The owner explicitly requested deletion of `C:/Work/Dripperz-release-evidence`, including the local foundation deployment/recovery bundles. That archive is no longer available; no replacement backup was verified. The historical acceptance and identities above remain a record of past observations, not proof of currently recoverable artifacts. Reverify provider artifacts or another retained source before relying on this foundation as a recovery candidate. No live deployment or provider resource was deleted by this cleanup.
- At the original acceptance checkpoint, the three dev runs' `delivery-record-dev` and `tested-delivery-bundle` artifacts were downloaded to the now-deleted local archive, outside Git and expiring Actions storage. All three bundle digests, public identities and predecessor links were verified then, and the archive index recorded delivery-record SHA-256 hashes. Those archived files and index are no longer retained locally. The original Actions retention settings were 90 days for records and 14 days for bundles; current remote availability has not been reverified.
- Capture an explicit UTC acceptance/readback time when the owner revalidates the selected candidate immediately before native production approval; do not invent timestamps for earlier conversation messages.
- Recheck source, deployment, configuration, access and native approval policy before promotion. Any intervening dev deployment or relevant configuration change invalidates affected acceptance, even if the source is unchanged.
- Publishing this record through main while dev is enabled can itself trigger another dev deployment. If that occurs, refresh the deployment identity and repeat affected acceptance before production.
- Production activation and a fresh manual dispatch require separate authorization. The owner must review this evidence, acknowledge the no-predecessor limitation and grant native approval for the exact run. First-production smoke is read-only; production acceptance remains separate.
