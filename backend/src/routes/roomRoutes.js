const express = require("express");

const {
  createRoom,
  joinRoom,
  getRoom,
  startGame,
  nextRound,
  submitAction,
  leaveRoom,
} = require("../controllers/roomController");

const router = express.Router();

router.post("/create", createRoom);
router.post("/join", joinRoom);
router.get("/:code", getRoom);

router.post("/start", startGame);
router.post("/next-round", nextRound);
router.post("/action", submitAction);
router.post("/leave", leaveRoom);

module.exports = router;