export interface TraceResultNode {
  address: string;
  depth: number;
  parentAddress: string | null;
  txid: string | null;
  value: number | null;
  entityLabel?: string;
  entityType?: string;
  isPotentialChange?: boolean;
}

export async function fetchTrace(address: string): Promise<TraceResultNode[]> {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/bitcoin/address/${address}/trace`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}
