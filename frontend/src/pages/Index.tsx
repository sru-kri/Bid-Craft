import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const Index = () => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const navigate = useNavigate();

  const handleSoloPlay = () => {
    if (!playerName.trim()) return;
    localStorage.setItem('bidcraft_player', playerName.trim());
    navigate('/solo');
  };

  const handleCreateRoom = () => {
    if (!playerName.trim()) return;
    localStorage.setItem('bidcraft_player', playerName.trim());
    navigate('/multiplayer?create=true');
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    localStorage.setItem('bidcraft_player', playerName.trim());
    navigate(`/multiplayer?join=${roomCode.trim().toUpperCase()}`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-wider">
            <span className="text-gradient-blue">BID</span>
            <span className="text-gradient-orange">CRAFT</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground italic">
            "Greed kills, patience wins."
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-6 md:p-8 w-full max-w-md"
        >
          <h2 className="font-display text-xl md:text-2xl font-bold text-gradient-orange text-center mb-6">
            Enter The Arena
          </h2>

          {/* Name Input */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Your Investor Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="bg-muted/50 border-border/50 text-center font-medium text-foreground placeholder:text-muted-foreground"
              maxLength={20}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleSoloPlay}
              disabled={!playerName.trim()}
              className="w-full btn-primary-glow text-primary-foreground font-display font-bold py-6 text-lg"
            >
              SOLO MODE 🎯
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-4 text-sm text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              onClick={handleCreateRoom}
              disabled={!playerName.trim()}
              className="w-full btn-secondary-glow text-secondary-foreground font-display font-bold py-6 text-lg"
            >
              CREATE ROOM 🏠
            </Button>

            {!showJoin ? (
              <Button
                onClick={() => setShowJoin(true)}
                variant="outline"
                className="w-full border-border/50 text-muted-foreground hover:text-foreground font-display py-6"
              >
                JOIN ROOM 🔗
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <Input
                  type="text"
                  placeholder="Enter Room Code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="bg-muted/50 border-border/50 text-center font-display text-lg tracking-widest text-foreground placeholder:text-muted-foreground"
                  maxLength={6}
                />
                <Button
                  onClick={handleJoinRoom}
                  disabled={!playerName.trim() || !roomCode.trim()}
                  variant="outline"
                  className="w-full border-secondary text-secondary hover:bg-secondary/10 font-display py-6"
                >
                  JOIN GAME →
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Warning */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-sm text-muted-foreground text-center max-w-md"
        >
          ⚠️ <strong>WARNING:</strong> Capital ≤ 0 = Instant Elimination. No Second Chances.
        </motion.p>

        {/* Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex gap-6"
        >
          <button
            onClick={() => navigate('/how-to-play')}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            📖 How to Play
          </button>
          <button
            onClick={() => navigate('/about')}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            ℹ️ About Game
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
