/**
 * LI.FI SDK Configuration
 *
 * Initializes the LI.FI SDK with EVM + Solana provider support.
 * The EVM provider is wired to wagmi so the SDK can sign transactions
 * through the user's connected wallet (MetaMask, WalletConnect, etc).
 */

import { createConfig, EVM, Solana } from '@lifi/sdk';
import { getWalletClient, switchChain } from '@wagmi/core';
import { wagmiConfig } from './evm-config';

let initialized = false;

/**
 * Initialize the LI.FI SDK.
 * Safe to call multiple times — only runs once.
 */
export function initLiFi() {
  if (initialized) return;

  createConfig({
    integrator: 'PayAnywhere',
    providers: [
      EVM({
        getWalletClient: async () => {
          const client = await getWalletClient(wagmiConfig);
          return client;
        },
        switchChain: async (chainId: number) => {
          await switchChain(wagmiConfig, { chainId });
          const client = await getWalletClient(wagmiConfig);
          return client;
        },
      }),
      Solana(),
    ],
  });

  initialized = true;
}
