import React from 'react';
import { motion } from 'framer-motion';
import { EarthIcon, ZapIcon, ShieldBlockchainIcon, CodesandboxIcon, BarChartIcon, Link04Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

const features = [
  { icon: <HugeiconsIcon icon={EarthIcon} />, title: 'Cross-Chain Native', desc: 'LI.FI SDK routes across 60+ chains. Destination-amount routing guarantees exact USDC delivery.' },
  { icon: <HugeiconsIcon icon={ZapIcon} />, title: 'Instant Settlement', desc: 'On-chain escrow auto-releases USDC the moment the bridge confirms. No waiting.' },
  { icon: <HugeiconsIcon icon={ShieldBlockchainIcon} />, title: 'x402 Standard', desc: 'HTTP 402 Payment Required. The new internet-native payment standard, built for the future.' },
  { icon: <HugeiconsIcon icon={CodesandboxIcon} />, title: 'Anchor Escrow', desc: 'Three instructions, two events, zero bloat. A lean, auditable Solana program.' },
  { icon: <HugeiconsIcon icon={BarChartIcon} />, title: 'Live Dashboard', desc: 'Create links, track settlements, view real-time payment history from on-chain data.' },
  { icon: <HugeiconsIcon icon={Link04Icon} />, title: 'Shareable Links', desc: 'Generate payment URLs — embed anywhere, create QR codes, share on social.' },
];

const Features: React.FC = () => {
  return (
    <section className="py-28 relative">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold tracking-[0.15em] uppercase text-primary mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Built for cross-chain commerce
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="surface-card-hover rounded-3xl p-6 group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/8 border border-primary/10 group-hover:bg-primary/12 transition-all text-lg">
                  {f.icon}
                </div>
              </div>
              <h3 className="text-[15px] font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
