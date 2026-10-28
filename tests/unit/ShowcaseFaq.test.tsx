/**
 * Keep public answers centered on collection facts rather than UI implementation details.
 * @packageDocumentation
 */

import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Collection, ShowcaseFaq } from '../../src/CoreShowcase';

test('FAQ explains the collection, catalog, community treasury and secondary-market purchases', () => {
  const { container } = render(<ShowcaseFaq />);
  expect(container.querySelectorAll('details > summary')).toHaveLength(7);
  expect(
    screen.getByText(/fashion universe developed by The Creator/),
  ).toBeInTheDocument();
  expect(screen.getByText(/all 128 traits/)).toBeInTheDocument();
  expect(
    screen.getByText(/not current prices or market value/),
  ).toBeInTheDocument();
  expect(
    screen.getByText('How does the community treasury work?'),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      'The community treasury is held in a Gnosis Safe multisignature wallet, with a connected Snapshot DAO where the community votes on how its funds should be managed.',
    ),
  ).toBeInTheDocument();
  expect(screen.getByText('Can I mint or buy a Dripperz?')).toBeInTheDocument();
  expect(
    screen.getByText('Minting has ended. You can buy Dripperz on OpenSea.'),
  ).toBeInTheDocument();
  expect(container.textContent).not.toMatch(
    /How do the galleries work|presale if you are whitelisted|full rights on NFT/,
  );
});

test('collection presentation stands alone and retains its source emphasis', () => {
  const { container } = render(<Collection />);
  expect(container.querySelector('.collection-intro p')).toHaveTextContent(
    'Cyberclub is a fashion universe developed by The Creator.',
  );
  expect(container.querySelector('.accent-purple')).toHaveTextContent(
    'The Creator.',
  );
  expect(container.querySelector('.lore-underline')).toHaveTextContent(
    'key to freedom',
  );
  expect(screen.queryByRole('region')).toBeNull();
});
