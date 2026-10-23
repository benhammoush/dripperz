/**
 * Add trusted static delivery identity to the checked bundle before artifact capture.
 * @file
 */
import { execFileSync } from 'node:child_process';

execFileSync(process.execPath, ['scripts/delivery.mjs', 'prepare'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DELIVERY_REVISION: process.env.CI_SOURCE_SHA,
    DELIVERY_TARGET: process.env.CI_ENVIRONMENT,
  },
});
