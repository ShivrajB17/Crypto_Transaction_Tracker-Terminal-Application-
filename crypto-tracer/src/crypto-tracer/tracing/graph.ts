import { MultiDirectedGraph } from 'graphology';
import { NormalizedBitcoinTransaction } from '../blockchain/models.js';

/**
 * Builds a directed address-level graph from normalized Bitcoin transactions.
 * For this MVP, we map every input address to every output address within a transaction.
 */
export function buildAddressGraph(transactions: NormalizedBitcoinTransaction[]): MultiDirectedGraph {
  const graph = new MultiDirectedGraph();
  
  for (const tx of transactions) {
    const inputs = tx.inputs.filter(i => i.address !== null);
    const outputs = tx.outputs.filter(o => o.address !== null);
    
    for (const input of inputs) {
      const inAddr = input.address!;
      if (!graph.hasNode(inAddr)) {
        graph.addNode(inAddr, { type: 'address' });
      }
      
      for (const output of outputs) {
        const outAddr = output.address!;
        if (!graph.hasNode(outAddr)) {
          graph.addNode(outAddr, { type: 'address' });
        }
        
        graph.addEdge(inAddr, outAddr, {
          txid: tx.txid,
          value: output.value,
          fee: tx.fee,
          timestamp: tx.timestamp
        });
      }
    }
  }
  
  return graph;
}
