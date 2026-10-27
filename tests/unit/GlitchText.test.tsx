/**
 * Neon heading copies must never duplicate meaningful text for assistive technology.
 * @packageDocumentation
 */

import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { GlitchText } from '../../src/design-system';

test('glitch headings expose one stable label and hide both decorative layers', () => {
  const { container } = render(
    <h2>
      <GlitchText text="CYBERCLUB" />
    </h2>,
  );
  expect(screen.getByRole('heading', { name: 'CYBERCLUB' })).toHaveTextContent(
    'CYBERCLUB',
  );
  expect(container.textContent).toBe('CYBERCLUB');
  const copies = container.querySelectorAll('.glitch-layer');
  expect(copies).toHaveLength(2);
  for (const copy of copies) {
    expect(copy.getAttribute('aria-hidden')).toBe('true');
    expect(copy.getAttribute('data-text')).toBe('CYBERCLUB');
  }
});
