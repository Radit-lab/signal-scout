import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Activity, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiveClock } from './LiveClock';
import { ProgressBar } from './ProgressBar';
import { SignalCard } from './SignalCard';
import { useSignalScanner } from './useSignalScanner';
import { TRADING_PAIRS } from './constants';

export function SignalPredictor() {
  const { scanState, bestSignal, error, runScan, cancelScan } = useSignalScanner();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="glass-card p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/30 mb-4"
            >
              <Activity className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Signal Predictor
            </h1>
            <p className="text-muted-foreground text-sm">
              Analyzing <span className="text-primary font-semibold">{TRADING_PAIRS.length}</span> pairs for 1-minute signals
            </p>
          </div>

          {/* Live Clock */}
          <div className="flex justify-center mb-8">
            <LiveClock />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-8">
            <AnimatePresence mode="wait">
              {!scanState.isScanning ? (
                <motion.div
                  key="scan"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex-1"
                >
                  <Button
                    onClick={runScan}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-blue-500 hover:opacity-90 transition-opacity"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Scan All Pairs
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="cancel"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex-1"
                >
                  <Button
                    onClick={cancelScan}
                    variant="destructive"
                    className="w-full h-12 text-base font-semibold"
                    disabled={scanState.status === 'Cancelling...'}
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel Scan
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <ProgressBar progress={scanState.progress} status={scanState.status} />
          </div>

          {/* Results Section */}
          <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Strongest Signal
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {scanState.isScanning && !bestSignal ? (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-8"
                >
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary pulse-dot" />
                    <span className="italic">Scanning all pairs...</span>
                  </div>
                </motion.div>
              ) : scanState.isCancelled ? (
                <motion.div
                  key="cancelled"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-8"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <X className="w-5 h-5" />
                    <span>Scan cancelled by user</span>
                  </div>
                </motion.div>
              ) : bestSignal ? (
                <SignalCard key="result" signal={bestSignal} />
              ) : scanState.progress === 100 ? (
                <motion.div
                  key="no-signal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-8"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertTriangle className="w-5 h-5" />
                    <span>No strong signal found right now</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="awaiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-8"
                >
                  <span className="text-muted-foreground italic">Awaiting scan...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-center"
              >
                <p className="text-destructive text-sm font-medium flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Multi-pair signal analysis • 1-minute timeframe
        </p>
      </motion.div>
    </div>
  );
}
