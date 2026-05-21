import { select, confirm } from '@inquirer/prompts';
import { listTemplates } from '../templates/registry.js';

interface Config {
  template: string;
  packageManager: string;
  initGit: boolean;
}

export async function prompts(appName: string, options: any): Promise<Config> {
  // Non-interactive mode
  if (options.template) {
    return {
      template: options.template,
      packageManager: options.packageManager || 'pnpm',
      initGit: !options.skipGit
    };
  }

  // Interactive mode
  const templateChoices = listTemplates().map(t => ({
    name: t.label,
    value: t.name,
    description: t.description
  }));

  const template = await select({
    message: 'Select a framework:',
    choices: templateChoices
  });

  const packageManager = await select({
    message: 'Select a package manager:',
    choices: [
      { name: 'pnpm', value: 'pnpm' },
      { name: 'npm', value: 'npm' },
      { name: 'yarn', value: 'yarn' }
    ],
    default: 'pnpm'
  });

  const initGit = await confirm({
    message: 'Initialize git repository?',
    default: true
  });

  return { template, packageManager, initGit };
}
