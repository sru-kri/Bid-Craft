const Player = require("../models/Player");
const GameRoom = require("../models/GameRoom");
const GameHistory = require("../models/GameHistory");

const INITIAL_CAPITAL = 100000;

// =====================================================
// HELPERS
// =====================================================

const generateRoomCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
};

const getRandomEvent = () => {
  const events = [
    {
      id: "bull_run",
      name: "Bull Run",
      description:
        "Markets are surging! Stocks hitting all-time highs.",
      icon: "📈",
      color: "success",
      outcomes: {
        BUY: {
          min: 15,
          max: 35,
          description: "Massive gains!",
        },
        HOLD: {
          min: 5,
          max: 15,
          description: "Steady growth",
        },
        SELL: {
          min: -20,
          max: -5,
          description: "Missed the rally!",
        },
      },
    },

    {
      id: "market_crash",
      name: "Market Crash",
      description:
        "Panic selling! Markets in freefall.",
      icon: "📉",
      color: "danger",
      outcomes: {
        BUY: {
          min: -40,
          max: -20,
          description: "Caught the falling knife!",
        },
        HOLD: {
          min: -25,
          max: -10,
          description: "Portfolio bleeding",
        },
        SELL: {
          min: 5,
          max: 15,
          description: "Smart exit!",
        },
      },
    },

    {
      id: "insider_tip",
      name: "Insider Tip",
      description:
        "You received suspicious information...",
      icon: "🤫",
      color: "warning",
      outcomes: {
        BUY: {
          min: -30,
          max: 50,
          description: "High risk, high reward!",
        },
        HOLD: {
          min: -5,
          max: 5,
          description: "Played it safe",
        },
        SELL: {
          min: -15,
          max: 20,
          description: "Uncertain outcome",
        },
      },
    },

    {
      id: "interest_hike",
      name: "Interest Rate Hike",
      description:
        "Central bank raises rates. Economic pressure mounting.",
      icon: "🏦",
      color: "warning",
      outcomes: {
        BUY: {
          min: -20,
          max: -5,
          description: "Bad timing!",
        },
        HOLD: {
          min: -10,
          max: 0,
          description: "Weathered the storm",
        },
        SELL: {
          min: 5,
          max: 20,
          description: "Perfect exit!",
        },
      },
    },

    {
      id: "fake_news",
      name: "Fake News",
      description:
        "Markets in chaos! What's real anymore?",
      icon: "📰",
      color: "danger",
      outcomes: {
        BUY: {
          min: -25,
          max: 25,
          description: "Pure chaos!",
        },
        HOLD: {
          min: -15,
          max: 15,
          description: "Confusion reigns",
        },
        SELL: {
          min: -20,
          max: 20,
          description: "Random outcome!",
        },
      },
    },

    {
      id: "tech_boom",
      name: "Tech Boom",
      description:
        "AI revolution! Tech stocks exploding.",
      icon: "🚀",
      color: "success",
      outcomes: {
        BUY: {
          min: 20,
          max: 45,
          description: "Massive tech gains!",
        },
        HOLD: {
          min: 10,
          max: 20,
          description: "Solid returns",
        },
        SELL: {
          min: -25,
          max: -10,
          description: "Missed the rocket!",
        },
      },
    },

    {
      id: "recession_fears",
      name: "Recession Fears",
      description:
        "Economic indicators flashing red.",
      icon: "⚠️",
      color: "danger",
      outcomes: {
        BUY: {
          min: -30,
          max: -10,
          description: "Caught in downturn",
        },
        HOLD: {
          min: -15,
          max: -5,
          description: "Portfolio suffering",
        },
        SELL: {
          min: 10,
          max: 25,
          description: "Escaped in time!",
        },
      },
    },

    {
      id: "merger_rumors",
      name: "Merger Rumors",
      description:
        "Big acquisition talks in the air.",
      icon: "🤝",
      color: "info",
      outcomes: {
        BUY: {
          min: -10,
          max: 40,
          description: "Risky bet!",
        },
        HOLD: {
          min: -5,
          max: 10,
          description: "Wait and see",
        },
        SELL: {
          min: -20,
          max: 15,
          description: "Mixed signals",
        },
      },
    },
  ];

  return events[
    Math.floor(Math.random() * events.length)
  ];
};

const calculateOutcome = (event, action) => {
  const outcome = event.outcomes[action];

  if (!outcome) {
    throw new Error("Invalid action");
  }

  const range = outcome.max - outcome.min;

  return Math.round(
    outcome.min + Math.random() * range
  );
};

const applyOutcome = (capital, percentChange) => {
  const change = Math.round(
    capital * (percentChange / 100)
  );

  return capital + change;
};

// =====================================================
// CREATE ROOM
// =====================================================

const createRoom = async (req, res) => {
  try {
    const { playerName } = req.body;

    if (!playerName || !playerName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Player name is required",
      });
    }

    const player = await Player.create({
      name: playerName.trim(),
      capital: INITIAL_CAPITAL,
      round: 1,
    });

    let code;
    let existingRoom;

    do {
      code = generateRoomCode();

      existingRoom = await GameRoom.findOne({
        code,
      });
    } while (existingRoom);

    const room = await GameRoom.create({
      code,
      host_id: player._id,
      status: "waiting",
      current_round: 0,
      current_event: null,
    });

    player.room_id = room._id;

    await player.save();

    console.log("ROOM CREATED:", {
      roomId: room._id.toString(),
      roomCode: room.code,
      playerId: player._id.toString(),
      hostId: player._id.toString(),
    });

    return res.status(201).json({
      success: true,

      // IMPORTANT: frontend expects _id
      room: {
        _id: room._id,
        code: room.code,
        status: room.status,
        current_round: room.current_round,
        current_event: room.current_event,
        host_id: room.host_id,
      },

      // IMPORTANT: frontend expects _id
      player: {
        _id: player._id,
        name: player.name,
        capital: player.capital,
        round: player.round,
        is_eliminated: player.is_eliminated,
        last_action: player.last_action,
      },
    });
  } catch (error) {
    console.error("Create room error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create room",
    });
  }
};

// =====================================================
// JOIN ROOM
// =====================================================

const joinRoom = async (req, res) => {
  try {
    const { code, playerName } = req.body;

    if (!code || !playerName || !playerName.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Room code and player name are required",
      });
    }

    const room = await GameRoom.findOne({
      code: code.trim().toUpperCase(),
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (room.status !== "waiting") {
      return res.status(400).json({
        success: false,
        message: "Game has already started",
      });
    }

    const playerCount = await Player.countDocuments({
      room_id: room._id,
    });

    if (playerCount >= room.max_players) {
      return res.status(400).json({
        success: false,
        message: "Room is full",
      });
    }

    const player = await Player.create({
      name: playerName.trim(),
      room_id: room._id,
      capital: INITIAL_CAPITAL,
      round: 1,
    });

    const players = await Player.find({
      room_id: room._id,
    });

    console.log("PLAYER JOINED:", {
      roomId: room._id.toString(),
      roomCode: room.code,
      playerId: player._id.toString(),
      playerName: player.name,
      players: players.length,
    });

    // Notify everyone already inside this Socket.IO room.
    if (req.app.get("io")) {
      req.app
        .get("io")
        .to(room.code)
        .emit("room-updated", room.code);

      console.log(
        `Socket notification sent for room ${room.code}`
      );
    }

    return res.status(201).json({
      success: true,

      // IMPORTANT: frontend expects _id
      room: {
        _id: room._id,
        code: room.code,
        status: room.status,
        current_round: room.current_round,
        current_event: room.current_event,
        host_id: room.host_id,
      },

      // IMPORTANT: frontend expects _id
      player: {
        _id: player._id,
        name: player.name,
        capital: player.capital,
        round: player.round,
        is_eliminated: player.is_eliminated,
        last_action: player.last_action,
      },

      players,
    });
  } catch (error) {
    console.error("Join room error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to join room",
    });
  }
};

// =====================================================
// GET ROOM
// =====================================================

const getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    console.log("GET ROOM REQUEST:", {
      params: req.params,
      roomId,
    });

    if (
      !roomId ||
      roomId === "undefined" ||
      roomId === "null"
    ) {
      return res.status(400).json({
        success: false,
        message: "Room ID is required",
      });
    }

    const room = await GameRoom.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const players = await Player.find({
      room_id: room._id,
    });

    return res.status(200).json({
      success: true,
      room,
      players,
    });
  } catch (error) {
    console.error("Get room error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get room",
      error: error.message,
    });
  }
};

// =====================================================
// START GAME
// =====================================================

const startGame = async (req, res) => {
  try {
    const { roomId, playerId } = req.body;

    if (!roomId || !playerId) {
      return res.status(400).json({
        success: false,
        message: "Room ID and player ID are required",
      });
    }

    const room = await GameRoom.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (
      room.host_id.toString() !==
      playerId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only the host can start the game",
      });
    }

    if (room.status !== "waiting") {
      return res.status(400).json({
        success: false,
        message: "Game has already started",
      });
    }

    const event = getRandomEvent();

    room.status = "playing";
    room.current_round = 1;
    room.current_event = event;

    await room.save();

    await Player.updateMany(
      {
        room_id: room._id,
      },
      {
        round: 1,
        last_action: null,
        last_event: null,
      }
    );

    console.log("GAME STARTED:", {
      roomId: room._id.toString(),
      roomCode: room.code,
      round: room.current_round,
      event: event.id,
    });

    // Notify all players.
    if (req.app.get("io")) {
      req.app
        .get("io")
        .to(room.code)
        .emit("room-updated", room.code);

      req.app
        .get("io")
        .to(room.code)
        .emit("game-started", room.code);
    }

    return res.json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("Start game error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start game",
    });
  }
};

// =====================================================
// SUBMIT ACTION
// =====================================================

const submitAction = async (req, res) => {
  try {
    const {
      roomId,
      playerId,
      action,
    } = req.body;

    if (!roomId || !playerId) {
      return res.status(400).json({
        success: false,
        message: "Room ID and player ID are required",
      });
    }

    if (
      !["BUY", "HOLD", "SELL"].includes(action)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid action",
      });
    }

    const room = await GameRoom.findById(roomId);

    if (!room || room.status !== "playing") {
      return res.status(400).json({
        success: false,
        message: "Game is not active",
      });
    }

    const player = await Player.findOne({
      _id: playerId,
      room_id: room._id,
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    if (player.is_eliminated) {
      return res.status(400).json({
        success: false,
        message: "Player is eliminated",
      });
    }

    if (player.last_action !== null) {
      return res.status(400).json({
        success: false,
        message:
          "Action already submitted for this round",
      });
    }

    const capitalBefore = player.capital;

    const percentChange = calculateOutcome(
      room.current_event,
      action
    );

    const capitalAfter = applyOutcome(
      capitalBefore,
      percentChange
    );

    player.capital = capitalAfter;
    player.last_action = action;
    player.last_event =
      room.current_event.id;
    player.round = room.current_round;
    player.is_eliminated =
      capitalAfter <= 0;

    await player.save();

    await GameHistory.create({
      player_id: player._id,
      room_id: room._id,
      round: room.current_round,
      event_type: room.current_event.id,
      action,
      capital_before: capitalBefore,
      capital_after: capitalAfter,
    });

    // Notify other clients.
    if (req.app.get("io")) {
      req.app
        .get("io")
        .to(room.code)
        .emit("room-updated", room.code);
    }

    return res.json({
      success: true,
      player,
      result: {
        change:
          capitalAfter - capitalBefore,
        percentChange,
      },
    });
  } catch (error) {
    console.error(
      "Submit action error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to submit action",
    });
  }
};

// =====================================================
// NEXT ROUND
// =====================================================

const nextRound = async (req, res) => {
  try {
    const { roomId, playerId } = req.body;

    if (!roomId || !playerId) {
      return res.status(400).json({
        success: false,
        message:
          "Room ID and player ID are required",
      });
    }

    const room = await GameRoom.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (
      room.host_id.toString() !==
      playerId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only the host can start the next round",
      });
    }

    const activePlayers =
      await Player.find({
        room_id: room._id,
        is_eliminated: false,
      });

    const allActed =
      activePlayers.every(
        (player) =>
          player.last_action !== null
      );

    if (!allActed) {
      return res.status(400).json({
        success: false,
        message:
          "Not all active players have acted",
      });
    }

    if (activePlayers.length === 0) {
      room.status = "finished";

      await room.save();

      if (req.app.get("io")) {
        req.app
          .get("io")
          .to(room.code)
          .emit("room-updated", room.code);
      }

      return res.json({
        success: true,
        room,
      });
    }

    const event = getRandomEvent();

    room.current_round += 1;
    room.current_event = event;

    await room.save();

    await Player.updateMany(
      {
        room_id: room._id,
        is_eliminated: false,
      },
      {
        last_action: null,
        round: room.current_round,
      }
    );

    console.log("NEXT ROUND:", {
      roomId: room._id.toString(),
      roomCode: room.code,
      round: room.current_round,
      event: event.id,
    });

    // Notify all clients.
    if (req.app.get("io")) {
      req.app
        .get("io")
        .to(room.code)
        .emit("room-updated", room.code);

      req.app
        .get("io")
        .to(room.code)
        .emit(
          "round-started",
          room.code
        );
    }

    return res.json({
      success: true,
      room,
    });
  } catch (error) {
    console.error(
      "Next round error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to start next round",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createRoom,
  joinRoom,
  getRoom,
  startGame,
  submitAction,
  nextRound,
};