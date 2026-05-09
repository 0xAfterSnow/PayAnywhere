import React, { useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/evm-config';
import { initLiFi } from '@/lib/lifi-config';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import Docs from './pages/Docs';
import NotFound from './pages/NotFound';

import '@solana/wallet-adapter-react-ui/styles.css';
import '@rainbow-me/rainbowkit/styles.css';

// Initialize LI.FI SDK once at app level
initLiFi();

const queryClient = new QueryClient();

const App = () => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={lightTheme({
                        accentColor: '#8B5CF6',
                        accentColorForeground: 'white',
                        borderRadius: 'large',
                        fontStack: 'rounded',
                    })}
                >
                    <ConnectionProvider endpoint={endpoint}>
                        <WalletProvider wallets={wallets} autoConnect>
                            <WalletModalProvider>
                                <Routes>
                                    <Route path="/" element={<Index />} />
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/pay/:merchantId/:orderId" element={<Checkout />} />
                                    <Route path="/docs" element={<Docs />} />
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                                <Toaster />
                            </WalletModalProvider>
                        </WalletProvider>
                    </ConnectionProvider>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};

export default App;
