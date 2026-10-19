/**
 * Exercise fixed-snapshot validation, strict token parsing and original score presentation.
 * @packageDocumentation
 */

import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import {
  formatRarityScore,
  parseRarityDataset,
  parseTokenId,
} from '../../src/rarityData';

const fixture: unknown = JSON.parse(
  readFileSync('public/rarity/collection.json', 'utf8'),
);

test('all approved IDs map consistently to stored rank and score fixtures', () => {
  const data = parseRarityDataset(fixture);
  for (const [id, rank, score] of [
    [1, 3056, '110.0'],
    [54, 2207, '127.0'],
    [2940, 1, '3019.8'],
    [5555, 2988, '111.4'],
  ] as const) {
    const token = data.tokens[id - 1]!;
    expect(token.id).toBe(id);
    expect(token.rank).toBe(rank);
    expect(formatRarityScore(token.score)).toBe(score);
  }
});

test('only integral decimal IDs in the actual collection bounds are accepted', () => {
  for (const value of [
    '',
    ' ',
    '0',
    '-1',
    '+1',
    '1.5',
    '1e2',
    '0x10',
    '5556',
    'Infinity',
    '../1',
    '1abc',
  ])
    expect(parseTokenId(value)).toBeNull();
  expect(parseTokenId('0001')).toBe(1);
  expect(parseTokenId(' 5555 ')).toBe(5555);
});

test('malformed or missing snapshots fail closed before exposing partial records', () => {
  for (const value of [
    null,
    {},
    [],
    { schema: 1, total: 0 },
    { schema: 1, total: 5555, traits: [], tokens: [] },
  ])
    expect(() => parseRarityDataset(value)).toThrow(
      'Invalid local rarity data',
    );
});

test('duplicate IDs/ranks, unsafe image paths, missing categories and bad counts are rejected', () => {
  const data = JSON.parse(JSON.stringify(fixture)) as {
    schema: number;
    total: number;
    traits: { type: string; asset: string; count: number }[];
    tokens: { id: number; rank: number; score: number; traits: number[] }[];
  };
  const mutations = [
    () => {
      data.tokens[1]!.id = 1;
    },
    () => {
      data.tokens[1]!.rank = data.tokens[0]!.rank;
    },
    () => {
      data.traits[0]!.asset = 'https://example.invalid/image.png';
    },
    () => {
      data.tokens[0]!.traits = data.tokens[0]!.traits.slice(1);
    },
    () => {
      data.tokens[0]!.traits.reverse();
    },
    () => {
      data.traits[0]!.count += 1;
    },
    () => {
      data.tokens[0]!.score = Number.NaN;
    },
  ];
  const original = JSON.stringify(data);
  for (const mutate of mutations) {
    Object.assign(data, JSON.parse(original) as object);
    mutate();
    expect(() => parseRarityDataset(data)).toThrow('Invalid local rarity data');
  }
});
