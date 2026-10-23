/**
 * Prove delivery identity, isolated configuration and approval contracts fail closed.
 * Fixtures contain only synthetic public IDs; no network or mutations are used.
 * @file
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  rm,
  truncate,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { deploy, select, heroRequired } from '../../scripts/delivery.mjs';
import {
  sourceRevision,
  projectName,
  fingerprint,
  assertMainProtection,
  assertProductionGate,
  projectConfiguration,
  assertDeployment,
  staticHostingConfiguration,
} from '../../scripts/delivery-contract.mjs';

/**
 * Exercise the actual controller in an isolated directory with synthetic APIs.
 * All fetches are intercepted; unknown endpoints throw rather than using network.
 * @param scenario - Failure/success scenario to simulate.
 * @param run - Assertion callback receiving captured requests and fixture paths.
 */
async function withController(scenario, run) {
  const production = scenario.startsWith('production-');
  const root =
    process.platform === 'win32' ? join(tmpdir(), 'opencode') : tmpdir();
  const directory = await mkdtemp(join(root, 'dripperz-delivery-test-'));
  const originalCwd = process.cwd();
  const originalFetch = globalThis.fetch;
  const settings = {
    GITHUB_REPOSITORY: 'benhammoush/dripperz',
    GITHUB_REF: 'refs/heads/main',
    GH_TOKEN: 'synthetic-github',
    VERCEL_TOKEN: 'synthetic-vercel',
    DEPLOY_ENABLED: 'true',
    DELIVERY_REVISION: 'a'.repeat(40),
    DELIVERY_TARGET: production ? 'production' : 'dev',
    DELIVERY_AUTOMATIC: production ? 'false' : 'true',
    VERCEL_TEAM_ID: 'team_test',
    VERCEL_DEV_PROJECT_ID: 'prj_dev',
    VERCEL_PRODUCTION_PROJECT_ID: 'prj_production',
    GITHUB_RUN_ID: '100',
    GITHUB_STEP_SUMMARY: join(directory, 'summary.md'),
    GITHUB_OUTPUT: join(directory, 'output.txt'),
    GITHUB_EVENT_PATH: join(directory, 'event.json'),
    GITHUB_EVENT_NAME: production ? 'workflow_dispatch' : 'workflow_run',
    GITHUB_RUN_ATTEMPT: '1',
  };
  const previous = Object.fromEntries(
    Object.keys(settings).map((key) => [key, process.env[key]]),
  );
  const requests = [];
  const fixture = staticProject();
  const productionFixture = staticProject();
  productionFixture.project.id = 'prj_production';
  productionFixture.project.name = 'dripperz-production';
  productionFixture.domains.domains[0].name = 'dripperz-production.vercel.app';
  const staticFiles = [
    ['index.html', '<div id="root"></div>'],
    ['robots.txt', 'User-agent: *\nDisallow: /\n'],
    ['vercel.json', JSON.stringify(staticHostingConfiguration())],
  ];
  if (
    scenario.startsWith('large-') ||
    scenario.startsWith('production-large-')
  ) {
    staticFiles.push(['model.glb', Buffer.alloc(1_000_001, 7)]);
    staticFiles.sort(([a], [b]) => a.localeCompare(b));
  }
  if (scenario === 'inline-json-limit') {
    for (let index = 0; index < 60; index++)
      staticFiles.push([`small-${index}.bin`, Buffer.alloc(60_000)]);
    staticFiles.sort(([a], [b]) => a.localeCompare(b));
  }
  if (scenario.includes('rarity-')) {
    const manifest = JSON.parse(
      await readFile(
        new URL('../../docs/rarity-source-manifest.json', import.meta.url),
        'utf8',
      ),
    );
    for (const asset of manifest.assets)
      staticFiles.push([
        asset.output.split('/').at(-1),
        await readFile(
          new URL(`../../public/rarity/${asset.output}`, import.meta.url),
        ),
      ]);
    staticFiles.push([
      'collection.json',
      await readFile(
        new URL('../../public/rarity/collection.json', import.meta.url),
      ),
    ]);
    staticFiles.push(['inline-boundary.bin', Buffer.alloc(64_000)]);
    staticFiles.push(['binary-boundary.bin', Buffer.alloc(64_001)]);
    staticFiles.sort(([a], [b]) => a.localeCompare(b));
  }
  const identity = {
    schema: 1,
    revision: settings.DELIVERY_REVISION,
    version: '0.1.0',
    target: production ? 'production' : 'dev',
    runId: '100',
    bundleDigest: fingerprint(
      staticFiles.map(([name, data]) => [
        name,
        Buffer.from(data).toString('base64'),
      ]),
    ),
  };
  const candidateIdentity = { ...identity, target: 'dev', runId: '90' };
  const recoveryIdentity = {
    ...candidateIdentity,
    revision: 'b'.repeat(40),
    version: '0.0.9',
    bundleDigest: 'recovery',
    runId: '80',
  };
  const priorIdentity = {
    ...identity,
    revision: 'c'.repeat(40),
    version: '0.0.8',
    bundleDigest: 'prior',
    runId: '70',
  };
  const devConfig = checkProject(fixture);
  const prodConfig = projectConfiguration(
    productionFixture.project,
    productionFixture.domains,
    'production',
    'team_test',
    'prj_production',
  );
  const existing = Object.fromEntries(
    [
      ['dpl_candidate', candidateIdentity, 'prj_dev', devConfig],
      ['dpl_recovery', recoveryIdentity, 'prj_dev', devConfig],
      ['dpl_prior', priorIdentity, 'prj_production', prodConfig],
    ].map(([id, publicIdentity, projectId, configDigest]) => [
      id,
      {
        id,
        projectId,
        readyState: 'READY',
        target: 'production',
        url: `${id.replaceAll('_', '-')}.vercel.app`,
        createdAt: Date.UTC(2026, 0, 1),
        meta: { ...publicIdentity, configDigest },
      },
    ]),
  );
  let projectReads = 0;
  let created;
  let uploaded = false;
  try {
    process.chdir(directory);
    Object.assign(process.env, settings);
    await mkdir('dist');
    for (const [name, data] of staticFiles)
      await writeFile(`dist/${name}`, data);
    await writeFile('dist/delivery.json', JSON.stringify(identity));
    await writeFile(
      'event.json',
      JSON.stringify({
        workflow_run: {
          conclusion: 'success',
          event: 'push',
          head_branch: 'main',
          head_repository: { full_name: 'benhammoush/dripperz' },
          path: '.github/workflows/ci.yml',
          head_sha: identity.revision,
        },
      }),
    );
    globalThis.fetch = async (input, options = {}) => {
      const url = new URL(input);
      requests.push({
        url: url.href,
        method: options.method ?? 'GET',
        body: Buffer.isBuffer(options.body)
          ? options.body
          : options.body
            ? JSON.parse(options.body)
            : undefined,
        headers: options.headers,
      });
      let result;
      if (url.hostname === 'api.github.com') {
        assert.ok(url.pathname.startsWith('/repos/benhammoush/dripperz/'));
        assert.equal(options.headers.Authorization, 'Bearer synthetic-github');
        if (url.pathname.endsWith('/branches/main')) {
          result = {
            commit: {
              sha:
                scenario === 'superseded' ? 'b'.repeat(40) : identity.revision,
            },
          };
        } else if (url.pathname.includes('/compare/')) {
          result = {
            status: scenario === 'unmerged' ? 'diverged' : 'identical',
          };
        } else
          throw new Error(
            `Unexpected synthetic GitHub endpoint: ${url.pathname}`,
          );
      } else if (url.hostname === 'api.vercel.com') {
        const devRead =
          production &&
          (url.pathname.startsWith('/v9/projects/prj_dev') ||
            /\/v13\/deployments\/dpl_(candidate|recovery)$/.test(url.pathname));
        assert.equal(options.headers.Authorization, 'Bearer synthetic-vercel');
        assert.equal(devRead, false, 'Production must not read dev resources');
        if (url.pathname === '/v9/projects/prj_dev/domains')
          result = fixture.domains;
        else if (url.pathname === '/v9/projects/prj_dev') {
          projectReads++;
          if (scenario === 'large-snapshot-tamper' && projectReads === 1)
            await writeFile('dist/model.glb', Buffer.alloc(1_000_001, 8));
          result = structuredClone(fixture.project);
          if (
            (scenario === 'drift' && projectReads > 1) ||
            (scenario === 'large-late-drift' && uploaded)
          )
            result.nodeVersion = '22.x';
          if (production)
            result.targets = { production: { id: 'dpl_candidate' } };
          if (scenario === 'production-late-dev-drift' && projectReads > 1)
            result.targets.production.id = 'dpl_changed';
          if (scenario === 'production-candidate-drift')
            result.targets.production.id = 'dpl_changed';
          if (created && !production)
            result.targets = { production: { id: created.id } };
        } else if (url.pathname === '/v9/projects/prj_production/domains')
          result = productionFixture.domains;
        else if (url.pathname === '/v9/projects/prj_production') {
          projectReads++;
          result = {
            ...productionFixture.project,
            targets: { production: { id: created?.id ?? 'dpl_prior' } },
          };
          if (scenario.startsWith('production-empty') && !created)
            delete result.targets;
          if (scenario === 'production-empty-drift' && projectReads > 1)
            result.targets = { production: { id: 'dpl_changed' } };
          if (
            scenario === 'production-empty-malformed-drift' &&
            projectReads > 1
          )
            result.targets = { production: {} };
          if (scenario === 'production-invalid-prior')
            result.targets.production.id = 'invalid';
          if (scenario === 'production-missing-prior-id')
            result.targets.production = {};
        } else if (url.pathname === '/v2/files') {
          assert.equal(url.searchParams.get('teamId'), 'team_test');
          assert.equal(options.method, 'POST');
          assert.equal(options.redirect, 'error');
          assert.equal(
            options.headers['Content-Type'],
            'application/octet-stream',
          );
          assert.equal(
            options.headers['Content-Length'],
            String(options.body.length),
          );
          assert.equal(
            options.headers['x-vercel-digest'],
            createHash('sha1').update(options.body).digest('hex'),
          );
          if (scenario === 'large-ambiguous-upload')
            throw new Error('Synthetic lost file response');
          if (scenario === 'large-rejected-upload')
            return new Response('', { status: 403 });
          if (
            scenario === 'rarity-rejected-middle' &&
            requests.filter((request) => request.url.includes('/v2/files'))
              .length === 3
          )
            return new Response('', { status: 403 });
          uploaded = true;
          return new Response(null, { status: 200 });
        } else if (url.pathname.startsWith('/v13/deployments/')) {
          result = structuredClone(existing[url.pathname.split('/').at(-1)]);
          if (
            scenario === 'production-recovery-mismatch' &&
            result.id === 'dpl_recovery'
          )
            result.meta.bundleDigest = 'wrong';
          if (
            scenario === 'production-prior-mismatch' &&
            result.id === 'dpl_prior'
          )
            result.meta.revision = 'wrong';
          if (
            scenario === 'production-run-mismatch' &&
            result.id === 'dpl_candidate'
          )
            result.meta.runId = '89';
        } else if (
          url.pathname === '/v13/deployments' &&
          options.method === 'POST'
        ) {
          if (
            scenario === 'ambiguous-post' ||
            scenario === 'production-empty-ambiguous-post'
          )
            throw new Error('Synthetic lost deployment response');
          created = {
            id: 'dpl_created',
            projectId: production ? 'prj_production' : 'prj_dev',
            readyState: 'READY',
            target: 'production',
            url: production
              ? 'dripperz-production-immutable.vercel.app'
              : 'dripperz-dev-immutable.vercel.app',
            meta: JSON.parse(options.body).meta,
          };
          result = created;
        } else
          throw new Error(
            `Unexpected synthetic Vercel endpoint: ${url.pathname}`,
          );
      } else if (
        [
          'dripperz-dev.vercel.app',
          'dripperz-dev-immutable.vercel.app',
          'dripperz-production.vercel.app',
          'dripperz-production-immutable.vercel.app',
          'dpl-candidate.vercel.app',
          'dpl-recovery.vercel.app',
          'dpl-prior.vercel.app',
        ].includes(url.hostname)
      ) {
        if (
          scenario === 'smoke-failure' ||
          scenario === 'production-empty-smoke-failure'
        )
          return new Response('Unavailable', { status: 503 });
        const hostedIdentity =
          url.hostname === 'dpl-candidate.vercel.app' ||
          (production && url.hostname === 'dripperz-dev.vercel.app')
            ? candidateIdentity
            : url.hostname === 'dpl-recovery.vercel.app'
              ? recoveryIdentity
              : url.hostname === 'dpl-prior.vercel.app'
                ? priorIdentity
                : identity;
        return new Response(
          url.pathname === '/delivery.json'
            ? JSON.stringify(hostedIdentity)
            : url.pathname === '/robots.txt'
              ? 'User-agent: *\nDisallow: /\n'
              : '<div id="root"></div>',
          {
            status: 200,
            headers: {
              'X-Robots-Tag': 'noindex, nofollow',
              'Cache-Control': 'no-store',
            },
          },
        );
      } else throw new Error('Network is disabled in controller tests');
      return Response.json(result);
    };
    await run({ requests, directory, identity });
  } finally {
    globalThis.fetch = originalFetch;
    process.chdir(originalCwd);
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    await rm(directory, { recursive: true, force: true });
  }
}

test('controller selects trusted successful main push CI with built-in authentication and no administration endpoints', async () => {
  await withController('success', async ({ directory }) => {
    await select();
    assert.match(
      await readFile(join(directory, 'output.txt'), 'utf8'),
      /target=dev/,
    );
    const event = JSON.parse(
      await readFile(join(directory, 'event.json'), 'utf8'),
    );
    for (const [key, value] of [
      ['event', 'pull_request'],
      ['conclusion', 'failure'],
      ['head_branch', 'feature'],
      ['head_repository', { full_name: 'someone/Dripperz' }],
      ['head_repository', { full_name: 'benhammoush/another-project' }],
    ]) {
      const invalid = structuredClone(event);
      invalid.workflow_run[key] = value;
      await writeFile(join(directory, 'event.json'), JSON.stringify(invalid));
      await assert.rejects(select);
    }
  });
});

test('repository guards reject unrelated owners and projects before any API request', async () => {
  for (const repository of [
    'someone/dripperz',
    'benhammoush/another-project',
  ]) {
    await withController('success', async ({ requests }) => {
      process.env.GITHUB_REPOSITORY = repository;
      await assert.rejects(select, /Unexpected repository/);
      await assert.rejects(
        deploy,
        /Delivery controller must run from repository main/,
      );
      assert.equal(requests.length, 0);
    });
  }
});

test('manual selection uses the shared target and exact sha inputs', async () => {
  await withController('success', async ({ directory }) => {
    process.env.GITHUB_EVENT_NAME = 'workflow_dispatch';
    await writeFile(
      join(directory, 'event.json'),
      JSON.stringify({ inputs: { target: 'dev', sha: 'a'.repeat(40) } }),
    );
    await select();
    assert.match(
      await readFile(join(directory, 'output.txt'), 'utf8'),
      /automatic=false/,
    );
    assert.match(
      await readFile(join(directory, 'output.txt'), 'utf8'),
      /revision=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/,
    );
  });
});

test('controller rejects stale automatic, unmerged, drifted, tampered and disabled deliveries before POST', async () => {
  for (const scenario of [
    'superseded',
    'unmerged',
    'drift',
    'tampered',
    'disabled',
    'missing-enable',
    'production-missing-enable',
    'missing-config',
    'missing-github',
    'production-disabled',
  ]) {
    await withController(scenario, async ({ requests }) => {
      if (scenario === 'tampered')
        await writeFile('dist/index.html', 'tampered');
      if (scenario === 'disabled' || scenario === 'production-disabled')
        process.env.DEPLOY_ENABLED = 'false';
      if (scenario.endsWith('missing-enable'))
        delete process.env.DEPLOY_ENABLED;
      if (scenario === 'missing-config')
        delete process.env.VERCEL_DEV_PROJECT_ID;
      if (scenario === 'missing-github') delete process.env.GH_TOKEN;
      const expected = {
        superseded: /superseded/,
        unmerged: /not an ancestor/,
        drift: /static project settings/,
        tampered: /bundle identity or content mismatch/,
        disabled: /Delivery remains disabled/,
        'missing-enable': /Delivery remains disabled/,
        'production-missing-enable': /Delivery remains disabled/,
        'missing-config': /Missing VERCEL_DEV_PROJECT_ID/,
        'missing-github': /Missing GH_TOKEN/,
        'production-disabled': /Delivery remains disabled/,
      };
      await assert.rejects(deploy, expected[scenario]);
      if (
        [
          'disabled',
          'production-disabled',
          'missing-enable',
          'production-missing-enable',
        ].includes(scenario)
      )
        assert.ok(
          requests.every((request) => !request.url.includes('api.vercel.com')),
        );
      assert.equal(
        requests.filter((request) => request.method === 'POST').length,
        0,
        scenario,
      );
    });
  }
});

test('successful controller uses one POST and retains exact immutable and prior identity', async () => {
  await withController('success', async ({ requests, directory, identity }) => {
    await deploy();
    assert.equal(
      requests.filter((request) => request.method === 'POST').length,
      1,
    );
    const record = JSON.parse(
      await readFile(join(directory, 'delivery-record.json'), 'utf8'),
    );
    assert.equal(record.deploymentId, 'dpl_created');
    assert.equal(record.priorDeploymentId, null);
    assert.equal(record.revision, identity.revision);
    assert.equal(record.status, 'smoke-verified-not-user-accepted');
    const payload = requests.find((request) => request.method === 'POST').body;
    assert.equal(payload.name, 'dripperz-dev');
    assert.equal(payload.project, 'prj_dev');
    assert.equal(payload.target, 'production');
    assert.deepEqual(payload.projectSettings, {
      framework: null,
      buildCommand: '',
      installCommand: '',
      outputDirectory: '.',
      rootDirectory: null,
      nodeVersion: '24.x',
    });
    assert.deepEqual(
      payload.files.map((file) => file.file),
      ['delivery.json', 'index.html', 'robots.txt', 'vercel.json'],
    );
    assert.ok(payload.files.every((file) => file.encoding === 'base64'));
    const config = JSON.parse(
      Buffer.from(
        payload.files.find((file) => file.file === 'vercel.json').data,
        'base64',
      ).toString(),
    );
    assert.deepEqual(config, {
      version: 2,
      framework: null,
      buildCommand: '',
      installCommand: '',
      outputDirectory: '.',
      headers: [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
            { key: 'Cache-Control', value: 'no-store' },
          ],
        },
      ],
    });
    assert.equal(
      Buffer.from(
        payload.files.find((file) => file.file === 'robots.txt').data,
        'base64',
      ).toString(),
      'User-agent: *\nDisallow: /\n',
    );
  });
});

test('large files use binary uploads and SHA references without raising the JSON limit', async () => {
  for (const scenario of ['large-success', 'production-large-success']) {
    await withController(scenario, async ({ requests, directory }) => {
      await deploy();
      const uploads = requests.filter((request) =>
        request.url.includes('/v2/files'),
      );
      const deployments = requests.filter(
        (request) =>
          request.url.includes('/v13/deployments?') &&
          request.method === 'POST',
      );
      assert.equal(uploads.length, 1);
      assert.equal(deployments.length, 1);
      assert.ok(
        requests.indexOf(uploads[0]) < requests.indexOf(deployments[0]),
      );
      assert.equal(uploads[0].body.length, 1_000_001);
      const reference = deployments[0].body.files.find(
        (file) => file.file === 'model.glb',
      );
      assert.deepEqual(reference, {
        file: 'model.glb',
        sha: createHash('sha1').update(uploads[0].body).digest('hex'),
        size: 1_000_001,
      });
      assert.ok(
        Buffer.byteLength(JSON.stringify(deployments[0].body)) < 4_000_000,
      );
      const record = JSON.parse(
        await readFile(join(directory, 'delivery-record.json'), 'utf8'),
      );
      assert.deepEqual(record.assetUploads, [
        { ...reference, status: 'uploaded' },
      ]);
      assert.equal(record.status, 'smoke-verified-not-user-accepted');
    });
  }
});

test('rarity artwork batches and the exact inline boundary retain bounded JSON on both targets', async () => {
  for (const scenario of ['rarity-success', 'production-rarity-success']) {
    await withController(scenario, async ({ requests }) => {
      await deploy();
      const uploads = requests.filter((request) =>
        request.url.includes('/v2/files'),
      );
      const deployments = requests.filter(
        (request) =>
          request.url.includes('/v13/deployments?') &&
          request.method === 'POST',
      );
      assert.equal(deployments.length, 1);
      const payload = deployments[0].body;
      assert.ok(Buffer.byteLength(JSON.stringify(payload)) < 4_000_000);
      const inline = payload.files.find(
        (file) => file.file === 'inline-boundary.bin',
      );
      assert.equal(inline.encoding, 'base64');
      assert.equal(Buffer.from(inline.data, 'base64').length, 64_000);
      const binary = payload.files.find(
        (file) => file.file === 'binary-boundary.bin',
      );
      assert.equal(binary.size, 64_001);
      const references = payload.files.filter((file) => file.sha);
      assert.equal(references.length, uploads.length);
      assert.ok(
        uploads.length > 100,
        'Exercise the actual 128-layer batch, not just one large model',
      );
      const uploadedSizes = new Map(
        uploads.map((request) => [
          createHash('sha1').update(request.body).digest('hex'),
          request.body.length,
        ]),
      );
      for (const reference of references) {
        assert.equal(uploadedSizes.get(reference.sha), reference.size);
      }
      assert.ok(
        uploads.every(
          (request) =>
            requests.indexOf(request) < requests.indexOf(deployments[0]),
        ),
      );
      assert.equal(
        payload.files.filter((file) => /^t\d{3}\.png$/.test(file.file)).length,
        128,
      );
    });
  }
});

test('a rejected upload partway through the rarity batch stops without retry or deployment', async () => {
  await withController(
    'rarity-rejected-middle',
    async ({ requests, directory }) => {
      await assert.rejects(deploy);
      assert.equal(
        requests.filter((request) => request.url.includes('/v2/files')).length,
        3,
      );
      assert.equal(
        requests.filter(
          (request) =>
            request.url.includes('/v13/deployments?') &&
            request.method === 'POST',
        ).length,
        0,
      );
      const record = JSON.parse(
        await readFile(join(directory, 'delivery-record.json'), 'utf8'),
      );
      assert.equal(record.status, 'file-upload-pending');
      assert.deepEqual(
        record.assetUploads.map((asset) => asset.status),
        ['uploaded', 'uploaded', 'upload-requested'],
      );
    },
  );
});

test('failed or ambiguous file uploads and post-upload drift never create a deployment or retry', async () => {
  for (const scenario of [
    'large-ambiguous-upload',
    'large-rejected-upload',
    'large-late-drift',
  ]) {
    await withController(scenario, async ({ requests, directory }) => {
      await assert.rejects(deploy);
      assert.equal(
        requests.filter((request) => request.url.includes('/v2/files')).length,
        1,
      );
      assert.equal(
        requests.filter(
          (request) =>
            request.url.includes('/v13/deployments?') &&
            request.method === 'POST',
        ).length,
        0,
      );
      const record = JSON.parse(
        await readFile(join(directory, 'delivery-record.json'), 'utf8'),
      );
      assert.equal(record.status, 'file-upload-pending');
      assert.equal(
        record.assetUploads[0].status,
        scenario === 'large-late-drift' ? 'uploaded' : 'upload-requested',
      );
    });
  }
});

test('tampered large assets fail integrity checks before any upload', async () => {
  await withController('large-success', async ({ requests }) => {
    await writeFile('dist/model.glb', Buffer.alloc(1_000_001, 8));
    await assert.rejects(deploy, /bundle identity or content mismatch/);
    assert.equal(
      requests.filter((request) => request.method === 'POST').length,
      0,
    );
  });
});

test('the original deployment JSON guard still rejects excess inline data before mutations', async () => {
  await withController('inline-json-limit', async ({ requests }) => {
    await assert.rejects(deploy, /deployment JSON limit/);
    assert.equal(
      requests.filter((request) => request.method === 'POST').length,
      0,
    );
  });
});

test('file and aggregate bounds reject sparse oversized bundles before hashing or provider requests', async () => {
  for (const sizes of [[100_000_001], [70_000_000, 70_000_000, 70_000_000]]) {
    await withController('success', async ({ requests }) => {
      for (const [index, size] of sizes.entries()) {
        const path = `dist/oversized-${index}.bin`;
        await writeFile(path, '');
        await truncate(path, size);
      }
      await assert.rejects(deploy, /transport bounds/);
      assert.equal(requests.length, 0);
    });
  }
});

test('bytes changed between initial integrity verification and capture fail before upload', async () => {
  await withController('large-snapshot-tamper', async ({ requests }) => {
    await assert.rejects(deploy, /Captured upload bytes differ/);
    assert.equal(
      requests.filter((request) => request.method === 'POST').length,
      0,
    );
  });
});

test('historical sources skip only the later hero suite while hero markers require its exact command', async () => {
  await withController('success', async () => {
    await writeFile(
      'package.json',
      JSON.stringify({ scripts: { check: 'historical check' } }),
    );
    assert.equal(await heroRequired(), false);
    await mkdir('public/hero', { recursive: true });
    await writeFile('public/hero/wattson.glb', 'marker');
    await assert.rejects(heroRequired, /must retain/);
    await writeFile(
      'package.json',
      JSON.stringify({ scripts: { 'test:hero': 'echo skipped' } }),
    );
    await assert.rejects(heroRequired, /must retain/);
    await writeFile(
      'package.json',
      JSON.stringify({
        scripts: {
          'test:hero': 'playwright test --config playwright.hero.config.ts',
        },
      }),
    );
    assert.equal(await heroRequired(), true);
    await rm('public', { recursive: true });
    assert.equal(await heroRequired(), true);
  });
});

test('production uses only its target credential; acceptance and recovery are owner-reviewed', async () => {
  await withController(
    'production-success',
    async ({ requests, directory }) => {
      await deploy();
      const mutations = requests.filter((request) => request.method === 'POST');
      assert.equal(mutations.length, 1);
      assert.equal(mutations[0].body.project, 'prj_production');
      const record = JSON.parse(
        await readFile(join(directory, 'delivery-record.json'), 'utf8'),
      );
      assert.equal(record.priorDeploymentId, 'dpl_prior');
      assert.equal(record.productionBootstrap, false);
      assert.equal(record.promotion, undefined);
      assert.ok(
        requests.every((request) => !request.url.includes('/projects/prj_dev')),
      );
    },
  );
});

test('first production records no predecessor without claiming user acceptance or rollback capability', async () => {
  await withController('production-empty', async ({ requests, directory }) => {
    await deploy();
    assert.equal(
      requests.filter((request) => request.method === 'POST').length,
      1,
    );
    const record = JSON.parse(
      await readFile(join(directory, 'delivery-record.json'), 'utf8'),
    );
    assert.equal(record.priorDeploymentId, null);
    assert.equal(record.productionBootstrap, true);
    assert.equal(record.status, 'smoke-verified-not-user-accepted');
    assert.match(
      await readFile(join(directory, 'summary.md'), 'utf8'),
      /no prior production restore identity was available at preflight/,
    );
  });
});

test('production rejects malformed prior identity, bootstrap drift, reruns and non-dispatch execution before POST', async () => {
  for (const scenario of [
    'production-invalid-prior',
    'production-missing-prior-id',
    'production-empty-drift',
    'production-empty-malformed-drift',
    'production-rerun',
    'production-push',
  ]) {
    await withController(scenario, async ({ requests }) => {
      if (scenario === 'production-rerun') process.env.GITHUB_RUN_ATTEMPT = '2';
      if (scenario === 'production-push')
        process.env.GITHUB_EVENT_NAME = 'push';
      const expected = {
        'production-invalid-prior': /no valid deployment identity/,
        'production-missing-prior-id': /no valid deployment identity/,
        'production-empty-drift': /recovery identity changed/,
        'production-empty-malformed-drift': /recovery identity changed/,
        'production-rerun': /new manual dispatch/,
        'production-push': /new manual dispatch/,
      };
      await assert.rejects(deploy, expected[scenario]);
      assert.equal(
        requests.filter((request) => request.method === 'POST').length,
        0,
        scenario,
      );
    });
  }
});

test('ambiguous mutation and failed smoke never trigger retries or automatic rollback', async () => {
  for (const scenario of [
    'ambiguous-post',
    'smoke-failure',
    'production-empty-ambiguous-post',
    'production-empty-smoke-failure',
  ]) {
    await withController(scenario, async ({ requests, directory }) => {
      await assert.rejects(deploy);
      assert.equal(
        requests.filter((request) => request.method === 'POST').length,
        1,
      );
      const record = JSON.parse(
        await readFile(join(directory, 'delivery-record.json'), 'utf8'),
      );
      assert.equal(
        record.status,
        scenario.endsWith('ambiguous-post')
          ? 'mutation-requested'
          : 'verification-pending',
      );
      if (scenario.startsWith('production-empty')) {
        assert.equal(record.priorDeploymentId, null);
        assert.equal(record.productionBootstrap, true);
      }
    });
  }
});

/**
 * Create independent synthetic static-project readback for mutation-negative tests.
 * @returns Valid project and domain fixtures.
 */
function staticProject() {
  return {
    project: {
      id: 'prj_dev',
      accountId: 'team_test',
      name: 'dripperz-dev',
      env: [],
      link: null,
      framework: null,
      buildCommand: '',
      installCommand: '',
      outputDirectory: '.',
      rootDirectory: null,
      nodeVersion: '24.x',
    },
    domains: { domains: [{ name: 'dripperz-dev.vercel.app' }] },
  };
}

/**
 * Apply the agreed dev project contract to a test fixture.
 * @param fixture - Independent project/domain response pair.
 * @returns Configuration fingerprint or a fail-closed error.
 */
function checkProject(fixture) {
  return projectConfiguration(
    fixture.project,
    fixture.domains,
    'dev',
    'team_test',
    'prj_dev',
  );
}

/**
 * Build the exact owner-reviewed production environment fixture.
 * @returns Environment protection and branch-policy pair.
 */
function gate() {
  return {
    environment: {
      name: 'production',
      can_admins_bypass: false,
      protection_rules: [
        {
          type: 'required_reviewers',
          prevent_self_review: false,
          reviewers: [{ reviewer: { login: 'benhammoush' } }],
        },
      ],
      deployment_branch_policy: {
        custom_branch_policies: true,
        protected_branches: false,
      },
    },
    policies: {
      total_count: 1,
      branch_policies: [{ name: 'main', type: 'branch' }],
    },
  };
}

test('only full source SHAs and agreed isolated targets are accepted', () => {
  assert.equal(sourceRevision('a'.repeat(40)), 'a'.repeat(40));
  for (const revision of [
    'main',
    'a'.repeat(39),
    'A'.repeat(40),
    '',
    undefined,
    'a'.repeat(40) + '\n',
  ]) {
    assert.throws(() => sourceRevision(revision));
  }
  assert.equal(projectName('dev'), 'dripperz-dev');
  assert.equal(projectName('production'), 'dripperz-production');
  for (const target of ['staging', '', 'prod', undefined])
    assert.throws(() => projectName(target));
});

test('configuration hashing ignores object key order, not values or array order', () => {
  assert.equal(fingerprint({ a: 1, b: 2 }), fingerprint({ b: 2, a: 1 }));
  assert.notEqual(fingerprint([1, 2]), fingerprint([2, 1]));
  assert.notEqual(fingerprint({ a: 1 }), fingerprint({ a: 2 }));
});

test('dedicated project settings, no secrets, no Git triggers and exact domain are required', () => {
  assert.match(checkProject(staticProject()), /^[a-f0-9]{64}$/);
  for (const [key, value] of [
    ['id', 'prj_other'],
    ['accountId', 'team_other'],
    ['name', 'dripperz-production'],
    ['env', undefined],
    ['env', [{ key: 'SECRET' }]],
    ['link', { type: 'github' }],
    ['framework', 'vite'],
    ['buildCommand', null],
    ['installCommand', 'npm ci'],
    ['outputDirectory', 'dist'],
    ['rootDirectory', 'elsewhere'],
    ['nodeVersion', '22.x'],
  ]) {
    const fixture = staticProject();
    fixture.project[key] = value;
    assert.throws(() => checkProject(fixture), key);
  }
  for (const domains of [
    [],
    [{ name: 'other.vercel.app' }],
    [{ name: 'dripperz-dev.vercel.app', redirect: 'other.example' }],
    [{ name: 'dripperz-dev.vercel.app' }, { name: 'legacy.example' }],
  ]) {
    const fixture = staticProject();
    fixture.domains.domains = domains;
    assert.throws(() => checkProject(fixture));
  }
  const fixture = staticProject();
  const before = checkProject(fixture);
  fixture.project.passwordProtection = { deploymentType: 'all' };
  assert.notEqual(checkProject(fixture), before);
});

test('setup validator requires native owner approval, no bypass and main-only branches', () => {
  const valid = gate();
  assert.doesNotThrow(() =>
    assertProductionGate(valid.environment, valid.policies),
  );
  for (const property of [
    'can_admins_bypass',
    'protection_rules',
    'deployment_branch_policy',
  ]) {
    const fixture = gate();
    delete fixture.environment[property];
    assert.throws(() =>
      assertProductionGate(fixture.environment, fixture.policies),
    );
  }
  const bypass = gate();
  bypass.environment.can_admins_bypass = true;
  assert.throws(() =>
    assertProductionGate(bypass.environment, bypass.policies),
  );
  const selfReview = gate();
  selfReview.environment.protection_rules[0].prevent_self_review = true;
  assert.throws(() =>
    assertProductionGate(selfReview.environment, selfReview.policies),
  );
  const reviewer = gate();
  reviewer.environment.protection_rules[0].reviewers[0].reviewer.login =
    'someone-else';
  assert.throws(() =>
    assertProductionGate(reviewer.environment, reviewer.policies),
  );
  for (const policy of [
    { name: '*', type: 'branch' },
    { name: 'main', type: 'tag' },
  ]) {
    const fixture = gate();
    fixture.policies.branch_policies = [policy];
    assert.throws(() =>
      assertProductionGate(fixture.environment, fixture.policies),
    );
  }
});

test('setup validator requires trusted branch checks and enforcement', () => {
  const protection = {
    required_status_checks: {
      strict: true,
      checks: [
        { context: 'Quality and build', app_id: 15368 },
        { context: 'Browser smoke', app_id: 15368 },
      ],
    },
    enforce_admins: { enabled: true },
    allow_force_pushes: { enabled: false },
    allow_deletions: { enabled: false },
  };
  assert.doesNotThrow(() => assertMainProtection(protection));
  for (const key of Object.keys(protection)) {
    const invalid = structuredClone(protection);
    delete invalid[key];
    assert.throws(() => assertMainProtection(invalid));
  }
  protection.required_status_checks.checks[0].app_id = 1;
  assert.throws(() => assertMainProtection(protection));
});

test('provider READY state must match project, target, source, version and both digests', () => {
  const record = {
    deploymentId: 'dpl_test',
    revision: 'a'.repeat(40),
    version: '0.1.0',
    bundleDigest: 'bundle',
    configDigest: 'config',
  };
  const deployment = {
    id: 'dpl_test',
    projectId: 'prj_dev',
    target: 'production',
    readyState: 'READY',
    meta: { ...record },
  };
  assert.doesNotThrow(() => assertDeployment(deployment, record, 'prj_dev'));
  for (const key of ['id', 'projectId', 'target', 'readyState']) {
    assert.throws(() =>
      assertDeployment({ ...deployment, [key]: 'wrong' }, record, 'prj_dev'),
    );
  }
  for (const key of ['revision', 'version', 'bundleDigest', 'configDigest']) {
    assert.throws(() =>
      assertDeployment(
        { ...deployment, meta: { ...deployment.meta, [key]: 'wrong' } },
        record,
        'prj_dev',
      ),
    );
  }
});

test('workflow keeps native production gating without a custom promotion manifest or dev secret', async () => {
  const workflow = await readFile(
    '.github/workflows/deploy-production.yml',
    'utf8',
  );
  assert.ok(workflow.includes('environment: production'));
  assert.ok(workflow.includes('needs: verify_release'));
  assert.match(
    workflow,
    /ci-cd-workflows\/\.github\/workflows\/deploy-web.yml@[a-f0-9]{40}/,
  );
  assert.ok(!workflow.includes('VERCEL_DEV_VERIFICATION_TOKEN'));
  assert.ok(!workflow.includes('PROMOTION_EVIDENCE'));
  assert.ok(!workflow.includes('DELIVERY_ENABLED'));
  const config = JSON.parse(await readFile('.github/ci-cd.json', 'utf8'));
  assert.ok(config.deploymentVariables.includes('DEPLOY_ENABLED'));
  const beforeDeploy = workflow.slice(
    0,
    workflow.indexOf('\n  deploy_production:'),
  );
  assert.ok(!beforeDeploy.includes('secrets.'));
});
