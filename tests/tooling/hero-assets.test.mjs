/**
 * Pin the owner-approved interim model bytes, embedded resources and captured poster format.
 * @file
 */

import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { test } from 'node:test';

test('public hero contains the approved unchanged model, embedded resources and model poster only', async () => {
  const directory = new URL('../../public/hero/', import.meta.url);
  assert.deepEqual((await readdir(directory)).sort(), [
    'wattson-poster.png',
    'wattson.glb',
  ]);
  const model = await readFile(new URL('wattson.glb', directory));
  assert.equal(model.length, 70_102_064);
  assert.equal(
    createHash('sha256').update(model).digest('hex'),
    '3320181d562d490eab7ffb3adfb61e9b31a1f50655085dd59720a93b95c9c9e3',
  );
  assert.equal(model.readUInt32LE(0), 0x46546c67);
  assert.equal(model.readUInt32LE(4), 2);
  assert.equal(model.readUInt32LE(8), model.length);
  assert.equal(model.readUInt32LE(16), 0x4e4f534a);
  const gltf = JSON.parse(
    model.subarray(20, 20 + model.readUInt32LE(12)).toString(),
  );
  assert.ok(gltf.buffers.every((buffer) => buffer.uri === undefined));
  assert.ok(
    gltf.images.every(
      (image) => image.uri === undefined && Number.isInteger(image.bufferView),
    ),
  );
  assert.ok(
    gltf.animations.some((animation) => animation.name === 'All Animations'),
  );
  const poster = await readFile(new URL('wattson-poster.png', directory));
  assert.equal(poster.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(poster.readUInt32BE(16), 640);
  assert.equal(poster.readUInt32BE(20), 640);
});
