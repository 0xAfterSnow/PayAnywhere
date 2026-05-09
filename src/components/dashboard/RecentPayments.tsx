import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ExternalLink } from 'lucide-react';
import type { Payment } from '@/lib/constants';
import { HugeiconsIcon } from '@hugeicons/react';
import { Activity01Icon } from '@hugeicons/core-free-icons';
const fmt = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const trunc = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

interface RecentPaymentsProps {
  payments: Payment[];
}

const RecentPayments: React.FC<RecentPaymentsProps> = ({ payments }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: 0.2 }}
    className="surface-card overflow-hidden rounded-3xl"
  >
    <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-xl bg-primary/8 flex items-center justify-center text-sm"><HugeiconsIcon icon={Activity01Icon} /></div>
        <h3 className="text-[15px] font-bold text-foreground">Recent activity</h3>
      </div>
      <span className="text-sm text-muted-foreground font-medium">{payments.length} total</span>
    </div>

    {!payments.length && (
      <div className="p-10 text-center">
        <div className="text-3xl mb-3"><HugeiconsIcon icon={Activity01Icon} /></div>
        <p className="text-sm font-bold text-foreground">No payments yet</p>
        <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted-foreground">Real settlement activity will appear here after payments are created on-chain.</p>
      </div>
    )}

    {!!payments.length && (
      <>
        <div className="divide-y divide-border/30 sm:hidden">
          {payments.map((payment) => (
            <div key={payment.id} className="space-y-2 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/8 border border-primary/10">
                    <ArrowDownRight className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">${payment.amount.toFixed(2)}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">{payment.reference}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${payment.status === 'Settled' ? 'badge-settled' : payment.status === 'Pending' ? 'badge-pending' : 'badge-refunded'
                  }`}>{payment.status}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{payment.sourceChain}</span>
                <span>{fmt(payment.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                {['Ref', 'Amount', 'Source', 'Payer', 'Status', 'Date', ''].map((heading) => (
                  <th key={heading} className={`px-5 py-3 text-xs font-bold text-muted-foreground ${heading === '' ? 'text-right' : 'text-left'}`}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {payments.map((payment) => (
                <tr key={payment.id} className="transition-colors hover:bg-primary/3">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/8 border border-primary/10">
                        <ArrowDownRight className="h-4 w-4 text-primary" />
                      </div>
                      <span className="max-w-[180px] truncate font-mono text-xs text-foreground font-medium">{payment.reference}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-foreground">${payment.amount.toFixed(2)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="chain-pill text-xs">{payment.sourceChain}</span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{trunc(payment.payer)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${payment.status === 'Settled' ? 'badge-settled' : payment.status === 'Pending' ? 'badge-pending' : 'badge-refunded'
                      }`}>{payment.status}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">{fmt(payment.createdAt)}</td>
                  <td className="px-5 py-4 text-right">
                    {payment.txSignature ? (
                      <button aria-label="Open transaction" className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
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

export default RecentPayments;
