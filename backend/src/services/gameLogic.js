const MARKET_EVENTS = [
  {
    id: "bull_run",
    name: "Bull Run",
    description: "Markets are surging! Stocks hitting all-time highs.",
    icon: "📈",
    color: "success",
    outcomes: {
      BUY: { min: 15, max: 35 },
      HOLD: { min: 5, max: 15 },
      SELL: { min: -20, max: -5 },
    },
  },
  {
    id: "market_crash",
    name: "Market Crash",
    description: "Panic selling! Markets in freefall.",
    icon: "📉",
    color: "danger",
    outcomes: {
      BUY: { min: -40, max: -20 },
      HOLD: { min: -25, max: -10 },
      SELL: { min: 5, max: 15 },
    },
  },
  {
    id: "insider_tip",
    name: "Insider Tip",
    description: "You received suspicious information...",
    icon: "🤫",
    color: "warning",
    outcomes: {
      BUY: { min: -30, max: 50 },
      HOLD: { min: -5, max: 5 },
      SELL: { min: -15, max: 20 },
    },
  },
  {
    id: "interest_hike",
    name: "Interest Rate Hike",
    description: "Central bank raises rates. Economic pressure mounting.",
    icon: "🏦",
    color: "warning",
    outcomes: {
      BUY: { min: -20, max: -5 },
      HOLD: { min: -10, max: 0 },
      SELL: { min: 5, max: 20 },
    },
  },
  {
    id: "fake_news",
    name: "Fake News",
    description: "Markets in chaos! What's real anymore?",
    icon: "📰",
    color: "danger",
    outcomes: {
      BUY: { min: -25, max: 25 },
      HOLD: { min: -15, max: 15 },
      SELL: { min: -20, max: 20 },
    },
  },
  {
    id: "tech_boom",
    name: "Tech Boom",
    description: "AI revolution! Tech stocks exploding.",
    icon: "🚀",
    color: "success",
    outcomes: {
      BUY: { min: 20, max: 45 },
      HOLD: { min: 10, max: 20 },
      SELL: { min: -25, max: -10 },
    },
  },
  {
    id: "recession_fears",
    name: "Recession Fears",
    description: "Economic indicators flashing red.",
    icon: "⚠️",
    color: "danger",
    outcomes: {
      BUY: { min: -30, max: -10 },
      HOLD: { min: -15, max: -5 },
      SELL: { min: 10, max: 25 },
    },
  },
  {
    id: "merger_rumors",
    name: "Merger Rumors",
    description: "Big acquisition talks in the air.",
    icon: "🤝",
    color: "info",
    outcomes: {
      BUY: { min: -10, max: 40 },
      HOLD: { min: -5, max: 10 },
      SELL: { min: -20, max: 15 },
    },
  },
];

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

function getRandomEvent() {
  return MARKET_EVENTS[
    Math.floor(Math.random() * MARKET_EVENTS.length)
  ];
}

function calculateOutcome(event, action) {
  const outcome = event.outcomes[action];

  const range = outcome.max - outcome.min;

  return Math.round(
    outcome.min + Math.random() * range
  );
}

function applyOutcome(capital, percentChange) {
  const change = Math.round(
    capital * (percentChange / 100)
  );

  return capital + change;
}

module.exports = {
  MARKET_EVENTS,
  generateRoomCode,
  getRandomEvent,
  calculateOutcome,
  applyOutcome,
};