import { Command } from 'commander';

export const createCommand = new Command('create')
  .argument('<app-name>', 'Project name')
  .description('Create a new project from template')
  .action(() => {
    // TODO: implement in Task 6
  });
