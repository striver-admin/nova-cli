// src/index.ts
import { program } from "commander";

// src/commands/create.ts
import { Command } from "commander";
import { resolve } from "path";
import { existsSync } from "fs";

// src/prompts/index.ts
import { select, confirm } from "@inquirer/prompts";

// src/templates/registry.ts
var templates = [
  {
    name: "vue3",
    label: "Vue 3 + TypeScript",
    repo: "https://github.com/striver-admin/nova-cli.git",
    branch: "main",
    dir: "packages/template-vue3",
    description: "Vue 3 project with Vite, Pinia, Vue Router, ESLint, Prettier, Husky",
    features: [
      "vite",
      "vue-router",
      "pinia",
      "eslint",
      "prettier",
      "husky",
      "lint-staged"
    ]
  },
  {
    name: "react18",
    label: "React 18 + TypeScript",
    repo: "https://github.com/striver-admin/nova-cli.git",
    branch: "main",
    dir: "packages/template-react18",
    description: "React 18 project with Vite, React Router, Zustand, ESLint, Prettier, Husky",
    features: [
      "vite",
      "react-router",
      "zustand",
      "eslint",
      "prettier",
      "husky",
      "lint-staged"
    ]
  }
];
function findTemplate(name) {
  return templates.find((t) => t.name === name);
}
function listTemplates() {
  return templates;
}

// src/prompts/index.ts
async function prompts(appName, options) {
  if (options.template) {
    return {
      template: options.template,
      packageManager: options.packageManager || "pnpm",
      initGit: !options.skipGit
    };
  }
  const templateChoices = listTemplates().map((t) => ({
    name: t.label,
    value: t.name,
    description: t.description
  }));
  const template = await select({
    message: "Select a framework:",
    choices: templateChoices
  });
  const packageManager = await select({
    message: "Select a package manager:",
    choices: [
      { name: "pnpm", value: "pnpm" },
      { name: "npm", value: "npm" },
      { name: "yarn", value: "yarn" }
    ],
    default: "pnpm"
  });
  const initGit2 = await confirm({
    message: "Initialize git repository?",
    default: true
  });
  return { template, packageManager, initGit: initGit2 };
}

// src/utils/git.ts
import { execa } from "execa";
import { tmpdir } from "os";
import { join } from "path";
import fs from "fs-extra";
async function cloneTemplate(templateName, targetDir) {
  const template = templates.find((t) => t.name === templateName);
  if (!template) {
    throw new Error(`Template "${templateName}" not found. Run "nova list" to see available templates.`);
  }
  const tmpDir = join(tmpdir(), `nova-cli-${Date.now()}`);
  try {
    await execa("git", [
      "clone",
      "--depth",
      "1",
      "--branch",
      template.branch,
      template.repo,
      tmpDir
    ]);
    const sourceDir = join(tmpDir, template.dir);
    await fs.copy(sourceDir, targetDir);
  } finally {
    await fs.remove(tmpDir);
  }
}
async function initGit(dir) {
  await execa("git", ["init"], { cwd: dir });
  await execa("git", ["add", "."], { cwd: dir });
  await execa("git", ["commit", "-m", "Initial commit from nova-cli"], { cwd: dir });
}

// src/utils/package.ts
import fs2 from "fs-extra";
import { join as join2 } from "path";
async function updatePackageJson(dir, updates) {
  const packagePath = join2(dir, "package.json");
  const pkg = await fs2.readJson(packagePath);
  Object.assign(pkg, updates);
  delete pkg.devDependencies?.tsup;
  delete pkg.scripts?.build;
  await fs2.writeJson(packagePath, pkg, { spaces: 2 });
}

// src/utils/fs.ts
import { execa as execa2 } from "execa";
async function installDeps(dir, manager) {
  const [cmd, ...args] = getInstallCommand(manager);
  await execa2(cmd, args, { cwd: dir, stdio: "inherit" });
}
function getInstallCommand(manager) {
  switch (manager) {
    case "pnpm":
      return ["pnpm", "install"];
    case "yarn":
      return ["yarn"];
    default:
      return ["npm", "install"];
  }
}

// src/utils/logger.ts
import chalk from "chalk";
var useColor = process.stdout.isTTY;
var logger = {
  success(msg) {
    console.log(useColor ? chalk.green("\u2714") : "\u2714", useColor ? chalk.green(msg) : msg);
  },
  error(msg) {
    console.error(useColor ? chalk.red("\u2716") : "\u2716", useColor ? chalk.red(msg) : msg);
  },
  info(msg) {
    console.log(useColor ? chalk.blue("\u2139") : "\u2139", useColor ? chalk.blue(msg) : msg);
  },
  warn(msg) {
    console.log(useColor ? chalk.yellow("\u26A0") : "\u26A0", useColor ? chalk.yellow(msg) : msg);
  }
};

// src/utils/spinner.ts
import ora from "ora";
var useSpinner = process.stdout.isTTY;
var spinner = {
  async start(text, fn) {
    if (!useSpinner) {
      console.log(text);
      return fn();
    }
    const oraSpinner = ora(text).start();
    try {
      const result = await fn();
      oraSpinner.succeed();
      return result;
    } catch (error) {
      oraSpinner.fail();
      throw error;
    }
  }
};

// src/commands/create.ts
var createCommand = new Command("create").argument("<app-name>", "Project name").option("-t, --template <name>", "Template to use (vue3, react18)").option("-pm, --package-manager <name>", "Package manager (npm/yarn/pnpm)", "pnpm").option("--skip-install", "Skip dependency installation").option("--skip-git", "Skip git initialization").action(async (appName, options) => {
  const targetDir = resolve(process.cwd(), appName);
  if (existsSync(targetDir)) {
    logger.error(`Directory "${appName}" already exists.`);
    process.exit(1);
  }
  try {
    const config = await prompts(appName, options);
    await spinner.start("Cloning template...", async () => {
      await cloneTemplate(config.template, targetDir);
    });
    await spinner.start("Setting up project...", async () => {
      await updatePackageJson(targetDir, { name: appName, version: "0.0.1" });
    });
    if (!options.skipInstall) {
      await spinner.start("Installing dependencies...", async () => {
        await installDeps(targetDir, config.packageManager);
      });
    }
    if (config.initGit) {
      await spinner.start("Initializing git...", async () => {
        await initGit(targetDir);
      });
    }
    logger.success(`Project "${appName}" created successfully!`);
    logger.info(`Run \`cd ${appName} && ${config.packageManager} dev\` to start.`);
  } catch (error) {
    logger.error(error.message || "Failed to create project.");
    process.exit(1);
  }
});

// src/commands/list.ts
import { Command as Command2 } from "commander";
import chalk2 from "chalk";
var useColor2 = process.stdout.isTTY;
var listCommand = new Command2("list").description("List all available templates").action(() => {
  const templates2 = listTemplates();
  console.log("");
  console.log("Available templates:");
  console.log("");
  templates2.forEach((t) => {
    const name = useColor2 ? chalk2.bold(t.name) : t.name;
    const label = useColor2 ? chalk2.cyan(t.label) : t.label;
    console.log(`  ${name}  ${label}`);
    console.log(`     ${t.description}`);
    console.log(`     Features: ${t.features.join(", ")}`);
    console.log("");
  });
});

// src/commands/info.ts
import { Command as Command3 } from "commander";
import chalk3 from "chalk";
var useColor3 = process.stdout.isTTY;
var infoCommand = new Command3("info").argument("<template>", "Template name").description("Show template details").action((templateName) => {
  const template = findTemplate(templateName);
  if (!template) {
    logger.error(`Template "${templateName}" not found. Run "nova list" to see available templates.`);
    process.exit(1);
  }
  console.log("");
  console.log(useColor3 ? chalk3.bold(template.label) : template.label);
  console.log("");
  console.log(`  Name:        ${template.name}`);
  console.log(`  Description: ${template.description}`);
  console.log(`  Repository:  ${template.repo}`);
  console.log(`  Branch:      ${template.branch}`);
  console.log(`  Features:    ${template.features.join(", ")}`);
  console.log("");
});

// src/commands/init.ts
import { Command as Command4 } from "commander";
import { resolve as resolve2 } from "path";
import { existsSync as existsSync2 } from "fs";

// src/prompts/init.ts
import { select as select2, checkbox } from "@inquirer/prompts";
async function initPrompts(options) {
  if (options.type && options.tools) {
    return {
      projectType: options.type,
      tools: Array.isArray(options.tools) ? options.tools : [options.tools],
      packageManager: options.packageManager || "pnpm"
    };
  }
  const projectType = await select2({
    message: "Select project type:",
    choices: [
      { name: "Vue 3 + TypeScript", value: "vue3" },
      { name: "React 18 + TypeScript", value: "react" },
      { name: "TypeScript (plain)", value: "ts" },
      { name: "JavaScript (plain)", value: "js" }
    ]
  });
  const tools = await checkbox({
    message: "Select tools to add:",
    choices: [
      { name: "ESLint", value: "eslint", checked: true },
      { name: "Prettier", value: "prettier", checked: true },
      { name: "Husky + lint-staged", value: "husky", checked: true }
    ],
    validate: (input) => input.length > 0 || "Select at least one tool"
  });
  const packageManager = await select2({
    message: "Select a package manager:",
    choices: [
      { name: "pnpm", value: "pnpm" },
      { name: "npm", value: "npm" },
      { name: "yarn", value: "yarn" }
    ],
    default: "pnpm"
  });
  return { projectType, tools, packageManager };
}

// src/utils/tooling.ts
import fs3 from "fs-extra";
import { join as join3 } from "path";
import { execa as execa3 } from "execa";
async function addEslintConfig(dir, projectType) {
  const configPath = join3(dir, ".eslintrc.cjs");
  const configs = {
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
    no-var': 'error', // \u8981\u6C42\u4F7F\u7528 let \u6216 const \u800C\u4E0D\u662F var
    'no-multiple-empty-lines': ['error', { max: 1 }], // \u4E0D\u5141\u8BB8\u591A\u4E2A\u7A7A\u884C
    'prefer-const': 'off', // \u4F7F\u7528 let \u5173\u952E\u5B57\u58F0\u660E\u4F46\u5728\u521D\u59CB\u5206\u914D\u540E\u4ECE\u672A\u91CD\u65B0\u5206\u914D\u7684\u53D8\u91CF\uFF0C\u8981\u6C42\u4F7F\u7528 const
    'no-use-before-define': 'off', // \u7981\u6B62\u5728 \u51FD\u6570/\u7C7B/\u53D8\u91CF \u5B9A\u4E49\u4E4B\u524D\u4F7F\u7528\u5B83\u4EEC

    // typeScript (https://typescript-eslint.io/rules)
    '@typescript-eslint/no-unused-vars': 'error', // \u7981\u6B62\u5B9A\u4E49\u672A\u4F7F\u7528\u7684\u53D8\u91CF
    '@typescript-eslint/no-empty-function': 'error', // \u7981\u6B62\u7A7A\u51FD\u6570
    '@typescript-eslint/prefer-ts-expect-error': 'error', // \u7981\u6B62\u4F7F\u7528 @ts-ignore
    '@typescript-eslint/ban-ts-comment': 'error', // \u7981\u6B62 @ts-<directive> \u4F7F\u7528\u6CE8\u91CA\u6216\u8981\u6C42\u5728\u6307\u4EE4\u540E\u8FDB\u884C\u63CF\u8FF0
    '@typescript-eslint/no-inferrable-types': 'off', // \u53EF\u4EE5\u8F7B\u677E\u63A8\u65AD\u7684\u663E\u5F0F\u7C7B\u578B\u53EF\u80FD\u4F1A\u589E\u52A0\u4E0D\u5FC5\u8981\u7684\u5197\u957F
    '@typescript-eslint/no-namespace': 'off', // \u7981\u6B62\u4F7F\u7528\u81EA\u5B9A\u4E49 TypeScript \u6A21\u5757\u548C\u547D\u540D\u7A7A\u95F4
    '@typescript-eslint/no-explicit-any': 'off', // \u7981\u6B62\u4F7F\u7528 any \u7C7B\u578B
    '@typescript-eslint/ban-types': 'off', // \u7981\u6B62\u4F7F\u7528\u7279\u5B9A\u7C7B\u578B
    '@typescript-eslint/no-var-requires': 'off', // \u5141\u8BB8\u4F7F\u7528 require() \u51FD\u6570\u5BFC\u5165\u6A21\u5757
    '@typescript-eslint/no-non-null-assertion': 'off', // \u4E0D\u5141\u8BB8\u4F7F\u7528\u540E\u7F00\u8FD0\u7B97\u7B26\u7684\u975E\u7A7A\u65AD\u8A00(!)

    // vue (https://eslint.vuejs.org/rules)
    'vue/script-setup-uses-vars': 'error', // \u9632\u6B62<script setup>\u4F7F\u7528\u7684\u53D8\u91CF<template>\u88AB\u6807\u8BB0\u4E3A\u672A\u4F7F\u7528\uFF0C\u6B64\u89C4\u5219\u4EC5\u5728\u542F\u7528\u8BE5 no-unused-vars \u89C4\u5219\u65F6\u6709\u6548
    'vue/v-slot-style': 'error', // \u5F3A\u5236\u6267\u884C v-slot \u6307\u4EE4\u6837\u5F0F
    'vue/no-mutating-props': 'error', // \u4E0D\u5141\u8BB8\u6539\u53D8\u7EC4\u4EF6 prop
    'vue/custom-event-name-casing': 'error', // \u4E3A\u81EA\u5B9A\u4E49\u4E8B\u4EF6\u540D\u79F0\u5F3A\u5236\u4F7F\u7528\u7279\u5B9A\u5927\u5C0F\u5199
    'vue/html-closing-bracket-newline': 'error', // \u5728\u6807\u7B7E\u7684\u53F3\u62EC\u53F7\u4E4B\u524D\u8981\u6C42\u6216\u7981\u6B62\u6362\u884C
    'vue/attribute-hyphenation': 'error', // \u5BF9\u6A21\u677F\u4E2D\u7684\u81EA\u5B9A\u4E49\u7EC4\u4EF6\u5F3A\u5236\u6267\u884C\u5C5E\u6027\u547D\u540D\u6837\u5F0F\uFF1Amy-prop="prop"
    'vue/attributes-order': 'off', // vue api\u4F7F\u7528\u987A\u5E8F\uFF0C\u5F3A\u5236\u6267\u884C\u5C5E\u6027\u987A\u5E8F
    'vue/no-v-html': 'off', // \u7981\u6B62\u4F7F\u7528 v-html
    'vue/require-default-prop': 'off', // \u6B64\u89C4\u5219\u8981\u6C42\u4E3A\u6BCF\u4E2A prop \u4E3A\u5FC5\u586B\u65F6\uFF0C\u5FC5\u987B\u63D0\u4F9B\u9ED8\u8BA4\u503C
    'vue/multi-word-component-names': 'off', // \u8981\u6C42\u7EC4\u4EF6\u540D\u79F0\u59CB\u7EC8\u4E3A \u201C-\u201D \u94FE\u63A5\u7684\u5355\u8BCD
    'vue/no-setup-props-destructure': 'off' // \u7981\u6B62\u89E3\u6784 props \u4F20\u9012\u7ED9 setup
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
    'no-var': 'error', // \u8981\u6C42\u4F7F\u7528 let \u6216 const \u800C\u4E0D\u662F var
    'no-multiple-empty-lines': ['error', { max: 1 }], // \u4E0D\u5141\u8BB8\u591A\u4E2A\u7A7A\u884C
    'prefer-const': 'off', // \u4F7F\u7528 let \u5173\u952E\u5B57\u58F0\u660E\u4F46\u5728\u521D\u59CB\u5206\u914D\u540E\u4ECE\u672A\u91CD\u65B0\u5206\u914D\u7684\u53D8\u91CF\uFF0C\u8981\u6C42\u4F7F\u7528 const
    'no-use-before-define': 'off', // \u7981\u6B62\u5728 \u51FD\u6570/\u7C7B/\u53D8\u91CF \u5B9A\u4E49\u4E4B\u524D\u4F7F\u7528\u5B83\u4EEC

    // typeScript (https://typescript-eslint.io/rules)
    '@typescript-eslint/no-unused-vars': 'error', // \u7981\u6B62\u5B9A\u4E49\u672A\u4F7F\u7528\u7684\u53D8\u91CF
    '@typescript-eslint/no-empty-function': 'error', // \u7981\u6B62\u7A7A\u51FD\u6570
    '@typescript-eslint/prefer-ts-expect-error': 'error', // \u7981\u6B62\u4F7F\u7528 @ts-ignore
    '@typescript-eslint/ban-ts-comment': 'error', // \u7981\u6B62 @ts-<directive> \u4F7F\u7528\u6CE8\u91CA\u6216\u8981\u6C42\u5728\u6307\u4EE4\u540E\u8FDB\u884C\u63CF\u8FF0
    '@typescript-eslint/no-inferrable-types': 'off', // \u53EF\u4EE5\u8F7B\u677E\u63A8\u65AD\u7684\u663E\u5F0F\u7C7B\u578B\u53EF\u80FD\u4F1A\u589E\u52A0\u4E0D\u5FC5\u8981\u7684\u5197\u957F
    '@typescript-eslint/no-namespace': 'off', // \u7981\u6B62\u4F7F\u7528\u81EA\u5B9A\u4E49 TypeScript \u6A21\u5757\u548C\u547D\u540D\u7A7A\u95F4
    '@typescript-eslint/no-explicit-any': 'off', // \u7981\u6B62\u4F7F\u7528 any \u7C7B\u578B
    '@typescript-eslint/ban-types': 'off', // \u7981\u6B62\u4F7F\u7528\u7279\u5B9A\u7C7B\u578B
    '@typescript-eslint/no-var-requires': 'off', // \u5141\u8BB8\u4F7F\u7528 require() \u51FD\u6570\u5BFC\u5165\u6A21\u5757
    '@typescript-eslint/no-non-null-assertion': 'off', // \u4E0D\u5141\u8BB8\u4F7F\u7528\u540E\u7F00\u8FD0\u7B97\u7B26\u7684\u975E\u7A7A\u65AD\u8A00(!)
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
    'no-var': 'error', // \u8981\u6C42\u4F7F\u7528 let \u6216 const \u800C\u4E0D\u662F var
    'no-multiple-empty-lines': ['error', { max: 1 }], // \u4E0D\u5141\u8BB8\u591A\u4E2A\u7A7A\u884C
    'prefer-const': 'off', // \u4F7F\u7528 let \u5173\u952E\u5B57\u58F0\u660E\u4F46\u5728\u521D\u59CB\u5206\u914D\u540E\u4ECE\u672A\u91CD\u65B0\u5206\u914D\u7684\u53D8\u91CF\uFF0C\u8981\u6C42\u4F7F\u7528 const
    'no-use-before-define': 'off', // \u7981\u6B62\u5728 \u51FD\u6570/\u7C7B/\u53D8\u91CF \u5B9A\u4E49\u4E4B\u524D\u4F7F\u7528\u5B83\u4EEC
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
    'no-var': 'error', // \u8981\u6C42\u4F7F\u7528 let \u6216 const \u800C\u4E0D\u662F var
    'no-multiple-empty-lines': ['error', { max: 1 }], // \u4E0D\u5141\u8BB8\u591A\u4E2A\u7A7A\u884C
    'prefer-const': 'off', // \u4F7F\u7528 let \u5173\u952E\u5B57\u58F0\u660E\u4F46\u5728\u521D\u59CB\u5206\u914D\u540E\u4ECE\u672A\u91CD\u65B0\u5206\u914D\u7684\u53D8\u91CF\uFF0C\u8981\u6C42\u4F7F\u7528 const
    'no-use-before-define': 'off', // \u7981\u6B62\u5728 \u51FD\u6570/\u7C7B/\u53D8\u91CF \u5B9A\u4E49\u4E4B\u524D\u4F7F\u7528\u5B83\u4EEC
  }
};
`
  };
  await fs3.writeFile(configPath, configs[projectType] || configs["ts"]);
}
async function addPrettierConfig(dir) {
  const configPath = join3(dir, ".prettierrc");
  const config = JSON.stringify(
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
      rangeStart: 0
    },
    null,
    2
  ) + "\n";
  await fs3.writeFile(configPath, config);
}
async function addPrettierIgnore(dir) {
  const ignorePath = join3(dir, ".prettierignore");
  const content = `node_modules
dist
coverage
*.min.js
`;
  await fs3.writeFile(ignorePath, content);
}
async function setupHusky(dir) {
  const huskyDir = join3(dir, ".husky");
  await fs3.ensureDir(huskyDir);
  const preCommitPath = join3(huskyDir, "pre-commit");
  await fs3.writeFile(preCommitPath, "#!/bin/sh\nnpx lint-staged\n");
  await fs3.chmod(preCommitPath, 493);
}
async function updatePackageJsonForTooling(dir, options) {
  const packagePath = join3(dir, "package.json");
  const pkg = await fs3.readJson(packagePath);
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
    const extMap = {
      vue3: "*.{js,ts,vue}",
      react: "*.{js,ts,tsx,jsx}",
      ts: "*.{js,ts}",
      js: "*.js"
    };
    const glob = extMap[options.projectType] || "*.{js,ts}";
    pkg["lint-staged"] = {
      [glob]: options.eslint && options.prettier ? ["eslint --fix", "prettier --write"] : options.eslint ? ["eslint --fix"] : ["prettier --write"]
    };
  }
  await fs3.writeJson(packagePath, pkg, { spaces: 2 });
}
async function runHuskyPrepare(dir, packageManager) {
  const [cmd, ...args] = getInstallCommand2(packageManager);
  await execa3(cmd, [...args, "run", "prepare"], { cwd: dir, stdio: "inherit" });
}
function getInstallCommand2(manager) {
  switch (manager) {
    case "pnpm":
      return ["pnpm", "install"];
    case "yarn":
      return ["yarn"];
    default:
      return ["npm", "install"];
  }
}

// src/commands/init.ts
var initCommand = new Command4("init").description("Add ESLint, Prettier, Husky to an existing project").option("-t, --type <type>", "Project type (vue3, react, ts, js)").option("--tools <tools...>", "Tools to add (eslint, prettier, husky)").option("-pm, --package-manager <name>", "Package manager (npm/yarn/pnpm)", "pnpm").option("--skip-install", "Skip dependency installation").action(async (options) => {
  const targetDir = process.cwd();
  if (!existsSync2(resolve2(targetDir, "package.json"))) {
    logger.error("No package.json found. Run this command inside an existing project.");
    process.exit(1);
  }
  try {
    const config = await initPrompts(options);
    const hasEslint = config.tools.includes("eslint");
    const hasPrettier = config.tools.includes("prettier");
    const hasHusky = config.tools.includes("husky");
    if (hasEslint) {
      await spinner.start("Adding ESLint config...", async () => {
        await addEslintConfig(targetDir, config.projectType);
      });
    }
    if (hasPrettier) {
      await spinner.start("Adding Prettier config...", async () => {
        await addPrettierConfig(targetDir);
        await addPrettierIgnore(targetDir);
      });
    }
    if (hasHusky) {
      await spinner.start("Setting up Husky...", async () => {
        await setupHusky(targetDir);
      });
    }
    await spinner.start("Updating package.json...", async () => {
      await updatePackageJsonForTooling(targetDir, {
        eslint: hasEslint,
        prettier: hasPrettier,
        husky: hasHusky,
        projectType: config.projectType
      });
    });
    if (!options.skipInstall) {
      await spinner.start("Installing dependencies...", async () => {
        await installDeps(targetDir, config.packageManager);
      });
    }
    if (hasHusky && !options.skipInstall) {
      await spinner.start("Initializing Husky hooks...", async () => {
        await runHuskyPrepare(targetDir, config.packageManager);
      });
    }
    logger.success("Tooling setup complete!");
    const scripts = [];
    if (hasEslint) scripts.push("lint");
    if (hasPrettier) scripts.push("format");
    if (scripts.length > 0) {
      logger.info(`Available scripts: ${scripts.join(", ")}`);
    }
  } catch (error) {
    logger.error(error.message || "Failed to setup tooling.");
    process.exit(1);
  }
});

// package.json
var package_default = {
  name: "striver-dev-cli",
  version: "0.0.4",
  description: "Project scaffolding CLI for Vue and React",
  type: "module",
  bin: {
    nova: "bin/nova-cli.js"
  },
  main: "./dist/index.js",
  scripts: {
    build: "tsup",
    dev: "tsup --watch",
    typecheck: "tsc --noEmit"
  },
  dependencies: {
    "@inquirer/prompts": "^5.0.0",
    chalk: "^5.3.0",
    commander: "^12.0.0",
    execa: "^9.0.0",
    "fs-extra": "^11.2.0",
    ora: "^8.0.0"
  },
  devDependencies: {
    "@types/fs-extra": "^11.0.4",
    "@types/node": "^20.11.0",
    tsup: "^8.0.0",
    typescript: "^5.4.0"
  },
  engines: {
    node: ">=18.0.0"
  },
  publishConfig: {
    access: "public"
  },
  files: [
    "dist",
    "bin"
  ]
};

// src/index.ts
program.name("nova-cli").description("Project scaffolding CLI for Vue and React").version(package_default.version);
program.addCommand(createCommand);
program.addCommand(listCommand);
program.addCommand(infoCommand);
program.addCommand(initCommand);
program.parse();
//# sourceMappingURL=index.js.map