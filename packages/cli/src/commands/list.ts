import { Command } from 'commander';
import { listTemplates } from '../templates/registry.js';
import { logger } from '../utils/logger.js';
import chalk from 'chalk';

const useColor = process.stdout.isTTY;

export const listCommand = new Command('list')
  .description('List all available templates')
  .action(() => {
    const templates = listTemplates();

    console.log('');
    console.log('Available templates:');
    console.log('');

    templates.forEach(t => {
      const name = useColor ? chalk.bold(t.name) : t.name;
      const label = useColor ? chalk.cyan(t.label) : t.label;
      console.log(`  ${name}  ${label}`);
      console.log(`     ${t.description}`);
      console.log(`     Features: ${t.features.join(', ')}`);
      console.log('');
    });
  });
