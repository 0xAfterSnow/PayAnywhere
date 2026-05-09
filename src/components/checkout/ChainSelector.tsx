import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { SUPPORTED_CHAINS } from '@/lib/constants';
import { CHAIN_META } from '@/lib/evm-config';
import { useAccount, useBalance } from 'wagmi';

interface ChainSelectorProps {
  selectedChainId: number | null;
  onSelect: (chainId: number) => void;
}

const ChainSelector: React.FC<ChainSelectorProps> = ({ selectedChainId, onSelect }) => {
  const { address, isConnected } = useAccount();

  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-muted-foreground">Pay from</p>
      <div className="grid grid-cols-2 gap-2.5">
        {SUPPORTED_CHAINS.map((chain) => {
          const active = selectedChainId === chain.id;
          const Icon = chain.icon;

          const meta = CHAIN_META[chain.id];

          return (
            <motion.button
              key={chain.id}
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -1 }}
              onClick={() => onSelect(chain.id)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all ${active
                  ? 'bg-primary/8 border-2 border-primary/30 shadow-md shadow-primary/5'
                  : 'surface-card hover:border-border/80'
                }`} s
            >
              <span className="text-xl"><Icon className="h-7 w-7 [&_rect]:hidden" /></span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${active ? 'text-foreground' : 'text-secondary-foreground'}`}>
                  {chain.name}
                </p>
                <p className="text-xs text-muted-foreground">{chain.symbol}</p>
              </div>
              {active && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="h-3 w-3 text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ChainSelector;
