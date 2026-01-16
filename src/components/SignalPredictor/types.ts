export interface SignalResult {
  pair: string;
  signal: string;
  strength: number;
  time: string;
  close: string;
  support: string;
  resistance: string;
}

export interface ScanState {
  isScanning: boolean;
  isCancelled: boolean;
  progress: number;
  processedPairs: number;
  totalPairs: number;
  status: string;
}
