import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import {
  io,
  Socket,
} from "socket.io-client";

import type {
  MarketEvent,
} from "@/lib/gameEvents";

export interface Player {
  _id: string;
  name: string;
  capital: number;
  round: number;
  is_eliminated: boolean;
  last_action: string | null;
}

export interface GameRoom {
  _id: string;
  code: string;
  status:
    | "waiting"
    | "playing"
    | "finished";
  current_round: number;
  current_event:
    | MarketEvent
    | null;
  host_id: string | null;
}

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export function useMultiplayerGame() {

  const [room, setRoom] =
    useState<GameRoom | null>(null);

  const [players, setPlayers] =
    useState<Player[]>([]);

  const [playerId, setPlayerId] =
    useState<string | null>(null);

  const [currentEvent, setCurrentEvent] =
    useState<MarketEvent | null>(null);

  const [isHost, setIsHost] =
    useState(false);

  const [socket, setSocket] =
    useState<Socket | null>(null);

  // --------------------------------------------------
  // PREVENT DUPLICATE ROOM CREATION
  // --------------------------------------------------

  const creatingRoomRef =
    useRef(false);

  const joiningRoomRef =
    useRef(false);

  // --------------------------------------------------
  // HELPER
  // --------------------------------------------------

  const normalizeId = useCallback(
    (value: unknown): string | null => {
      if (
        value === null ||
        value === undefined
      ) {
        return null;
      }

      if (
        typeof value === "string"
      ) {
        return value;
      }

      if (
        typeof value === "object" &&
        value !== null &&
        "_id" in value
      ) {
        return String(
          (value as { _id: unknown })
            ._id
        );
      }

      return String(value);
    },
    []
  );

  // --------------------------------------------------
  // CONNECT SOCKET.IO
  // --------------------------------------------------

  useEffect(() => {

    console.log(
      "Connecting to Socket.IO:",
      API_URL
    );

    const newSocket =
      io(API_URL, {
        transports: [
          "websocket",
          "polling",
        ],
      });

    newSocket.on(
      "connect",
      () => {
        console.log(
          "Socket connected:",
          newSocket.id
        );
      }
    );

    newSocket.on(
      "disconnect",
      () => {
        console.log(
          "Socket disconnected"
        );
      }
    );

    newSocket.on(
      "connect_error",
      (error) => {
        console.error(
          "Socket connection error:",
          error.message
        );
      }
    );

    setSocket(newSocket);

    return () => {

      console.log(
        "Cleaning up socket"
      );

      newSocket.removeAllListeners();
      newSocket.disconnect();
    };

  }, []);

  // --------------------------------------------------
  // GET ROOM DATA
  // --------------------------------------------------

  const refreshRoom =
    useCallback(
      async (
        roomId: string
      ) => {

        try {

          console.log(
            "Refreshing room:",
            roomId
          );

          const response =
            await fetch(
              `${API_URL}/api/game/${roomId}`
            );

          if (!response.ok) {

            console.error(
              "Failed to fetch room:",
              response.status
            );

            return;
          }

          const data =
            await response.json();

          if (!data.success) {

            console.error(
              "Failed to fetch room:",
              data.message
            );

            return;
          }

          const updatedRoom =
            data.room as GameRoom;

          const updatedPlayers =
            (data.players || []) as Player[];

          setRoom(updatedRoom);
          setPlayers(updatedPlayers);

          if (
            updatedRoom.current_event
          ) {

            setCurrentEvent(
              updatedRoom.current_event
            );

          } else {

            setCurrentEvent(null);

          }

          // Synchronize host
          const currentId =
            normalizeId(playerId);

          const hostId =
            normalizeId(
              updatedRoom.host_id
            );

          if (
            currentId &&
            hostId
          ) {

            setIsHost(
              currentId === hostId
            );

          }

          console.log(
            "ROOM UPDATED:",
            {
              code:
                updatedRoom.code,

              status:
                updatedRoom.status,

              players:
                updatedPlayers.length,

              playerNames:
                updatedPlayers.map(
                  (p) => p.name
                ),
            }
          );

        } catch (error) {

          console.error(
            "Refresh room error:",
            error
          );

        }

      },
      [
        playerId,
        normalizeId,
      ]
    );

  // --------------------------------------------------
  // SOCKET ROOM UPDATED
  // --------------------------------------------------

  useEffect(() => {

    if (!socket) {
      return;
    }

    const handleRoomUpdated =
      (
        roomCode?: string
      ) => {

        console.log(
          "SOCKET EVENT: room-updated",
          roomCode
        );

        if (!room?._id) {
          return;
        }

        if (
          roomCode &&
          roomCode.toUpperCase() !==
            room.code.toUpperCase()
        ) {
          return;
        }

        console.log(
          "Room changed. Refreshing..."
        );

        refreshRoom(
          room._id
        );
      };

    socket.on(
      "room-updated",
      handleRoomUpdated
    );

    return () => {

      socket.off(
        "room-updated",
        handleRoomUpdated
      );

    };

  }, [
    socket,
    room?._id,
    room?.code,
    refreshRoom,
  ]);

  // --------------------------------------------------
  // PLAYER JOINED
  // --------------------------------------------------

  useEffect(() => {

    if (!socket) {
      return;
    }

    const handlePlayerJoined =
      (
        data:
          | string
          | {
              roomCode?: string;
            }
      ) => {

        console.log(
          "SOCKET EVENT: player-joined",
          data
        );

        if (!room?._id) {
          return;
        }

        const roomCode =
          typeof data === "string"
            ? data
            : data?.roomCode;

        if (
          roomCode &&
          roomCode.toUpperCase() !==
            room.code.toUpperCase()
        ) {
          return;
        }

        console.log(
          "Player joined current room. Refreshing..."
        );

        refreshRoom(
          room._id
        );
      };

    socket.on(
      "player-joined",
      handlePlayerJoined
    );

    return () => {

      socket.off(
        "player-joined",
        handlePlayerJoined
      );

    };

  }, [
    socket,
    room?._id,
    room?.code,
    refreshRoom,
  ]);

  // --------------------------------------------------
  // CREATE ROOM
  // --------------------------------------------------

  const createRoom =
    useCallback(
      async (
        playerName: string
      ) => {

        // ------------------------------------------
        // DUPLICATE REQUEST PROTECTION
        // ------------------------------------------

        if (
          creatingRoomRef.current
        ) {

          console.warn(
            "Create room already in progress. Ignoring duplicate request."
          );

          return null;
        }

        // If we already have a room,
        // don't create another one.
        if (room?._id) {

          console.warn(
            "A room already exists. Skipping create request."
          );

          return room.code;
        }

        creatingRoomRef.current =
          true;

        try {

          console.log(
            "CREATE ROOM REQUEST STARTED"
          );

          const response =
            await fetch(
              `${API_URL}/api/game/create`,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  playerName,
                }),
              }
            );

          const data =
            await response.json();

          if (
            !response.ok ||
            !data.success
          ) {

            console.error(
              "Create room failed:",
              data.message
            );

            return null;
          }

          const newRoom =
            data.room as GameRoom;

          const player =
            data.player as Player;

          const currentPlayerId =
            normalizeId(
              player._id
            );

          const hostId =
            normalizeId(
              newRoom.host_id
            );

          setRoom(newRoom);

          setPlayerId(
            currentPlayerId
          );

          setPlayers([
            player,
          ]);

          setIsHost(
            currentPlayerId ===
              hostId
          );

          console.log(
            "ROOM CREATED:",
            {
              roomCode:
                newRoom.code,

              roomId:
                newRoom._id,

              playerId:
                currentPlayerId,

              hostId,

              isHost:
                currentPlayerId ===
                hostId,
            }
          );

          // ----------------------------------------
          // JOIN SOCKET ROOM
          // ----------------------------------------

          if (socket) {

            const joinRoomSocket =
              () => {

                console.log(
                  "Joining socket room:",
                  newRoom.code
                );

                socket.emit(
                  "join-room",
                  newRoom.code
                );
              };

            if (
              socket.connected
            ) {

              joinRoomSocket();

            } else {

              socket.once(
                "connect",
                joinRoomSocket
              );

            }
          }

          // ----------------------------------------
          // REFRESH ROOM
          // ----------------------------------------

          await refreshRoom(
            newRoom._id
          );

          console.log(
            "CREATE ROOM REQUEST COMPLETED:",
            newRoom.code
          );

          return newRoom.code;

        } catch (error) {

          console.error(
            "Create room error:",
            error
          );

          return null;

        } finally {

          creatingRoomRef.current =
            false;

        }

      },
      [
        socket,
        room?._id,
        room?.code,
        refreshRoom,
        normalizeId,
      ]
    );

  // --------------------------------------------------
  // JOIN ROOM
  // --------------------------------------------------

  const joinRoom =
    useCallback(
      async (
        code: string,
        playerName: string
      ) => {

        // ------------------------------------------
        // DUPLICATE JOIN PROTECTION
        // ------------------------------------------

        if (
          joiningRoomRef.current
        ) {

          console.warn(
            "Join room already in progress. Ignoring duplicate request."
          );

          return false;
        }

        joiningRoomRef.current =
          true;

        try {

          const roomCode =
            code
              .trim()
              .toUpperCase();

          const response =
            await fetch(
              `${API_URL}/api/game/join`,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  code: roomCode,
                  playerName,
                }),
              }
            );

          const data =
            await response.json();

          if (
            !response.ok ||
            !data.success
          ) {

            console.error(
              "Join room failed:",
              data.message
            );

            return false;
          }

          const joinedRoom =
            data.room as GameRoom;

          const player =
            data.player as Player;

          const roomPlayers =
            (data.players || []) as Player[];

          const currentPlayerId =
            normalizeId(
              player._id
            );

          const hostId =
            normalizeId(
              joinedRoom.host_id
            );

          setRoom(
            joinedRoom
          );

          setPlayerId(
            currentPlayerId
          );

          setPlayers(
            roomPlayers
          );

          setIsHost(
            currentPlayerId ===
              hostId
          );

          console.log(
            "ROOM JOINED:",
            {
              roomCode:
                joinedRoom.code,

              roomId:
                joinedRoom._id,

              playerId:
                currentPlayerId,

              hostId,

              isHost:
                currentPlayerId ===
                hostId,

              players:
                roomPlayers.length,
            }
          );

          // ----------------------------------------
          // SOCKET ROOM
          // ----------------------------------------

          if (socket) {

            const joinRoomSocket =
              () => {

                console.log(
                  "Joining socket room:",
                  joinedRoom.code
                );

                socket.emit(
                  "join-room",
                  joinedRoom.code
                );
              };

            if (
              socket.connected
            ) {

              joinRoomSocket();

            } else {

              socket.once(
                "connect",
                joinRoomSocket
              );

            }
          }

          // ----------------------------------------
          // REFRESH
          // ----------------------------------------

          await refreshRoom(
            joinedRoom._id
          );

          return true;

        } catch (error) {

          console.error(
            "Join room error:",
            error
          );

          return false;

        } finally {

          joiningRoomRef.current =
            false;

        }

      },
      [
        socket,
        refreshRoom,
        normalizeId,
      ]
    );

  // --------------------------------------------------
  // KEEP ROOM DATA UPDATED
  // --------------------------------------------------

  useEffect(() => {

    if (!room?._id) {
      return;
    }

    refreshRoom(
      room._id
    );

    const interval =
      setInterval(() => {

        refreshRoom(
          room._id
        );

      }, 2000);

    return () => {

      clearInterval(
        interval
      );

    };

  }, [
    room?._id,
    refreshRoom,
  ]);

  // --------------------------------------------------
  // START GAME
  // --------------------------------------------------

  const startGame =
    useCallback(
      async () => {

        if (!room?._id) {

          console.error(
            "No room available"
          );

          return;
        }

        if (!playerId) {

          console.error(
            "No player ID available"
          );

          return;
        }

        if (!isHost) {

          console.error(
            "Only the host can start the game"
          );

          return;
        }

        try {

          console.log(
            "Starting game:",
            {
              roomId:
                room._id,

              playerId,
            }
          );

          const response =
            await fetch(
              `${API_URL}/api/game/start`,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  roomId:
                    room._id,

                  playerId,
                }),
              }
            );

          const data =
            await response.json();

          if (
            !response.ok ||
            !data.success
          ) {

            console.error(
              "Start game failed:",
              data.message
            );

            return;
          }

          console.log(
            "Game started successfully:",
            data.room
          );

          const updatedRoom =
            data.room as GameRoom;

          setRoom(
            updatedRoom
          );

          if (
            updatedRoom.current_event
          ) {

            setCurrentEvent(
              updatedRoom.current_event
            );

          } else {

            setCurrentEvent(null);

          }

          await refreshRoom(
            updatedRoom._id
          );

          if (socket) {

            socket.emit(
              "game-started",
              updatedRoom.code
            );

          }

        } catch (error) {

          console.error(
            "Start game error:",
            error
          );

        }

      },
      [
        room?._id,
        playerId,
        isHost,
        refreshRoom,
        socket,
      ]
    );

  // --------------------------------------------------
  // SUBMIT ACTION
  // --------------------------------------------------

  const submitAction =
    useCallback(
      async (
        action: string,
        newCapital?: number
      ) => {

        if (!room?._id) {

          console.error(
            "No room available"
          );

          return null;
        }

        if (!playerId) {

          console.error(
            "No player ID available"
          );

          return null;
        }

        try {

          const response =
            await fetch(
              `${API_URL}/api/game/action`,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  roomId:
                    room._id,

                  playerId,

                  action,

                  newCapital,
                }),
              }
            );

          const data =
            await response.json();

          if (
            !response.ok ||
            !data.success
          ) {

            console.error(
              "Submit action failed:",
              data.message
            );

            return null;
          }

          console.log(
            "Action submitted:",
            data
          );

          if (data.player) {

            setPlayers(
              (prev) =>
                prev.map(
                  (player) =>
                    String(
                      player._id
                    ) ===
                    String(
                      data.player._id
                    )
                      ? data.player
                      : player
                )
            );

          }

          await refreshRoom(
            room._id
          );

          return data.result;

        } catch (error) {

          console.error(
            "Submit action error:",
            error
          );

          return null;

        }

      },
      [
        room?._id,
        playerId,
        refreshRoom,
      ]
    );

  // --------------------------------------------------
  // NEXT ROUND
  // --------------------------------------------------

  const nextRound =
    useCallback(
      async () => {

        if (!room?._id) {

          console.error(
            "No room available"
          );

          return;
        }

        if (!playerId) {

          console.error(
            "No player ID available"
          );

          return;
        }

        if (!isHost) {

          console.error(
            "Only the host can start next round"
          );

          return;
        }

        try {

          const response =
            await fetch(
              `${API_URL}/api/game/next-round`,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  roomId:
                    room._id,

                  playerId,
                }),
              }
            );

          const data =
            await response.json();

          if (
            !response.ok ||
            !data.success
          ) {

            console.error(
              "Next round failed:",
              data.message
            );

            return;
          }

          console.log(
            "Next round started:",
            data.room
          );

          const updatedRoom =
            data.room as GameRoom;

          setRoom(
            updatedRoom
          );

          if (
            updatedRoom.current_event
          ) {

            setCurrentEvent(
              updatedRoom.current_event
            );

          } else {

            setCurrentEvent(null);

          }

          await refreshRoom(
            updatedRoom._id
          );

          if (socket) {

            socket.emit(
              "round-started",
              updatedRoom.code
            );

          }

        } catch (error) {

          console.error(
            "Next round error:",
            error
          );

        }

      },
      [
        room?._id,
        playerId,
        isHost,
        refreshRoom,
        socket,
      ]
    );

  // --------------------------------------------------
  // LEAVE ROOM
  // --------------------------------------------------

  const leaveRoom =
    useCallback(
      () => {

        if (socket) {

          socket.disconnect();

        }

        setRoom(null);
        setPlayers([]);
        setPlayerId(null);
        setCurrentEvent(null);
        setIsHost(false);

        creatingRoomRef.current =
          false;

        joiningRoomRef.current =
          false;

      },
      [socket]
    );

  // --------------------------------------------------
  // CURRENT PLAYER
  // --------------------------------------------------

  const currentPlayer =
    players.find(
      (player) =>
        String(player._id) ===
        String(playerId)
    );

  // --------------------------------------------------
  // ACTIVE PLAYERS
  // --------------------------------------------------

  const activePlayers =
    players.filter(
      (player) =>
        !player.is_eliminated
    );

  // --------------------------------------------------
  // EVERYONE ACTED
  // --------------------------------------------------

  const allPlayersActed =
    activePlayers.length > 0 &&
    activePlayers.every(
      (player) =>
        player.last_action !== null
    );

  // --------------------------------------------------
  // DEBUG
  // --------------------------------------------------

  console.log(
    "GAME STATE:",
    {
      roomId:
        room?._id,

      roomCode:
        room?.code,

      roomStatus:
        room?.status,

      hostId:
        room?.host_id,

      playerId,

      isHost,

      players:
        players.map(
          (player) => ({
            id:
              player._id,

            name:
              player.name,

            capital:
              player.capital,

            lastAction:
              player.last_action,
          })
        ),
    }
  );

  // --------------------------------------------------
  // RETURN
  // --------------------------------------------------

  return {
    room,
    players,
    playerId,
    currentPlayer,
    currentEvent,
    isHost,
    activePlayers,
    allPlayersActed,
    createRoom,
    joinRoom,
    startGame,
    nextRound,
    submitAction,
    leaveRoom,
  };
}