/**
 * React build configuration shared with the unit-test harness.
 * @packageDocumentation
 */

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Preserve Vite's sensitive-file defaults and block its alternate raw-file routes.
      deny: [
        '.env',
        '.env.*',
        '*.{crt,pem,key,p12,pfx,cer,der}',
        '.npmrc',
        '.yarnrc.yml',
        '**/.git/**',
        '**/.local-hero/**',
      ],
    },
  },
});
