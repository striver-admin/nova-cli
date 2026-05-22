import { select, checkbox, confirm } from '@inquirer/prompts';

interface InitConfig {
  projectType: string;
  tools: string[];
  frameworkPackages: string[];
  packageManager: string;
}

const vuePackageChoices = [
  { name: 'Vue 3 (core)', value: 'vue', checked: true },
  { name: 'Vue Router', value: 'vue-router', checked: true },
  { name: 'Element Plus (UI)', value: 'element-plus', checked: true },
  { name: 'Pinia (state management)', value: 'pinia', checked: true },
  { name: '@vitejs/plugin-vue', value: '@vitejs/plugin-vue', checked: true }
];

const reactPackageChoices = [
  { name: 'React + React DOM', value: 'react', checked: true },
  { name: 'React Router DOM', value: 'react-router-dom', checked: true },
  { name: 'Ant Design (UI)', value: 'antd', checked: true },
  { name: 'TanStack React Query', value: '@tanstack/react-query', checked: true },
  { name: 'Zustand (state management)', value: 'zustand', checked: true }
];

export async function initPrompts(options: any): Promise<InitConfig> {
  if (options.type && options.tools) {
    return {
      projectType: options.type,
      tools: Array.isArray(options.tools) ? options.tools : [options.tools],
      frameworkPackages: options.frameworkPkgs ? (Array.isArray(options.frameworkPkgs) ? options.frameworkPkgs : [options.frameworkPkgs]) : [],
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

  let frameworkPackages: string[] = [];

  if (projectType === 'vue3') {
    frameworkPackages = await checkbox({
      message: 'Select Vue packages to install:',
      choices: vuePackageChoices
    });
  } else if (projectType === 'react') {
    frameworkPackages = await checkbox({
      message: 'Select React packages to install:',
      choices: reactPackageChoices
    });
  }

  const packageManager = await select({
    message: 'Select a package manager:',
    choices: [
      { name: 'pnpm', value: 'pnpm' },
      { name: 'npm', value: 'npm' },
      { name: 'yarn', value: 'yarn' }
    ],
    default: 'pnpm'
  });

  return { projectType, tools, frameworkPackages, packageManager };
}
