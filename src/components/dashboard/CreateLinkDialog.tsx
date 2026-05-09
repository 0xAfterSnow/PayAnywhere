import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Copy, Check, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider } from '@coral-xyz/anchor';
import { PayAnywhereSDK } from '@/lib/payAnywhere';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link04Icon } from '@hugeicons/core-free-icons';

interface Props { merchantName?: string; onCreated?: () => void | Promise<void>; }

const CreateLinkDialog: React.FC<Props> = ({ merchantName, onCreated }) => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [slug, setSlug] = useState('');
  const [created, setCreated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentAddress, setPaymentAddress] = useState('');
  const { toast } = useToast();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();

  const sdk = useMemo(() => {
    if (!publicKey || !signTransaction || !signAllTransactions) return null;
    return new PayAnywhereSDK(
      new AnchorProvider(connection, { publicKey, signTransaction, signAllTransactions } as any, { commitment: 'confirmed' })
    );
  }, [connection, publicKey, signTransaction, signAllTransactions]);

  const slug4url = (merchantName || 'merchant').toLowerCase().trim().replace(/\s+/g, '-');
  const checkoutUrl = paymentAddress
    ? `${window.location.origin}/pay/${encodeURIComponent(slug4url)}/${paymentAddress}`
    : '';

  const handleCreate = async () => {
    if (!label || !sdk) return;
    setLoading(true);
    try {
      const usdcAmount = parseFloat(amount || '0');
      if (!usdcAmount || usdcAmount <= 0) {
        toast({ title: 'Amount required', description: 'Enter a USDC amount > 0.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      const ref = new Uint8Array(32);
      ref.set(new TextEncoder().encode((slug || label.toLowerCase().replace(/\s+/g, '-')).slice(0, 32)));

      const result = await sdk.createPayment({ amount: usdcAmount * 1e6, reference: Array.from(ref) as any });
      if (result.success) {
        setPaymentAddress(result.data?.paymentAddress || '');
        setCreated(true);
        toast({ title: 'Created ', description: `"${label}" is live on-chain.` });
        await onCreated?.();
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleClose = () => { setOpen(false); setTimeout(() => { setLabel(''); setAmount(''); setSlug(''); setCreated(false); setCopied(false); setPaymentAddress(''); }, 200); };

  return (
    <Dialog open={open} onOpenChange={(v) => v ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button className="h-11 rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary/88 shadow-lg shadow-primary/15 gap-2">
          <Plus className="h-4 w-4" /> New request
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl border-border/50 bg-card sm:max-w-sm p-6">
        <DialogHeader><DialogTitle className="text-lg font-bold">{created ? 'Created ' : 'New payment request'}</DialogTitle></DialogHeader>
        {!created ? (
          <div className="space-y-4 pt-2">
            <div><Label className="text-sm text-muted-foreground font-semibold mb-1.5 block">Label</Label><Input value={label} onChange={e => setLabel(e.target.value)} placeholder="Coffee" className="h-12 rounded-2xl border-border/60 bg-secondary" /></div>
            <div><Label className="text-sm text-muted-foreground font-semibold mb-1.5 block">Amount (USDC)</Label><Input type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="h-12 rounded-2xl border-border/60 bg-secondary" /></div>
            <div><Label className="text-sm text-muted-foreground font-semibold mb-1.5 block">Reference</Label><Input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="coffee" className="h-12 rounded-2xl border-border/60 bg-secondary" /></div>
            <Button onClick={handleCreate} disabled={!label || !amount || loading} className="w-full h-12 rounded-2xl bg-primary font-bold hover:bg-primary/88 shadow-lg shadow-primary/15 gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <HugeiconsIcon icon={Link04Icon} />} {loading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="surface-brand rounded-2xl p-5 text-center">
              <div className="flex items-center justify-center text-2xl mb-2">
                <HugeiconsIcon icon={Link04Icon} />
              </div>
              <p className="break-all rounded-xl bg-secondary px-3 py-2.5 font-mono text-xs">{checkoutUrl || 'Generating...'}</p>
              {amount && <p className="mt-2.5 text-sm text-muted-foreground font-semibold">${parseFloat(amount).toFixed(2)} USDC</p>}
            </div>
            <Button onClick={() => { navigator.clipboard.writeText(checkoutUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="w-full h-12 rounded-2xl bg-primary font-bold hover:bg-primary/88 gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button variant="outline" onClick={handleClose} className="w-full h-12 rounded-2xl border-border/60 font-semibold hover:bg-secondary">Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateLinkDialog;
