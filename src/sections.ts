/**
 * Shared navigation and honest descriptions of current and deferred Phase 3 sections.
 * @packageDocumentation
 */

export const SECTIONS = [
  {
    id: 'collection',
    label: 'Cyberclub',
    title: 'Cyberclub',
    detail:
      'Original collection artwork and fictional characters from Phase 3.',
  },
  {
    id: 'cybermap',
    label: 'Cybermap',
    title: 'Cybermap',
    detail: 'The original roadmap describes ideas, not current commitments.',
  },
  {
    id: 'treasury',
    label: 'Treasury',
    title: 'Treasury',
    detail:
      'Original treasury and governance references, with a dated source review. No live balances are requested.',
  },
  {
    id: 'rarity',
    label: 'Rarity',
    title: 'Rarity explorer',
    detail:
      'Explore the collection with local traits, stored ranks and scores. No wallet is required.',
  },
  {
    id: 'faq',
    label: 'FAQ',
    title: 'Frequently asked questions',
    detail: 'The collection, its characters, traits and original universe.',
  },
] as const;
