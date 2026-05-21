export interface TemplateMeta {
  name: string;
  label: string;
  repo: string;
  branch: string;
  dir: string;
  description: string;
  features: string[];
}

export const templates: TemplateMeta[] = [
  {
    name: 'vue3',
    label: 'Vue 3 + TypeScript',
    repo: 'https://github.com/your-org/nova-cli.git',
    branch: 'main',
    dir: 'packages/template-vue3',
    description: 'Vue 3 project with Vite, Pinia, Vue Router, ESLint, Prettier, Husky',
    features: ['vite', 'vue-router', 'pinia', 'eslint', 'prettier', 'husky', 'lint-staged']
  },
  {
    name: 'react18',
    label: 'React 18 + TypeScript',
    repo: 'https://github.com/your-org/nova-cli.git',
    branch: 'main',
    dir: 'packages/template-react18',
    description: 'React 18 project with Vite, React Router, Zustand, ESLint, Prettier, Husky',
    features: ['vite', 'react-router', 'zustand', 'eslint', 'prettier', 'husky', 'lint-staged']
  }
];

export function findTemplate(name: string): TemplateMeta | undefined {
  return templates.find(t => t.name === name);
}

export function listTemplates(): TemplateMeta[] {
  return templates;
}
