/**
 * EVM Wallet Configuration
 *
 * wagmi + RainbowKit config for EVM chain support.
 * Allows payers to connect MetaMask, WalletConnect, Coinbase Wallet, etc.
 */

import { http } from 'wagmi';
import { mainnet, base, arbitrum, optimism, polygon, bsc, avalanche } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

/**
 * Supported EVM chains for cross-chain payments.
 * These are the chains that payers can pay from.
 */
export const supportedChains = [
  mainnet,
  base,
  arbitrum,
  optimism,
  polygon,
  bsc,
  avalanche,
] as const;

/**
 * wagmi config with RainbowKit defaults.
 * Includes WalletConnect, MetaMask, Coinbase Wallet, and injected wallets.
 */
export const wagmiConfig = getDefaultConfig({
  appName: 'PayAnywhere',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: [mainnet, base, arbitrum, optimism, polygon, bsc, avalanche],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [avalanche.id]: http(),
  },
});

/**
 * Chain metadata for display.
 */
export const CHAIN_META: Record<number, { name: string; icon: string; color: string; symbol: string }> = {
  [mainnet.id]: { name: 'Ethereum', icon: '⟠', color: '#627EEA', symbol: 'ETH' },
  [base.id]: { name: 'Base', icon: '🔵', color: '#0052FF', symbol: 'ETH' },
  [arbitrum.id]: { name: 'Arbitrum', icon: '🔷', color: '#28A0F0', symbol: 'ETH' },
  [optimism.id]: { name: 'Optimism', icon: '🔴', color: '#FF0420', symbol: 'ETH' },
  [polygon.id]: { name: 'Polygon', icon: '🟣', color: '#8247E5', symbol: 'POL' },
  [bsc.id]: { name: 'BNB Chain', icon: '🟡', color: '#F0B90B', symbol: 'BNB' },
  [avalanche.id]: { name: 'Avalanche', icon: '🔺', color: '#E84142', symbol: 'AVAX' },
};
