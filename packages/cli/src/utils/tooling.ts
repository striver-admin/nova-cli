import fs from "fs-extra";
import { join } from "path";
import { execa } from "execa";

export async function addEslintConfig(dir: string, projectType: string) {
  const configPath = join(dir, ".eslintrc.cjs");

  const configs: Record<string, string> = {
    vue3: `module.exports = {
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
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-var': 'error', // 要求使用 let 或 const 而不是 var
    'no-multiple-empty-lines': ['error', { max: 1 }], // 不允许多个空行
    'prefer-const': 'off', // 使用 let 关键字声明但在初始分配后从未重新分配的变量，要求使用 const
    'no-use-before-define': 'off', // 禁止在 函数/类/变量 定义之前使用它们

    // typeScript (https://typescript-eslint.io/rules)
    '@typescript-eslint/no-unused-vars': 'error', // 禁止定义未使用的变量
    '@typescript-eslint/no-empty-function': 'error', // 禁止空函数
    '@typescript-eslint/prefer-ts-expect-error': 'error', // 禁止使用 @ts-ignore
    '@typescript-eslint/ban-ts-comment': 'error', // 禁止 @ts-<directive> 使用注释或要求在指令后进行描述
    '@typescript-eslint/no-inferrable-types': 'off', // 可以轻松推断的显式类型可能会增加不必要的冗长
    '@typescript-eslint/no-namespace': 'off', // 禁止使用自定义 TypeScript 模块和命名空间
    '@typescript-eslint/no-explicit-any': 'off', // 禁止使用 any 类型
    '@typescript-eslint/ban-types': 'off', // 禁止使用特定类型
    '@typescript-eslint/no-var-requires': 'off', // 允许使用 require() 函数导入模块
    '@typescript-eslint/no-non-null-assertion': 'off', // 不允许使用后缀运算符的非空断言(!)

    // vue (https://eslint.vuejs.org/rules)
    'vue/script-setup-uses-vars': 'error', // 防止<script setup>使用的变量<template>被标记为未使用，此规则仅在启用该 no-unused-vars 规则时有效
    'vue/v-slot-style': 'error', // 强制执行 v-slot 指令样式
    'vue/no-mutating-props': 'error', // 不允许改变组件 prop
    'vue/custom-event-name-casing': 'error', // 为自定义事件名称强制使用特定大小写
    'vue/html-closing-bracket-newline': 'error', // 在标签的右括号之前要求或禁止换行
    'vue/attribute-hyphenation': 'error', // 对模板中的自定义组件强制执行属性命名样式：my-prop="prop"
    'vue/attributes-order': 'off', // vue api使用顺序，强制执行属性顺序
    'vue/no-v-html': 'off', // 禁止使用 v-html
    'vue/require-default-prop': 'off', // 此规则要求为每个 prop 为必填时，必须提供默认值
    'vue/multi-word-component-names': 'off', // 要求组件名称始终为 “-” 链接的单词
    'vue/no-setup-props-destructure': 'off' // 禁止解构 props 传递给 setup
  }
};
`,
    react: `module.exports = {
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
    'no-var': 'error', // 要求使用 let 或 const 而不是 var
    'no-multiple-empty-lines': ['error', { max: 1 }], // 不允许多个空行
    'prefer-const': 'off', // 使用 let 关键字声明但在初始分配后从未重新分配的变量，要求使用 const
    'no-use-before-define': 'off', // 禁止在 函数/类/变量 定义之前使用它们

    // typeScript (https://typescript-eslint.io/rules)
    '@typescript-eslint/no-unused-vars': 'error', // 禁止定义未使用的变量
    '@typescript-eslint/no-empty-function': 'error', // 禁止空函数
    '@typescript-eslint/prefer-ts-expect-error': 'error', // 禁止使用 @ts-ignore
    '@typescript-eslint/ban-ts-comment': 'error', // 禁止 @ts-<directive> 使用注释或要求在指令后进行描述
    '@typescript-eslint/no-inferrable-types': 'off', // 可以轻松推断的显式类型可能会增加不必要的冗长
    '@typescript-eslint/no-namespace': 'off', // 禁止使用自定义 TypeScript 模块和命名空间
    '@typescript-eslint/no-explicit-any': 'off', // 禁止使用 any 类型
    '@typescript-eslint/ban-types': 'off', // 禁止使用特定类型
    '@typescript-eslint/no-var-requires': 'off', // 允许使用 require() 函数导入模块
    '@typescript-eslint/no-non-null-assertion': 'off', // 不允许使用后缀运算符的非空断言(!)
    // react
    'react/react-in-jsx-scope': 'off'
  }
};
`,
    ts: `module.exports = {
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
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-var': 'error', // 要求使用 let 或 const 而不是 var
    'no-multiple-empty-lines': ['error', { max: 1 }], // 不允许多个空行
    'prefer-const': 'off', // 使用 let 关键字声明但在初始分配后从未重新分配的变量，要求使用 const
    'no-use-before-define': 'off', // 禁止在 函数/类/变量 定义之前使用它们
  }
};
`,
    js: `module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-var': 'error', // 要求使用 let 或 const 而不是 var
    'no-multiple-empty-lines': ['error', { max: 1 }], // 不允许多个空行
    'prefer-const': 'off', // 使用 let 关键字声明但在初始分配后从未重新分配的变量，要求使用 const
    'no-use-before-define': 'off', // 禁止在 函数/类/变量 定义之前使用它们
  }
};
`,
  };

  await fs.writeFile(configPath, configs[projectType] || configs["ts"]);
}

export async function addPrettierConfig(dir: string) {
  const configPath = join(dir, ".prettierrc");
  const config =
    JSON.stringify(
      {
        semi: true,
        printWidth: 120,
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
        quoteProps: "as-needed",
        jsxSingleQuote: false,
        trailingComma: "none",
        bracketSpacing: true,
        bracketSameLine: false,
        arrowParens: "avoid",
        requirePragma: false,
        insertPragma: false,
        proseWrap: "preserve",
        htmlWhitespaceSensitivity: "css",
        vueIndentScriptAndStyle: false,
        endOfLine: "auto",
        rangeStart: 0,
      },
      null,
      2,
    ) + "\n";

  await fs.writeFile(configPath, config);
}

export async function addPrettierIgnore(dir: string) {
  const ignorePath = join(dir, ".prettierignore");
  const content = `node_modules
dist
coverage
*.min.js
`;
  await fs.writeFile(ignorePath, content);
}

export async function setupHusky(dir: string) {
  const huskyDir = join(dir, ".husky");
  await fs.ensureDir(huskyDir);

  const preCommitPath = join(huskyDir, "pre-commit");
  await fs.writeFile(preCommitPath, "#!/bin/sh\nnpx lint-staged\n");
  await fs.chmod(preCommitPath, 0o755);
}

export async function updatePackageJsonForTooling(
  dir: string,
  options: {
    eslint: boolean;
    prettier: boolean;
    husky: boolean;
    projectType: string;
  },
) {
  const packagePath = join(dir, "package.json");
  const pkg = await fs.readJson(packagePath);

  pkg.scripts = pkg.scripts || {};

  if (options.eslint) {
    pkg.scripts.lint = "eslint . --fix";
  }

  if (options.prettier) {
    pkg.scripts.format = "prettier --write .";
  }

  if (options.husky) {
    pkg.scripts.prepare = "husky";
  }

  pkg.devDependencies = pkg.devDependencies || {};

  if (options.eslint) {
    pkg.devDependencies.eslint = "^8.57.0";
    pkg.devDependencies["@typescript-eslint/eslint-plugin"] = "^7.0.0";
    pkg.devDependencies["@typescript-eslint/parser"] = "^7.0.0";

    if (options.prettier) {
      pkg.devDependencies["eslint-config-prettier"] = "^9.1.0";
    }

    if (options.projectType === "vue3") {
      pkg.devDependencies["eslint-plugin-vue"] = "^9.24.0";
    } else if (options.projectType === "react") {
      pkg.devDependencies["eslint-plugin-react"] = "^7.34.0";
      pkg.devDependencies["eslint-plugin-react-hooks"] = "^4.6.0";
    }
  }

  if (options.prettier) {
    pkg.devDependencies.prettier = "^3.2.0";
  }

  if (options.husky) {
    pkg.devDependencies.husky = "^9.0.0";
    pkg.devDependencies["lint-staged"] = "^15.2.0";

    const extMap: Record<string, string> = {
      vue3: "*.{js,ts,vue}",
      react: "*.{js,ts,tsx,jsx}",
      ts: "*.{js,ts}",
      js: "*.js",
    };
    const glob = extMap[options.projectType] || "*.{js,ts}";

    pkg["lint-staged"] = {
      [glob]:
        options.eslint && options.prettier
          ? ["eslint --fix", "prettier --write"]
          : options.eslint
            ? ["eslint --fix"]
            : ["prettier --write"],
    };
  }

  await fs.writeJson(packagePath, pkg, { spaces: 2 });
}

export async function runHuskyPrepare(dir: string, packageManager: string) {
  const [cmd, ...args] = getInstallCommand(packageManager);
  await execa(cmd, [...args, "run", "prepare"], { cwd: dir, stdio: "inherit" });
}

function getInstallCommand(manager: string): [string, ...string[]] {
  switch (manager) {
    case "pnpm":
      return ["pnpm", "install"];
    case "yarn":
      return ["yarn"];
    default:
      return ["npm", "install"];
  }
}
