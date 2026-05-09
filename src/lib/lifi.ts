/**
 * LI.FI SDK Integration — Production
 *
 * Handles cross-chain routing from any EVM chain to Solana USDC.
 * Uses the official @lifi/sdk for route finding and execution.
 *
 * SDK docs: https://docs.li.fi/integrate-li.fi-sdk/li.fi-sdk
 */

import { getRoutes as lifiGetRoutes, executeRoute as lifiExecuteRoute, type Route, type RouteExtended } from '@lifi/sdk';
import { USDC_MINT, SOLANA_CHAIN_ID, SUPPORTED_CHAINS } from './constants';
import { initLiFi } from './lifi-config';

// ── Types ───────────────────────────────────────────────────────────────────

export interface LiFiRouteRequest {
  fromChainId: number;
  fromTokenAddress: string;
  toChainId: number;
  toTokenAddress: string;
  fromAmount: string;
  fromAddress: string;
  toAddress: string;
}

export interface RouteUpdate {
  status: 'NOT_STARTED' | 'PENDING' | 'DONE' | 'FAILED';
  currentStep: number;
  totalSteps: number;
  txHash?: string;
  substatus?: string;
}

// ── Configuration ───────────────────────────────────────────────────────────

/**
 * Native token addresses per chain (for paying gas).
 * Use 0x0 for native tokens in LI.FI.
 */
export const NATIVE_TOKEN = '0x0000000000000000000000000000000000000000';

/**
 * Common USDC addresses per chain.
 */
export const USDC_ADDRESSES: Record<number, string> = {
  1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',      // Ethereum
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',    // Base
  42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',   // Arbitrum
  10: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',      // Optimism
  137: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',     // Polygon
  56: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',      // BSC
  43114: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',   // Avalanche
  84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',   // Base Sepolia
};

// ── Route Finder ────────────────────────────────────────────────────────────

/**
 * Build a LI.FI route request.
 *
 * @param fromChainId Source chain ID (e.g. 1 for Ethereum)
 * @param fromTokenAddress Source token (native or ERC20)
 * @param fromAmount Amount in smallest units of source token
 * @param fromAddress Payer's EVM address
 * @param toAddress Merchant's Solana USDC token account
 */
export function buildRouteRequest(
  fromChainId: number,
  fromTokenAddress: string,
  fromAmount: string,
  fromAddress: string,
  toAddress: string,
): LiFiRouteRequest {
  return {
    fromChainId,
    fromTokenAddress,
    toChainId: SOLANA_CHAIN_ID,
    toTokenAddress: USDC_MINT,
    fromAmount,
    fromAddress,
    toAddress,
  };
}

/**
 * Fetch routes from LI.FI SDK.
 * Uses the official SDK — returns real cross-chain routes with quotes.
 */
export async function getRoutes(request: LiFiRouteRequest): Promise<Route[]> {
  initLiFi();

  try {
    const result = await lifiGetRoutes({
      fromChainId: request.fromChainId,
      fromTokenAddress: request.fromTokenAddress,
      toChainId: request.toChainId,
      toTokenAddress: request.toTokenAddress,
      fromAmount: request.fromAmount,
      fromAddress: request.fromAddress,
      toAddress: request.toAddress,
      options: {
        slippage: 0.03,
        order: 'RECOMMENDED',
        allowSwitchChain: true,
      },
    });

    return result.routes || [];
  } catch (error) {
    console.error('LI.FI route fetch failed:', error);
    return [];
  }
}

/**
 * Execute a route via the LI.FI SDK.
 * This uses the real SDK — triggers wallet signing, chain switching,
 * and monitors execution across chains.
 *
 * @param route The route to execute (from getRoutes)
 * @param callbacks Optional callbacks for status updates
 * @returns Execution result with tx hash
 */
export async function executeRoute(
  route: Route,
  callbacks?: {
    onUpdate?: (update: RouteUpdate) => void;
    onStepComplete?: (step: number) => void;
  }
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  initLiFi();

  try {
    const totalSteps = route.steps.length;

    callbacks?.onUpdate?.({
      status: 'PENDING',
      currentStep: 1,
      totalSteps,
    });

    const executedRoute: RouteExtended = await lifiExecuteRoute(route, {
      updateRouteHook(updatedRoute) {
        // Find the current executing step
        const currentStepIndex = updatedRoute.steps.findIndex(
          (step) => step.execution && step.execution.status === 'PENDING'
        );
        const completedSteps = updatedRoute.steps.filter(
          (step) => step.execution?.status === 'DONE'
        ).length;

        const lastTxHash = updatedRoute.steps
          .flatMap((s) => s.execution?.process || [])
          .filter((p) => p.txHash)
          .pop()?.txHash;

        callbacks?.onUpdate?.({
          status: completedSteps === totalSteps ? 'DONE' : 'PENDING',
          currentStep: Math.max(currentStepIndex + 1, completedSteps),
          totalSteps,
          txHash: lastTxHash,
          substatus: updatedRoute.steps[currentStepIndex]?.execution?.process
            ?.filter((p) => p.status === 'PENDING')
            .pop()?.message,
        });

        if (completedSteps > 0) {
          callbacks?.onStepComplete?.(completedSteps);
        }
      },
    });

    // Get final tx hash from completed route
    const finalTxHash = executedRoute.steps
      .flatMap((s) => s.execution?.process || [])
      .filter((p) => p.txHash)
      .pop()?.txHash;

    callbacks?.onUpdate?.({
      status: 'DONE',
      currentStep: totalSteps,
      totalSteps,
      txHash: finalTxHash,
    });

    return { success: true, txHash: finalTxHash };
  } catch (error) {
    callbacks?.onUpdate?.({
      status: 'FAILED',
      currentStep: 0,
      totalSteps: route.steps.length,
    });
    return { success: false, error: error instanceof Error ? error.message : 'Execution failed' };
  }
}

/**
 * Get estimated gas + bridge cost for a route.
 */
export function getRouteCost(route: Route): {
  gasCostUSD: string;
  estimatedTime: number;
  fromAmount: string;
  toAmount: string;
} {
  return {
    gasCostUSD: route.gasCostUSD || '0',
    estimatedTime: route.steps.reduce((t, s) => t + (s.estimate?.executionDuration || 0), 0),
    fromAmount: route.fromAmount,
    toAmount: route.toAmount,
  };
}

/**
 * Get chain display info.
 */
export function getChainInfo(chainId: number) {
  return SUPPORTED_CHAINS.find((c) => c.id === chainId) || null;
}
