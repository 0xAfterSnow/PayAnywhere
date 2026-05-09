import { CryptoIcons } from '@/components/crypto-icons';


export const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum', symbol: 'ETH', color: '#627EEA', icon: CryptoIcons.eth },
  { id: 8453, name: 'Base', symbol: 'ETH', color: '#0052FF', icon: CryptoIcons.base },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', color: '#28A0F0', icon: CryptoIcons.arbi },
  { id: 10, name: 'Optimism', symbol: 'ETH', color: '#FF0420', icon: CryptoIcons.op },
  { id: 137, name: 'Polygon', symbol: 'MATIC', color: '#8247E5', icon: CryptoIcons.pol },
  { id: 56, name: 'BSC', symbol: 'BNB', color: '#F0B90B', icon: CryptoIcons.bsc },
  { id: 43114, name: 'Avalanche', symbol: 'AVAX', color: '#E84142', icon: CryptoIcons.avax },
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
