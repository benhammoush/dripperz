/**
 * Preserve the original checksum-pinned workflow expression/syntax gate.
 * @file
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Reject unverified tool bytes before extraction or execution.
 * @param bytes - Downloaded archive bytes.
 * @param digest - Reviewed release archive SHA-256.
 * @returns The verified archive bytes.
 */
export function verifiedArchive(bytes, digest) {
  assert.equal(createHash('sha256').update(bytes).digest('hex'), digest);
  return bytes;
}

/** Download and run the fixed linter, cleaning only its fresh temporary directory. */
async function lintWorkflows() {
  assert.equal(process.arch, 'x64', 'Use the reviewed x64 actionlint build');
  const assets = {
    linux: [
      'linux_amd64.tar.gz',
      '8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8',
    ],
    win32: [
      'windows_amd64.zip',
      '6e7241b51e6817ea6a047693d8e6fed13b31819c9a0dd6c5a726e1592d22f6e9',
    ],
  };
  const asset = assets[process.platform];
  assert.ok(asset, 'No reviewed actionlint archive for this platform');
  const directory = mkdtempSync(
    join(process.env.RUNNER_TEMP || tmpdir(), 'dripperz-actionlint-'),
  );
  try {
    const name = `actionlint_1.7.12_${asset[0]}`;
    const response = await fetch(
      `https://github.com/rhysd/actionlint/releases/download/v1.7.12/${name}`,
      { signal: AbortSignal.timeout(60_000) },
    );
    assert.equal(response.status, 200);
    const archive = join(directory, name);
    writeFileSync(
      archive,
      verifiedArchive(Buffer.from(await response.arrayBuffer()), asset[1]),
    );
    const binary =
      process.platform === 'win32' ? 'actionlint.exe' : 'actionlint';
    execFileSync('tar', ['-xf', archive, '-C', directory, binary], {
      stdio: 'inherit',
    });
    const workflows = readdirSync('.github/workflows')
      .filter((file) => /\.ya?ml$/.test(file))
      .map((file) => join('.github/workflows', file));
    execFileSync(
      join(directory, binary),
      ['-shellcheck=', '-pyflakes=', ...workflows],
      { stdio: 'inherit' },
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await lintWorkflows();
