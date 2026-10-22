/**
 * Shared navigation and honest descriptions of current and deferred Phase 3 sections.
 * @packageDocumentation
 */

export const SECTIONS = [
  {
    id: 'collection',
    label: 'Cyberclub',
    title: 'The collection',
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
    label: 'Governance',
    title: 'Decentralized Autonomous Organization',
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
    detail:
      'Answers about this historical showcase and its local-only interactions.',
  },
] as const;
