/**
 * Core Phase 3 content: approved artwork, an explicitly archived roadmap and showcase FAQ.
 * @packageDocumentation
 */

import { Gallery } from './Gallery';
import {
  ARCHIVED_ROADMAP,
  CHARACTER_SLIDES,
  COLLECTION_SLIDES,
  SHOWCASE_FAQ,
} from './showcaseContent';

/**
 * Display the collection's two galleries without current sales, governance or ownership claims.
 * @returns The shared desktop/mobile collection introduction and gallery controls.
 */
export function Collection() {
  return (
    <>
      <p className="collection-intro">
        Cyberclub is a fictional fashion universe built around individuality and
        cyberpunk style. This archive revisits the artwork and characters
        presented in Phase 3.
      </p>
      <Gallery
        id="collection-studies"
        title="Collection portraits"
        slides={COLLECTION_SLIDES}
        intervalMs={5000}
      />
      <Gallery
        id="characters"
        title="Meet the characters"
        slides={CHARACTER_SLIDES}
        intervalMs={8000}
      />
    </>
  );
}

/**
 * Preserve original stage order without interpreting old strike-through styling as completion evidence.
 * @returns An ordered archive with explicit historical-proposal and noncommitment labels.
 */
export function Cybermap() {
  return (
    <>
      <p className="archive-notice">
        Archived roadmap · Historical proposals, not verified achievements or
        current commitments. Completion status and dates are not established by
        the original page.
      </p>
      <ol className="cybermap">
        {ARCHIVED_ROADMAP.map((stage, index) => (
          <li key={stage.title}>
            <span className="timeline-marker" aria-hidden="true">
              0{index + 1}
            </span>
            <div>
              <h3>{stage.title}</h3>
              <p>{stage.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

/**
 * Provide native keyboard-operable disclosures using approved showcase-focused answers.
 * @returns A single FAQ shared across viewport sizes without minting instructions or rights grants.
 */
export function ShowcaseFaq() {
  return (
    <div className="faq-list">
      {SHOWCASE_FAQ.map((item) => (
        <details key={item.question}>
          <summary tabIndex={0}>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

/**
 * Recreate the legacy treasury layout with every historical value deliberately masked.
 * @returns Static treasury and proposal panels without live integrations or voting controls.
 */
export function HistoricalTreasury() {
  return (
    <>
      <p className="archive-notice">
        Historical reference—not current balances or active governance.
      </p>
      <div className="treasury-grid">
        <article className="treasury-card treasury-overview">
          <h3>Community treasury</h3>
          <dl className="treasury-references">
            <dt>Safe address</dt>
            <dd>0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX</dd>
            <dt>Record date</dt>
            <dd>XXXX-XX-XX</dd>
          </dl>
          <div className="treasury-balances">
            <p>
              Treasury value <strong>XXXX.XXXX ETH</strong>
            </p>
            <p>
              USD conversion <strong>XXX.XXX,XX USD</strong>
            </p>
          </div>
        </article>
        <article className="treasury-card treasury-proposal">
          <h3>Latest proposal</h3>
          <dl className="treasury-references">
            <dt>Governance space</dt>
            <dd>XXXX.XXXX</dd>
            <dt>Proposal title</dt>
            <dd className="treasury-proposal-title">XXXX XXXX XXXX</dd>
            <dt>Status</dt>
            <dd className="treasury-proposal-status">XXXXXXX</dd>
            <dt>Proposal details</dt>
            <dd>
              XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX
              XXXX XXXX XXXX
            </dd>
            <dt>Choices</dt>
            <dd className="treasury-choices">
              <span>XXXX</span>
              <span>XXXX</span>
              <span>XXXX</span>
            </dd>
            <dt>Record date</dt>
            <dd>XXXX-XX-XX</dd>
          </dl>
        </article>
      </div>
    </>
  );
}
