import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SUPPORTED_CHAINS } from '@/lib/constants';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16">
      {/* Warm background layers */}
      <div className="absolute inset-0 bg-noise" />
      <div className="absolute inset-0 bg-radial-top" />

      {/* Floating decorative orbs */}
      <div className="absolute top-[15%] left-[15%] w-72 h-72 rounded-full bg-primary/5 blur-[100px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full bg-pink-400/4 blur-[120px] pointer-events-none animate-float-delayed" />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-violet-400/3 blur-[150px] pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/12 mb-10"
          >
            <span className="text-xs font-bold text-primary">Live on Solana Devnet</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-[clamp(2.5rem,7vw,5rem)] font-extrabold tracking-[-0.04em] leading-[1.05] mb-6"
          >
            <span className="text-gradient-heading">One link.</span>
            <br />
            <span className="text-primary">Any chain.</span>
            <br />
            <span className="text-gradient-heading">Instant USDC.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed"
          >
            Create a payment link. Buyers pay from any chain they want
            ETH, Base, Arbitrum, and more. You get USDC on Solana.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14"
          >
            <Link to="/dashboard">
              <Button className="h-12 px-8 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/88 rounded-2xl gap-2.5 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5">
                Create Payment Link
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button
                variant="outline"
                className="h-12 px-8 text-sm font-semibold border-border/60 text-foreground hover:bg-secondary rounded-2xl gap-2.5"
              >
                View Docs
              </Button>
            </Link>
          </motion.div>

          {/* Chains */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-16"
          >
            <span className="text-xs text-muted-foreground mr-1 font-medium">Accepts from</span>
            {SUPPORTED_CHAINS.map((chain, i) => (
              <motion.span
                key={chain.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="chain-pill"
              >
                <span className="text-sm">{chain.icon}</span>
                <span className="text-secondary-foreground">{chain.name}</span>
              </motion.span>
            ))}
            <span className="chain-pill text-muted-foreground">+60 more</span>
          </motion.div>

          {/* Visual payment card preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="max-w-sm mx-auto"
          >
            <div className="surface-elevated rounded-3xl p-6 glow-brand-strong">
              {/* Mini checkout preview */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/8 border border-primary/12 mb-3">
                  <span className="text-[10px] font-bold text-primary">☕ Coffee Shop</span>
                </div>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-3xl font-extrabold text-foreground">$5.00</span>
                  <span className="text-sm text-muted-foreground font-semibold">USDC</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary/6 border border-primary/12">
                  <span className="text-lg">🔵</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Base</p>
                    <p className="text-[11px] text-muted-foreground">Pay with ETH</p>
                  </div>
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-secondary/60">
                  <span className="text-lg">⟠</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground/60">Ethereum</p>
                    <p className="text-[11px] text-muted-foreground">Pay with ETH</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 h-11 rounded-2xl bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20">
                ⚡ Pay $5.00 from Base →
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
