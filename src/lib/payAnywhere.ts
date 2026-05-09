/**
 * PayAnywhere SDK
 * TypeScript SDK for the PayAnywhere Solana escrow program.
 * Program ID: DzabFC9A3kvyxbetCvXcvAgCpu4bTp2zyzabVFeJV7Cn
 */

import { BN, Program, Provider } from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import IDL from "../idl/workspaceIDL.json";
import { PROGRAM_ID } from "./configAddress";

// ── Types ───────────────────────────────────────────────────────────────────

export interface MerchantData {
  bump: number;
  authority: PublicKey;
  usdcTokenAccount: PublicKey;
  feeBps: number;
  paymentCounter: BN;
  name: string;
}

export interface PaymentData {
  bump: number;
  merchant: PublicKey;
  amount: BN;
  status: { pending: {} } | { settled: {} } | { refunded: {} };
  reference: number[];
  payer: PublicKey;
  createdAt: BN;
  settledAt: BN;
}

export interface InitMerchantParams {
  name: string;
  feeBps: number;
}

export interface CreatePaymentParams {
  amount: number;
  reference: number[];
}

export interface SDKResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * PayAnywhere SDK class
 */
export class PayAnywhereSDK {
  private readonly provider: Provider;
  private readonly program: Program<any>;

  constructor(provider: Provider) {
    this.provider = provider;
    this.program = new Program(IDL as any, this.provider);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private safeBN(value: any, defaultValue: number | string = 0): BN {
    if (value === null || value === undefined) return new BN(defaultValue);
    if (typeof value === 'number') {
      if (isNaN(value) || !isFinite(value)) return new BN(defaultValue);
      return new BN(Math.floor(value).toString());
    }
    if (typeof value === 'string') {
      const n = parseFloat(value);
      if (isNaN(n)) return new BN(defaultValue);
      return new BN(Math.floor(n).toString());
    }
    if (value instanceof BN) return value;
    return new BN(defaultValue);
  }

  private safeBNToNumber(value: any, defaultValue: number = 0): number {
    try {
      return value && typeof value.toNumber === 'function' ? value.toNumber() : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private async getPDA(seeds: (string | PublicKey | Buffer | Uint8Array)[]): Promise<[PublicKey, number]> {
    const buffers = seeds.map(s => {
      if (typeof s === 'string') return Buffer.from(s, 'utf8');
      if (s instanceof PublicKey) return s.toBuffer();
      if (s instanceof Uint8Array) return Buffer.from(s);
      return s;
    });
    return PublicKey.findProgramAddressSync(buffers, this.program.programId);
  }

  private bnToSeedBuffer(value: BN, bytes: number = 8): Buffer {
    return value.toArrayLike(Buffer, "le", bytes);
  }

  private async testConnection(): Promise<boolean> {
    try {
      if (!this.provider?.connection) return false;
      const { value } = await this.provider.connection.getLatestBlockhashAndContext('finalized');
      return !!(value && value.blockhash);
    } catch {
      return false;
    }
  }

  // ── PDA Derivers ──────────────────────────────────────────────────────

  /** Derive Merchant PDA: seeds = [b"merchant", wallet] */
  async getMerchantPDA(wallet?: PublicKey): Promise<[PublicKey, number]> {
    const w = wallet || this.provider.publicKey!;
    return this.getPDA(["merchant", w]);
  }

  /** Derive Payment PDA: seeds = [b"payment", merchant_pda, counter_le_bytes] */
  async getPaymentPDA(merchantPDA: PublicKey, counter: BN): Promise<[PublicKey, number]> {
    return this.getPDA(["payment", merchantPDA, this.bnToSeedBuffer(counter)]);
  }

  // ── Instructions ──────────────────────────────────────────────────────

  /**
   * Initialize a Merchant PDA.
   * Creates: seeds = [b"merchant", wallet.pubkey()]
   */
  async initializeMerchant(params: InitMerchantParams): Promise<SDKResult<{ signature: string; merchantAddress: string }>> {
    if (!this.provider.publicKey) return { success: false, error: "Wallet not connected" };

    try {
      if (!(await this.testConnection())) return { success: false, error: "Network unavailable" };
      if (!params.name?.trim()) return { success: false, error: "Name required" };
      if (params.feeBps < 0 || params.feeBps > 10000) return { success: false, error: "Fee must be 0-10000" };

      const [merchantAddress] = await this.getMerchantPDA();
      // Use wallet's associated USDC token account as default
      const usdcMint = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
      const usdcAta = getAssociatedTokenAddressSync(usdcMint, this.provider.publicKey);

      const tx = await this.program.methods
        .initializeMerchant(params.name.trim(), usdcAta, params.feeBps)
        .accounts({
          merchant: merchantAddress,
          wallet: this.provider.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { success: true, data: { signature: tx, merchantAddress: merchantAddress.toString() } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Initialize failed" };
    }
  }

  /**
   * Create a Payment PDA.
   * seeds = [b"payment", merchant_pda, counter_le_bytes]
   */
  async createPayment(params: CreatePaymentParams): Promise<SDKResult<{ signature: string; paymentAddress: string }>> {
    if (!this.provider.publicKey) return { success: false, error: "Wallet not connected" };

    try {
      if (!(await this.testConnection())) return { success: false, error: "Network unavailable" };
      if (params.amount <= 0) return { success: false, error: "Amount must be > 0" };

      const [merchantAddress] = await this.getMerchantPDA();

      // Fetch merchant to get current payment_counter
      const merchantAccount = await this.program.account.merchant.fetch(merchantAddress);
      const counter = this.safeBN(merchantAccount.paymentCounter);
      const [paymentAddress] = await this.getPaymentPDA(merchantAddress, counter);

      const reference = params.reference.length === 32
        ? params.reference
        : new Array(32).fill(0).map((_, i) => params.reference[i] || 0);

      const tx = await this.program.methods
        .createPayment(this.safeBN(params.amount), reference)
        .accounts({
          payment: paymentAddress,
          merchant: merchantAddress,
          authority: this.provider.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { success: true, data: { signature: tx, paymentAddress: paymentAddress.toString() } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Create payment failed" };
    }
  }

  /**
   * Settle a Payment.
   * Transfers USDC from escrow to merchant, flips status to Settled.
   */
  async settlePayment(paymentAddress: PublicKey, escrowTokenAccount: PublicKey): Promise<SDKResult<{ signature: string }>> {
    if (!this.provider.publicKey) return { success: false, error: "Wallet not connected" };

    try {
      if (!(await this.testConnection())) return { success: false, error: "Network unavailable" };

      const paymentAccount = await this.program.account.payment.fetch(paymentAddress);
      const merchantPDA = paymentAccount.merchant;
      const merchantAccount = await this.program.account.merchant.fetch(merchantPDA);

      const [escrowAuthority] = await this.getPDA(["escrow_auth", escrowTokenAccount]);

      const tx = await this.program.methods
        .settlePayment()
        .accounts({
          payment: paymentAddress,
          merchant: merchantPDA,
          escrowTokenAccount,
          escrowAuthority,
          merchantTokenAccount: merchantAccount.usdcTokenAccount,
          authority: this.provider.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      return { success: true, data: { signature: tx } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Settlement failed" };
    }
  }

  // ── Account Getters ───────────────────────────────────────────────────

  /** Fetch merchant account */
  async fetchMerchant(wallet?: PublicKey): Promise<SDKResult<MerchantData>> {
    try {
      const [merchantPDA] = await this.getMerchantPDA(wallet);
      const account = await this.program.account.merchant.fetch(merchantPDA);
      return { success: true, data: account as MerchantData };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Account does not exist')) {
        return { success: false, error: "Merchant not initialized" };
      }
      return { success: false, error: "Failed to fetch merchant" };
    }
  }

  /** Fetch a specific payment */
  async fetchPayment(paymentAddress: PublicKey): Promise<SDKResult<PaymentData>> {
    try {
      const account = await this.program.account.payment.fetch(paymentAddress);
      return { success: true, data: account as PaymentData };
    } catch {
      return { success: false, error: "Failed to fetch payment" };
    }
  }

  /** Fetch all payments for a merchant */
  async getAllPayments(merchantPDA?: PublicKey): Promise<SDKResult<Array<{ publicKey: PublicKey; account: PaymentData }>>> {
    try {
      if (!(await this.testConnection())) return { success: false, error: "Network unavailable" };
      const all = await this.program.account.payment.all();
      if (!all?.length) return { success: true, data: [] };

      let filtered = all;
      if (merchantPDA) {
        filtered = all.filter((p: any) => p.account.merchant.toString() === merchantPDA.toString());
      }

      return {
        success: true,
        data: filtered.map((p: any) => ({ publicKey: p.publicKey, account: p.account })),
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Account does not exist')) {
        return { success: true, data: [] };
      }
      return { success: false, error: "Failed to fetch payments" };
    }
  }

  // ── Utility ───────────────────────────────────────────────────────────

  async fetchSolBalance(account?: PublicKey): Promise<SDKResult<number>> {
    const target = account || this.provider.publicKey;
    if (!target) return { success: false, error: "No account" };
    try {
      const bal = await this.provider.connection.getBalance(target);
      return { success: true, data: bal / LAMPORTS_PER_SOL };
    } catch {
      return { success: false, error: "Failed to fetch balance" };
    }
  }

  /** Listen for PaymentSettled events */
  onPaymentSettled(callback: (event: any) => void): number {
    return this.program.addEventListener('PaymentSettled', callback);
  }

  /** Remove event listener */
  removeListener(listenerId: number): void {
    this.program.removeEventListener(listenerId);
  }
}
