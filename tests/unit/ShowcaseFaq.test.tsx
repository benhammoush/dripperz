/**
 * Keep public answers centered on collection facts rather than UI implementation details.
 * @packageDocumentation
 */

import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Collection, ShowcaseFaq } from '../../src/CoreShowcase';

test('FAQ explains the collection, complete catalog and disconnected features', () => {
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
    screen.getByText(/live balances, proposals and voting are disconnected/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/does not grant ownership or a license/),
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
