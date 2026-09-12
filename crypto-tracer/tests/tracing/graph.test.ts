import { describe, it, expect } from 'vitest';
import { buildAddressGraph } from '../../src/crypto-tracer/tracing/graph.js';
import { NormalizedBitcoinTransaction } from '../../src/crypto-tracer/blockchain/models.js';

describe('Graph Builder', () => {
  it('should build a directed graph from transactions', () => {
    const mockTxs: NormalizedBitcoinTransaction[] = [
      {
        txid: 'tx1',
        inputs: [{ txid: 'prev1', vout: 0, value: 1000, address: 'A' }],
        outputs: [{ value: 900, address: 'B' }],
        fee: 100,
        confirmed: true,
        blockHeight: 1,
        timestamp: 123
      }
    ];

    const graph = buildAddressGraph(mockTxs);
    
    expect(graph.order).toBe(2); // 2 nodes: A, B
    expect(graph.size).toBe(1);  // 1 edge: A -> B
    expect(graph.hasNode('A')).toBe(true);
    expect(graph.hasNode('B')).toBe(true);
    expect(graph.hasDirectedEdge('A', 'B')).toBe(true);
    
    const edges = graph.edges('A', 'B');
    const edgeAttributes = graph.getEdgeAttributes(edges[0]);
    expect(edgeAttributes.txid).toBe('tx1');
    expect(edgeAttributes.value).toBe(900);
  });
  
  it('should handle transactions with multiple inputs and outputs', () => {
    const mockTxs: NormalizedBitcoinTransaction[] = [
      {
        txid: 'tx2',
        inputs: [
          { txid: 'prev1', vout: 0, value: 500, address: 'A' },
          { txid: 'prev2', vout: 1, value: 500, address: 'B' }
        ],
        outputs: [
          { value: 600, address: 'C' },
          { value: 300, address: 'D' }
        ],
        fee: 100,
        confirmed: true,
        blockHeight: 1,
        timestamp: 123
      }
    ];

    const graph = buildAddressGraph(mockTxs);
    
    expect(graph.order).toBe(4);
    expect(graph.size).toBe(4); // A->C, A->D, B->C, B->D
    
    expect(graph.hasDirectedEdge('A', 'C')).toBe(true);
    expect(graph.hasDirectedEdge('A', 'D')).toBe(true);
    expect(graph.hasDirectedEdge('B', 'C')).toBe(true);
    expect(graph.hasDirectedEdge('B', 'D')).toBe(true);
  });
  
  it('should ignore inputs and outputs without an address', () => {
    const mockTxs: NormalizedBitcoinTransaction[] = [
      {
        txid: 'tx3',
        inputs: [{ txid: 'prev1', vout: 0, value: 1000, address: null }],
        outputs: [{ value: 900, address: 'B' }],
        fee: 100,
        confirmed: true,
        blockHeight: 1,
        timestamp: 123
      }
    ];

    const graph = buildAddressGraph(mockTxs);
    
    expect(graph.order).toBe(0); 
    expect(graph.size).toBe(0);
  });
});
