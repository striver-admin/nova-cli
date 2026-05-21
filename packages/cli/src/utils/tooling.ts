import fs from 'fs-extra';
import { join } from 'path';
import { execa } from 'execa';

export async function addEslintConfig(dir: string, projectType: string) {
  const configPath = join(dir, '.eslintrc.cjs');

  const configs: Record<string, string> = {
    'vue3': `module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'prettier'
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
};
`,
    'react': `module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaFeatures: { jsx: true },
    parser: '@typescript-eslint/parser'
  },
  settings: {
    react: { version: 'detect' }
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'react/react-in-jsx-scope': 'off'
  }
};
`,
    'ts': `module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
};
`,
    'js': `module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
};
`
  };

  await fs.writeFile(configPath, configs[projectType] || configs['ts']);
}

export async function addPrettierConfig(dir: string) {
  const configPath = join(dir, '.prettierrc');
  const config = JSON.stringify({
    semi: false,
    singleQuote: true,
    printWidth: 100,
    trailingComma: 'none',
    arrowParens: 'avoid'
  }, null, 2) + '\n';

  await fs.writeFile(configPath, config);
}

export async function addPrettierIgnore(dir: string) {
  const ignorePath = join(dir, '.prettierignore');
  const content = `node_modules
dist
coverage
*.min.js
`;
  await fs.writeFile(ignorePath, content);
}

export async function setupHusky(dir: string) {
  const huskyDir = join(dir, '.husky');
  await fs.ensureDir(huskyDir);

  const preCommitPath = join(huskyDir, 'pre-commit');
  await fs.writeFile(preCommitPath, '#!/bin/sh\nnpx lint-staged\n');
  await fs.chmod(preCommitPath, 0o755);
}

export async function updatePackageJsonForTooling(
  dir: string,
  options: { eslint: boolean; prettier: boolean; husky: boolean; projectType: string }
) {
  const packagePath = join(dir, 'package.json');
  const pkg = await fs.readJson(packagePath);

  pkg.scripts = pkg.scripts || {};

  if (options.eslint) {
    pkg.scripts.lint = 'eslint . --fix';
  }

  if (options.prettier) {
    pkg.scripts.format = 'prettier --write .';
  }

  if (options.husky) {
    pkg.scripts.prepare = 'husky';
  }

  pkg.devDependencies = pkg.devDependencies || {};

  if (options.eslint) {
    pkg.devDependencies.eslint = '^8.57.0';
    pkg.devDependencies['@typescript-eslint/eslint-plugin'] = '^7.0.0';
    pkg.devDependencies['@typescript-eslint/parser'] = '^7.0.0';

    if (options.prettier) {
      pkg.devDependencies['eslint-config-prettier'] = '^9.1.0';
    }

    if (options.projectType === 'vue3') {
      pkg.devDependencies['eslint-plugin-vue'] = '^9.24.0';
    } else if (options.projectType === 'react') {
      pkg.devDependencies['eslint-plugin-react'] = '^7.34.0';
      pkg.devDependencies['eslint-plugin-react-hooks'] = '^4.6.0';
    }
  }

  if (options.prettier) {
    pkg.devDependencies.prettier = '^3.2.0';
  }

  if (options.husky) {
    pkg.devDependencies.husky = '^9.0.0';
    pkg.devDependencies['lint-staged'] = '^15.2.0';

    const extMap: Record<string, string> = {
      'vue3': '*.{js,ts,vue}',
      'react': '*.{js,ts,tsx,jsx}',
      'ts': '*.{js,ts}',
      'js': '*.js'
    };
    const glob = extMap[options.projectType] || '*.{js,ts}';

    pkg['lint-staged'] = {
      [glob]: options.eslint && options.prettier
        ? ['eslint --fix', 'prettier --write']
        : options.eslint
          ? ['eslint --fix']
          : ['prettier --write']
    };
  }

  await fs.writeJson(packagePath, pkg, { spaces: 2 });
}

export async function runHuskyPrepare(dir: string, packageManager: string) {
  const [cmd, ...args] = getInstallCommand(packageManager);
  await execa(cmd, [...args, 'run', 'prepare'], { cwd: dir, stdio: 'inherit' });
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
