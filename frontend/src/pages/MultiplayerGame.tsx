import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ParticleBackground } from '@/components/ParticleBackground';
import { PlayerStats } from '@/components/PlayerStats';
import { EventCard } from '@/components/EventCard';
import { Leaderboard } from '@/components/Leaderboard';
import { Button } from '@/components/ui/button';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { GameAction, calculateOutcome, applyOutcome } from '@/lib/gameEvents';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function MultiplayerGame() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [result, setResult] = useState<{
    change: number;
    percentChange: number;
  } | null>(null);

  const [localCapital, setLocalCapital] = useState(100000);
  const [hasActed, setHasActed] = useState(false);

  // --------------------------------------------------
  // IMPORTANT:
  // Prevent create/join from being called multiple times
  // --------------------------------------------------
  const initializationStarted = useRef(false);

  const {
    room,
    players,
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
  } = useMultiplayerGame();

  // --------------------------------------------------
  // INITIALIZE GAME
  // --------------------------------------------------

  useEffect(() => {
    // Prevent duplicate initialization.
    // This protects against React StrictMode running
    // the effect more than once in development.
    if (initializationStarted.current) {
      console.log('Game initialization already started. Skipping...');
      return;
    }

    const playerName = localStorage.getItem('bidcraft_player');

    if (!playerName) {
      navigate('/');
      return;
    }

    const shouldCreate = searchParams.get('create') === 'true';
    const joinCode = searchParams.get('join');

    if (!shouldCreate && !joinCode) {
      navigate('/');
      return;
    }

    initializationStarted.current = true;

    const initGame = async () => {
      try {
        // -----------------------------------------
        // CREATE ROOM
        // -----------------------------------------

        if (shouldCreate) {
          console.log('Creating room...');

          const code = await createRoom(playerName);

          if (code) {
            console.log('Room successfully created:', code);
            toast.success(`Room created! Code: ${code}`);
          } else {
            console.error('Failed to create room');
            toast.error('Failed to create room');

            initializationStarted.current = false;
            navigate('/');
          }

          return;
        }

        // -----------------------------------------
        // JOIN ROOM
        // -----------------------------------------

        if (joinCode) {
          console.log('Joining room:', joinCode);

          const success = await joinRoom(
            joinCode,
            playerName
          );

          if (success) {
            console.log('Successfully joined room');
            toast.success('Joined room!');
          } else {
            console.error('Failed to join room');
            toast.error('Failed to join room');

            initializationStarted.current = false;
            navigate('/');
          }

          return;
        }
      } catch (error) {
        console.error('Game initialization error:', error);

        toast.error('Something went wrong');

        initializationStarted.current = false;
        navigate('/');
      }
    };

    initGame();
  }, [
    searchParams,
    navigate,
    createRoom,
    joinRoom,
  ]);

  // --------------------------------------------------
  // SYNC LOCAL CAPITAL WITH SERVER
  // --------------------------------------------------

  useEffect(() => {
    if (currentPlayer) {
      setLocalCapital(currentPlayer.capital);
    }
  }, [currentPlayer?.capital]);

  // --------------------------------------------------
  // RESET STATE ON NEW ROUND
  // --------------------------------------------------

  useEffect(() => {
    setHasActed(false);
    setResult(null);
  }, [room?.current_round]);

  // --------------------------------------------------
  // KEYBOARD SHORTCUTS
  // --------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        !currentEvent ||
        hasActed ||
        currentPlayer?.is_eliminated
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === 'b' || key === '1') {
        handleAction('BUY');
      }

      if (key === 'h' || key === '2') {
        handleAction('HOLD');
      }

      if (key === 's' || key === '3') {
        handleAction('SELL');
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [
    currentEvent,
    hasActed,
    currentPlayer?.is_eliminated,
  ]);

  // --------------------------------------------------
  // HANDLE ACTION
  // --------------------------------------------------

  const handleAction = useCallback(
    async (action: GameAction) => {
      if (!currentEvent || hasActed) {
        return;
      }

      const percentChange = calculateOutcome(
        currentEvent,
        action
      );

      const newCapital = applyOutcome(
        localCapital,
        percentChange
      );

      const change =
        newCapital - localCapital;

      setResult({
        change,
        percentChange,
      });

      setLocalCapital(newCapital);
      setHasActed(true);

      await submitAction(
        action,
        newCapital
      );
    },
    [
      currentEvent,
      hasActed,
      localCapital,
      submitAction,
    ]
  );

  // --------------------------------------------------
  // START GAME
  // --------------------------------------------------

  const handleStartGame = async () => {
    if (players.length < 1) {
      toast.error(
        'Need at least 1 player to start'
      );
      return;
    }

    await startGame();
  };

  // --------------------------------------------------
  // NEXT ROUND
  // --------------------------------------------------

  const handleNextRound = async () => {
    await nextRound();
  };

  // --------------------------------------------------
  // LEAVE ROOM
  // --------------------------------------------------

  const handleLeave = async () => {
    await leaveRoom();

    // Reset initialization guard because
    // we're leaving this game.
    initializationStarted.current = false;

    navigate('/');
  };

  // --------------------------------------------------
  // COPY ROOM CODE
  // --------------------------------------------------

  const copyRoomCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(
        room.code
      );

      toast.success(
        'Room code copied!'
      );
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (!room) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <ParticleBackground />

        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="glass-card p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />

            <p className="text-muted-foreground">
              Connecting to room...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isEliminated =
    currentPlayer?.is_eliminated ?? false;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 min-h-screen flex flex-col p-4 md:p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">

          <Button
            variant="ghost"
            onClick={handleLeave}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Leave
          </Button>

          <div className="text-center">
            <h1 className="font-display text-xl font-bold">
              <span className="text-gradient-blue">
                BID
              </span>

              <span className="text-gradient-orange">
                CRAFT
              </span>
            </h1>

            <button
              onClick={copyRoomCode}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Room:{' '}
              <span className="font-display tracking-widest">
                {room.code}
              </span>{' '}
              📋
            </button>
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              {room.status === 'waiting'
                ? 'Waiting'
                : `Round ${room.current_round}`}
            </p>

            <p className="text-xs text-muted-foreground">
              {activePlayers.length} / {players.length}{' '}
              alive
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Leaderboard */}
          <div className="order-2 lg:order-1">
            <Leaderboard
              players={players}
              currentPlayerId={currentPlayer?._id}
            />
          </div>

          {/* Game */}
          <div className="order-1 lg:order-2 lg:col-span-2 flex flex-col">

            {/* Player Stats */}
            {currentPlayer && (
              <div className="mb-6">
                <PlayerStats
                  name={currentPlayer.name}
                  capital={localCapital}
                  round={room.current_round}
                  lastChange={result?.change}
                  isEliminated={isEliminated}
                />
              </div>
            )}

            {/* Game Area */}
            <div className="flex-1 flex items-center justify-center">

              <AnimatePresence mode="wait">

                {/* WAITING */}
                {room.status === 'waiting' ? (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="glass-card p-8 text-center max-w-md"
                  >
                    <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                      Waiting for Players
                    </h2>

                    <p className="text-muted-foreground mb-6">
                      Share the room code with friends to join!
                    </p>

                    <div
                      onClick={copyRoomCode}
                      className="glass-card p-4 cursor-pointer hover:bg-muted/50 transition-colors mb-6"
                    >
                      <p className="font-display text-3xl tracking-widest text-primary">
                        {room.code}
                      </p>
                    </div>

                    {isHost ? (
                      <Button
                        onClick={handleStartGame}
                        disabled={players.length < 1}
                        className="btn-primary-glow text-primary-foreground font-display font-bold w-full"
                      >
                        START GAME 🚀
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Waiting for host to start...
                      </p>
                    )}
                  </motion.div>

                ) : isEliminated ? (

                  /* ELIMINATED */
                  <motion.div
                    key="eliminated"
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    className="glass-card p-8 text-center max-w-md"
                  >
                    <div className="text-6xl mb-4">
                      💀
                    </div>

                    <h2 className="font-display text-2xl font-bold text-destructive mb-2">
                      YOU'RE OUT!
                    </h2>

                    <p className="text-muted-foreground">
                      Watch the remaining players battle it out.
                    </p>
                  </motion.div>

                ) : currentEvent ? (

                  /* GAME EVENT */
                  <div className="w-full max-w-lg">

                    <EventCard
                      event={currentEvent}
                      onAction={handleAction}
                      disabled={hasActed}
                      selectedAction={
                        hasActed &&
                        currentPlayer?.last_action
                          ? currentPlayer.last_action as GameAction
                          : null
                      }
                      result={result}
                    />

                    {hasActed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 text-center"
                      >
                        {allPlayersActed ? (
                          isHost && (
                            <Button
                              onClick={
                                handleNextRound
                              }
                              className="btn-secondary-glow text-secondary-foreground font-display font-bold"
                            >
                              NEXT ROUND →
                            </Button>
                          )
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Waiting for other players... (
                            {
                              players.filter(
                                (p) =>
                                  p.last_action
                              ).length
                            }
                            /
                            {
                              activePlayers.length
                            }
                            )
                          </p>
                        )}
                      </motion.div>
                    )}
                  </div>

                ) : null}

              </AnimatePresence>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}