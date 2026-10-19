# Archive terminal

The owner accepted the corrected docked terminal and Matrix presentation locally,
excluding radio/audio entirely, and subsequently authorized a commit and PR.
Stop at PR/CI verification; no merge or deployment is authorized in this step.

## Legacy audit and approved commands

Source: untouched legacy `src/Phase_3.tsx`, lines 248–324. Preserve the green text,
transparent bottom-left presentation, Goldman font, `/` prompt, welcome/help wording and original public document
destinations. The legacy custom commands were `mugshot`, `report`, `password`
(Discord gate) and `song` (radio attribution). Remove the latter two entirely;
do not load environment secrets or port authentication code. `help` and `clear`
are explicit local commands in the new implementation.

| Command   | Local behavior                                                              |
| --------- | --------------------------------------------------------------------------- |
| `help`    | List the four supported commands.                                           |
| `clear`   | Clear displayed output; retain this mount's command history.                |
| `report`  | Show the original external lore PDF link.                                   |
| `mugshot` | Show the original external club-member PDF link, with a large-file warning. |

Commands are case-insensitive after trimming. Arguments and unknown commands
receive the original “Wrong command, type help instead.” message. Empty input
does nothing. Input is bounded to 160 characters, output and history to 30 entries.
Up/Down traverse history and restore the visitor's draft. Nothing is persisted.
User strings render as text, never HTML or executable code. No arbitrary URL,
shell evaluation, network fetch, delayed popup or navigation is driven by input.
Links open only after an explicit click, with `noopener noreferrer` and new-tab
wording. The fixed allowlist is not a real operating-system terminal.

## Original document destinations

- Report: `https://dripperzcyberclub.mypinata.cloud/ipfs/QmNSwRjCrKQDuqc1CthMDX39v1qrWWzFtGU5d445k41tYK`
- Mugshot: `https://dripperzcyberclub.mypinata.cloud/ipfs/QmPfGUovpmDNRJAWGnnkfc543uyoZE4R6FaPWrwyWk1e8L`

Both returned HTTP 200 with PDF content type during the 2026-10-19 audit. Report
was 2,239,748 bytes: a six-page fictional redacted project/lore dossier. Mugshot
was 57,515,852 bytes, exceeding the local reader's 20 MB ingestion limit; its
contents were **not fully inspected**. The owner approved using these original
external links rather than bundling the documents. Do not describe availability
as guaranteed or claim a complete content/security/accessibility audit of PDFs.
No PDF files are copied into this repository. Archive-host failures cannot break
the prompt, since commands do not fetch the PDFs. No prefetch/preconnect is added.

The owner corrected the initial standalone section to match the original fixed
bottom-left dock: desktop width 30%, transparent background, green Goldman text,
no visible section heading, bordered card or Run button. The dock remains inside
the loading screen's inert shell and below header/menu controls. A small keyboard-
accessible minimize control avoids trapping content behind the dock; its state
preserves command output/history. Narrow screens use a viewport-bounded dock and
44px input/toggle targets. This control is a deliberate usability addition to the
legacy presentation, not an exact reproduction of the old emulator dependency.

The output is a labelled, keyboard-scrollable live log. Input retains normal Tab
navigation, has an accessible label with visible `/` prompt and supports Enter submission. No forced autofocus,
typing animations, blink effects, password challenge or radio controls are used.
