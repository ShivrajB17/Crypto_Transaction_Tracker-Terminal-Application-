import React from 'react';
import type { TraceResultNode } from './TraceService';

interface TransactionDetailsPanelProps {
  data: TraceResultNode;
  type: 'node' | 'edge';
  onClose: () => void;
}

export const TransactionDetailsPanel: React.FC<TransactionDetailsPanelProps> = ({ data, type, onClose }) => {
  return (
    <div style={{
      width: '320px',
      borderLeft: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-4px 0 15px rgba(0,0,0,0.05)',
      zIndex: 10,
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '1rem',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>
          {type === 'node' ? 'Address Details' : 'Transaction Details'}
        </h3>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.25rem',
            color: '#64748b',
            padding: '4px',
            lineHeight: 1
          }}
          aria-label="Close details"
        >
          &times;
        </button>
      </div>
      
      <div style={{ padding: '1rem', overflowY: 'auto', flexGrow: 1 }}>
        {type === 'node' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <DetailItem label="Address" value={data.address} copyable />
            <DetailItem label="Depth from Start" value={data.depth.toString()} />
            
            {data.entityLabel && (
              <DetailItem label="Known Entity" value={`🏛️ ${data.entityLabel}`} />
            )}
            
            {data.isPotentialChange && (
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px dashed #94a3b8',
                padding: '0.75rem',
                borderRadius: '6px',
                marginTop: '0.5rem'
              }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Potential Change Address</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>This address exhibits heuristic patterns typical of a change output (e.g., self-change or receiving &gt;90% of funds).</span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <DetailItem label="Transaction ID" value={data.txid || 'Unknown'} copyable />
            <DetailItem label="Value Transferred" value={data.value !== null ? `${data.value} sats` : 'Unknown'} />
            <DetailItem label="Source Address" value={data.parentAddress || 'Unknown'} copyable />
            <DetailItem label="Target Address" value={data.address} copyable />
          </div>
        )}
      </div>
    </div>
  );
};

const DetailItem: React.FC<{ label: string, value: string, copyable?: boolean }> = ({ label, value, copyable }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', color: '#0f172a', wordBreak: 'break-all', fontFamily: 'monospace' }}>
          {value}
        </span>
        {copyable && (
          <button 
            onClick={handleCopy}
            title="Copy to clipboard"
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              padding: '2px 6px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              color: '#475569',
              flexShrink: 0
            }}
          >
            Copy
          </button>
        )}
      </div>
    </div>
  );
};
