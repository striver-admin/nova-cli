import { Command } from 'commander';

export const infoCommand = new Command('info')
  .argument('<template>', 'Template name')
  .description('Show template details')
  .action(() => {
    // TODO: implement in Task 6
  });
