import React from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, Clock3, DollarSign } from 'lucide-react';
import type { Payment } from '@/lib/constants';
import { HugeiconsIcon } from '@hugeicons/react';
import { Wallet02Icon, Task01Icon, CheckmarkBadge03Icon, Clock01Icon } from '@hugeicons/core-free-icons';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  emoji: React.ReactNode;
  delay?: number;
}

interface StatsCardsProps {
  payments: Payment[];
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, emoji, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
    className="surface-card rounded-3xl p-5"
  >
    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/8 border border-primary/10 text-lg">
      {emoji}
    </div>
    <p className="text-2xl font-extrabold leading-8 text-foreground">{value}</p>
    <p className="mt-1.5 text-sm text-muted-foreground font-medium">{label}</p>
  </motion.div>
);

const StatsCards: React.FC<StatsCardsProps> = ({ payments }) => {
  const settled = payments.filter((payment) => payment.status === 'Settled');
  const pending = payments.filter((payment) => payment.status === 'Pending');
  const totalVolume = settled.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard icon={DollarSign} emoji={<HugeiconsIcon icon={Wallet02Icon} />} label="Settled volume" value={`$${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
      <StatCard icon={Activity} emoji={<HugeiconsIcon icon={Task01Icon} />} label="Payment requests" value={payments.length.toString()} delay={0.05} />
      <StatCard icon={CheckCircle2} emoji={<HugeiconsIcon icon={CheckmarkBadge03Icon} />} label="Settled" value={settled.length.toString()} delay={0.1} />
      <StatCard icon={Clock3} emoji={<HugeiconsIcon icon={Clock01Icon} />} label="Pending" value={pending.length.toString()} delay={0.15} />
    </div>
  );
};

export default StatsCards;
