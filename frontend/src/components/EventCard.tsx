import { cn } from '@/lib/utils';
import { MarketEvent, GameAction } from '@/lib/gameEvents';
import { motion, AnimatePresence } from 'framer-motion';

interface EventCardProps {
  event: MarketEvent;
  onAction?: (action: GameAction) => void;
  disabled?: boolean;
  selectedAction?: GameAction | null;
  result?: { change: number; percentChange: number } | null;
}

const colorMap = {
  success: 'border-success/50 bg-success/10',
  danger: 'border-destructive/50 bg-destructive/10',
  warning: 'border-warning/50 bg-warning/10',
  info: 'border-secondary/50 bg-secondary/10',
};

const iconBgMap = {
  success: 'bg-success/20',
  danger: 'bg-destructive/20',
  warning: 'bg-warning/20',
  info: 'bg-secondary/20',
};

export function EventCard({ event, onAction, disabled, selectedAction, result }: EventCardProps) {
  const actions: GameAction[] = ['BUY', 'HOLD', 'SELL'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'glass-card p-6 md:p-8 w-full max-w-lg mx-auto border-2',
        colorMap[event.color]
      )}
    >
      {/* Event Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className={cn('text-4xl p-3 rounded-xl', iconBgMap[event.color])}>
          {event.icon}
        </div>
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
            {event.name}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            {event.description}
          </p>
        </div>
      </div>

      {/* Result Display */}
      <AnimatePresence>
        {result && selectedAction && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div
              className={cn(
                'rounded-xl p-4 text-center',
                result.change >= 0
                  ? 'bg-success/20 border border-success/30'
                  : 'bg-destructive/20 border border-destructive/30'
              )}
            >
              <p className="text-sm text-muted-foreground mb-1">
                {event.outcomes[selectedAction].description}
              </p>
              <p
                className={cn(
                  'font-display text-2xl font-bold',
                  result.change >= 0 ? 'text-success' : 'text-destructive'
                )}
              >
                {result.change >= 0 ? '+' : ''}
                {result.percentChange.toFixed(1)}%
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action) => (
          <button
            key={action}
            onClick={() => onAction?.(action)}
            disabled={disabled || selectedAction !== null}
            className={cn(
              'relative py-4 px-2 rounded-xl font-display font-bold text-sm md:text-base transition-all duration-200',
              'border-2 backdrop-blur-sm',
              selectedAction === action
                ? action === 'BUY'
                  ? 'bg-success/30 border-success text-success'
                  : action === 'SELL'
                  ? 'bg-destructive/30 border-destructive text-destructive'
                  : 'bg-warning/30 border-warning text-warning'
                : 'bg-muted/30 border-border hover:border-primary/50 text-foreground hover:bg-muted/50',
              (disabled || selectedAction !== null) && 'opacity-60 cursor-not-allowed'
            )}
          >
            {action}
            <span className="block text-xs font-body font-normal text-muted-foreground mt-1">
              {action === 'BUY' && 'B / 1'}
              {action === 'HOLD' && 'H / 2'}
              {action === 'SELL' && 'S / 3'}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
