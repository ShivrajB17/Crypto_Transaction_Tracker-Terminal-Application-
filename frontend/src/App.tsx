import { useState } from 'react';
import './App.css';
import { fetchTrace, type TraceResultNode } from './TraceService';
import { TransactionGraph } from './TransactionGraph';
import { InvestigationSummary } from './InvestigationSummary';

function App() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TraceResultNode[]>([]);
  const [candidate, setCandidate] = useState<string | null>(null);

  const handleTrace = async () => {
    if (!address.trim()) {
      setError('Please enter a valid Bitcoin address');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResults([]);
    setCandidate(null);

    try {
      const data = await fetchTrace(address.trim());
      setResults(data);
      
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
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Enter Bitcoin Address..." 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={loading}
          />
          <button onClick={handleTrace} disabled={loading}>
            {loading ? 'Tracing...' : 'Trace Funds'}
          </button>
        </div>

        {error && <div className="error-message" role="alert">{error}</div>}

        {results.length > 0 && (
          <div className="results-container">
            <InvestigationSummary data={results} candidateAddress={candidate} />
            
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
