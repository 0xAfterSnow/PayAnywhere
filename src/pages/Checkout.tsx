import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Sparkles, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider } from '@coral-xyz/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import ChainSelector from '@/components/checkout/ChainSelector';
import PaymentFlow from '@/components/checkout/PaymentFlow';
import { SUPPORTED_CHAINS } from '@/lib/constants';
import { PayAnywhereSDK, type PaymentData } from '@/lib/payAnywhere';
import { Coins02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
/** Tiny helper – turn a BN-like into a number safely */
const bnToNumber = (value: unknown): number => {
  if (value && typeof (value as any).toNumber === 'function') {
    try { return (value as any).toNumber(); } catch { return 0; }
  }
  return Number(value) || 0;
};

/** Decode a reference byte array to a string */
const decodeReference = (reference: number[] | Uint8Array): string => {
  const bytes = Array.from(reference).filter(Boolean);
  if (!bytes.length) return 'payment';
  return new TextDecoder().decode(new Uint8Array(bytes)).trim() || 'payment';
};

/** Status from the on-chain enum */
const getStatusLabel = (status: Record<string, unknown>): string => {
  if ('settled' in status) return 'Settled';
  if ('refunded' in status) return 'Refunded';
  return 'Pending';
};

const Checkout: React.FC = () => {
  const { merchantId, orderId } = useParams();
  const { connection } = useConnection();
  const [chainId, setChainId] = useState<number | null>(null);
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
  const { isConnected: evmConnected } = useAccount();

  // On-chain data states
  const [loadingOnChain, setLoadingOnChain] = useState(true);
  const [onChainError, setOnChainError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  // Read-only SDK (no wallet needed — just fetches data)
  const sdk = useMemo(() => {
    // Create a dummy keypair for read-only access — we only need connection
    const dummyKeypair = Keypair.generate();
    const provider = new AnchorProvider(
      connection,
      {
        publicKey: dummyKeypair.publicKey,
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any) => txs,
      } as any,
      { commitment: 'confirmed' },
    );
    return new PayAnywhereSDK(provider);
  }, [connection]);

  // Fetch payment data from on-chain
  useEffect(() => {
    if (!orderId) {
      setOnChainError('No payment address in URL');
      setLoadingOnChain(false);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      setLoadingOnChain(true);
      setOnChainError(null);

      try {
        // orderId is the payment PDA address
        const paymentPubkey = new PublicKey(orderId);
        const paymentResult = await sdk.fetchPayment(paymentPubkey);

        if (cancelled) return;

        if (!paymentResult.success || !paymentResult.data) {
          setOnChainError('Payment not found on Solana Devnet. It may not exist or the address is invalid.');
          setLoadingOnChain(false);
          return;
        }

        setPaymentData(paymentResult.data);
        // merchantId from URL is the business name — no on-chain merchant fetch needed
      } catch (err) {
        if (!cancelled) {
          setOnChainError(
            err instanceof Error && err.message.includes('Invalid public key')
              ? 'Invalid payment address in URL.'
              : 'Failed to fetch payment from Solana Devnet.'
          );
        }
      } finally {
        if (!cancelled) setLoadingOnChain(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [orderId, merchantId, sdk]);

  // Derived display data from on-chain
  const amount = paymentData ? bnToNumber(paymentData.amount) / 1_000_000 : 0;
  const reference = paymentData ? decodeReference(paymentData.reference) : orderId || 'payment';
  const status = paymentData ? getStatusLabel(paymentData.status as Record<string, unknown>) : 'Unknown';
  const merchantDisplayName = decodeURIComponent(merchantId || 'Merchant').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const isAlreadySettled = status === 'Settled';

  return (
    <div className="min-h-screen bg-warm-gradient">
      <div className="fixed inset-0 bg-noise pointer-events-none" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="border-b border-border/20 bg-background/60 backdrop-blur-2xl">
          <div className="container mx-auto flex h-14 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-primary/15 flex items-center justify-center">
                <HugeiconsIcon icon={Coins02Icon} color='hsl(258,72%,58%)' />
              </div>
              <span className="text-[15px] font-bold tracking-tight text-foreground">
                Pay<span className="text-primary">Anywhere</span>
              </span>            </Link>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" /> Secure
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">

            {/* Loading state */}
            {loadingOnChain && (
              <div className="surface-brand rounded-3xl p-10 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-sm font-bold text-foreground">Loading payment details...</p>
                <p className="text-xs text-muted-foreground mt-1">Fetching from Solana Devnet</p>
              </div>
            )}

            {/* Error state */}
            {!loadingOnChain && onChainError && (
              <div className="surface-brand rounded-3xl p-8 text-center">
                <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-2">Payment Not Found</h2>
                <p className="text-sm text-muted-foreground mb-5">{onChainError}</p>
                {orderId && (
                  <a
                    href={`https://explorer.solana.com/address/${orderId}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Check on Explorer <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}

            {/* Already settled */}
            {!loadingOnChain && !onChainError && isAlreadySettled && (
              <div className="surface-brand rounded-3xl p-8 text-center">
                <div className="text-4xl mb-4">✅</div>
                <h2 className="text-xl font-bold text-foreground mb-1">Payment Already Settled</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  ${amount.toFixed(2)} USDC was delivered to {merchantDisplayName}
                </p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full badge-settled text-xs font-bold">
                  Settled
                </span>
              </div>
            )}

            {/* Active payment */}
            {!loadingOnChain && !onChainError && !isAlreadySettled && paymentData && (
              <>
                <div className="surface-brand rounded-3xl p-7 mb-5">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/8 border border-primary/15 mb-4">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span className="text-xs font-semibold text-primary">Payment Request</span>
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">{merchantDisplayName}</p>
                    <h1 className="text-lg font-bold text-foreground mb-2">{reference}</h1>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-extrabold text-foreground tracking-tight">${amount.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground font-semibold">USDC</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 font-mono">
                      Amount verified on-chain · Cannot be modified
                    </p>
                  </div>

                  <div className="surface-card rounded-2xl p-4 space-y-2.5 mb-6">
                    {[
                      ['Settlement', 'USDC on Solana'],
                      ['Protocol', 'x402 + LI.FI'],
                      ['Status', status],
                      ['Payment PDA', orderId ? `${orderId.slice(0, 8)}...${orderId.slice(-6)}` : '-'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">{k}</span>
                        <span className={`font-bold ${k === 'Payment PDA' ? 'font-mono' : ''} text-foreground`}>{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* EVM Wallet Connect */}
                  {!evmConnected && (
                    <div className="mb-5">
                      <p className="text-xs font-bold text-muted-foreground mb-2.5">Connect your wallet</p>
                      <ConnectButton.Custom>
                        {({ openConnectModal }) => (
                          <button
                            onClick={openConnectModal}
                            className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/88 transition-all shadow-lg shadow-primary/20"
                          >
                            Connect EVM Wallet
                          </button>
                        )}
                      </ConnectButton.Custom>
                    </div>
                  )}

                  {evmConnected && (
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-muted-foreground">Wallet</span>
                        <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
                      </div>
                    </div>
                  )}

                  {amount > 0 ? (
                    <ChainSelector selectedChainId={chainId} onSelect={setChainId} />
                  ) : (
                    <p className="rounded-2xl bg-secondary px-4 py-3 text-center text-sm text-muted-foreground font-medium">
                      Invalid payment amount.
                    </p>
                  )}
                </div>

                {chain && amount > 0 ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <PaymentFlow
                      amount={amount}
                      chainId={chain.id}
                      chainName={chain.name}
                      onPay={(txHash) => {
                        console.log('Payment complete:', txHash);
                      }}
                    />
                  </motion.div>
                ) : amount > 0 ? (
                  <p className="text-center text-sm text-muted-foreground font-medium">
                    {!evmConnected ? 'Connect wallet to continue' : 'Select a chain to continue'}
                  </p>
                ) : null}
              </>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Checkout;
