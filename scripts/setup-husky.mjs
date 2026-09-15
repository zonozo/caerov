import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

if (!existsSync('.git')) {
  console.log('Husky skipped: this directory is not a Git repository.');
  process.exit(0);
}

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const result = spawnSync(command, ['exec', 'husky'], {
  env: process.env,
  shell: process.platform === 'win32',
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
