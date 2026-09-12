import { Command } from 'commander';
import chalk from 'chalk';

export const program = new Command();

program
  .name('crypto-tracer')
  .description('Crypto Forensics Tracer')
  .version('1.0.0')
  .action(() => {
    console.log(chalk.bold.green('Crypto Forensics Tracer'));
  });
