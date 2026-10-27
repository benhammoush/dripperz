/**
 * Offline token lookup with stored ranks, transparent trait composition and recoverable failures.
 * @packageDocumentation
 */

import { useEffect, useState, type FormEvent } from 'react';
import {
  formatRarityScore,
  parseRarityDataset,
  parseTokenId,
  rarityName,
  RARITY_TOTAL,
  type RarityDataset,
  type RarityToken,
} from './rarityData';
import './RarityExplorer.css';
import { RarityCatalog } from './RarityCatalog';

/** Current validated snapshot and selected record used by the keyed artwork mount. */
interface ArtworkProps {
  data: RarityDataset;
  token: RarityToken;
}

/**
 * Compose the audited back-to-front layer stack without claiming a partial image is complete.
 * @param props - One token mount; changing token remounts loading/error ownership.
 * @returns Accessible composed artwork and independent loading/error feedback.
 */
function TokenArtwork(props: ArtworkProps) {
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set());
  const [failed, setFailed] = useState(false);
  const ready = loaded.size === props.token.traits.length;
  return (
    <div className="rarity-art-frame">
      <div
        className="rarity-art"
        role="img"
        aria-label={`${rarityName(props.token.id)} composed artwork`}
        aria-busy={!ready && !failed}
        aria-hidden={failed}
        data-ready={ready && !failed}
      >
        {props.token.traits.map((id) => (
          <img
            key={id}
            src={`/rarity/${props.data.traits[id]!.asset}`}
            width="1000"
            height="1000"
            alt=""
            aria-hidden="true"
            decoding="async"
            onLoad={() => setLoaded((current) => new Set(current).add(id))}
            onError={() => setFailed(true)}
          />
        ))}
      </div>
      {failed ? (
        <p className="rarity-art-status" role="status">
          Artwork unavailable. Submit Find Dripperz to retry; traits, score and
          rank remain accessible.
        </p>
      ) : (
        !ready && (
          <p className="rarity-art-status" role="status">
            Loading artwork…
          </p>
        )
      )}
    </div>
  );
}

const DISPLAY_ORDER = [
  'CLASS',
  'HEAD',
  'NECK',
  'CLOTHES',
  'BODY',
  'ACCESSORIES',
  'BACKGROUND',
] as const;

/**
 * Fetch one same-origin snapshot on activation, then perform all token lookups locally.
 * @returns A keyboard-usable lookup form, stored facts and layered artwork, without remote services.
 */
export default function RarityExplorer() {
  const [data, setData] = useState<RarityDataset | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [input, setInput] = useState('1');
  const [selected, setSelected] = useState(1);
  const [error, setError] = useState('');
  const [artAttempt, setArtAttempt] = useState(0);
  const [catalogOpen, setCatalogOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    /** Load and validate the local snapshot; aborted or stale attempts never replace the current view. */
    async function load() {
      try {
        const response = await fetch('/rarity/collection.json', {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Rarity response unavailable');
        const text = await response.text();
        if (text.length > 2_000_000)
          throw new Error('Rarity response too large');
        const parsed = parseRarityDataset(JSON.parse(text) as unknown);
        if (current) setData(parsed);
      } catch {
        if (current && !controller.signal.aborted) setFailed(true);
      }
    }
    void load();
    return () => {
      current = false;
      controller.abort();
    };
  }, [attempt]);

  /** Restart metadata loading only through an explicit user action. */
  function retryData() {
    setFailed(false);
    setData(null);
    setAttempt((value) => value + 1);
  }

  /**
   * Validate the entered ID before selecting one internally consistent record.
   * @param event - Native form submission, including keyboard Enter.
   */
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = parseTokenId(input);
    if (id === null) {
      setError('Enter a whole Dripperz ID from 1 to 5555.');
      return;
    }
    setSelected(id);
    setInput(String(id));
    setError('');
    setArtAttempt((value) => value + 1);
  }

  if (failed)
    return (
      <div className="rarity-explorer">
        <p role="alert">
          Local rarity data is unavailable. The rest of the showcase still
          works.
        </p>
        <button type="button" onClick={retryData}>
          Retry rarity data
        </button>
      </div>
    );
  if (!data) return <p role="status">Loading local rarity data…</p>;
  const token = data.tokens[selected - 1];
  if (!token) return <p role="alert">This token record is unavailable.</p>;

  return (
    <div className="rarity-explorer">
      <form className="rarity-search" onSubmit={submit} noValidate>
        <label htmlFor="rarity-token-id">Dripperz ID</label>
        <input
          id="rarity-token-id"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          inputMode="numeric"
          autoComplete="off"
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby="rarity-id-help rarity-id-error"
        />
        <button className="action-button" type="submit">
          Find Dripperz
        </button>
        <span id="rarity-id-help">1–{RARITY_TOTAL}</span>
      </form>
      <p
        id="rarity-id-error"
        className="rarity-input-error"
        role={error ? 'alert' : undefined}
      >
        {error}
      </p>
      <div className="rarity-result">
        <div>
          <TokenArtwork
            key={`${token.id}-${artAttempt}`}
            data={data}
            token={token}
          />
        </div>
        <div className="rarity-facts">
          <h3 aria-live="polite">{rarityName(token.id)}</h3>
          <dl className="rarity-ranking">
            <div>
              <dt>Rank</dt>
              <dd>
                {token.rank} / {data.total}
              </dd>
            </div>
            <div>
              <dt>Rarity score</dt>
              <dd>{formatRarityScore(token.score)}</dd>
            </div>
          </dl>
          <table>
            <caption>{rarityName(token.id)} traits</caption>
            <thead>
              <tr>
                <th scope="col">Trait</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              {DISPLAY_ORDER.map((type) => {
                const trait = token.traits
                  .map((id) => data.traits[id]!)
                  .find((item) => item.type === type);
                return (
                  <tr key={type}>
                    <th scope="row">{type}</th>
                    <td>{trait?.value ?? 'Not present'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <button
        className="action-button rarity-catalog-toggle"
        type="button"
        aria-expanded={catalogOpen}
        aria-controls="rarity-catalog"
        onClick={() => setCatalogOpen((open) => !open)}
      >
        {catalogOpen ? 'Hide rarity catalog' : 'Display rarity catalog'}
      </button>
      <div id="rarity-catalog" hidden={!catalogOpen}>
        {catalogOpen && <RarityCatalog data={data} />}
      </div>
    </div>
  );
}
