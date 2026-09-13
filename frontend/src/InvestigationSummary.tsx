import React from 'react';
import type { TraceResultNode } from './TraceService';

interface InvestigationSummaryProps {
  data: TraceResultNode[];
  candidateAddress: string | null;
  activeConfig?: { depth: number, nodes: number } | null;
}

export const InvestigationSummary: React.FC<InvestigationSummaryProps> = ({ data, candidateAddress, activeConfig }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const uniqueAddresses = data.length;
  const transactionsFound = data.filter(n => n.txid !== null).length;
  const maxDepth = Math.max(...data.map(n => n.depth), 0);
  const knownEntities = data.filter(n => !!n.entityLabel).length;
  const potentialChange = data.filter(n => !!n.isPotentialChange).length;

  const candidateNode = data.find(n => n.address === candidateAddress);
  
  let candidateDisplay = 'None identified';
  if (candidateNode) {
    candidateDisplay = candidateNode.address;
    if (candidateNode.entityLabel) {
      candidateDisplay += ` (🏛️ ${candidateNode.entityLabel})`;
    }
  }

  return (
    <div 
      data-testid="investigation-summary"
      style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.125rem' }}>
          Investigation Summary
        </h3>
        
        {activeConfig && (
          <div style={{ display: 'flex', gap: '0.75rem', backgroundColor: '#e2e8f0', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
            <span>Config: Depth {activeConfig.depth}</span>
            <span>|</span>
            <span>Max Fetches {activeConfig.nodes}</span>
          </div>
        )}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Addresses Discovered</span>
          <span style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 600 }} data-testid="summary-addresses">{uniqueAddresses}</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Transactions Found</span>
          <span style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 600 }} data-testid="summary-txs">{transactionsFound}</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Max Depth Reached</span>
          <span style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 600 }} data-testid="summary-depth">{maxDepth}</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Known Entities</span>
          <span style={{ fontSize: '1.25rem', color: '#3b82f6', fontWeight: 600 }} data-testid="summary-entities">{knownEntities}</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Potential Change</span>
          <span style={{ fontSize: '1.25rem', color: '#94a3b8', fontWeight: 600 }} data-testid="summary-change">{potentialChange}</span>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
        <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
          Candidate Endpoint
        </span>
        <span style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 500, wordBreak: 'break-all' }} data-testid="summary-candidate">
          {candidateDisplay}
        </span>
      </div>
    </div>
  );
};
