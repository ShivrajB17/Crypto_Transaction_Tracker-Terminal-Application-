import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InvestigationSummary } from './InvestigationSummary';
import type { TraceResultNode } from './TraceService';

describe('InvestigationSummary', () => {
  it('renders nothing when data is empty', () => {
    const { container } = render(<InvestigationSummary data={[]} candidateAddress={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('calculates summary statistics correctly', () => {
    const mockData: TraceResultNode[] = [
      { address: 'addr1', depth: 0, parentAddress: null, txid: null, value: null }, // Start node
      { address: 'addr2', depth: 1, parentAddress: 'addr1', txid: 'tx1', value: 100 },
      { address: 'addr3', depth: 2, parentAddress: 'addr2', txid: 'tx2', value: 90, entityLabel: 'Binance' }, // Known entity
      { address: 'addr4', depth: 1, parentAddress: 'addr1', txid: 'tx3', value: 10, isPotentialChange: true } // Change
    ];

    render(<InvestigationSummary data={mockData} candidateAddress="addr3" />);

    expect(screen.getByTestId('summary-addresses').textContent).toBe('4');
    expect(screen.getByTestId('summary-txs').textContent).toBe('3');
    expect(screen.getByTestId('summary-depth').textContent).toBe('2');
    expect(screen.getByTestId('summary-entities').textContent).toBe('1');
    expect(screen.getByTestId('summary-change').textContent).toBe('1');
    
    expect(screen.getByTestId('summary-candidate').textContent).toContain('addr3 (🏛️ Binance)');
  });

  it('handles no candidate gracefully', () => {
    const mockData: TraceResultNode[] = [
      { address: 'addr1', depth: 0, parentAddress: null, txid: null, value: null }
    ];

    render(<InvestigationSummary data={mockData} candidateAddress={null} />);
    expect(screen.getByTestId('summary-candidate').textContent).toContain('None identified');
  });
});
