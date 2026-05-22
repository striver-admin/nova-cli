import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { initPrompts } from '../prompts/init.js';
import {
  addEslintConfig,
  addPrettierConfig,
  addPrettierIgnore,
  setupHusky,
  updatePackageJsonForTooling,
  runHuskyPrepare,
  installFrameworkPackages
} from '../utils/tooling.js';
import { installDeps } from '../utils/fs.js';
import { logger } from '../utils/logger.js';
import { spinner } from '../utils/spinner.js';

export const initCommand = new Command('init')
  .description('Add ESLint, Prettier, Husky to an existing project')
  .option('-t, --type <type>', 'Project type (vue3, react, ts, js)')
  .option('--tools <tools...>', 'Tools to add (eslint, prettier, husky)')
  .option('--framework-pkgs <pkgs...>', 'Framework packages to install')
  .option('-pm, --package-manager <name>', 'Package manager (npm/yarn/pnpm)', 'pnpm')
  .option('--skip-install', 'Skip dependency installation')
  .action(async (options: any) => {
    const targetDir = process.cwd();

    if (!existsSync(resolve(targetDir, 'package.json'))) {
      logger.error('No package.json found. Run this command inside an existing project.');
      process.exit(1);
    }

    try {
      const config = await initPrompts(options);

      const hasEslint = config.tools.includes('eslint');
      const hasPrettier = config.tools.includes('prettier');
      const hasHusky = config.tools.includes('husky');

      if (hasEslint) {
        await spinner.start('Adding ESLint config...', async () => {
          await addEslintConfig(targetDir, config.projectType);
        });
      }

      if (hasPrettier) {
        await spinner.start('Adding Prettier config...', async () => {
          await addPrettierConfig(targetDir);
          await addPrettierIgnore(targetDir);
        });
      }

      if (hasHusky) {
        await spinner.start('Setting up Husky...', async () => {
          await setupHusky(targetDir);
        });
      }

      await spinner.start('Updating package.json...', async () => {
        await updatePackageJsonForTooling(targetDir, {
          eslint: hasEslint,
          prettier: hasPrettier,
          husky: hasHusky,
          projectType: config.projectType
        });
      });

      if (config.frameworkPackages.length > 0) {
        await spinner.start('Adding framework packages...', async () => {
          await installFrameworkPackages(targetDir, config.projectType, config.frameworkPackages);
        });
      }

      if (!options.skipInstall) {
        await spinner.start('Installing dependencies...', async () => {
          await installDeps(targetDir, config.packageManager);
        });
      }

      if (hasHusky && !options.skipInstall) {
        await spinner.start('Initializing Husky hooks...', async () => {
          await runHuskyPrepare(targetDir, config.packageManager);
        });
      }

      logger.success('Tooling setup complete!');
      const scripts = [];
      if (hasEslint) scripts.push('lint');
      if (hasPrettier) scripts.push('format');
      if (scripts.length > 0) {
        logger.info(`Available scripts: ${scripts.join(', ')}`);
      }
    } catch (error: any) {
      logger.error(error.message || 'Failed to setup tooling.');
      process.exit(1);
    }
  });
