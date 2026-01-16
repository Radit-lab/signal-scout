import { useState, useRef, useCallback } from 'react';
import { SignalResult, ScanState } from './types';
import { TRADING_PAIRS, BATCH_SIZE } from './constants';

interface Candle {
  open: string;
  close: string;
  color: string;
}

export function useSignalScanner() {
  const [scanState, setScanState] = useState<ScanState>({
    isScanning: false,
    isCancelled: false,
    progress: 0,
    processedPairs: 0,
    totalPairs: TRADING_PAIRS.length,
    status: 'Ready',
  });
  const [bestSignal, setBestSignal] = useState<SignalResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const cancelledRef = useRef(false);

  const processPair = async (pair: string, predictedTime: string): Promise<SignalResult | 'error' | null> => {
    try {
      const targetUrl = `http://103.42.5.134:8000/candles/last?asset=${pair}&count=199`;
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
      
      const res = await fetch(proxyUrl);
      if (!res.ok) return 'error';
      
      const proxyData = await res.json();
      const candles: Candle[] = JSON.parse(proxyData.contents);

      if (!Array.isArray(candles) || candles.length < 15) return null;

      const last15 = candles.slice(-15);
      const last = last15[last15.length - 1];
      const closes = last15.map(c => parseFloat(c.close));

      let callCount = 0, putCount = 0;
      last15.forEach(c => {
        if (c.color === 'green') callCount++;
        else if (c.color === 'red') putCount++;
      });

      const trend = callCount >= 10 ? 'CALL' : (putCount >= 10 ? 'PUT' : null);
      
      const last3 = last15.slice(-3);
      const last3same = last3.every(c => c.color === 'green') ? 'CALL' : 
                        last3.every(c => c.color === 'red') ? 'PUT' : null;

      const bodySignal = Math.abs(parseFloat(last.close) - parseFloat(last.open)) > 
                        Math.abs(parseFloat(last15[last15.length-2].close) - parseFloat(last15[last15.length-2].open)) ? 
                        (last.color === 'green' ? 'CALL' : 'PUT') : null;

      const signals = [trend, last3same, bodySignal].filter(Boolean);
      const callVotes = signals.filter(s => s === 'CALL').length;
      const putVotes = signals.filter(s => s === 'PUT').length;

      let signal: string | null = null;
      let strength = 0;

      if (callVotes >= 2) {
        signal = 'CALL ⬆️';
        strength = callVotes;
      } else if (putVotes >= 2) {
        signal = 'PUT ⬇️';
        strength = putVotes;
      }

      if (signal && strength >= 2) {
        return {
          pair,
          signal,
          strength,
          time: predictedTime,
          close: last.close,
          support: Math.min(...closes).toFixed(5),
          resistance: Math.max(...closes).toFixed(5)
        };
      }
    } catch (e) {
      console.error(`Error processing ${pair}:`, e);
      return 'error';
    }
    return null;
  };

  const runScan = useCallback(async () => {
    cancelledRef.current = false;
    setBestSignal(null);
    setError(null);
    
    setScanState({
      isScanning: true,
      isCancelled: false,
      progress: 0,
      processedPairs: 0,
      totalPairs: TRADING_PAIRS.length,
      status: 'Scanning...',
    });

    const now = new Date();
    const future = new Date(now.getTime() + 60000);
    const hh = String(future.getHours()).padStart(2, '0');
    const mm = String(future.getMinutes()).padStart(2, '0');
    const predictedTime = `${hh}:${mm}`;

    let currentBest: SignalResult | null = null;
    let processedPairs = 0;
    let failedCount = 0;

    for (let i = 0; i < TRADING_PAIRS.length; i += BATCH_SIZE) {
      if (cancelledRef.current) {
        setScanState(prev => ({
          ...prev,
          isScanning: false,
          isCancelled: true,
          status: 'Cancelled',
        }));
        return;
      }

      const batch = TRADING_PAIRS.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(pair => processPair(pair, predictedTime));
      
      try {
        const results = await Promise.all(batchPromises);
        for (const result of results) {
          if (result === 'error') failedCount++;
          if (result && result !== 'error' && result.signal) {
            if (!currentBest || result.strength > currentBest.strength) {
              currentBest = result;
            }
          }
        }
        
        processedPairs += batch.length;
        const percent = Math.min(Math.round((processedPairs / TRADING_PAIRS.length) * 100), 100);
        
        setScanState(prev => ({
          ...prev,
          progress: percent,
          processedPairs,
          status: `Processing ${processedPairs}/${TRADING_PAIRS.length}`,
        }));
        
      } catch (e) {
        console.error('Batch error:', e);
      }
    }

    if (!cancelledRef.current) {
      setBestSignal(currentBest);
      setScanState(prev => ({
        ...prev,
        isScanning: false,
        progress: 100,
        processedPairs: TRADING_PAIRS.length,
        status: currentBest ? 'Scan Complete' : 'No Signal Found',
      }));
    }
  }, []);

  const cancelScan = useCallback(() => {
    cancelledRef.current = true;
    setScanState(prev => ({
      ...prev,
      status: 'Cancelling...',
    }));
  }, []);

  return {
    scanState,
    bestSignal,
    error,
    runScan,
    cancelScan,
  };
}
