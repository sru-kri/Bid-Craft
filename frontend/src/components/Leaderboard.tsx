import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/gameEvents';
import { motion } from 'framer-motion';

interface Player {
  _id: string;
  name: string;
  capital: number;
  is_eliminated: boolean;
  last_action: string | null;
}

interface LeaderboardProps {
  players: Player[];
  currentPlayerId?: string | null;
}

export function Leaderboard({
  players,
  currentPlayerId,
}: LeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => {
    // Active players first
    if (a.is_eliminated && !b.is_eliminated) return 1;
    if (!a.is_eliminated && b.is_eliminated) return -1;

    // Then sort by capital
    return b.capital - a.capital;
  });

  return (
    <div className="glass-card p-4 md:p-6">
      <h3 className="font-display font-bold text-lg mb-4 text-foreground flex items-center gap-2">
        🏆 <span>Leaderboard</span>
      </h3>

      <div className="space-y-2">
        {sortedPlayers.map((player, index) => {
          const isCurrentPlayer =
            String(player._id) === String(currentPlayerId);

          return (
            <motion.div
              key={player._id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg',
                isCurrentPlayer
                  ? 'bg-primary/20 border border-primary/30'
                  : 'bg-muted/30',
                player.is_eliminated && 'opacity-50'
              )}
            >
              <div className="flex items-center gap-3">
                {/* Rank */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm',
                    index === 0 && !player.is_eliminated
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900'
                      : index === 1 && !player.is_eliminated
                      ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-800'
                      : index === 2 && !player.is_eliminated
                      ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {player.is_eliminated ? '💀' : index + 1}
                </div>

                {/* Name */}
                <div>
                  <p
                    className={cn(
                      'font-semibold text-sm',
                      isCurrentPlayer
                        ? 'text-primary'
                        : 'text-foreground'
                    )}
                  >
                    {player.name}

                    {isCurrentPlayer && ' (You)'}
                  </p>

                  {player.last_action && (
                    <p className="text-xs text-muted-foreground">
                      Last: {player.last_action}
                    </p>
                  )}
                </div>
              </div>

              {/* Capital */}
              <p
                className={cn(
                  'font-display font-bold text-sm',
                  player.is_eliminated
                    ? 'text-destructive'
                    : player.capital >= 100000
                    ? 'text-success'
                    : 'text-foreground'
                )}
              >
                {formatCurrency(player.capital)}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}