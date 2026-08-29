const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    capital: {
      type: Number,
      default: 100000,
    },

    round: {
      type: Number,
      default: 1,
    },

    is_eliminated: {
      type: Boolean,
      default: false,
    },

    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GameRoom",
      default: null,
    },

    last_action: {
      type: String,
      default: null,
    },

    last_event: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Player", playerSchema);