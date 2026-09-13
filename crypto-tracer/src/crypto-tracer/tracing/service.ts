import { fetchBitcoinTransactions } from '../blockchain/client.js';
import { NormalizedBitcoinTransaction } from '../blockchain/models.js';
import { buildAddressGraph } from './graph.js';
import { trace, TraceResultNode } from './engine.js';

import fs from 'fs';
import path from 'path';

let knownEntitiesCache: Record<string, any> | null = null;

function getKnownEntities(): Record<string, any> {
  if (knownEntitiesCache) return knownEntitiesCache;
  try {
    const dataPath = path.resolve(process.cwd(), 'data/known-addresses.json');
    const raw = fs.readFileSync(dataPath, 'utf8');
    const list = JSON.parse(raw);
    knownEntitiesCache = {};
    for (const item of list) {
      if (item.address) {
        knownEntitiesCache[item.address] = item;
      }
    }
  } catch (err) {
    console.error('Failed to load known entities', err);
    knownEntitiesCache = {};
  }
  return knownEntitiesCache!;
}

export async function recursiveTrace(
  startAddress: string, 
  maxDepth: number = 3, 
  maxNodes: number = 15
): Promise<TraceResultNode[]> {
  const allTransactions: NormalizedBitcoinTransaction[] = [];
  const fetchedAddresses = new Set<string>();
  
  const queue: { address: string; depth: number }[] = [{ address: startAddress, depth: 0 }];
  fetchedAddresses.add(startAddress);
  
  let apiCalls = 0;

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (apiCalls >= maxNodes) {
      console.warn('Max node limit reached, stopping recursive fetch');
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
  
  const results = trace(startAddress, graph, maxDepth);
  
  // Map known entities to results
  const known = getKnownEntities();
  for (const node of results) {
    if (known[node.address]) {
      node.entityLabel = known[node.address].label;
      node.entityType = known[node.address].entity_type;
    }
  }
  
  return results;
}
