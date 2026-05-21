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
    repo: "https://github.com/your-org/nova-cli.git",
    branch: "main",
    dir: "packages/template-vue3",
    description: "Vue 3 project with Vite, Pinia, Vue Router, ESLint, Prettier, Husky",
    features: ["vite", "vue-router", "pinia", "eslint", "prettier", "husky", "lint-staged"]
  },
  {
    name: "react18",
    label: "React 18 + TypeScript",
    repo: "https://github.com/your-org/nova-cli.git",
    branch: "main",
    dir: "packages/template-react18",
    description: "React 18 project with Vite, React Router, Zustand, ESLint, Prettier, Husky",
    features: ["vite", "react-router", "zustand", "eslint", "prettier", "husky", "lint-staged"]
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

// package.json
var package_default = {
  name: "nova-cli",
  version: "0.0.1",
  description: "Project scaffolding CLI for Vue and React",
  type: "module",
  bin: {
    nova: "./bin/nova-cli.js"
  },
  main: "./dist/index.js",
  scripts: {
    build: "tsup",
    dev: "tsup --watch",
    typecheck: "tsc --noEmit"
  },
  dependencies: {
    commander: "^12.0.0",
    "@inquirer/prompts": "^5.0.0",
    chalk: "^5.3.0",
    ora: "^8.0.0",
    execa: "^9.0.0",
    "fs-extra": "^11.2.0"
  },
  devDependencies: {
    "@types/fs-extra": "^11.0.4",
    "@types/node": "^20.11.0",
    tsup: "^8.0.0",
    typescript: "^5.4.0"
  },
  engines: {
    node: ">=18.0.0"
  }
};

// src/index.ts
program.name("nova-cli").description("Project scaffolding CLI for Vue and React").version(package_default.version);
program.addCommand(createCommand);
program.addCommand(listCommand);
program.addCommand(infoCommand);
program.parse();
//# sourceMappingURL=index.js.map