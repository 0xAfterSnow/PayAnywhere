import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, ExternalLink, Link2 } from 'lucide-react';
import type { Payment } from '@/lib/constants';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link04Icon } from '@hugeicons/core-free-icons';
interface PaymentLinksTableProps {
  merchantAddress: string;
  merchantName: string;
  payments: Payment[];
}

const PaymentLinksTable: React.FC<PaymentLinksTableProps> = ({ merchantAddress, merchantName, payments }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const slug = merchantName.toLowerCase().trim().replace(/\s+/g, '-');
  const getPaymentUrl = (payment: Payment) => `${window.location.origin}/pay/${encodeURIComponent(slug)}/${payment.id}`;

  const handleCopy = (payment: Payment) => {
    navigator.clipboard.writeText(getPaymentUrl(payment));
    setCopiedId(payment.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpen = (payment: Payment) => {
    window.open(getPaymentUrl(payment), '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="surface-card overflow-hidden rounded-3xl"
    >
      <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-primary/8 flex items-center justify-center text-sm"><HugeiconsIcon icon={Link04Icon} /></div>
          <h3 className="text-[15px] font-bold text-foreground">Payment requests</h3>
        </div>
        <span className="text-sm text-muted-foreground font-medium">{payments.length} live</span>
      </div>

      {!payments.length && (
        <div className="p-10 text-center">
          <div className="text-3xl mb-3"><HugeiconsIcon icon={Link04Icon} /></div>
          <p className="text-sm font-bold text-foreground">No payment requests yet</p>
          <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted-foreground">Create one to generate a real on-chain payment account.</p>
        </div>
      )}

      {!!payments.length && (
        <>
          <div className="divide-y divide-border/30 sm:hidden">
            {payments.map((payment) => (
              <div key={payment.id} className="space-y-2.5 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{payment.reference}</p>
                    <p className="font-mono text-xs text-muted-foreground">{merchantAddress.slice(0, 6)}...{merchantAddress.slice(-4)}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${payment.status === 'Settled' ? 'badge-settled' : payment.status === 'Pending' ? 'badge-pending' : 'badge-refunded'
                    }`}>
                    {payment.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">USDC</span>
                  <span className="font-bold text-foreground">${payment.amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  {['Request', 'Amount', 'Payer', 'Status', 'Created', ''].map((heading) => (
                    <th key={heading} className={`px-5 py-3 text-xs font-bold text-muted-foreground ${heading === '' ? 'text-right' : 'text-left'}`}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {payments.map((payment) => (
                  <tr key={payment.id} className="group transition-colors hover:bg-primary/3">
                    <td className="px-5 py-4">
                      <p className="max-w-[220px] truncate text-sm font-bold text-foreground">{payment.reference}</p>
                      <p className="font-mono text-xs text-muted-foreground">{merchantAddress.slice(0, 6)}...{merchantAddress.slice(-4)}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-foreground">${payment.amount.toFixed(2)} USDC</td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-muted-foreground">{payment.payer.slice(0, 6)}...{payment.payer.slice(-4)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${payment.status === 'Settled' ? 'badge-settled' : payment.status === 'Pending' ? 'badge-pending' : 'badge-refunded'
                        }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button aria-label="Copy payment request" onClick={() => handleCopy(payment)} className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                          {copiedId === payment.id ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                        </button>
                        <button aria-label="Open payment request" onClick={() => handleOpen(payment)} className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default PaymentLinksTable;
