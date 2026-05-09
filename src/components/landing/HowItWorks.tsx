import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link04Icon, ShoppingBag03Icon, CheckmarkBadge03Icon, CoinsSwapIcon } from '@hugeicons/core-free-icons';

const steps = [
  {
    num: '1',
    emoji: <HugeiconsIcon icon={Link04Icon} />,
    title: 'Create a Link',
    description: 'Connect your wallet, set the amount, and generate a shareable payment URL in seconds.',
  },
  {
    num: '2',
    emoji: <HugeiconsIcon icon={ShoppingBag03Icon} />,
    title: 'Buyer Opens Link',
    description: 'Buyer picks their chain ETH, Base, Arbitrum, or any of 60+ supported networks.',
  },
  {
    num: '3',
    emoji: <HugeiconsIcon icon={CoinsSwapIcon} />,
    title: 'LI.FI Bridges',
    description: 'The SDK auto-routes the best bridge, handles slippage, and executes the cross-chain swap.',
  },
  {
    num: '4',
    emoji: <HugeiconsIcon icon={CheckmarkBadge03Icon} />,
    title: 'USDC Settled',
    description: 'Escrow confirms, x402 verifies, and the merchant gets USDC on Solana. Done!',
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-28 relative">
      <div className="absolute inset-0 bg-radial-center" />
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold tracking-[0.15em] uppercase text-primary mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Four steps. One payment.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="surface-card-hover rounded-3xl p-6 group text-center"
            >
              <div className="flex items-center justify-center mb-5">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8 border border-primary/10 group-hover:bg-primary/12 transition-all">
                    <span className="text-2xl">{step.emoji}</span>
                  </div>
                  <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md shadow-primary/20">
                    {step.num}
                  </div>
                </div>
              </div>
              <h3 className="text-[15px] font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
