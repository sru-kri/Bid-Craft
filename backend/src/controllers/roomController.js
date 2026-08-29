const GameRoom = require("../models/GameRoom");
const Player = require("../models/Player");
const GameHistory = require("../models/GameHistory");

// Generate 6-character room code
const generateRoomCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
};

// CREATE ROOM
const createRoom = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Player name is required",
      });
    }

    const player = await Player.create({
      name: name.trim(),
      capital: 100000,
      round: 1,
    });

    let code;
    let existingRoom;

    do {
      code = generateRoomCode();
      existingRoom = await GameRoom.findOne({ code });
    } while (existingRoom);

    const room = await GameRoom.create({
      code,
      host_id: player._id,
      status: "waiting",
      current_round: 0,
      current_event: null,
      max_players: 8,
    });

    player.room_id = room._id;
    await player.save();

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      room,
      player,
      players: [player],
    });
  } catch (error) {
    console.error("Create room error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create room",
      error: error.message,
    });
  }
};

// JOIN ROOM
const joinRoom = async (req, res) => {
  try {
    const { code, name } = req.body;

    if (!code || !name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Room code and player name are required",
      });
    }

    const room = await GameRoom.findOne({
      code: code.toUpperCase().trim(),
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
      is_eliminated: false,
    });

    if (playerCount >= room.max_players) {
      return res.status(400).json({
        success: false,
        message: "Room is full",
      });
    }

    const player = await Player.create({
      name: name.trim(),
      capital: 100000,
      round: 1,
      room_id: room._id,
    });

    const players = await Player.find({
      room_id: room._id,
    }).sort({ capital: -1 });

    res.status(200).json({
      success: true,
      message: "Joined room successfully",
      room,
      player,
      players,
    });
  } catch (error) {
    console.error("Join room error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to join room",
      error: error.message,
    });
  }
};

// GET ROOM
const getRoom = async (req, res) => {
  try {
    const room = await GameRoom.findOne({
      code: req.params.code.toUpperCase(),
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const players = await Player.find({
      room_id: room._id,
    }).sort({ capital: -1 });

    res.json({
      success: true,
      room,
      players,
    });
  } catch (error) {
    console.error("Get room error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get room",
      error: error.message,
    });
  }
};

// START GAME
const startGame = async (req, res) => {
  try {
    const { roomId, playerId } = req.body;

    const room = await GameRoom.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (room.host_id.toString() !== playerId) {
      return res.status(403).json({
        success: false,
        message: "Only the host can start the game",
      });
    }

    if (room.status !== "waiting") {
      return res.status(400).json({
        success: false,
        message: "Game has already started",
      });
    }

    const players = await Player.find({
      room_id: room._id,
      is_eliminated: false,
    });

    if (players.length < 1) {
      return res.status(400).json({
        success: false,
        message: "At least one player is required",
      });
    }

    // Temporary event generation.
    // We will later move the complete game logic to the backend.
    const events = [
      {
        id: "bull_run",
        name: "Bull Run",
        description: "Markets are surging! Stocks hitting all-time highs.",
        icon: "📈",
        color: "success",
        outcomes: {
          BUY: { min: 15, max: 35, description: "Massive gains!" },
          HOLD: { min: 5, max: 15, description: "Steady growth" },
          SELL: { min: -20, max: -5, description: "Missed the rally!" },
        },
      },
      {
        id: "market_crash",
        name: "Market Crash",
        description: "Panic selling! Markets in freefall.",
        icon: "📉",
        color: "danger",
        outcomes: {
          BUY: { min: -40, max: -20, description: "Caught the falling knife!" },
          HOLD: { min: -25, max: -10, description: "Portfolio bleeding" },
          SELL: { min: 5, max: 15, description: "Smart exit!" },
        },
      },
      {
        id: "tech_boom",
        name: "Tech Boom",
        description: "AI revolution! Tech stocks exploding.",
        icon: "🚀",
        color: "success",
        outcomes: {
          BUY: { min: 20, max: 45, description: "Massive tech gains!" },
          HOLD: { min: 10, max: 20, description: "Solid returns" },
          SELL: { min: -25, max: -10, description: "Missed the rocket!" },
        },
      },
    ];

    const event = events[Math.floor(Math.random() * events.length)];

    room.status = "playing";
    room.current_round = 1;
    room.current_event = event;

    await room.save();

    await Player.updateMany(
      { room_id: room._id },
      {
        $set: {
          round: 1,
          last_action: null,
          last_event: event.id,
        },
      }
    );

    const updatedPlayers = await Player.find({
      room_id: room._id,
    });

    res.json({
      success: true,
      message: "Game started",
      room,
      players: updatedPlayers,
    });
  } catch (error) {
    console.error("Start game error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to start game",
      error: error.message,
    });
  }
};

// NEXT ROUND
const nextRound = async (req, res) => {
  try {
    const { roomId, playerId } = req.body;

    const room = await GameRoom.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (room.host_id.toString() !== playerId) {
      return res.status(403).json({
        success: false,
        message: "Only the host can start the next round",
      });
    }

    if (room.status !== "playing") {
      return res.status(400).json({
        success: false,
        message: "Game is not currently playing",
      });
    }

    const events = [
      {
        id: "bull_run",
        name: "Bull Run",
        description: "Markets are surging! Stocks hitting all-time highs.",
        icon: "📈",
        color: "success",
        outcomes: {
          BUY: { min: 15, max: 35, description: "Massive gains!" },
          HOLD: { min: 5, max: 15, description: "Steady growth" },
          SELL: { min: -20, max: -5, description: "Missed the rally!" },
        },
      },
      {
        id: "market_crash",
        name: "Market Crash",
        description: "Panic selling! Markets in freefall.",
        icon: "📉",
        color: "danger",
        outcomes: {
          BUY: { min: -40, max: -20, description: "Caught the falling knife!" },
          HOLD: { min: -25, max: -10, description: "Portfolio bleeding" },
          SELL: { min: 5, max: 15, description: "Smart exit!" },
        },
      },
      {
        id: "tech_boom",
        name: "Tech Boom",
        description: "AI revolution! Tech stocks exploding.",
        icon: "🚀",
        color: "success",
        outcomes: {
          BUY: { min: 20, max: 45, description: "Massive tech gains!" },
          HOLD: { min: 10, max: 20, description: "Solid returns" },
          SELL: { min: -25, max: -10, description: "Missed the rocket!" },
        },
      },
    ];

    const event = events[Math.floor(Math.random() * events.length)];

    room.current_round += 1;
    room.current_event = event;

    await room.save();

    await Player.updateMany(
      { room_id: room._id },
      {
        $set: {
          last_action: null,
          last_event: event.id,
          round: room.current_round,
        },
      }
    );

    const players = await Player.find({
      room_id: room._id,
    });

    res.json({
      success: true,
      message: "Next round started",
      room,
      players,
    });
  } catch (error) {
    console.error("Next round error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to start next round",
      error: error.message,
    });
  }
};

// SUBMIT ACTION
const submitAction = async (req, res) => {
  try {
    const {
      roomId,
      playerId,
      action,
      newCapital,
    } = req.body;

    if (!roomId || !playerId || !action) {
      return res.status(400).json({
        success: false,
        message: "Room, player and action are required",
      });
    }

    const player = await Player.findById(playerId);
    const room = await GameRoom.findById(roomId);

    if (!player || !room) {
      return res.status(404).json({
        success: false,
        message: "Player or room not found",
      });
    }

    if (player.room_id.toString() !== room._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Player does not belong to this room",
      });
    }

    if (player.last_action !== null) {
      return res.status(400).json({
        success: false,
        message: "Player has already acted this round",
      });
    }

    const capitalBefore = player.capital;

    player.capital = newCapital;
    player.last_action = action;
    player.round = room.current_round;
    player.last_event = room.current_event?.id || null;

    if (newCapital <= 0) {
      player.is_eliminated = true;
    }

    await player.save();

    await GameHistory.create({
      player_id: player._id,
      room_id: room._id,
      round: room.current_round,
      event_type: room.current_event?.id || "unknown",
      action,
      capital_before: capitalBefore,
      capital_after: newCapital,
    });

    const players = await Player.find({
      room_id: room._id,
    }).sort({ capital: -1 });

    res.json({
      success: true,
      message: "Action submitted",
      player,
      players,
    });
  } catch (error) {
    console.error("Submit action error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit action",
      error: error.message,
    });
  }
};

// LEAVE ROOM
const leaveRoom = async (req, res) => {
  try {
    const { roomId, playerId } = req.body;

    const player = await Player.findById(playerId);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    const room = await GameRoom.findById(roomId);

    await Player.findByIdAndDelete(playerId);

    if (room) {
      const remainingPlayers = await Player.find({
        room_id: room._id,
      });

      // If host leaves, assign another player as host
      if (
        room.host_id &&
        room.host_id.toString() === playerId
      ) {
        if (remainingPlayers.length > 0) {
          room.host_id = remainingPlayers[0]._id;
          await room.save();
        } else {
          await GameRoom.findByIdAndDelete(room._id);
        }
      }
    }

    res.json({
      success: true,
      message: "Player left room",
    });
  } catch (error) {
    console.error("Leave room error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to leave room",
      error: error.message,
    });
  }
};

module.exports = {
  createRoom,
  joinRoom,
  getRoom,
  startGame,
  nextRound,
  submitAction,
  leaveRoom,
};