const mongoose = require("mongoose");

const gameRoomSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    host_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      default: null,
    },

    status: {
      type: String,
      enum: ["waiting", "playing", "finished"],
      default: "waiting",
    },

    current_round: {
      type: Number,
      default: 0,
    },

    current_event: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    max_players: {
      type: Number,
      default: 8,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GameRoom", gameRoomSchema);