import { MarkerType, type Node, type Edge } from '@xyflow/react';
import type { TraceResultNode } from './TraceService';

export function buildGraphElements(
  data: TraceResultNode[], 
  candidateAddress: string | null
): { nodes: Node[], edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  const depthCounts: Record<number, number> = {};

  data.forEach((item) => {
    const isStart = item.depth === 0;
    const isCandidate = candidateAddress !== null && item.address === candidateAddress;
    
    const depth = item.depth;
    if (depthCounts[depth] === undefined) {
      depthCounts[depth] = 0;
    }
    
    const x = depth * 350;
    const y = depthCounts[depth] * 120;
    depthCounts[depth]++;
    
    // Style determination
    let background = '#f1f5f9';
    let borderColor = '#94a3b8';
    let borderStyle = 'solid';
    
    let labelText = item.address;

    if (isStart) {
      background = '#dcfce7'; // green-100
      borderColor = '#22c55e'; // green-500
      labelText = item.entityLabel ? `Start (🏛️ ${item.entityLabel}):\n${item.address}` : `Start:\n${item.address}`;
    } else if (isCandidate) {
      background = '#fef08a'; // yellow-200
      borderColor = '#eab308'; // yellow-500
      labelText = item.entityLabel ? `Endpoint (🏛️ ${item.entityLabel}):\n${item.address}` : `Endpoint:\n${item.address}`;
    } else if (item.entityLabel) {
      background = '#dbeafe'; // blue-100
      borderColor = '#3b82f6'; // blue-500
      labelText = `🏛️ ${item.entityLabel}\n${item.address}`;
    } else if (item.isPotentialChange) {
      background = '#f8fafc'; // slate-50
      borderColor = '#94a3b8'; // slate-400
      borderStyle = 'dashed';
      labelText = `Potential Change\n${item.address}`;
    }

    nodes.push({
      id: item.address,
      position: { x, y },
      data: { 
        label: labelText,
        rawData: item,
      },
      style: {
        background,
        border: `2px ${borderStyle} ${borderColor}`,
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        fontWeight: isStart || isCandidate ? 'bold' : 'normal',
        width: 220,
        wordBreak: 'break-all',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }
    });

    if (item.parentAddress) {
      const txidShort = item.txid ? `${item.txid.substring(0, 8)}...` : '';
      const valStr = item.value !== null ? `${item.value} sats` : '';
      const edgeLabel = [valStr, txidShort].filter(Boolean).join(' | ');

      edges.push({
        id: `${item.parentAddress}-${item.address}-${item.txid || Math.random()}`,
        source: item.parentAddress,
        target: item.address,
        label: edgeLabel,
        data: { rawData: item },
        labelStyle: { fill: '#475569', fontSize: 10, fontWeight: 'bold' },
        labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#64748b'
        },
        style: { stroke: '#64748b', strokeWidth: 2 },
        animated: true,
      });
    }
  });

  return { nodes, edges };
}
