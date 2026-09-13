import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { recursiveTrace } from '../tracing/service.js';
import { printInvestigationSummary } from './formatter.js';

export const program = new Command();

program
  .name('crypto-tracer')
  .description('Crypto Forensics Tracer')
  .version('1.0.0');

program
  .command('trace <address>')
  .description('Trace cryptocurrency funds from a starting address')
  .option('-d, --depth <number>', 'Maximum trace depth', '3')
  .option('-n, --nodes <number>', 'Maximum addresses to fetch', '15')
  .action(async (address: string, options: any) => {
    const depth = parseInt(options.depth, 10);
    const nodes = parseInt(options.nodes, 10);
    
    console.log(chalk.bold.green('\n🔍 Crypto Forensics Tracer'));
    console.log(chalk.gray(`Tracing: ${address}\n`));
    
    const spinner = ora('Fetching blockchain data...').start();
    
    try {
      const results = await recursiveTrace(address, depth, nodes);
      spinner.succeed(`Trace complete. Discovered ${results.length} addresses.`);
      printInvestigationSummary(address, results, depth, nodes);
    } catch (err: any) {
      spinner.fail('Trace failed.');
      console.error(chalk.red(err.message || err));
      process.exit(1);
    }
  });
