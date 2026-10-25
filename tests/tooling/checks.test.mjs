/**
 * Keep the complete local gate and standalone build guarded without repeated stages.
 * @file
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { verifiedArchive } from '../../scripts/check-workflows.mjs';

const { scripts, engines, packageManager } = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url)),
);

test('preserves the selected exact npm toolchain', () => {
  assert.equal(engines.npm, '11.19.0');
  assert.equal(packageManager, `npm@${engines.npm}`);
});

test('quality rejects every advisory severity in full and runtime dependency trees', () => {
  assert.equal(scripts['ci:quality'], 'npm run check');
  assert.ok(scripts.check.includes('npm run audit:dependencies'));
  assert.equal(
    scripts['audit:dependencies'],
    'npm audit && npm audit --omit=dev',
  );
  assert.doesNotMatch(scripts['ci:quality'], /audit-level/);
});

test('workflow lint stays in CI quality and rejects altered executable archives', () => {
  assert.ok(scripts.check.includes('npm run lint:workflows'));
  assert.equal(scripts['lint:workflows'], 'node scripts/check-workflows.mjs');
  const bytes = Buffer.from('abc');
  const digest =
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
  assert.equal(verifiedArchive(bytes, digest), bytes);
  assert.throws(() => verifiedArchive(Buffer.from('changed'), digest));
});

test('the full gate invokes each prerequisite once and delegates type/version guards to build', () => {
  const check = scripts.check.split(' && ');
  const build = scripts.build.split(' && ');
  for (const name of [
    'lint',
    'format:check',
    'test:rules',
    'test:unit',
    'build',
  ]) {
    assert.equal(
      check.filter((stage) => stage === `npm run ${name}`).length,
      1,
      name,
    );
  }
  for (const name of ['check:version', 'typecheck']) {
    assert.equal(check.includes(`npm run ${name}`), false, name);
    assert.equal(
      build.filter((stage) => stage === `npm run ${name}`).length,
      1,
      name,
    );
  }
  assert.equal(build.at(-1), 'vite build');
});

test('standalone browser commands build first while CI consumes the shared verified build', () => {
  assert.equal(scripts.test, 'npm run test:rules && npm run test:unit');
  assert.equal(scripts['test:e2e'], 'npm run test:browser');
  assert.equal(scripts['test:browser'], 'npm run build && playwright test');
  assert.equal(
    scripts['test:hero'],
    'npm run build && playwright test --config playwright.hero.config.ts',
  );
  const workflow = readFileSync(
    new URL('../../.github/workflows/ci.yml', import.meta.url),
    'utf8',
  );
  assert.match(
    workflow,
    /ci-cd-workflows\/\.github\/workflows\/verify-web.yml@[a-f0-9]{40}/,
  );
  assert.equal(
    scripts['ci:browser'],
    'playwright test && playwright test --config playwright.hero.config.ts',
  );
  assert.ok(scripts['ci:quality'].startsWith('npm run check'));
  const hero = readFileSync(
    new URL('../../playwright.hero.config.ts', import.meta.url),
    'utf8',
  );
  assert.doesNotMatch(hero, /npm run build/);
});
