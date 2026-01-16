import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, Target, Shield } from 'lucide-react';
import { SignalResult } from './types';

interface SignalCardProps {
  signal: SignalResult;
}

export function SignalCard({ signal }: SignalCardProps) {
  const isCall = signal.signal.includes('CALL');
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass-card p-6 relative overflow-hidden"
    >
      {/* Glow effect */}
      <div 
        className={`absolute inset-0 opacity-10 ${isCall ? 'bg-success' : 'bg-destructive'}`}
        style={{
          background: `radial-gradient(circle at 50% 0%, ${isCall ? 'hsl(142, 76%, 45%)' : 'hsl(0, 84%, 60%)'} 0%, transparent 60%)`,
        }}
      />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isCall ? 'bg-success/20' : 'bg-destructive/20'}`}>
              {isCall ? (
                <TrendingUp className="w-6 h-6 text-success" />
              ) : (
                <TrendingDown className="w-6 h-6 text-destructive" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">{signal.pair}</h3>
              <p className="text-sm text-muted-foreground">Strongest Signal</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full font-bold text-sm ${
            isCall 
              ? 'bg-success/20 text-success border border-success/30' 
              : 'bg-destructive/20 text-destructive border border-destructive/30'
          }`}>
            {signal.signal}
          </div>
        </div>

        {/* Strength indicator */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">Signal Strength</span>
            <span className="text-sm font-mono text-primary">{signal.strength}/3</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((level) => (
              <div
                key={level}
                className={`h-2 flex-1 rounded-full transition-all ${
                  level <= signal.strength
                    ? isCall ? 'bg-success' : 'bg-destructive'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Entry Time</span>
            </div>
            <p className="text-lg font-mono font-bold">{signal.time}</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Last Close</span>
            </div>
            <p className="text-lg font-mono font-bold">{parseFloat(signal.close).toFixed(5)}</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Support</span>
            </div>
            <p className="text-lg font-mono font-bold text-success">{signal.support}</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Resistance</span>
            </div>
            <p className="text-lg font-mono font-bold text-destructive">{signal.resistance}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
