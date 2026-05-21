import chalk from 'chalk';

const useColor = process.stdout.isTTY;

export const logger = {
  success(msg: string) {
    console.log(useColor ? chalk.green('✔') : '✔', useColor ? chalk.green(msg) : msg);
  },
  error(msg: string) {
    console.error(useColor ? chalk.red('✖') : '✖', useColor ? chalk.red(msg) : msg);
  },
  info(msg: string) {
    console.log(useColor ? chalk.blue('ℹ') : 'ℹ', useColor ? chalk.blue(msg) : msg);
  },
  warn(msg: string) {
    console.log(useColor ? chalk.yellow('⚠') : '⚠', useColor ? chalk.yellow(msg) : msg);
  }
};
