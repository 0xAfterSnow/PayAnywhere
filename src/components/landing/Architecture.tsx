import React from 'react';
import { motion } from 'framer-motion';

const layers = [
  { label: 'Payer', sub: 'ETH · Base · Arbitrum · Polygon + more', emoji: '👛', color: 'bg-amber-50 border-amber-200/60' },
  { label: 'LI.FI Bridge', sub: 'Route → Swap → Bridge → Confirm', emoji: '🌉', color: 'bg-primary/5 border-primary/15' },
  { label: 'Solana Escrow', sub: 'create_payment → settle_payment', emoji: '🔐', color: 'bg-violet-50 border-violet-200/60' },
  { label: 'Merchant', sub: 'USDC settled + x402 verified ✓', emoji: '✨', color: 'bg-emerald-50 border-emerald-200/60' },
];

const Architecture: React.FC = () => {
  return (
    <section className="py-28 relative">
      <div className="absolute inset-0 bg-radial-center" />
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs font-bold tracking-[0.15em] uppercase text-primary mb-3">Architecture</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            End-to-end payment flow
          </h2>
        </motion.div>

        <div className="max-w-md mx-auto space-y-3">
          {layers.map((layer, i) => (
            <React.Fragment key={layer.label}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.12 }}
                className={`rounded-2xl border p-5 ${layer.color} transition-all hover:shadow-md`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{layer.emoji}</div>
                  <div>
                    <p className="text-[15px] font-bold text-foreground">{layer.label}</p>
                    <p className="text-sm text-muted-foreground">{layer.sub}</p>
                  </div>
                </div>
              </motion.div>
              {i < layers.length - 1 && (
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 + 0.2 }}
                    className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center"
                  >
                    <svg className="h-3 w-3 text-primary" viewBox="0 0 12 12" fill="none">
                      <path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Architecture;
