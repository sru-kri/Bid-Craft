function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    // -----------------------------------------
    // JOIN SOCKET ROOM
    // -----------------------------------------
    socket.on("join-room", (roomCode) => {
      if (!roomCode) {
        console.log("join-room called without room code");
        return;
      }

      const normalizedRoomCode = roomCode
        .trim()
        .toUpperCase();

      socket.join(normalizedRoomCode);

      console.log(
        `Socket ${socket.id} joined room ${normalizedRoomCode}`
      );

      // Tell every OTHER client in this room
      // that someone joined.
      socket
        .to(normalizedRoomCode)
        .emit("player-joined", {
          roomCode: normalizedRoomCode,
        });

      // Also notify the room that its data changed.
      socket
        .to(normalizedRoomCode)
        .emit("room-updated", {
          roomCode: normalizedRoomCode,
        });
    });

    // -----------------------------------------
    // GAME STARTED
    // -----------------------------------------
    socket.on("game-started", (roomCode) => {
      if (!roomCode) return;

      const normalizedRoomCode = roomCode
        .trim()
        .toUpperCase();

      console.log(
        `Game started in room ${normalizedRoomCode}`
      );

      socket
        .to(normalizedRoomCode)
        .emit("game-started", {
          roomCode: normalizedRoomCode,
        });
    });

    // -----------------------------------------
    // ROUND STARTED
    // -----------------------------------------
    socket.on("round-started", (roomCode) => {
      if (!roomCode) return;

      const normalizedRoomCode = roomCode
        .trim()
        .toUpperCase();

      console.log(
        `New round started in room ${normalizedRoomCode}`
      );

      socket
        .to(normalizedRoomCode)
        .emit("round-started", {
          roomCode: normalizedRoomCode,
        });
    });

    // -----------------------------------------
    // DISCONNECT
    // -----------------------------------------
    socket.on("disconnect", () => {
      console.log(
        "Player disconnected:",
        socket.id
      );
    });
  });
}

module.exports = setupSocket;