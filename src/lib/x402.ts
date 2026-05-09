/**
 * x402 Protocol Client — Production
 *
 * Implements the HTTP 402 Payment Required protocol client side.
 * Flow:
 * 1. GET /pay/:merchantId/:orderId → 402 with payment details
 * 2. Client pays via LI.FI → Solana program
 * 3. Client sends tx signature as X-PAYMENT header
 * 4. Backend verifies on-chain → returns 200 OK
 *
 * This module is a production-ready x402 client. Server-side verification
 * should be handled by a separate backend service.
 */

// ── Types ───────────────────────────────────────────────────────────────────

/** x402 payment request returned by server (HTTP 402 response) */
export interface X402PaymentRequest {
  status: 402;
  payment: {
    amount: string;
    currency: string;
    chain: string;
    recipient: string;
    reference: string;
    merchantId: string;
    orderId: string;
    expiresAt?: string;
  };
  accept: {
    chains: number[];
    tokens: string[];
  };
}

/** x402 payment proof sent by client */
export interface X402PaymentProof {
  txSignature: string;
  fromChain: number;
  fromToken: string;
  payer: string;
  timestamp: number;
}

/** x402 verification result from server */
export interface X402VerificationResult {
  verified: boolean;
  paymentStatus: 'pending' | 'settled' | 'failed';
  onChainData?: {
    amount: number;
    reference: string;
    settledAt: number;
  };
  error?: string;
}

// ── Client-side Implementation ──────────────────────────────────────────────

/**
 * Fetch x402 payment requirements from a payment URL.
 * Makes a GET request and expects a 402 response with payment details.
 *
 * @param paymentUrl The full payment URL (e.g. https://api.example.com/pay/merchant/order123)
 * @returns Payment requirements or null if the URL doesn't support x402
 */
export async function fetchPaymentRequirements(
  paymentUrl: string,
): Promise<X402PaymentRequest | null> {
  try {
    const res = await fetch(paymentUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (res.status === 402) {
      const data = await res.json();
      return data as X402PaymentRequest;
    }

    // URL responded but not with 402 — not a payable resource
    return null;
  } catch (error) {
    console.error('x402 payment requirements fetch failed:', error);
    return null;
  }
}

/**
 * Build a 402 Payment Required response body.
 * Used to construct payment details for the checkout flow.
 * In a server context, this would be returned as the HTTP 402 response.
 */
export function build402Response(
  merchantId: string,
  orderId: string,
  amount: string,
  recipient: string,
  supportedChains: number[] = [1, 8453, 42161, 10, 137, 56, 43114],
): X402PaymentRequest {
  return {
    status: 402,
    payment: {
      amount,
      currency: 'USDC',
      chain: 'solana',
      recipient,
      reference: orderId,
      merchantId,
      orderId,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    },
    accept: {
      chains: supportedChains,
      tokens: ['USDC', 'USDT', 'ETH', 'MATIC', 'BNB', 'AVAX'],
    },
  };
}

/**
 * Build the x402 payment proof object.
 * Client sends this after completing payment.
 */
export function buildPaymentProof(
  txSignature: string,
  fromChain: number,
  fromToken: string,
  payer: string,
): X402PaymentProof {
  return {
    txSignature,
    fromChain,
    fromToken,
    payer,
    timestamp: Date.now(),
  };
}

/**
 * Encode payment proof as a base64 header string.
 */
export function encodeProofHeader(proof: X402PaymentProof): string {
  return btoa(JSON.stringify(proof));
}

/**
 * Decode payment proof from a base64 header string.
 */
export function decodeProofHeader(header: string): X402PaymentProof | null {
  try {
    const decoded = atob(header);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Submit payment proof to the x402 server for verification.
 * Sends the proof as an X-PAYMENT header.
 *
 * @param verifyUrl The verification endpoint (e.g. https://api.example.com/pay/verify)
 * @param proof The payment proof to submit
 * @param orderId The order ID being verified
 * @returns Verification result from the server
 */
export async function submitPaymentProof(
  verifyUrl: string,
  proof: X402PaymentProof,
  orderId: string,
): Promise<X402VerificationResult> {
  try {
    const res = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PAYMENT': encodeProofHeader(proof),
      },
      body: JSON.stringify({ orderId }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        verified: true,
        paymentStatus: 'settled',
        onChainData: data.onChainData,
      };
    }

    const errorData = await res.json().catch(() => null);
    return {
      verified: false,
      paymentStatus: 'failed',
      error: errorData?.error || `Verification failed with status ${res.status}`,
    };
  } catch (error) {
    return {
      verified: false,
      paymentStatus: 'failed',
      error: error instanceof Error ? error.message : 'Verification request failed',
    };
  }
}
