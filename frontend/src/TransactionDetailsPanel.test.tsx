import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransactionDetailsPanel } from './TransactionDetailsPanel';
import type { TraceResultNode } from './TraceService';

describe('TransactionDetailsPanel', () => {
  const mockNodeData: TraceResultNode = {
    address: 'test_addr1',
    depth: 2,
    parentAddress: 'start_addr',
    txid: 'tx123',
    value: 5000,
    entityLabel: 'Binance',
    isPotentialChange: true
  };

  it('renders node details correctly', () => {
    const handleClose = vi.fn();
    render(<TransactionDetailsPanel data={mockNodeData} type="node" onClose={handleClose} />);
    
    expect(screen.getByText('Address Details')).toBeInTheDocument();
    expect(screen.getByText('test_addr1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('🏛️ Binance')).toBeInTheDocument();
    expect(screen.getByText('Potential Change Address')).toBeInTheDocument();
  });

  it('renders edge details correctly', () => {
    const handleClose = vi.fn();
    render(<TransactionDetailsPanel data={mockNodeData} type="edge" onClose={handleClose} />);
    
    expect(screen.getByText('Transaction Details')).toBeInTheDocument();
    expect(screen.getByText('tx123')).toBeInTheDocument();
    expect(screen.getByText('5000 sats')).toBeInTheDocument();
    expect(screen.getByText('start_addr')).toBeInTheDocument();
    expect(screen.getByText('test_addr1')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<TransactionDetailsPanel data={mockNodeData} type="node" onClose={handleClose} />);
    
    const closeButton = screen.getByRole('button', { name: 'Close details' });
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
