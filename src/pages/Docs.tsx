import React from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HugeiconsIcon } from '@hugeicons/react';
import { EarthIcon, CodesandboxIcon } from '@hugeicons/core-free-icons';

const snippets = {
  lifi: `import { createConfig, getRoutes, executeRoute, EVM, Solana } from '@lifi/sdk';

// 1. Initialize with EVM + Solana providers
createConfig({ 
  integrator: 'PayAnywhere',
  providers: [EVM({ getWalletClient, switchChain }), Solana()] 
});

// 2. Fetch cross-chain route to Solana
const routes = await getRoutes({
  fromChainId: 8453,        // Base
  toChainId: 1151111081099710, // Solana
  fromTokenAddress: NATIVE_TOKEN,
  toTokenAddress: USDC_MINT,
  fromAmount: '5000000',    // 5 USDC
  fromAddress: payerAddress,
  toAddress: merchantAddress,
  options: { slippage: 0.03, order: 'RECOMMENDED', allowSwitchChain: true }
});

// 3. Execute and monitor progress
await executeRoute(routes[0], {
  updateRouteHook: (route) => {
    console.log('Status:', route.steps);
  }
});`,

  anchor: `#[program]
pub mod workspace {
  pub fn initialize_merchant(
    ctx: Context<InitializeMerchant>,
    name: String,
    usdc_token_account: Pubkey,
    fee_bps: u16,
  ) -> Result<()> { ... }

  pub fn create_payment(
    ctx: Context<CreatePayment>,
    amount: u64,
    reference: [u8; 32],
  ) -> Result<()> { ... }

  pub fn settle_payment(
    ctx: Context<SettlePayment>,
  ) -> Result<()> { ... }
}`,
};

const DocBlock: React.FC<{ emoji: React.ReactNode; title: string; desc: string; code: string; delay: number }> = ({ emoji, title, desc, code, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay }}
    className="surface-card rounded-3xl overflow-hidden"
  >
    <div className="p-6 border-b border-border/30">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-9 w-9 rounded-xl bg-primary/8 border border-primary/10 flex items-center justify-center text-lg">
          {emoji}
        </div>
        <h3 className="text-[15px] font-bold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
    <div className="bg-secondary/40 p-5 overflow-x-auto">
      <pre className="font-mono text-xs leading-relaxed text-secondary-foreground whitespace-pre">{code}</pre>
    </div>
  </motion.div>
);

const Docs: React.FC = () => (
  <div className="min-h-screen bg-background">
    <div className="fixed inset-0 bg-noise pointer-events-none" />
    <Header />
    <main className="relative z-10 pt-28 pb-16">
      <div className="container mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/8 border border-primary/12 mb-6">
            <span className="text-xs font-bold text-primary">Developer Reference</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-3 tracking-tight">Technical Docs</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">LI.FI SDK, x402 protocol, and the Anchor escrow program.</p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-6">
          <DocBlock emoji={<HugeiconsIcon icon={EarthIcon} />} title="LI.FI SDK" desc="Production cross-chain routing. Destination-amount routing, wallet signing, and real bridge execution." code={snippets.lifi} delay={0} />
          <DocBlock emoji={<HugeiconsIcon icon={CodesandboxIcon} />} title="Anchor Escrow" desc="Three instructions, two events. PDA seeds, payment counters, escrow-to-merchant USDC transfer." code={snippets.anchor} delay={0.08} />
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Docs;
