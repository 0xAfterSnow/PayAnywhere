import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatsCards from '@/components/dashboard/StatsCards';
import PaymentLinksTable from '@/components/dashboard/PaymentLinksTable';
import RecentPayments from '@/components/dashboard/RecentPayments';
import CreateLinkDialog from '@/components/dashboard/CreateLinkDialog';
import MerchantSetup from '@/components/dashboard/MerchantSetup';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboardData } from '@/hooks/use-dashboard-data';

const Dashboard: React.FC = () => {
  const { connected } = useWallet();
  const { data, error, loading, merchantMissing, refresh } = useDashboardData();
  const shouldSetup = !connected || merchantMissing;

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-noise pointer-events-none" />
      <Header />
      <main className="relative z-10 pb-12 pt-24">
        <div className="container mx-auto max-w-4xl pt-8">
          {shouldSetup ? (
            <MerchantSetup onComplete={refresh} />
          ) : loading && !data ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="surface-card flex items-center gap-3 rounded-2xl px-6 py-4 text-sm text-muted-foreground font-medium">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Loading live dashboard...
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <h1 className="text-3xl font-extrabold leading-tight text-foreground">Dashboard</h1>
                  <p className="text-sm text-muted-foreground mt-1">Live merchant data from Solana Devnet.</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Button variant="outline" onClick={refresh} disabled={loading} className="h-10 rounded-2xl border-border/60 px-4 text-sm font-semibold gap-2">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <CreateLinkDialog merchantName={data?.merchant?.name} onCreated={refresh} />
                </div>
              </motion.div>

              {error && (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-3.5 text-sm text-destructive font-medium">
                  {error}
                </div>
              )}

              {data && (
                <>
                  <StatsCards payments={data.payments} />
                  <PaymentLinksTable merchantAddress={data.merchantAddress} merchantName={data.merchant.name} payments={data.payments} />
                  <RecentPayments payments={data.payments} />
                </>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
