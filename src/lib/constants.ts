import { CryptoIcons } from '@/components/crypto-icons';


export const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum', symbol: 'ETH', icon: CryptoIcons.eth },
  { id: 8453, name: 'Base', symbol: 'ETH', icon: CryptoIcons.base },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', icon: CryptoIcons.arbi },
  { id: 10, name: 'Optimism', symbol: 'ETH', icon: CryptoIcons.op },
  { id: 137, name: 'Polygon', symbol: 'MATIC', icon: CryptoIcons.pol },
  { id: 56, name: 'BSC', symbol: 'BNB', icon: CryptoIcons.bsc },
  { id: 43114, name: 'Avalanche', symbol: 'AVAX', icon: CryptoIcons.avax },
  { id: 11155111, name: 'Base Sepolia', symbol: 'ETH', icon: CryptoIcons.base },
] as const;

export const SOLANA_CHAIN_ID = 1151111081099710;

export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

export const PAYMENT_STATUSES = {
  PENDING: 'Pending',
  SETTLED: 'Settled',
  REFUNDED: 'Refunded',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUSES[keyof typeof PAYMENT_STATUSES];

export interface Payment {
  id: string;
  reference: string;
  amount: number;
  status: PaymentStatus;
  sourceChain: string;
  payer: string;
  merchant: string;
  createdAt: string;
  settledAt?: string;
  txSignature?: string;
}

export interface MerchantConfig {
  name: string;
  wallet: string;
  usdcAccount: string;
  feeBps: number;
  paymentCount: number;
}

export interface PaymentLink {
  id: string;
  label: string;
  amount: number;
  currency: string;
  slug: string;
  active: boolean;
  createdAt: string;
  paymentsReceived: number;
  totalCollected: number;
}
