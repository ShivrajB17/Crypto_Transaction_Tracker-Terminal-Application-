import React, { useMemo } from 'react';
import { ReactFlow, Controls, Background, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { TraceResultNode } from './TraceService';
import { buildGraphElements } from './graphBuilder';

interface TransactionGraphProps {
  data: TraceResultNode[];
  candidateAddress: string | null;
}

export const TransactionGraph: React.FC<TransactionGraphProps> = ({ data, candidateAddress }) => {
  const { nodes, edges } = useMemo(() => buildGraphElements(data, candidateAddress), [data, candidateAddress]);

  if (nodes.length === 0) {
    return null;
  }

  return (
    <div style={{ height: '500px', width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '2rem', backgroundColor: '#fafafa' }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
      </ReactFlow>
    </div>
  );
};
