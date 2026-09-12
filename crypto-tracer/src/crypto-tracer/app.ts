import express from 'express';
import { validateBitcoinAddress, fetchBitcoinTransactions, BlockchainAPIError } from './blockchain/client.js';

export const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});


app.get('/api/test', (req, res) => {
  res.json({ message: 'Crypto Forensics Tracer API is working' });
});

app.get('/api/bitcoin/address/:address/transactions', async (req, res) => {
  try {
    const address = req.params.address;
    
    const isValid = await validateBitcoinAddress(address);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid Bitcoin address' });
    }
    
    const transactions = await fetchBitcoinTransactions(address);
    res.json(transactions);
  } catch (error) {
    if (error instanceof BlockchainAPIError) {
      return res.status(502).json({ error: 'Upstream blockchain API error' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});
