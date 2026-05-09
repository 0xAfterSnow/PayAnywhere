/**
 * EVM Wallet Configuration
 *
 * wagmi + RainbowKit config for EVM chain support.
 * Allows payers to connect MetaMask, WalletConnect, Coinbase Wallet, etc.
 */

import { http } from 'wagmi';
import { mainnet, base, arbitrum, optimism, polygon, bsc, avalanche, baseSepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { CryptoIcons } from '@/components/crypto-icons';

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
  baseSepolia,
] as const;

/**
 * wagmi config with RainbowKit defaults.
 * Includes WalletConnect, MetaMask, Coinbase Wallet, and injected wallets.
 */
export const wagmiConfig = getDefaultConfig({
  appName: 'PayAnywhere',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: [mainnet, base, arbitrum, optimism, polygon, bsc, avalanche, baseSepolia],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [avalanche.id]: http(),
    [baseSepolia.id]: http(),

  },
});

/**
 * Chain metadata for display.
 */
export const CHAIN_META: Record<number, { name: string; icon: string; color: string; symbol: string }> = {
  [mainnet.id]: { name: 'Ethereum', icon: CryptoIcons.eth, color: '#627EEA', symbol: 'ETH' },
  [base.id]: { name: 'Base', icon: CryptoIcons.base, color: '#0052FF', symbol: 'ETH' },
  [arbitrum.id]: { name: 'Arbitrum', icon: CryptoIcons.arbi, color: '#28A0F0', symbol: 'ETH' },
  [optimism.id]: { name: 'Optimism', icon: CryptoIcons.op, color: '#FF0420', symbol: 'ETH' },
  [polygon.id]: { name: 'Polygon', icon: CryptoIcons.pol, color: '#8247E5', symbol: 'POL' },
  [bsc.id]: { name: 'BNB Chain', icon: CryptoIcons.bsc, color: '#F0B90B', symbol: 'BNB' },
  [avalanche.id]: { name: 'Avalanche', icon: CryptoIcons.avax, color: '#E84142', symbol: 'AVAX' },
  [baseSepolia.id]: { name: 'Base Sepolia', icon: CryptoIcons.base, color: '#0052FF', symbol: 'ETH' },
};
