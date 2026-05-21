import { Command } from 'commander';
import { findTemplate } from '../templates/registry.js';
import { logger } from '../utils/logger.js';
import chalk from 'chalk';

const useColor = process.stdout.isTTY;

export const infoCommand = new Command('info')
  .argument('<template>', 'Template name')
  .description('Show template details')
  .action((templateName: string) => {
    const template = findTemplate(templateName);

    if (!template) {
      logger.error(`Template "${templateName}" not found. Run "nova list" to see available templates.`);
      process.exit(1);
    }

    console.log('');
    console.log(useColor ? chalk.bold(template.label) : template.label);
    console.log('');
    console.log(`  Name:        ${template.name}`);
    console.log(`  Description: ${template.description}`);
    console.log(`  Repository:  ${template.repo}`);
    console.log(`  Branch:      ${template.branch}`);
    console.log(`  Features:    ${template.features.join(', ')}`);
    console.log('');
  });
