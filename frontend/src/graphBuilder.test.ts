import { describe, it, expect } from 'vitest';
import { buildGraphElements } from './graphBuilder';
import type { TraceResultNode } from './TraceService';

describe('graphBuilder', () => {
  it('builds a single node graph', () => {
    const data: TraceResultNode[] = [
      { address: 'addr1', depth: 0, parentAddress: null, txid: null, value: null }
    ];
    
    const { nodes, edges } = buildGraphElements(data, 'addr1');
    
    expect(nodes).toHaveLength(1);
    expect(edges).toHaveLength(0);
    expect(nodes[0].id).toBe('addr1');
    expect(nodes[0].data.label).toContain('Start:\naddr1');
    // It's both start and candidate, background should be green (start takes precedence in style logic)
    expect(nodes[0].style?.background).toBe('#dcfce7');
  });

  it('builds a linear graph', () => {
    const data: TraceResultNode[] = [
      { address: 'addr1', depth: 0, parentAddress: null, txid: null, value: null },
      { address: 'addr2', depth: 1, parentAddress: 'addr1', txid: 'tx1', value: 100 }
    ];
    
    const { nodes, edges } = buildGraphElements(data, 'addr2');
    
    expect(nodes).toHaveLength(2);
    expect(edges).toHaveLength(1);
    
    expect(nodes[0].id).toBe('addr1');
    expect(nodes[1].id).toBe('addr2');
    expect(nodes[1].style?.background).toBe('#fef08a'); // candidate
    
    expect(edges[0].source).toBe('addr1');
    expect(edges[0].target).toBe('addr2');
    expect(edges[0].label).toBe('100 sats | tx1...');
  });

  it('builds a branching graph with correct horizontal and vertical layout', () => {
    const data: TraceResultNode[] = [
      { address: 'addr1', depth: 0, parentAddress: null, txid: null, value: null },
      { address: 'addr2', depth: 1, parentAddress: 'addr1', txid: 'tx1', value: 50 },
      { address: 'addr3', depth: 1, parentAddress: 'addr1', txid: 'tx2', value: 50 },
    ];
    
    const { nodes, edges } = buildGraphElements(data, 'addr3');
    
    expect(nodes).toHaveLength(3);
    expect(edges).toHaveLength(2);
    
    // Depth 0 node should be at x:0, y:0
    expect(nodes[0].position).toEqual({ x: 0, y: 0 });
    
    // Depth 1 nodes should be at x:350, with differing y values (0 and 120)
    expect(nodes[1].position).toEqual({ x: 350, y: 0 });
    expect(nodes[2].position).toEqual({ x: 350, y: 120 });
    
    // addr3 is candidate
    expect(nodes[2].style?.background).toBe('#fef08a');
  });

  it('applies styles for known entities and potential change', () => {
    const data: TraceResultNode[] = [
      { address: 'addr1', depth: 0, parentAddress: null, txid: null, value: null },
      { address: 'addr2', depth: 1, parentAddress: 'addr1', txid: 'tx1', value: 50, entityLabel: 'Binance' },
      { address: 'addr3', depth: 1, parentAddress: 'addr1', txid: 'tx1', value: 50, isPotentialChange: true },
    ];
    
    const { nodes } = buildGraphElements(data, null);
    
    expect(nodes).toHaveLength(3);
    
    // Known entity (addr2)
    expect(nodes[1].style?.background).toBe('#dbeafe'); // blue
    expect(nodes[1].data.label).toContain('🏛️ Binance');
    
    // Potential change (addr3)
    expect(nodes[2].style?.background).toBe('#f8fafc'); // gray
    expect(nodes[2].style?.border).toContain('dashed');
    expect(nodes[2].data.label).toContain('Potential Change');
  });
});
