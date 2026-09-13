import { useState } from 'react';
import './App.css';
import { fetchTrace, type TraceResultNode } from './TraceService';
import { TransactionGraph } from './TransactionGraph';
import { InvestigationSummary } from './InvestigationSummary';

function App() {
  const [address, setAddress] = useState('');
  const [maxDepth, setMaxDepth] = useState<number>(3);
  const [maxNodes, setMaxNodes] = useState<number>(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TraceResultNode[]>([]);
  const [candidate, setCandidate] = useState<string | null>(null);
  
  // Track active config for the summary panel
  const [activeConfig, setActiveConfig] = useState<{ depth: number, nodes: number } | null>(null);

  const handleTrace = async () => {
    if (!address.trim()) {
      setError('Please enter a valid Bitcoin address');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResults([]);
    setCandidate(null);
    setActiveConfig(null);

    try {
      const data = await fetchTrace(address.trim(), maxDepth, maxNodes);
      setResults(data);
      setActiveConfig({ depth: maxDepth, nodes: maxNodes });
      
      if (data.length > 0) {
        let bestScore = -1;
        let candidateNode = null;
        for (const node of data) {
          if (node.depth === 0) continue; // Start node cannot be the end candidate
          if (node.isPotentialChange) continue; // Penalize change addresses

          let score = node.depth * 1000;
          if (node.entityLabel) score += 10000; // Prioritize known entities

          if (score > bestScore) {
            bestScore = score;
            candidateNode = node;
          } else if (score === bestScore && candidateNode) {
            const val1 = node.value || 0;
            const val2 = candidateNode.value || 0;
            if (val1 > val2) {
              candidateNode = node;
            }
          }
        }
        if (candidateNode) {
          setCandidate(candidateNode.address);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during tracing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Crypto Forensics Tracer</h1>
      </header>
      
      <main>
        <div className="search-box" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Enter Bitcoin Address..." 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={loading}
            style={{ flexGrow: 1, minWidth: '300px' }}
          />
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="maxDepth" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Max Depth</label>
              <input 
                id="maxDepth"
                type="number" 
                min={1} 
                max={5} 
                value={maxDepth}
                onChange={(e) => setMaxDepth(parseInt(e.target.value) || 3)}
                disabled={loading}
                style={{ width: '80px', padding: '0.5rem' }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="maxNodes" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Max Fetched Addrs</label>
              <input 
                id="maxNodes"
                type="number" 
                min={1} 
                max={50} 
                value={maxNodes}
                onChange={(e) => setMaxNodes(parseInt(e.target.value) || 15)}
                disabled={loading}
                style={{ width: '90px', padding: '0.5rem' }}
              />
            </div>

            <button onClick={handleTrace} disabled={loading} style={{ height: 'fit-content', alignSelf: 'flex-end' }}>
              {loading ? 'Tracing...' : 'Trace Funds'}
            </button>
          </div>
        </div>

        {error && <div className="error-message" role="alert">{error}</div>}

        {results.length > 0 && (
          <div className="results-container">
            <InvestigationSummary data={results} candidateAddress={candidate} activeConfig={activeConfig} />
            
            <h2>Observed Transaction Flow</h2>
            <TransactionGraph data={results} candidateAddress={candidate} />
            
            <h2>Detailed Trace Data</h2>
            {candidate && (
              <div className="candidate-box">
                <strong>Candidate Endpoint:</strong> {candidate}
              </div>
            )}
            <table>
              <thead>
                <tr>
                  <th>Depth</th>
                  <th>Address</th>
                  <th>Label</th>
                  <th>Parent Address</th>
                  <th>TxID</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {results.map((node, i) => (
                  <tr key={i} className={node.address === candidate ? 'highlight' : ''}>
                    <td>{node.depth}</td>
                    <td>{node.address} {node.isPotentialChange ? '(Change)' : ''}</td>
                    <td>{node.entityLabel || '-'}</td>
                    <td>{node.parentAddress || '-'}</td>
                    <td>{node.txid ? `${node.txid.substring(0, 10)}...` : '-'}</td>
                    <td>{node.value !== null ? node.value : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
