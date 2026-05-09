import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AnchorProvider } from '@coral-xyz/anchor';
import { PayAnywhereSDK } from '@/lib/payAnywhere';
import { HugeiconsIcon } from '@hugeicons/react';
import { Store01Icon, ShoppingBag03Icon } from '@hugeicons/core-free-icons';

interface Props { onComplete: () => void; }

const MerchantSetup: React.FC<Props> = ({ onComplete }) => {
  const { connected, publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const { toast } = useToast();
  const [merchantName, setMerchantName] = useState('');
  const [feeBps, setFeeBps] = useState('100');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const sdk = useMemo(() => {
    if (!publicKey || !signTransaction || !signAllTransactions) return null;
    return new PayAnywhereSDK(
      new AnchorProvider(connection, { publicKey, signTransaction, signAllTransactions } as any, { commitment: 'confirmed' })
    );
  }, [connection, publicKey, signTransaction, signAllTransactions]);

  const handleInitialize = async () => {
    if (!sdk || !publicKey) return;
    setLoading(true);
    try {
      const result = await sdk.initializeMerchant({ name: merchantName, feeBps: parseInt(feeBps || '0') });
      if (result.success) {
        toast({ title: 'Merchant initialized ✨', description: 'PDA created on Solana Devnet.' });
        onComplete();
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="min-h-[60vh] flex items-center justify-center">
      <div className="surface-brand rounded-3xl p-8 max-w-sm w-full mx-auto">
        <div className="text-center mb-7">
          <div className="flex items-center justify-center text-4xl mb-3"><HugeiconsIcon icon={Store01Icon} /></div>
          <h2 className="text-xl font-extrabold text-foreground mb-1.5">Merchant Setup</h2>
          <p className="text-sm text-muted-foreground">Initialize your merchant PDA on Solana.</p>
        </div>

        <div className="flex items-center justify-center gap-1.5 mb-7">
          {[0, 1, 2].map((s) => (
            <div key={s} className={`h-1.5 rounded-full transition-all ${s <= step ? 'w-10 bg-primary' : 'w-4 bg-secondary'}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-5">
            <div className="surface-card rounded-2xl p-5 text-center">
              <div className="flex items-center justify-center text-2xl mb-2">
                <HugeiconsIcon icon={ShoppingBag03Icon} />
              </div>
              <p className="text-sm text-muted-foreground mb-4">Connect your Solana wallet</p>
              {connected ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold">
                    <CheckCircle className="h-4 w-4" /> Connected
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
                  </p>
                </div>
              ) : (
                <WalletMultiButton />
              )}
            </div>
            {connected && (
              <Button onClick={() => setStep(1)} className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/88 rounded-2xl font-bold gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <Label className="text-sm text-muted-foreground font-semibold mb-1.5 block">Name</Label>
              <Input value={merchantName} onChange={(e) => setMerchantName(e.target.value)} placeholder="My Store" className="h-12 rounded-2xl bg-secondary border-border/60" />
            </div>
            <div className="flex gap-2.5">
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1 h-11 border-border/60 rounded-2xl font-semibold">Back</Button>
              <Button onClick={() => setStep(2)} disabled={!merchantName} className="flex-1 h-11 bg-primary rounded-2xl font-bold gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="surface-card rounded-2xl p-4 space-y-3">
              {[
                ['Wallet', `${publicKey?.toString().slice(0, 8)}...${publicKey?.toString().slice(-8)}`],
                ['Business', merchantName],
                ['Fee', `${feeBps} bps (${(parseInt(feeBps || '0') / 100).toFixed(1)}%)`],
                ['Settlement', 'USDC on Solana'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">{k}</span>
                  <span className={`text-xs font-bold ${k === 'Settlement' ? 'text-primary' : 'text-foreground'}`}>{v}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">Creates a Merchant PDA on Devnet.</p>
            <div className="flex gap-2.5">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-11 border-border/60 rounded-2xl font-semibold">Back</Button>
              <Button onClick={handleInitialize} disabled={loading} className="flex-1 h-11 bg-primary rounded-2xl font-bold gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? 'Initializing...' : 'Initialize'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MerchantSetup;
