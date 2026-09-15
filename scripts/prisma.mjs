import { config as loadDotenv } from 'dotenv';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

loadDotenv({ path: resolve(process.cwd(), '.env') });

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const child = spawn(
  command,
  ['--filter', '@caerov/db', 'exec', 'prisma', ...process.argv.slice(2)],
  {
    env: process.env,
    shell: process.platform === 'win32',
    stdio: 'inherit',
  },
);

child.once('error', (error) => {
  console.error('Unable to start Prisma:', error);
  process.exitCode = 1;
});

child.once('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exitCode = code ?? 1;
  }
});
