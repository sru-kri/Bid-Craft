import { useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

interface Line {
  id: number;
  x: number;
  y: number;
  width: number;
  angle: number;
  delay: number;
}

export function ParticleBackground() {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 6,
      opacity: Math.random() * 0.5 + 0.2,
    }));
  }, []);

  const lines = useMemo<Line[]>(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      width: Math.random() * 300 + 100,
      angle: Math.random() * 60 - 30,
      delay: Math.random() * 3,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      
      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle bg-secondary/40"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}

      {/* Accent lines */}
      {lines.map((line) => (
        <div
          key={line.id}
          className="line-accent"
          style={{
            left: `${line.x}%`,
            top: `${line.y}%`,
            width: `${line.width}px`,
            transform: `rotate(${line.angle}deg)`,
            opacity: 0.3,
            animationDelay: `${line.delay}s`,
          }}
        />
      ))}

      {/* Glow spots */}
      <div 
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{ 
          background: 'hsl(var(--primary))',
          top: '10%',
          right: '10%',
        }} 
      />
      <div 
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-10"
        style={{ 
          background: 'hsl(var(--secondary))',
          bottom: '20%',
          left: '5%',
        }} 
      />
    </div>
  );
}
