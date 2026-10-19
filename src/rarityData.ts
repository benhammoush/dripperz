/**
 * Validate the offline snapshot and preserve stored ranking/formatting semantics.
 * @packageDocumentation
 */

export const RARITY_TOTAL = 5555;
export const LAYER_ORDER = [
  'BACKGROUND',
  'ACCESSORIES',
  'BODY',
  'NECK',
  'CLASS',
  'CLOTHES',
  'HEAD',
] as const;
/** Audited category names in back-to-front composition order. */
export type TraitType = (typeof LAYER_ORDER)[number];

/** One audited trait and its fixed same-origin image identifier. */
export interface RarityTrait {
  type: TraitType;
  value: string;
  count: number;
  score: number;
  asset: string;
}

/** Stored token values; trait indices are already in audited composition order. */
export interface RarityToken {
  id: number;
  rank: number;
  score: number;
  traits: number[];
}

/** Validated fixed snapshot, not a replacement scoring engine. */
export interface RarityDataset {
  total: number;
  traits: RarityTrait[];
  tokens: RarityToken[];
}

/**
 * Reject malformed data without leaking source content or accepting arbitrary asset paths.
 * @param condition - Required structural invariant.
 * @throws Error - If the snapshot does not satisfy the approved schema.
 */
function requireData(condition: unknown): asserts condition {
  if (!condition) throw new Error('Invalid local rarity data');
}

/**
 * Narrow a JSON value to a non-array record.
 * @param value - Untrusted parsed JSON value.
 * @returns The record after validation.
 */
function record(value: unknown): Record<string, unknown> {
  requireData(
    value !== null && typeof value === 'object' && !Array.isArray(value),
  );
  return value as Record<string, unknown>;
}

/**
 * Validate one finite positive score or bounded integer field.
 * @param value - Untrusted numeric field.
 * @param integer - Whether integral values are required.
 * @param maximum - Largest accepted value, inclusive.
 * @returns The validated numeric value.
 */
function positive(
  value: unknown,
  integer: boolean,
  maximum = Number.MAX_VALUE,
): number {
  requireData(
    typeof value === 'number' &&
      Number.isFinite(value) &&
      value > 0 &&
      value <= maximum &&
      (!integer || Number.isSafeInteger(value)),
  );
  return value;
}

/**
 * Validate the entire canonical snapshot before any token or asset is displayed.
 * @param value - Untrusted JSON response.
 * @returns Fresh typed records with complete IDs/ranks, safe layer paths and consistent counts.
 * @throws Error - If any record is missing, inconsistent or outside the fixed schema.
 */
export function parseRarityDataset(value: unknown): RarityDataset {
  const root = record(value);
  requireData(root.schema === 1 && root.total === RARITY_TOTAL);
  requireData(Array.isArray(root.traits) && root.traits.length === 128);
  requireData(
    Array.isArray(root.tokens) && root.tokens.length === RARITY_TOTAL,
  );
  const traitValues = new Set<string>();
  const traits = (root.traits as unknown[]).map((item, index): RarityTrait => {
    const row = record(item);
    requireData(
      typeof row.type === 'string' &&
        LAYER_ORDER.includes(row.type as TraitType),
    );
    requireData(
      typeof row.value === 'string' &&
        row.value.length > 0 &&
        row.value.length <= 80,
    );
    requireData(row.asset === `layers/t${String(index).padStart(3, '0')}.png`);
    const key = `${row.type}:${row.value}`;
    requireData(!traitValues.has(key));
    traitValues.add(key);
    return {
      type: row.type as TraitType,
      value: row.value,
      count: positive(row.count, true, RARITY_TOTAL),
      score: positive(row.score, false),
      asset: row.asset,
    };
  });
  const ranks = new Set<number>();
  const counts = Array<number>(traits.length).fill(0);
  const tokens = (root.tokens as unknown[]).map((item, index): RarityToken => {
    const row = record(item);
    requireData(row.id === index + 1);
    const rank = positive(row.rank, true, RARITY_TOTAL);
    requireData(!ranks.has(rank));
    ranks.add(rank);
    requireData(
      Array.isArray(row.traits) &&
        row.traits.length >= 3 &&
        row.traits.length <= 7,
    );
    const ids: number[] = [];
    const seen = new Set<TraitType>();
    let previousOrder = -1;
    for (const id of row.traits as unknown[]) {
      requireData(
        typeof id === 'number' &&
          Number.isSafeInteger(id) &&
          id >= 0 &&
          id < traits.length,
      );
      const trait = traits[id]!;
      const order = LAYER_ORDER.indexOf(trait.type);
      requireData(!seen.has(trait.type) && order > previousOrder);
      seen.add(trait.type);
      previousOrder = order;
      counts[id] = counts[id]! + 1;
      ids.push(id);
    }
    requireData(
      seen.has('BACKGROUND') && seen.has('BODY') && seen.has('CLASS'),
    );
    return {
      id: index + 1,
      rank,
      score: positive(row.score, false),
      traits: ids,
    };
  });
  requireData(traits.every((trait, index) => trait.count === counts[index]));
  return { total: RARITY_TOTAL, traits, tokens };
}

/**
 * Accept decimal token IDs only, including harmless padding, without parseInt truncation.
 * @param input - User-entered ID.
 * @returns The integral token ID in 1–5555, or null for invalid input.
 */
export function parseTokenId(input: string): number | null {
  const text = input.trim();
  if (!/^\d+$/.test(text)) return null;
  const value = Number(text);
  return Number.isSafeInteger(value) && value >= 1 && value <= RARITY_TOTAL
    ? value
    : null;
}

/**
 * Preserve the archive's one-decimal score presentation, without recalculating scores.
 * @param value - Validated stored score.
 * @returns Legacy JavaScript toFixed display text.
 */
export function formatRarityScore(value: number): string {
  return Number(value).toFixed(1);
}

/**
 * Format the original four-digit token name.
 * @param id - Validated token ID.
 * @returns The archived token display name.
 */
export function rarityName(id: number): string {
  return `Dripperz #${String(id).padStart(4, '0')}`;
}
