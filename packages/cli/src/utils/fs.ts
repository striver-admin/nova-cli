import { execa } from 'execa';

export async function installDeps(dir: string, manager: string) {
  const [cmd, ...args] = getInstallCommand(manager);
  await execa(cmd, args, { cwd: dir, stdio: 'inherit' });
}

function getInstallCommand(manager: string): [string, ...string[]] {
  switch (manager) {
    case 'pnpm':
      return ['pnpm', 'install'];
    case 'yarn':
      return ['yarn'];
    default:
      return ['npm', 'install'];
  }
}
