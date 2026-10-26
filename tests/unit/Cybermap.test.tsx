/**
 * Protect the original Phase 3 roadmap copy without reinstating active offers or completion claims.
 * @packageDocumentation
 */

import { render, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Cybermap } from '../../src/CoreShowcase';

test('quotes the seven desktop source stages in order with original figures and wording', () => {
  const { container } = render(<Cybermap />);
  expect(
    screen.getByText(
      'Original roadmap wording—not current offers or commitments.',
    ),
  ).toBeInTheDocument();
  const stages = screen.getAllByRole('listitem');
  expect(
    stages.map((stage) => within(stage).getByRole('heading').textContent),
  ).toEqual([
    'INVESTIGATION',
    'EXPAND THE CLUB',
    'PRESALE',
    'PUBLIC SALE',
    'TREASURY',
    'COMMUNITY BUILDING',
    'EXPANDING CYBERCLUB UNIVERSE',
  ]);
  const expected = [
    'Introduction to the CyberClub through a short interactive story.',
    'Get your chance to be whitelisted by joining us now !',
    'Will take place on our website Start 24H before public sale Price : 0.12 ETH Metamask wallet needed whitelisted only',
    'Will take place on our website Price : 0.15 ETH Metamask wallet needed Metadatas reveal 48h later',
    'Multi-sig committee election Vote and proposals on Snapshot 20% of sales + 1 unique NFT 100% of the royalties (3.5% of every secondary market sale on OpenSea)',
    'Partnerships, giveaways, events, website updates with community features',
    'P2E studio creation (fundraising with private investors) WL for spin off collections and beta access for future projects',
  ];
  const quotations = container.querySelectorAll('blockquote');
  expect(quotations).toHaveLength(7);
  quotations.forEach((quotation, index) => {
    expect(quotation.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      expected[index],
    );
  });
  expect(screen.queryByRole('link')).toBeNull();
  expect(screen.queryByRole('button')).toBeNull();
  expect(container.querySelector('del, s, time')).toBeNull();
});
