import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
import * as TraceService from './TraceService';

vi.mock('./TraceService', () => ({
  fetchTrace: vi.fn()
}));

describe('App', () => {
  it('shows error for empty input', async () => {
    render(<App />);
    const button = screen.getByText('Trace Funds');
    fireEvent.click(button);
    expect(await screen.findByText('Please enter a valid Bitcoin address')).toBeInTheDocument();
  });

  it('shows loading state and results table', async () => {
    (TraceService.fetchTrace as any).mockResolvedValue([
      { address: 'addr1', depth: 0, parentAddress: null, txid: null, value: null },
      { address: 'addr2', depth: 1, parentAddress: 'addr1', txid: 'tx1', value: 100 }
    ]);

    render(<App />);
    const input = screen.getByPlaceholderText('Enter Bitcoin Address...');
    const button = screen.getByText('Trace Funds');

    fireEvent.change(input, { target: { value: 'addr1' } });
    fireEvent.click(button);

    expect(screen.getByText('Tracing...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Candidate End Wallet:')).toBeInTheDocument();
    });

    expect(screen.getAllByText('addr2').length).toBeGreaterThan(0);
  });

  it('shows error message from API', async () => {
    (TraceService.fetchTrace as any).mockRejectedValue(new Error('Upstream API failed'));

    render(<App />);
    const input = screen.getByPlaceholderText('Enter Bitcoin Address...');
    const button = screen.getByText('Trace Funds');

    fireEvent.change(input, { target: { value: 'addr1' } });
    fireEvent.click(button);

    expect(await screen.findByText('Upstream API failed')).toBeInTheDocument();
  });
});
