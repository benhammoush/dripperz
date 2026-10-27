/**
 * Core Phase 3 content: approved artwork, an explicitly archived roadmap and showcase FAQ.
 * @packageDocumentation
 */

import { ARCHIVED_ROADMAP, SHOWCASE_FAQ } from './showcaseContent';

/**
 * Introduce the fashion universe in a standalone panel before the character carousel.
 * @returns Collection lore with the original colored and underlined emphasis.
 */
export function Collection() {
  return (
    <>
      <div className="collection-intro">
        <p>
          <span className="accent-cyan">Cyberclub</span> is a fashion universe
          developed by <span className="accent-purple">The Creator.</span>
        </p>
        <p>
          His belief that differences are the{' '}
          <span className="lore-underline">key to freedom</span> gives every
          Dripperz a unique identity.
        </p>
        <p className="lore-underline">
          Above all, it’s about your style in the metaverse.
        </p>
      </div>
    </>
  );
}

const ROADMAP_ICONS = [
  'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14M15 15l6 6',
  'M9 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6M3 21v-4a6 6 0 0 1 12 0v4M17 4a3 3 0 0 1 0 6M21 21v-4a6 6 0 0 0-3-5',
  'M3 7h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4V7M8 7V4h8v3',
  'M3 7h18l-2 14H5L3 7M8 7V5a4 4 0 0 1 8 0v2',
  'M3 9l9-6 9 6H3M5 10v8M10 10v8M14 10v8M19 10v8M3 21h18',
  'M12 3v18M3 12h18M5 5l14 14M19 5L5 19',
  'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M3 12h18M12 3a18 18 0 0 1 0 18 18 18 0 0 1 0-18',
] as const;

const ROADMAP_EMPHASIS =
  /(Price : 0\.(?:12|15) ETH|CyberClub|whitelisted|Snapshot|20%|100%|P2E)/g;

/**
 * Preserve original stage order without interpreting old strike-through styling as completion evidence.
 * @returns The original roadmap quotations and illustrated stage markers.
 */
export function Cybermap() {
  return (
    <>
      <ol className="cybermap">
        {ARCHIVED_ROADMAP.map((stage, index) => (
          <li key={stage.title}>
            <span className="timeline-marker" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={ROADMAP_ICONS[index]} />
              </svg>
            </span>
            <div className="timeline-copy">
              <h3>{stage.title}</h3>
              <blockquote>
                <p>
                  {stage.description
                    .split(ROADMAP_EMPHASIS)
                    .map((text, index) =>
                      index % 2 ? (
                        <span
                          key={index}
                          className={
                            text.startsWith('Price')
                              ? 'accent-purple'
                              : 'accent-cyan'
                          }
                        >
                          {text}
                        </span>
                      ) : (
                        text
                      ),
                    )}
                </p>
              </blockquote>
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
              <button className="action-button" type="button" disabled>
                XXXX
              </button>
              <button className="action-button" type="button" disabled>
                XXXX
              </button>
              <button className="action-button" type="button" disabled>
                XXXX
              </button>
            </dd>
            <dt>Record date</dt>
            <dd>XXXX-XX-XX</dd>
          </dl>
        </article>
      </div>
    </>
  );
}
