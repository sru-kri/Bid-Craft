import { useNavigate } from 'react-router-dom';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function HowToPlay() {
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
            How to Play
          </h1>

          <div className="space-y-8">
            <section className="glass-card p-6">
              <h2 className="font-display text-xl font-bold text-primary mb-4">Game Loop</h2>
              <ol className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="font-display text-secondary">1.</span>
                  <span>Market event card appears</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-display text-secondary">2.</span>
                  <span>Analyze the situation</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-display text-secondary">3.</span>
                  <span>Choose one action: <strong className="text-success">BUY</strong>, <strong className="text-warning">HOLD</strong>, or <strong className="text-destructive">SELL</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="font-display text-secondary">4.</span>
                  <span>Your capital changes based on your decision</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-display text-secondary">5.</span>
                  <span>Survive to the next round!</span>
                </li>
              </ol>
            </section>

            <section className="glass-card p-6">
              <h2 className="font-display text-xl font-bold text-destructive mb-4">Elimination Rules</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• You start with <strong className="text-primary">₹1,00,000</strong> capital</li>
                <li>• Capital ≤ 0 = <strong className="text-destructive">Instant Elimination</strong></li>
                <li>• No second chances, no respawns</li>
                <li>• Every decision matters!</li>
              </ul>
            </section>

            <section className="glass-card p-6">
              <h2 className="font-display text-xl font-bold text-secondary mb-4">Keyboard Shortcuts</h2>
              <div className="grid grid-cols-2 gap-4 text-muted-foreground">
                <div><kbd className="px-2 py-1 bg-muted rounded">B</kbd> or <kbd className="px-2 py-1 bg-muted rounded">1</kbd> = Buy</div>
                <div><kbd className="px-2 py-1 bg-muted rounded">H</kbd> or <kbd className="px-2 py-1 bg-muted rounded">2</kbd> = Hold</div>
                <div><kbd className="px-2 py-1 bg-muted rounded">S</kbd> or <kbd className="px-2 py-1 bg-muted rounded">3</kbd> = Sell</div>
                <div><kbd className="px-2 py-1 bg-muted rounded">Enter</kbd> = Next Round</div>
              </div>
            </section>

            <section className="glass-card p-6">
              <h2 className="font-display text-xl font-bold text-warning mb-4">Market Events</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-success">📈 Bull Run</h3>
                  <p className="text-sm text-muted-foreground">Markets surging! Buy = Gain, Sell = Miss out</p>
                </div>
                <div>
                  <h3 className="font-semibold text-destructive">📉 Market Crash</h3>
                  <p className="text-sm text-muted-foreground">Panic mode! Sell = Safe, Buy = Heavy loss</p>
                </div>
                <div>
                  <h3 className="font-semibold text-warning">🤫 Insider Tip</h3>
                  <p className="text-sm text-muted-foreground">Risky info! High reward or high loss</p>
                </div>
                <div>
                  <h3 className="font-semibold text-warning">🏦 Interest Rate Hike</h3>
                  <p className="text-sm text-muted-foreground">Economic pressure! Sell = Safe exit</p>
                </div>
                <div>
                  <h3 className="font-semibold text-destructive">📰 Fake News</h3>
                  <p className="text-sm text-muted-foreground">Total chaos! Random outcomes</p>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
