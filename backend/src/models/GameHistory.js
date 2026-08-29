const mongoose = require("mongoose");

const gameHistorySchema = new mongoose.Schema(
  {
    player_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },

    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GameRoom",
      required: true,
    },

    round: {
      type: Number,
      required: true,
    },

    event_type: {
      type: String,
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    capital_before: {
      type: Number,
      required: true,
    },

    capital_after: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GameHistory", gameHistorySchema);