import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

// npm scripts run in cmd.exe on Windows, where MODE=prod is not an assignment.
const runner = fileURLToPath(
  new URL('../node_modules/@web/test-runner/dist/bin.js', import.meta.url)
);
const result = spawnSync(process.execPath, [runner, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: {...process.env, MODE: 'prod'},
});
if (result.error) console.error(result.error);
process.exit(result.status ?? 1);
