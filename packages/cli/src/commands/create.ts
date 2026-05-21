import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { prompts } from '../prompts/index.js';
import { cloneTemplate, initGit } from '../utils/git.js';
import { updatePackageJson } from '../utils/package.js';
import { installDeps } from '../utils/fs.js';
import { logger } from '../utils/logger.js';
import { spinner } from '../utils/spinner.js';

export const createCommand = new Command('create')
  .argument('<app-name>', 'Project name')
  .option('-t, --template <name>', 'Template to use (vue3, react18)')
  .option('-pm, --package-manager <name>', 'Package manager (npm/yarn/pnpm)', 'pnpm')
  .option('--skip-install', 'Skip dependency installation')
  .option('--skip-git', 'Skip git initialization')
  .action(async (appName: string, options: any) => {
    const targetDir = resolve(process.cwd(), appName);

    if (existsSync(targetDir)) {
      logger.error(`Directory "${appName}" already exists.`);
      process.exit(1);
    }

    try {
      const config = await prompts(appName, options);

      await spinner.start('Cloning template...', async () => {
        await cloneTemplate(config.template, targetDir);
      });

      await spinner.start('Setting up project...', async () => {
        await updatePackageJson(targetDir, { name: appName, version: '0.0.1' });
      });

      if (!options.skipInstall) {
        await spinner.start('Installing dependencies...', async () => {
          await installDeps(targetDir, config.packageManager);
        });
      }

      if (config.initGit) {
        await spinner.start('Initializing git...', async () => {
          await initGit(targetDir);
        });
      }

      logger.success(`Project "${appName}" created successfully!`);
      logger.info(`Run \`cd ${appName} && ${config.packageManager} dev\` to start.`);
    } catch (error: any) {
      logger.error(error.message || 'Failed to create project.');
      process.exit(1);
    }
  });
