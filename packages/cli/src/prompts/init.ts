import { select, checkbox, confirm } from '@inquirer/prompts';

interface InitConfig {
  projectType: string;
  tools: string[];
  packageManager: string;
}

export async function initPrompts(options: any): Promise<InitConfig> {
  if (options.type && options.tools) {
    return {
      projectType: options.type,
      tools: Array.isArray(options.tools) ? options.tools : [options.tools],
      packageManager: options.packageManager || 'pnpm'
    };
  }

  const projectType = await select({
    message: 'Select project type:',
    choices: [
      { name: 'Vue 3 + TypeScript', value: 'vue3' },
      { name: 'React 18 + TypeScript', value: 'react' },
      { name: 'TypeScript (plain)', value: 'ts' },
      { name: 'JavaScript (plain)', value: 'js' }
    ]
  });

  const tools = await checkbox({
    message: 'Select tools to add:',
    choices: [
      { name: 'ESLint', value: 'eslint', checked: true },
      { name: 'Prettier', value: 'prettier', checked: true },
      { name: 'Husky + lint-staged', value: 'husky', checked: true }
    ],
    validate: (input) => input.length > 0 || 'Select at least one tool'
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

  return { projectType, tools, packageManager };
}
