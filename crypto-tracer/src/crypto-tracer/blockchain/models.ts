export interface BitcoinTxInput {
  txid: string;
  vout: number;
  value: number;
  address: string | null;
}

export interface BitcoinTxOutput {
  value: number;
  address: string | null;
}

export interface NormalizedBitcoinTransaction {
  txid: string;
  inputs: BitcoinTxInput[];
  outputs: BitcoinTxOutput[];
  fee: number;
  confirmed: boolean;
  blockHeight: number | null;
  timestamp: number | null; // Unix timestamp
}
