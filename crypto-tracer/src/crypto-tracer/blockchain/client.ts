import { NormalizedBitcoinTransaction } from './models.js';

export class BlockchainAPIError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'BlockchainAPIError';
  }
}

const MEMPOOL_BASE_URL = 'https://mempool.space/api';

export async function validateBitcoinAddress(address: string): Promise<boolean> {
  try {
    const response = await fetch(`${MEMPOOL_BASE_URL}/v1/validate-address/${address}`);
    if (!response.ok) {
      throw new BlockchainAPIError(`Mempool API error: ${response.statusText}`, response.status);
    }
    const data = await response.json();
    return data.isvalid === true;
  } catch (error) {
    if (error instanceof BlockchainAPIError) throw error;
    throw new BlockchainAPIError(`Network error validating address: ${error}`, 502);
  }
}

export async function fetchBitcoinTransactions(address: string): Promise<NormalizedBitcoinTransaction[]> {
  try {
    const response = await fetch(`${MEMPOOL_BASE_URL}/address/${address}/txs`);
    if (!response.ok) {
      throw new BlockchainAPIError(`Mempool API error: ${response.statusText}`, response.status);
    }
    
    const rawTxs = await response.json();
    
    return rawTxs.map((tx: any) => {
      return {
        txid: tx.txid,
        inputs: tx.vin.map((vin: any) => ({
          txid: vin.txid,
          vout: vin.vout,
          value: vin.prevout?.value || 0,
          address: vin.prevout?.scriptpubkey_address || null
        })),
        outputs: tx.vout.map((vout: any) => ({
          value: vout.value,
          address: vout.scriptpubkey_address || null
        })),
        fee: tx.fee,
        confirmed: tx.status?.confirmed || false,
        blockHeight: tx.status?.block_height || null,
        timestamp: tx.status?.block_time || null,
      };
    });
  } catch (error) {
    if (error instanceof BlockchainAPIError) throw error;
    throw new BlockchainAPIError(`Network error fetching transactions: ${error}`, 502);
  }
}
