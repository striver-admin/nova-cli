import { program } from 'commander';
import { createCommand } from './commands/create.js';
import { listCommand } from './commands/list.js';
import { infoCommand } from './commands/info.js';
import { version } from '../package.json';

program
  .name('nova-cli')
  .description('Project scaffolding CLI for Vue and React')
  .version(version);

program.addCommand(createCommand);
program.addCommand(listCommand);
program.addCommand(infoCommand);

program.parse();
