/**
 * Search the original trait catalog using the same validated snapshot as token lookup.
 * @packageDocumentation
 */

import { useState } from 'react';
import {
  formatRarityScore,
  LAYER_ORDER,
  type RarityDataset,
  type RarityTrait,
} from './rarityData';

/** One local trait preview with independent image-failure recovery. */
interface TraitCardProps {
  trait: RarityTrait;
  total: number;
}

/**
 * Keep trait facts readable even when its transparent artwork cannot load.
 * @param props - Validated trait and collection size.
 * @returns A local image, stored component score and occurrence count.
 */
function TraitCard(props: TraitCardProps) {
  const { trait, total } = props;
  const [failed, setFailed] = useState(false);
  return (
    <li className="rarity-trait-card">
      <div className="rarity-trait-preview">
        {failed ? (
          <div className="rarity-trait-error">
            <p>Preview unavailable</p>
            <button type="button" onClick={() => setFailed(false)}>
              Retry {trait.value} preview
            </button>
          </div>
        ) : (
          <img
            src={`/rarity/${trait.asset}`}
            alt={`${trait.type}: ${trait.value}`}
            width="1000"
            height="1000"
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <p className="eyebrow">{trait.type}</p>
      <h4>{trait.value}</h4>
      <dl>
        <div>
          <dt>Rarity score</dt>
          <dd>{formatRarityScore(trait.score)}</dd>
        </div>
        <div>
          <dt>Occurrences</dt>
          <dd>
            {trait.count} / {total}
          </dd>
        </div>
      </dl>
    </li>
  );
}

/** Validated collection data shared with the explorer, without another fetch. */
interface RarityCatalogProps {
  data: RarityDataset;
}

/**
 * Filter the 128 trait previews by name and category without changing token selection.
 * @param props - The explorer's validated local snapshot.
 * @returns Accessible search controls, result count and lazy-loaded trait cards.
 */
export function RarityCatalog(props: RarityCatalogProps) {
  const { data } = props;
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const search = query.trim().toLowerCase();
  const traits = data.traits.filter(
    (trait) =>
      (!category || trait.type === category) &&
      trait.value.toLowerCase().includes(search),
  );

  return (
    <div className="rarity-catalog">
      <h3>Rarity catalog</h3>
      <p className="rarity-note">
        Explore every trait. These are individual trait scores, not total token
        scores.
      </p>
      <div className="rarity-catalog-controls">
        <label>
          Search by trait name
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. Kartier"
          />
        </label>
        <label>
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {LAYER_ORDER.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
      </div>
      <p role="status">
        {traits.length} of {data.traits.length} traits
      </p>
      {traits.length ? (
        <ul
          className="rarity-catalog-grid"
          aria-label="Trait catalog results"
          tabIndex={0}
        >
          {traits.map((trait) => (
            <TraitCard key={trait.asset} trait={trait} total={data.total} />
          ))}
        </ul>
      ) : (
        <p>No matching traits. Try another name or category.</p>
      )}
    </div>
  );
}
