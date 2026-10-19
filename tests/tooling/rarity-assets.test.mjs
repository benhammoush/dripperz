/**
 * Verify prepared rarity provenance, exact archival arithmetic, tie order and all derivative bytes.
 * @file
 */

import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { test } from 'node:test';

const root = new URL('../../', import.meta.url);

test('rarity data preserves every legacy score/rank, approved fixture and bounded local asset', async () => {
  const bytes = await readFile(new URL('public/rarity/collection.json', root));
  const data = JSON.parse(bytes);
  const manifest = JSON.parse(
    await readFile(new URL('docs/rarity-source-manifest.json', root), 'utf8'),
  );
  assert.equal(
    manifest.sourceRaritySha256,
    '879353c792d3bc9634ffaffa51c0b780422428b3c5ca8b9ee37167a42e47ef1d',
  );
  assert.equal(
    createHash('sha256').update(bytes).digest('hex'),
    manifest.collectionSha256,
  );
  assert.equal(data.total, 5555);
  assert.equal(data.tokens.length, 5555);
  assert.equal(data.traits.length, 128);
  assert.equal(/https?:|ipfs:/.test(bytes.toString()), false);
  assert.deepEqual(manifest.layerOrder, [
    'BACKGROUND',
    'ACCESSORIES',
    'BODY',
    'NECK',
    'CLASS',
    'CLOTHES',
    'HEAD',
  ]);
  const counts = Array(128).fill(0);
  const types = new Map();
  const lengths = new Map();
  for (const token of data.tokens) {
    lengths.set(
      token.traits.length,
      (lengths.get(token.traits.length) ?? 0) + 1,
    );
    for (const id of token.traits) {
      counts[id]++;
      const type = data.traits[id].type;
      types.set(type, (types.get(type) ?? 0) + 1);
    }
  }
  /**
   * Mirror the original JavaScript positive component arithmetic exactly.
   * @param count - Tokens sharing a value, absence or attribute count.
   * @returns The four-decimal legacy component score.
   */
  function score(count) {
    return Math.round((1 / (count / data.total)) * 1e4) / 1e4;
  }
  data.traits.forEach((trait, id) => {
    assert.equal(trait.count, counts[id]);
    assert.equal(trait.score, score(trait.count));
  });
  // Original scorer dictionary insertion order, not image composition order.
  const scoreOrder = [
    'BACKGROUND',
    'BODY',
    'CLASS',
    'CLOTHES',
    'HEAD',
    'NECK',
    'ACCESSORIES',
  ];
  data.tokens.forEach((token, index) => {
    assert.equal(token.id, index + 1);
    const present = new Set(token.traits.map((id) => data.traits[id].type));
    assert.equal(present.size, token.traits.length);
    const attributeScore = token.traits.reduce(
      (sum, id) => sum + data.traits[id].score,
      0,
    );
    const missingScore = scoreOrder
      .filter((type) => !present.has(type))
      .reduce((sum, type) => sum + score(data.total - types.get(type)), 0);
    assert.equal(
      token.score,
      attributeScore + missingScore + score(lengths.get(token.traits.length)),
    );
  });
  [...data.tokens]
    .sort((a, b) => b.score - a.score || a.id - b.id)
    .forEach((token, index) => assert.equal(token.rank, index + 1));
  for (const [id, rank, display] of [
    [1, 3056, '110.0'],
    [2, 2495, '120.9'],
    [54, 2207, '127.0'],
    [2940, 1, '3019.8'],
    [5555, 2988, '111.4'],
  ]) {
    assert.equal(data.tokens[id - 1].rank, rank);
    assert.equal(data.tokens[id - 1].score.toFixed(1), display);
  }
  const sailor = data.traits.findIndex(
    (trait) => trait.type === 'CLOTHES' && trait.value === 'Sailor Tee',
  );
  assert.equal(
    manifest.assets[sailor].source,
    'src/trait-layers/CLOTHES/T-Sailor.png',
  );
  assert.ok(data.tokens[53].traits.includes(sailor));
  assert.deepEqual(
    (await readdir(new URL('public/rarity/layers/', root))).sort(),
    data.traits.map((trait) => trait.asset.split('/')[1]).sort(),
  );
  let total = bytes.length;
  for (const [id, trait] of data.traits.entries()) {
    assert.equal(trait.asset, `layers/t${String(id).padStart(3, '0')}.png`);
    const image = await readFile(new URL(`public/rarity/${trait.asset}`, root));
    assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(image.readUInt32BE(16), 1000);
    assert.equal(image.readUInt32BE(20), 1000);
    assert.equal(image[25], 6, 'RGBA output is required');
    assert.equal(
      createHash('sha256').update(image).digest('hex'),
      manifest.assets[id].outputSha256,
    );
    total += image.length;
  }
  assert.ok(
    total + 70_102_064 < 200_000_000,
    'Rarity and hero must remain within the unchanged raw transport cap',
  );
});
