const express = require("express");

const {
  createRoom,
  joinRoom,
  getRoom,
  startGame,
  submitAction,
  nextRound,
} = require("../controllers/gameController");

const router = express.Router();

router.post("/create", createRoom);

router.post("/join", joinRoom);

router.get("/:roomId", getRoom);

router.post("/start", startGame);

router.post("/action", submitAction);

router.post("/next-round", nextRound);

module.exports = router;