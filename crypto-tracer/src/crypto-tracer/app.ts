import express from 'express';
import cors from 'cors';
import { validateBitcoinAddress, fetchBitcoinTransactions, BlockchainAPIError } from './blockchain/client.js';
import { recursiveTrace } from './tracing/service.js';

export const app = express();

app.use(cors());
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

app.get('/api/bitcoin/address/:address/trace', async (req, res) => {
  try {
    const address = req.params.address;
    
    const isValid = await validateBitcoinAddress(address);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid Bitcoin address' });
    }
    
    // Parse query params, fallback to defaults
    let maxDepth = 3;
    if (req.query.maxDepth) {
      const parsedDepth = parseInt(req.query.maxDepth as string, 10);
      if (!isNaN(parsedDepth)) {
        maxDepth = Math.max(1, Math.min(parsedDepth, 5)); // Clamp between 1 and 5
      }
    }

    let maxNodes = 15;
    if (req.query.maxNodes) {
      const parsedNodes = parseInt(req.query.maxNodes as string, 10);
      if (!isNaN(parsedNodes)) {
        maxNodes = Math.max(1, Math.min(parsedNodes, 50)); // Clamp between 1 and 50
      }
    }
    
    const traceResults = await recursiveTrace(address, maxDepth, maxNodes);
    res.json(traceResults);
  } catch (error) {
    if (error instanceof BlockchainAPIError) {
      return res.status(502).json({ error: 'Upstream blockchain API error' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

