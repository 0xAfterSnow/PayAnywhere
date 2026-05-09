import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CTA: React.FC = () => {
  return (
    <section className="py-28">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="surface-elevated rounded-[2rem] p-10 sm:p-16 text-center max-w-2xl mx-auto relative overflow-hidden"
        >
          {/* Background decorations */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/5 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-400/4 blur-[80px] rounded-full" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/8 border border-primary/12 mb-7">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-primary">Get started in 30 seconds</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-4 tracking-tight">
              Start accepting cross-chain payments ✨
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-8 leading-relaxed">
              Connect your wallet, create a link, get USDC from any chain.
              It's that simple.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link to="/dashboard">
                <Button className="h-12 px-8 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/88 rounded-2xl gap-2.5 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5">
                  Open Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/docs">
                <Button variant="outline" className="h-12 px-8 text-sm font-semibold border-border/60 text-foreground hover:bg-secondary rounded-2xl">
                  Read Docs
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
