// Market events and game logic for BIDCRAFT

export interface MarketEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: 'success' | 'danger' | 'warning' | 'info';
  outcomes: {
    BUY: { min: number; max: number; description: string };
    HOLD: { min: number; max: number; description: string };
    SELL: { min: number; max: number; description: string };
  };
}

export const MARKET_EVENTS: MarketEvent[] = [
  {
    id: 'bull_run',
    name: 'Bull Run',
    description: 'Markets are surging! Stocks hitting all-time highs.',
    icon: '📈',
    color: 'success',
    outcomes: {
      BUY: { min: 15, max: 35, description: 'Massive gains!' },
      HOLD: { min: 5, max: 15, description: 'Steady growth' },
      SELL: { min: -20, max: -5, description: 'Missed the rally!' },
    },
  },
  {
    id: 'market_crash',
    name: 'Market Crash',
    description: 'Panic selling! Markets in freefall.',
    icon: '📉',
    color: 'danger',
    outcomes: {
      BUY: { min: -40, max: -20, description: 'Caught the falling knife!' },
      HOLD: { min: -25, max: -10, description: 'Portfolio bleeding' },
      SELL: { min: 5, max: 15, description: 'Smart exit!' },
    },
  },
  {
    id: 'insider_tip',
    name: 'Insider Tip',
    description: 'You received suspicious information...',
    icon: '🤫',
    color: 'warning',
    outcomes: {
      BUY: { min: -30, max: 50, description: 'High risk, high reward!' },
      HOLD: { min: -5, max: 5, description: 'Played it safe' },
      SELL: { min: -15, max: 20, description: 'Uncertain outcome' },
    },
  },
  {
    id: 'interest_hike',
    name: 'Interest Rate Hike',
    description: 'Central bank raises rates. Economic pressure mounting.',
    icon: '🏦',
    color: 'warning',
    outcomes: {
      BUY: { min: -20, max: -5, description: 'Bad timing!' },
      HOLD: { min: -10, max: 0, description: 'Weathered the storm' },
      SELL: { min: 5, max: 20, description: 'Perfect exit!' },
    },
  },
  {
    id: 'fake_news',
    name: 'Fake News',
    description: 'Markets in chaos! What\'s real anymore?',
    icon: '📰',
    color: 'danger',
    outcomes: {
      BUY: { min: -25, max: 25, description: 'Pure chaos!' },
      HOLD: { min: -15, max: 15, description: 'Confusion reigns' },
      SELL: { min: -20, max: 20, description: 'Random outcome!' },
    },
  },
  {
    id: 'tech_boom',
    name: 'Tech Boom',
    description: 'AI revolution! Tech stocks exploding.',
    icon: '🚀',
    color: 'success',
    outcomes: {
      BUY: { min: 20, max: 45, description: 'Massive tech gains!' },
      HOLD: { min: 10, max: 20, description: 'Solid returns' },
      SELL: { min: -25, max: -10, description: 'Missed the rocket!' },
    },
  },
  {
    id: 'recession_fears',
    name: 'Recession Fears',
    description: 'Economic indicators flashing red.',
    icon: '⚠️',
    color: 'danger',
    outcomes: {
      BUY: { min: -30, max: -10, description: 'Caught in downturn' },
      HOLD: { min: -15, max: -5, description: 'Portfolio suffering' },
      SELL: { min: 10, max: 25, description: 'Escaped in time!' },
    },
  },
  {
    id: 'merger_rumors',
    name: 'Merger Rumors',
    description: 'Big acquisition talks in the air.',
    icon: '🤝',
    color: 'info',
    outcomes: {
      BUY: { min: -10, max: 40, description: 'Risky bet!' },
      HOLD: { min: -5, max: 10, description: 'Wait and see' },
      SELL: { min: -20, max: 15, description: 'Mixed signals' },
    },
  },
];

export type GameAction = 'BUY' | 'HOLD' | 'SELL';

export function getRandomEvent(): MarketEvent {
  return MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)];
}

export function calculateOutcome(event: MarketEvent, action: GameAction): number {
  const outcome = event.outcomes[action];
  const range = outcome.max - outcome.min;
  const percentChange = outcome.min + Math.random() * range;
  return Math.round(percentChange);
}

export function applyOutcome(capital: number, percentChange: number): number {
  const change = Math.round(capital * (percentChange / 100));
  return capital + change;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
