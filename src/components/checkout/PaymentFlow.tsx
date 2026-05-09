import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, ArrowRight, ExternalLink, Zap, Shield, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccount, useSwitchChain } from 'wagmi';
import { getRoutes, executeRoute as execRoute, USDC_ADDRESSES, NATIVE_TOKEN } from '@/lib/lifi';
import { USDC_MINT } from '@/lib/constants';
import type { Route } from '@lifi/sdk';

type Step = 'idle' | 'connecting' | 'routing' | 'approving' | 'bridging' | 'settling' | 'complete' | 'error';

const labels: Record<Step, string> = {
  idle: 'Ready',
  connecting: 'Connecting wallet...',
  routing: 'Finding best route via LI.FI...',
  approving: 'Approve in wallet...',
  bridging: 'Bridging to Solana...',
  settling: 'Settling USDC...',
  complete: 'Payment settled!',
  error: 'Something went wrong',
};

interface Props {
  amount: number;
  chainId: number;
  chainName: string;
  merchantAddress?: string;
  onPay: (txHash?: string) => void;
}

const PaymentFlow: React.FC<Props> = ({ amount, chainId, chainName, merchantAddress, onPay }) => {
  const [step, setStep] = useState<Step>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ gasCost: string; estimatedTime: number } | null>(null);
  const { address, isConnected, chainId: connectedChainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const run = useCallback(async () => {
    if (!address || !isConnected) {
      setStep('error');
      setErrorMsg('Please connect your EVM wallet first');
      return;
    }

    setStep('routing');
    setErrorMsg('');

    try {
      // Switch chain if needed
      if (connectedChainId !== chainId) {
        setStep('connecting');
        try {
          switchChain({ chainId });
          // Give wallet time to switch
          await new Promise((r) => setTimeout(r, 1500));
        } catch {
          setStep('error');
          setErrorMsg('Please switch to ' + chainName + ' in your wallet');
          return;
        }
      }

      // Find routes via LI.FI SDK
      setStep('routing');
      const usdcAmount = Math.floor(amount * 1_000_000).toString(); // 6 decimals
      const fromToken = USDC_ADDRESSES[chainId] || NATIVE_TOKEN;
      const toAddress = merchantAddress || USDC_MINT;

      const routes = await getRoutes({
        fromChainId: chainId,
        fromTokenAddress: fromToken,
        toChainId: 1151111081099710, // Solana
        toTokenAddress: USDC_MINT,
        fromAmount: usdcAmount,
        fromAddress: address,
        toAddress,
      });

      if (!routes.length) {
        setStep('error');
        setErrorMsg('No routes available for this chain/token. Try a different chain.');
        return;
      }

      const route = routes[0];
      setRouteInfo({
        gasCost: route.gasCostUSD || '0',
        estimatedTime: route.steps.reduce((t, s) => t + (s.estimate?.executionDuration || 0), 0),
      });

      // Execute route via LI.FI SDK (real wallet signing)
      setStep('approving');
      const result = await execRoute(route, {
        onUpdate: (update) => {
          if (update.txHash) setTxHash(update.txHash);
          if (update.status === 'PENDING') {
            const stepIndex = update.currentStep;
            if (stepIndex <= 1) setStep('approving');
            else if (stepIndex <= 2) setStep('bridging');
            else setStep('settling');
          }
        },
        onStepComplete: (completedStep) => {
          if (completedStep >= 2) setStep('settling');
        },
      });

      if (result.success) {
        setTxHash(result.txHash || null);
        setStep('complete');
        onPay(result.txHash);
      } else {
        setStep('error');
        setErrorMsg(result.error || 'Payment execution failed');
      }
    } catch (err) {
      setStep('error');
      setErrorMsg(err instanceof Error ? err.message : 'Unexpected error');
    }
  }, [address, isConnected, connectedChainId, chainId, chainName, amount, merchantAddress, switchChain, onPay]);

  const processing = !['idle', 'complete', 'error'].includes(step);
  const done = step === 'complete';

  const activeSteps: Step[] = ['routing', 'approving', 'bridging', 'settling', 'complete'];

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {step !== 'idle' && step !== 'error' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="surface-card rounded-2xl p-5 space-y-3"
          >
            {activeSteps.map((s, i) => {
              const cur = activeSteps.indexOf(step);
              const isActive = i === cur;
              const isDone = i < cur;
              return (
                <div key={s} className="flex items-center gap-3">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-primary shadow-md shadow-primary/20'
                        : isActive
                        ? 'bg-primary/10 border-2 border-primary/30'
                        : 'bg-secondary border border-border/60'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle className="h-3.5 w-3.5 text-primary-foreground" />
                    ) : isActive ? (
                      <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/25" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      isDone ? 'text-primary font-semibold' : isActive ? 'text-foreground font-bold' : 'text-muted-foreground'
                    }`}
                  >
                    {labels[s]}
                  </span>
                </div>
              );
            })}

            {routeInfo && processing && (
              <div className="flex items-center gap-4 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                <span>~${routeInfo.gasCost} gas</span>
                <span>~{Math.ceil(routeInfo.estimatedTime / 60)}min</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {step === 'error' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-center"
        >
          <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">Payment Failed</h3>
          <p className="text-xs text-muted-foreground mb-3">{errorMsg}</p>
          <Button
            onClick={() => { setStep('idle'); setErrorMsg(''); }}
            variant="outline"
            className="h-9 rounded-full text-sm"
          >
            Try Again
          </Button>
        </motion.div>
      )}

      {done && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="surface-brand rounded-2xl p-6 text-center"
        >
          <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">Payment Settled ✨</h3>
          <p className="text-sm text-muted-foreground mb-4">
            ${amount.toFixed(2)} USDC delivered on Solana
          </p>
          <div className="flex items-center justify-center gap-5 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" /> x402 verified
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Live bridge
            </span>
          </div>
          {txHash && (
            <a
              href={`https://solscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              View on Solscan <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </motion.div>
      )}

      {!done && step !== 'error' && (
        <Button
          onClick={run}
          disabled={processing || !isConnected}
          className="w-full h-12 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/88 rounded-2xl gap-2.5 disabled:opacity-50 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all"
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Processing...
            </>
          ) : !isConnected ? (
            'Connect EVM wallet first'
          ) : (
            <>
              <Zap className="h-4 w-4" /> Pay ${amount.toFixed(2)} from {chainName}{' '}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      )}

      <div className="flex items-center justify-center gap-2.5 text-xs text-muted-foreground">
        <span>Powered by</span>
        <span className="font-bold text-foreground">LI.FI</span>
        <span className="opacity-30">·</span>
        <span className="font-bold text-foreground">x402</span>
      </div>
    </div>
  );
};

export default PaymentFlow;