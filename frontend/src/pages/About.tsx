import { useNavigate } from 'react-router-dom';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 min-h-screen p-4 md:p-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-muted-foreground hover:text-foreground mb-6"
        >
          ← Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            About BIDCRAFT
          </h1>

          <div className="space-y-8">
            <section className="glass-card p-6">
              <h2 className="font-display text-xl font-bold text-primary mb-4">What is BIDCRAFT?</h2>
              <p className="text-muted-foreground">
                BIDCRAFT is a turn-based survival stock market game. The goal isn't to make money — 
                it's to <strong className="text-foreground">survive longer than the market</strong>.
              </p>
            </section>

            <section className="glass-card p-6">
              <h2 className="font-display text-xl font-bold text-secondary mb-4">What This Game Teaches</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Why humans fail in markets</li>
                <li>• Decision making under pressure</li>
                <li>• Emotional discipline</li>
                <li>• The dangers of FOMO & panic</li>
              </ul>
            </section>

            <section className="glass-card p-6">
              <h2 className="font-display text-xl font-bold text-success mb-4">Why BIDCRAFT is Different</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• No complex charts or formulas</li>
                <li>• No real stock data needed</li>
                <li>• Focus on psychology, not math</li>
                <li>• Simple enough for beginners</li>
              </ul>
            </section>

            <section className="glass-card p-6">
              <h2 className="font-display text-xl font-bold text-warning mb-4">Psychology Traps</h2>
              <div className="space-y-3 text-muted-foreground">
                <div>
                  <strong className="text-destructive">Panic</strong> — Selling in fear
                </div>
                <div>
                  <strong className="text-destructive">Overconfidence</strong> — Taking big risks
                </div>
                <div>
                  <strong className="text-destructive">Herd Mentality</strong> — Following the crowd
                </div>
                <div>
                  <strong className="text-destructive">FOMO</strong> — Fear of missing out
                </div>
              </div>
            </section>

            <blockquote className="glass-card p-6 border-l-4 border-primary">
              <p className="text-lg italic text-foreground">
                "Real investors don't fail because of bad data. They fail because of bad emotions."
              </p>
            </blockquote>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
