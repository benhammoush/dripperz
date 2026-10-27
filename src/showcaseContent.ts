/**
 * Approved public artwork, fictional character descriptions and historical-showcase copy.
 * @packageDocumentation
 */

/** A local portrait paired with its visible title, alternative text and description. */
export interface GallerySlide {
  src: string;
  title: string;
  alt: string;
  description: string;
  scrambled?: boolean;
}

export const COLLECTION_SLIDES: readonly GallerySlide[] = [
  {
    src: '/artwork/showcase-01.jpg',
    title: 'Collection study 01',
    alt: 'Dripperz portrait in a pale blue hood and black face covering',
    description: 'A portrait from the original Phase 3 collection showcase.',
  },
  {
    src: '/artwork/showcase-02.jpg',
    title: 'Collection study 02',
    alt: 'Robotic figure with a green visor, patterned bucket hat and illustrated jacket against floating gemstones',
    description: 'A portrait from the original Phase 3 collection showcase.',
  },
  {
    src: '/artwork/showcase-03.jpg',
    title: 'The Creator',
    alt: 'Dark robotic portrait framed by mechanical arms',
    description:
      'The Creator artwork shown in the original Phase 3 collection gallery.',
  },
  {
    src: '/artwork/showcase-04.jpg',
    title: 'Collection study 04',
    alt: 'Silver robotic helmet with illuminated yellow slashes, orange and white hoodie and two swords',
    description: 'A portrait from the original Phase 3 collection showcase.',
  },
  {
    src: '/artwork/showcase-05.jpg',
    title: 'Collection study 05',
    alt: 'Black robotic figure in a graphic T-shirt with white wings covered in dark lettering',
    description: 'A portrait from the original Phase 3 collection showcase.',
  },
];

export const CHARACTER_SLIDES: readonly GallerySlide[] = [
  {
    src: '/artwork/drip-x.jpg',
    title: 'DRIP-X',
    alt: 'DRIP-X robotic portrait with a purple reflective visor and gold detail',
    description:
      'This DR1P-X represents the fashion addicts. Even if everyone has style, they are ████████ in the fashion industry of the CyberClub, ████████ spreading The Creator’s culture. Their agility and attention to detail allows them to work with precious stones and exotic textiles to create masterpieces.',
  },
  {
    src: '/artwork/redacted.jpg',
    title: 'Glitching signal',
    alt: 'Unnamed robotic character with a gold and pink reflective visor',
    description: 'Decorative glitching character signal.',
    scrambled: true,
  },
  {
    src: '/artwork/civil-x.jpg',
    title: 'C1V1L-X',
    alt: 'C1V1L-X silver robotic helmet with etched geometric panels against black',
    description:
      'C1V1L-X is a system initially programmed by ██████ to create an economically superior and efficient city. As these are the clones of the original project, the C1V1L-X class is the most common version ██████. Their design is simple and refined. They are multipurpose and participate in a variety of activities.',
  },
  {
    src: '/artwork/aim-x.jpg',
    title: 'A1M-X',
    alt: 'A1M-X gold robotic helmet with bright diagonal illuminated slashes',
    description:
      'A1M-X are Dripcity’s soldiers, they never miss their targets ██████ unique aimbot. We still don’t know why the CyberClub has such a █████ army and why do they need it. Is it to protect themselves from ██████ or are they planning to attack?',
  },
  {
    src: '/artwork/lil-x.jpg',
    title: 'L1L-X',
    alt: 'L1L-X gold robotic helmet with vivid green inset panels',
    description:
      'L1L-X are the gangsters of the CyberClub. They are running the main businesses such as █████████. It seems that they have a mafia-like hierarchy, and we believe we have identified ████████. When someone has a problem, he always reaches out to these thugs for help.',
  },
];

export const ARCHIVED_ROADMAP = [
  {
    title: 'INVESTIGATION',
    description:
      'Introduction to the CyberClub through a short interactive story.',
  },
  {
    title: 'EXPAND THE CLUB',
    description: 'Get your chance to be whitelisted by joining us now !',
  },
  {
    title: 'PRESALE',
    description:
      'Will take place on our website\nStart 24H before public sale\nPrice : 0.12 ETH\nMetamask wallet needed\nwhitelisted only',
  },
  {
    title: 'PUBLIC SALE',
    description:
      'Will take place on our website\nPrice : 0.15 ETH\nMetamask wallet needed\nMetadatas reveal 48h later',
  },
  {
    title: 'TREASURY',
    description:
      'Multi-sig committee election\nVote and proposals on Snapshot\n20% of sales + 1 unique NFT\n100% of the royalties (3.5% of every secondary market sale on OpenSea)',
  },
  {
    title: 'COMMUNITY BUILDING',
    description:
      'Partnerships, giveaways, events, website updates with community features',
  },
  {
    title: 'EXPANDING CYBERCLUB UNIVERSE',
    description:
      'P2E studio creation (fundraising with private investors)\nWL for spin off collections and beta access for future projects',
  },
] as const;

export const SHOWCASE_FAQ = [
  {
    question: 'What is Dripperz Cyberclub?',
    answer:
      'A fashion universe developed by The Creator, built around individuality, cyberpunk characters and personal style in the metaverse. The collection contains 5,555 unique Dripperz.',
  },
  {
    question: 'Who are the characters?',
    answer:
      'DRIP-X, C1V1L-X, A1M-X and L1L-X are characters from the Cyberclub universe, with their own roles and stories. Meet them in the Cyberclub section; some parts of their stories remain redacted.',
  },
  {
    question: 'What makes a Dripperz unique?',
    answer:
      'Each Dripperz combines a class, body and background with optional clothes, headwear, neckwear and accessories. The rarity catalog shows all 128 traits and how often each appears in the collection.',
  },
  {
    question: 'How can I check rarity?',
    answer:
      'Enter a Dripperz ID from 1 to 5,555 in the rarity explorer to see its artwork, traits, rank and score. Open the rarity catalog to browse or search individual traits. Ranks and scores use the original collection snapshot, not current prices or market value.',
  },
  {
    question: 'What is the Cybermap?',
    answer:
      'The Cybermap is the original seven-stage roadmap, from the first investigation into the Cyberclub to plans for a wider universe. Its sale prices and proposed benefits are historical, not current offers or promises.',
  },
  {
    question: 'What was the community treasury?',
    answer:
      'The original project used a multisignature Safe treasury and Snapshot proposals for community governance. This site preserves the layout with masked values; live balances, proposals and voting are disconnected.',
  },
  {
    question: 'Can I mint or buy here?',
    answer:
      'No. This is a non-commercial collection showcase, with no mint, sale or wallet connection. Viewing the artwork does not grant ownership or a license to use it.',
  },
] as const;
