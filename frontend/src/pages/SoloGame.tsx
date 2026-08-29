import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ParticleBackground } from '@/components/ParticleBackground';
import { PlayerStats } from '@/components/PlayerStats';
import { EventCard } from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { useGameState } from '@/hooks/useGameState';
import { GameAction } from '@/lib/gameEvents';
import { motion, AnimatePresence } from 'framer-motion';

export default function SoloGame() {
  const navigate = useNavigate();
  const { state, setPlayerInfo, startNewRound, makeDecision, resetGame } = useGameState();
  const [result, setResult] = useState<{ change: number; percentChange: number } | null>(null);
  const [showNextRound, setShowNextRound] = useState(false);

  // Initialize player
  useEffect(() => {
    const savedName = localStorage.getItem('bidcraft_player');
    if (!savedName) {
      navigate('/');
      return;
    }
    setPlayerInfo(Date.now().toString(), savedName);
  }, [navigate, setPlayerInfo]);

  // Start first round when player is set
  useEffect(() => {
    if (state.playerName && state.round === 0) {
      startNewRound();
    }
  }, [state.playerName, state.round, startNewRound]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.isEliminated) return;

      const key = e.key.toLowerCase();
      
      if (state.lastAction === null && state.currentEvent) {
        if (key === 'b' || key === '1') handleAction('BUY');
        if (key === 'h' || key === '2') handleAction('HOLD');
        if (key === 's' || key === '3') handleAction('SELL');
      }
      
      if (key === 'enter' && showNextRound) {
        handleNextRound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.lastAction, state.currentEvent, state.isEliminated, showNextRound]);

  const handleAction = useCallback((action: GameAction) => {
    if (state.lastAction !== null) return;
    
    const outcome = makeDecision(action);
    setResult({ change: outcome.change, percentChange: outcome.percentChange });
    setShowNextRound(true);
  }, [state.lastAction, makeDecision]);

  const handleNextRound = useCallback(() => {
    setResult(null);
    setShowNextRound(false);
    startNewRound();
  }, [startNewRound]);

  const handlePlayAgain = useCallback(() => {
    resetGame();
    setResult(null);
    setShowNextRound(false);
    startNewRound();
  }, [resetGame, startNewRound]);

  if (!state.playerName) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 min-h-screen flex flex-col p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back
          </Button>
          <h1 className="font-display text-xl font-bold">
            <span className="text-gradient-blue">BID</span>
            <span className="text-gradient-orange">CRAFT</span>
          </h1>
          <div className="w-16" />
        </div>

        {/* Player Stats */}
        <div className="mb-6">
          <PlayerStats
            name={state.playerName}
            capital={state.capital}
            round={state.round}
            lastChange={state.lastChange}
            isEliminated={state.isEliminated}
          />
        </div>

        {/* Game Area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {state.isEliminated ? (
              <motion.div
                key="eliminated"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card p-8 text-center max-w-md"
              >
                <div className="text-6xl mb-4">💀</div>
                <h2 className="font-display text-2xl font-bold text-destructive mb-2">
                  GAME OVER
                </h2>
                <p className="text-muted-foreground mb-6">
                  You survived {state.round} rounds before your capital hit zero.
                </p>
                <Button
                  onClick={handlePlayAgain}
                  className="btn-primary-glow text-primary-foreground font-display font-bold"
                >
                  PLAY AGAIN
                </Button>
              </motion.div>
            ) : state.currentEvent ? (
              <EventCard
                key={state.round}
                event={state.currentEvent}
                onAction={handleAction}
                disabled={state.lastAction !== null}
                selectedAction={state.lastAction}
                result={result}
              />
            ) : null}
          </AnimatePresence>

          {/* Next Round Button */}
          <AnimatePresence>
            {showNextRound && !state.isEliminated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6"
              >
                <Button
                  onClick={handleNextRound}
                  className="btn-secondary-glow text-secondary-foreground font-display font-bold px-8 py-6"
                >
                  NEXT ROUND →
                  <span className="ml-2 text-xs opacity-70">(Enter)</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Game History */}
        {state.history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            <h3 className="font-display text-sm text-muted-foreground mb-3">Recent History</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {state.history.slice(-5).reverse().map((entry, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 glass-card p-3 text-xs min-w-[120px]"
                >
                  <p className="font-display text-muted-foreground">R{entry.round}</p>
                  <p className="font-semibold text-foreground">{entry.event}</p>
                  <p className={entry.change >= 0 ? 'text-success' : 'text-destructive'}>
                    {entry.action}: {entry.change >= 0 ? '+' : ''}{entry.change.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
