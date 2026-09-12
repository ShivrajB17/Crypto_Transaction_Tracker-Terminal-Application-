import { fetchBitcoinTransactions } from '../blockchain/client.js';
import { NormalizedBitcoinTransaction } from '../blockchain/models.js';
import { buildAddressGraph } from './graph.js';
import { trace, TraceResultNode } from './engine.js';

export async function recursiveTrace(startAddress: string, maxDepth: number = 3): Promise<TraceResultNode[]> {
  const allTransactions: NormalizedBitcoinTransaction[] = [];
  const fetchedAddresses = new Set<string>();
  
  const queue: { address: string; depth: number }[] = [{ address: startAddress, depth: 0 }];
  fetchedAddresses.add(startAddress);
  
  const MAX_API_CALLS = 15; // Bound to avoid rate limits
  let apiCalls = 0;

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (apiCalls >= MAX_API_CALLS) {
      console.warn('API call limit reached, stopping recursive fetch');
      break;
    }
    
    let txs: NormalizedBitcoinTransaction[] = [];
    try {
      txs = await fetchBitcoinTransactions(current.address);
      apiCalls++;
    } catch (err) {
      console.error(`Failed to fetch txs for ${current.address}:`, err);
    }
    
    allTransactions.push(...txs);
    
    if (current.depth < maxDepth - 1) {
      const newAddresses = new Set<string>();
      for (const tx of txs) {
        const isSender = tx.inputs.some(input => input.address === current.address);
        if (isSender) {
          for (const output of tx.outputs) {
            if (output.address && !fetchedAddresses.has(output.address)) {
              newAddresses.add(output.address);
            }
          }
        }
      }
      
      for (const addr of newAddresses) {
        fetchedAddresses.add(addr);
        queue.push({ address: addr, depth: current.depth + 1 });
      }
    }
  }

  const uniqueTxsMap = new Map<string, NormalizedBitcoinTransaction>();
  for (const tx of allTransactions) {
    uniqueTxsMap.set(tx.txid, tx);
  }
  const uniqueTxs = Array.from(uniqueTxsMap.values());

  const graph = buildAddressGraph(uniqueTxs);
  
  return trace(startAddress, graph, maxDepth);
}
