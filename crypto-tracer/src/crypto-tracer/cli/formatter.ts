import chalk from 'chalk';
import { TraceResultNode } from '../tracing/engine.js';

export function printInvestigationSummary(
  address: string,
  data: TraceResultNode[],
  maxDepth: number,
  maxNodes: number
) {
  if (!data || data.length === 0) {
    console.log(chalk.yellow('\nNo transactions found for this address.\n'));
    return;
  }

  const uniqueAddresses = data.length;
  const transactionsFound = data.filter(n => n.txid !== null).length;
  const depthReached = Math.max(...data.map(n => n.depth), 0);
  const knownEntities = data.filter(n => !!n.entityLabel).length;
  const potentialChange = data.filter(n => !!n.isPotentialChange).length;

  console.log('\n' + chalk.bold.cyan('=== Investigation Summary ==='));
  console.log(chalk.gray(`Config: Depth ${maxDepth} | Max Fetches ${maxNodes}`));
  console.log('-----------------------------');
  console.log(`${chalk.bold('Addresses Discovered:')} ${chalk.green(uniqueAddresses)}`);
  console.log(`${chalk.bold('Transactions Found:')}   ${chalk.green(transactionsFound)}`);
  console.log(`${chalk.bold('Max Depth Reached:')}    ${chalk.blue(depthReached)}`);
  console.log(`${chalk.bold('Known Entities:')}       ${chalk.cyan(knownEntities)}`);
  console.log(`${chalk.bold('Potential Change:')}     ${chalk.gray(potentialChange)}`);
  
  // Calculate candidate endpoint
  let candidateDisplay = 'None identified';
  let bestScore = -9999;
  let candidateNode: TraceResultNode | null = null;
  
  for (const node of data) {
    let score = 0;
    if (node.entityLabel) score += 1000;
    if (node.isPotentialChange) score -= 500;
    score += node.depth * 10;
    score += node.value ? Math.log10(node.value) : 0;
    
    if (score > bestScore) {
      bestScore = score;
      candidateNode = node;
    }
  }

  if (candidateNode) {
    candidateDisplay = candidateNode.address;
    if (candidateNode.entityLabel) {
      candidateDisplay += chalk.bgBlue.white(` [ 🏛️ ${candidateNode.entityLabel} ] `);
    }
  }

  console.log('-----------------------------');
  console.log(`${chalk.bold.magenta('Candidate Endpoint:')}   ${candidateDisplay}`);
  console.log('=============================\n');
}
