import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/gameEvents';
import { motion } from 'framer-motion';

interface PlayerStatsProps {
  name: string;
  capital: number;
  round: number;
  lastChange?: number;
  isEliminated?: boolean;
}

export function PlayerStats({ name, capital, round, lastChange, isEliminated }: PlayerStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'glass-card p-4 md:p-6 w-full',
        isEliminated && 'border-destructive/50 bg-destructive/10'
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Player Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="font-display font-bold text-primary-foreground text-lg">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">Investor</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          {/* Round */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Round</p>
            <p className="font-display text-xl font-bold text-secondary">{round}</p>
          </div>

          {/* Capital */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Capital</p>
            <div className="flex items-center gap-2">
              <motion.p
                key={capital}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className={cn(
                  'font-display text-xl md:text-2xl font-bold',
                  isEliminated
                    ? 'text-destructive'
                    : capital >= 100000
                    ? 'text-success'
                    : 'text-primary'
                )}
              >
                {formatCurrency(capital)}
              </motion.p>
              {lastChange !== undefined && lastChange !== 0 && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    'text-sm font-semibold',
                    lastChange > 0 ? 'text-success' : 'text-destructive'
                  )}
                >
                  {lastChange > 0 ? '+' : ''}
                  {formatCurrency(lastChange)}
                </motion.span>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEliminated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 rounded-lg bg-destructive/20 border border-destructive/30 text-center"
        >
          <p className="font-display font-bold text-destructive">💀 ELIMINATED</p>
          <p className="text-sm text-muted-foreground">Your capital hit zero. Game over!</p>
        </motion.div>
      )}
    </motion.div>
  );
}
