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
    question: 'What is this site?',
    answer:
      'A personal, non-commercial showcase of Dripperz artwork and its fictional universe. It is not a mint or sales website.',
  },
  {
    question: 'Do I need a wallet?',
    answer:
      'No. This showcase has no wallet connection, minting or live blockchain integration. You can explore the artwork without signing in.',
  },
  {
    question: 'How do the galleries work?',
    answer:
      'Slides advance automatically, and images and descriptions stay together. Focus a gallery and press Left or Right to explore. Automatic motion pauses while focused, hidden or offscreen; reduced-motion preferences keep slides still.',
  },
  {
    question: 'Is the cybermap a current roadmap?',
    answer:
      'No. It records proposals from the original roadmap, not verified completion or new commitments. No dates, investment opportunities or future benefits are promised.',
  },
  {
    question: 'Does this site grant artwork rights?',
    answer:
      'No artwork license or ownership rights are granted by viewing this showcase. It makes no claim about the rights associated with any token.',
  },
  {
    question: 'Are treasury and rarity features available?',
    answer:
      'The treasury and rarity sections show locally presented information. Neither feature requests live balances, ownership or prices.',
  },
] as const;

export const PUBLIC_LINKS = [
  { label: 'Dripperz on X', href: 'https://twitter.com/DripperzCC' },
] as const;
