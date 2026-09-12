import { describe, it, expect } from 'vitest';
import Graph from 'graphology';
import { trace } from '../../src/crypto-tracer/tracing/engine.js';

describe('BFS Tracing Engine', () => {
  it('should handle a linear graph', () => {
    const graph = new Graph({ type: 'directed' });
    graph.addNode('A');
    graph.addNode('B');
    graph.addNode('C');
    graph.addNode('D');
    graph.addEdge('A', 'B', { txid: 'tx1', value: 10 });
    graph.addEdge('B', 'C', { txid: 'tx2', value: 9 });
    graph.addEdge('C', 'D', { txid: 'tx3', value: 8 });

    const results = trace('A', graph, 10);
    
    expect(results).toHaveLength(4);
    expect(results.map(r => r.address)).toEqual(['A', 'B', 'C', 'D']);
    expect(results[1].depth).toBe(1);
    expect(results[1].parentAddress).toBe('A');
    expect(results[1].txid).toBe('tx1');
  });

  it('should handle a branching graph', () => {
    // A -> B, A -> C, B -> D, C -> E
    const graph = new Graph({ type: 'directed' });
    ['A', 'B', 'C', 'D', 'E'].forEach(n => graph.addNode(n));
    graph.addEdge('A', 'B');
    graph.addEdge('A', 'C');
    graph.addEdge('B', 'D');
    graph.addEdge('C', 'E');

    const results = trace('A', graph, 10);
    
    expect(results).toHaveLength(5);
    const addresses = results.map(r => r.address);
    expect(addresses[0]).toBe('A');
    expect(addresses.slice(1, 3)).toContain('B');
    expect(addresses.slice(1, 3)).toContain('C');
    expect(addresses.slice(3, 5)).toContain('D');
    expect(addresses.slice(3, 5)).toContain('E');
  });

  it('should strictly enforce max depth', () => {
    const graph = new Graph({ type: 'directed' });
    ['A', 'B', 'C', 'D'].forEach(n => graph.addNode(n));
    graph.addEdge('A', 'B');
    graph.addEdge('B', 'C');
    graph.addEdge('C', 'D');

    // maxDepth = 1, should only reach B
    const results = trace('A', graph, 1);
    expect(results).toHaveLength(2);
    expect(results.map(r => r.address)).toEqual(['A', 'B']);
  });

  it('should not infinite loop on cyclic graphs', () => {
    // A -> B -> C -> A
    const graph = new Graph({ type: 'directed' });
    ['A', 'B', 'C'].forEach(n => graph.addNode(n));
    graph.addEdge('A', 'B');
    graph.addEdge('B', 'C');
    graph.addEdge('C', 'A');

    const results = trace('A', graph, 10);
    
    expect(results).toHaveLength(3);
    expect(results.map(r => r.address)).toEqual(['A', 'B', 'C']);
  });

  it('should return only start node if no outgoing transactions', () => {
    const graph = new Graph({ type: 'directed' });
    graph.addNode('A');
    
    const results = trace('A', graph, 10);
    expect(results).toHaveLength(1);
    expect(results[0].address).toBe('A');
  });

  it('should not duplicate traversal results for multiple paths to same address', () => {
    // A -> B, A -> C, B -> D, C -> D
    const graph = new Graph({ type: 'directed' });
    ['A', 'B', 'C', 'D'].forEach(n => graph.addNode(n));
    graph.addEdge('A', 'B');
    graph.addEdge('A', 'C');
    graph.addEdge('B', 'D');
    graph.addEdge('C', 'D');

    const results = trace('A', graph, 10);
    
    expect(results).toHaveLength(4);
    const dNodes = results.filter(r => r.address === 'D');
    expect(dNodes).toHaveLength(1);
  });

  it('should return empty array if starting address not in graph', () => {
    const graph = new Graph({ type: 'directed' });
    graph.addNode('A');

    const results = trace('Z', graph, 10);
    expect(results).toHaveLength(0);
  });
});
