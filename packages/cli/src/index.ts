import { program } from 'commander';
import { createCommand } from './commands/create.js';
import { listCommand } from './commands/list.js';
import { infoCommand } from './commands/info.js';
import pkgJson from '../package.json' with { type: 'json' };

program
  .name('nova-cli')
  .description('Project scaffolding CLI for Vue and React')
  .version(pkgJson.version);

program.addCommand(createCommand);
program.addCommand(listCommand);
program.addCommand(infoCommand);

program.parse();
