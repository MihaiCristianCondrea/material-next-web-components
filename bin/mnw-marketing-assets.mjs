#!/usr/bin/env node
// Copies the package's marketing assets (device frames, the Google Play badge)
// into a hub's public folder, where <mnw-device-frame> and <mnw-play-badge>
// load them from (configureMarketingAssets() sets another base).
//
//   npx mnw-marketing-assets [destination]   default: public/material-next
import {cpSync, existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const source = fileURLToPath(new URL('../assets/marketing/', import.meta.url));
const destination = resolve(process.argv[2] ?? 'public/material-next');

if (!existsSync(source)) {
  console.error(`Marketing assets not found at ${source}`);
  process.exit(1);
}
cpSync(source, destination, {recursive: true, filter: (path) => !path.endsWith('README.md')});
console.log(`material-next marketing assets -> ${destination}`);
