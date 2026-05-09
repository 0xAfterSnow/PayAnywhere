import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnchorProvider } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PayAnywhereSDK, type MerchantData } from '@/lib/payAnywhere';
import type { Payment, PaymentStatus } from '@/lib/constants';

const USDC_DECIMALS = 1_000_000;

const getStatus = (status: Record<string, unknown>): PaymentStatus => {
  if ('settled' in status) return 'Settled';
  if ('refunded' in status) return 'Refunded';
  return 'Pending';
};

const bnToNumber = (value: unknown): number => {
  if (value && typeof (value as { toNumber?: () => number }).toNumber === 'function') {
    return (value as { toNumber: () => number }).toNumber();
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const decodeReference = (reference: number[] | Uint8Array): string => {
  const bytes = Array.from(reference).filter(Boolean);
  if (!bytes.length) return 'payment';

  const decoded = new TextDecoder().decode(new Uint8Array(bytes)).trim();
  return decoded || 'payment';
};

export interface DashboardData {
  merchantAddress: string;
  merchant: MerchantData;
  payments: Payment[];
}

export const useDashboardData = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [merchantMissing, setMerchantMissing] = useState(false);

  const sdk = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) return null;

    const provider = new AnchorProvider(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      } as any,
      { commitment: 'confirmed' },
    );

    return new PayAnywhereSDK(provider);
  }, [connection, wallet.publicKey, wallet.signAllTransactions, wallet.signTransaction]);

  const refresh = useCallback(async () => {
    if (!wallet.connected || !wallet.publicKey || !sdk) {
      setData(null);
      setError(null);
      setMerchantMissing(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [merchantPDA] = await sdk.getMerchantPDA(wallet.publicKey);
      const merchantResult = await sdk.fetchMerchant(wallet.publicKey);

      if (!merchantResult.success || !merchantResult.data) {
        setData(null);
        setMerchantMissing(merchantResult.error === 'Merchant not initialized');
        setError(merchantResult.error === 'Merchant not initialized' ? null : merchantResult.error || 'Unable to load merchant');
        return;
      }

      const paymentsResult = await sdk.getAllPayments(merchantPDA);
      const payments = (paymentsResult.data || [])
        .map(({ publicKey, account }) => {
          const createdAt = bnToNumber(account.createdAt);
          const settledAt = bnToNumber(account.settledAt);
          const reference = decodeReference(account.reference);

          return {
            id: publicKey.toString(),
            reference,
            amount: bnToNumber(account.amount) / USDC_DECIMALS,
            status: getStatus(account.status as Record<string, unknown>),
            sourceChain: 'Solana',
            payer: account.payer.toString(),
            merchant: account.merchant.toString(),
            createdAt: createdAt ? new Date(createdAt * 1000).toISOString() : new Date().toISOString(),
            settledAt: settledAt ? new Date(settledAt * 1000).toISOString() : undefined,
            txSignature: undefined,
          } satisfies Payment;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setData({
        merchantAddress: merchantPDA.toString(),
        merchant: merchantResult.data,
        payments,
      });
      setMerchantMissing(false);
      setError(paymentsResult.success ? null : paymentsResult.error || 'Unable to load payments');
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : 'Unable to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [sdk, wallet.connected, wallet.publicKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    error,
    loading,
    merchantMissing,
    refresh,
    sdk,
  };
};
