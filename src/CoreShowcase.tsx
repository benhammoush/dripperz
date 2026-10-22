/**
 * Core Phase 3 content: approved artwork, an explicitly archived roadmap and showcase FAQ.
 * @packageDocumentation
 */

import { Gallery } from './Gallery';
import {
  ARCHIVED_ROADMAP,
  CHARACTER_SLIDES,
  SHOWCASE_FAQ,
} from './showcaseContent';

/**
 * Display character lore without duplicating artwork already shown in the hero carousel.
 * @returns The shared collection introduction and character gallery.
 */
export function Collection() {
  return (
    <>
      <p className="collection-intro">
        Cyberclub brings individuality and cyberpunk style together in a world
        of its own.
      </p>
      <Gallery
        id="characters"
        title="Meet the characters"
        slides={CHARACTER_SLIDES}
        intervalMs={3500}
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
            <dd className="treasury-proposal-details">
              XXXX XXXX XXXX XXXX XXXX <br />
              XXXX XXXX XXXX XXXX XXXX <br />
              XXXX XXXX XXXX XXXX XXXX XXXX
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
