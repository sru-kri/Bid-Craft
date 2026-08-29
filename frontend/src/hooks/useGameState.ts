import { useState, useCallback } from 'react';
import { 
  MarketEvent, 
  GameAction, 
  getRandomEvent, 
  calculateOutcome, 
  applyOutcome 
} from '@/lib/gameEvents';

export interface GameState {
  playerId: string | null;
  playerName: string;
  capital: number;
  round: number;
  isEliminated: boolean;
  currentEvent: MarketEvent | null;
  lastAction: GameAction | null;
  lastChange: number;
  history: GameHistoryEntry[];
}

export interface GameHistoryEntry {
  round: number;
  event: string;
  action: GameAction;
  capitalBefore: number;
  capitalAfter: number;
  change: number;
}

const INITIAL_CAPITAL = 100000;

export function useGameState() {
  const [state, setState] = useState<GameState>({
    playerId: null,
    playerName: '',
    capital: INITIAL_CAPITAL,
    round: 0,
    isEliminated: false,
    currentEvent: null,
    lastAction: null,
    lastChange: 0,
    history: [],
  });

  const setPlayerInfo = useCallback((id: string, name: string) => {
    setState(prev => ({
      ...prev,
      playerId: id,
      playerName: name,
    }));
  }, []);

  const startNewRound = useCallback(() => {
    const newEvent = getRandomEvent();
    setState(prev => ({
      ...prev,
      round: prev.round + 1,
      currentEvent: newEvent,
      lastAction: null,
      lastChange: 0,
    }));
    return newEvent;
  }, []);

  const makeDecision = useCallback((action: GameAction): { newCapital: number; change: number; percentChange: number } => {
    let result = { newCapital: state.capital, change: 0, percentChange: 0 };
    
    setState(prev => {
      if (!prev.currentEvent || prev.lastAction !== null) {
        return prev;
      }

      const percentChange = calculateOutcome(prev.currentEvent, action);
      const newCapital = applyOutcome(prev.capital, percentChange);
      const change = newCapital - prev.capital;
      const isEliminated = newCapital <= 0;

      result = { newCapital, change, percentChange };

      const historyEntry: GameHistoryEntry = {
        round: prev.round,
        event: prev.currentEvent.name,
        action,
        capitalBefore: prev.capital,
        capitalAfter: newCapital,
        change,
      };

      return {
        ...prev,
        capital: newCapital,
        isEliminated,
        lastAction: action,
        lastChange: change,
        history: [...prev.history, historyEntry],
      };
    });

    return result;
  }, [state.capital]);

  const resetGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      capital: INITIAL_CAPITAL,
      round: 0,
      isEliminated: false,
      currentEvent: null,
      lastAction: null,
      lastChange: 0,
      history: [],
    }));
  }, []);

  return {
    state,
    setPlayerInfo,
    startNewRound,
    makeDecision,
    resetGame,
  };
}
