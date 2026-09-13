import { MultiDirectedGraph } from 'graphology';

export interface TraceResultNode {
  address: string;
  depth: number;
  parentAddress: string | null;
  txid: string | null;
  value: number | null;
  entityLabel?: string;
  entityType?: string;
  isPotentialChange?: boolean;
}

/**
 * Performs a depth-limited Breadth-First Search (BFS) on the transaction graph
 * starting from the given address.
 */
export function trace(
  startAddress: string,
  graph: MultiDirectedGraph,
  maxDepth: number
): TraceResultNode[] {
  if (!graph.hasNode(startAddress)) {
    return [];
  }

  const results: TraceResultNode[] = [];
  const visited = new Set<string>();
  const queued = new Set<string>();
  
  const queue: Array<TraceResultNode> = [];

  queue.push({
    address: startAddress,
    depth: 0,
    parentAddress: null,
    txid: null,
    value: null
  });
  
  queued.add(startAddress);

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    visited.add(current.address);
    results.push(current);

    if (current.depth >= maxDepth) {
      continue;
    }

    graph.forEachOutboundEdge(current.address, (edge: string, attributes: any, source: string, target: string) => {
      if (!visited.has(target) && !queued.has(target)) {
        queued.add(target);
        queue.push({
          address: target,
          depth: current.depth + 1,
          parentAddress: source,
          txid: attributes.txid as string || null,
          value: attributes.value as number || null,
          isPotentialChange: attributes.isPotentialChange as boolean || false
        });
      }
    });
  }

  return results;
}
