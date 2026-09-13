import React, { useMemo, useState, useCallback } from 'react';
import { ReactFlow, Controls, Background, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { TraceResultNode } from './TraceService';
import { buildGraphElements } from './graphBuilder';
import { TransactionDetailsPanel } from './TransactionDetailsPanel';

interface TransactionGraphProps {
  data: TraceResultNode[];
  candidateAddress: string | null;
}

export const TransactionGraph: React.FC<TransactionGraphProps> = ({ data, candidateAddress }) => {
  const { nodes, edges } = useMemo(() => buildGraphElements(data, candidateAddress), [data, candidateAddress]);
  
  const [selectedElement, setSelectedElement] = useState<TraceResultNode | null>(null);
  const [elementType, setElementType] = useState<'node' | 'edge' | null>(null);

  const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    setSelectedElement(node.data.rawData);
    setElementType('node');
  }, []);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: any) => {
    setSelectedElement(edge.data.rawData);
    setElementType('edge');
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedElement(null);
    setElementType(null);
  }, []);

  if (nodes.length === 0) {
    return null;
  }

  return (
    <div style={{ 
      display: 'flex',
      height: '500px', 
      width: '100%', 
      border: '1px solid #e2e8f0', 
      borderRadius: '8px', 
      marginBottom: '2rem', 
      backgroundColor: '#fafafa',
      overflow: 'hidden'
    }}>
      <div style={{ flexGrow: 1, position: 'relative' }}>
        <ReactFlow 
          nodes={nodes} 
          edges={edges}
          fitView
          attributionPosition="bottom-left"
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
        >
          <Background />
          <Controls />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
        </ReactFlow>
      </div>
      
      {selectedElement && elementType && (
        <TransactionDetailsPanel 
          data={selectedElement} 
          type={elementType} 
          onClose={() => {
            setSelectedElement(null);
            setElementType(null);
          }} 
        />
      )}
    </div>
  );
};
