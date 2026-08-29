const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db");
const setupSocket = require("./socket");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);
app.use(cors());
app.use(express.json());

const roomRoutes = require("./routes/roomRoutes");
const gameRoutes = require("./routes/gameRoutes");

app.use("/api/game", gameRoutes);
app.use("/api/rooms", roomRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "BidCraft backend is running",
  });
});

// -----------------------------------------
// SOCKET.IO
// -----------------------------------------

setupSocket(io);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(
        `BidCraft backend running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Failed to start server:",
      error
    );

    process.exit(1);
  }
};

startServer();