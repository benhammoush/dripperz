/**
 * Adapt the existing bounded static controller to the shared versioned release contract.
 * @file
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { deploy } from './delivery.mjs';

const build = JSON.parse(readFileSync('ci-build.json', 'utf8'));
Object.assign(process.env, {
  DELIVERY_REVISION: process.env.CI_SOURCE_SHA,
  DELIVERY_TARGET: process.env.CI_ENVIRONMENT,
  DELIVERY_AUTOMATIC: String(process.env.GITHUB_EVENT_NAME === 'push'),
});
try {
  await deploy();
} finally {
  if (existsSync('delivery-record.json')) {
    const record = JSON.parse(readFileSync('delivery-record.json', 'utf8'));
    Object.assign(record, {
      schemaVersion: 1,
      sourceSha: build.sourceSha,
      environment: build.environment,
      artifactDigest: build.artifactDigest,
      configurationDigest: record.configDigest,
      workflowRunId: process.env.GITHUB_RUN_ID,
      deploymentId: record.deploymentId ?? null,
      previousDeploymentId: record.priorDeploymentId ?? null,
    });
    writeFileSync(
      'delivery-record.json',
      `${JSON.stringify(record, null, 2)}\n`,
    );
  }
}
