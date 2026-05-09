# PayAnywhere

**PayAnywhere** is a cutting-edge cross-chain payment platform that enables merchants to seamlessly accept USDC on Solana, while empowering users to pay from over 60+ different EVM chains. 

Built for modern web3 commerce, PayAnywhere abstracts away the complexities of bridging and cross-chain execution, delivering a smooth, instant, and secure checkout experience.

---

## ✨ Features

- **Cross-Chain Native:** Powered by the **LI.FI SDK**, enabling direct routing from major EVM networks (Ethereum, Base, Arbitrum, Optimism, Polygon, BSC, Avalanche) to Solana.
- **Destination-Amount Routing:** Guarantees exact USDC delivery to the merchant, no matter what token or chain the payer starts with.
- **Anchor Escrow Program:** A lean, auditable Solana program built with Anchor. It uses PDAs (Program Derived Addresses) to securely hold and route funds with zero bloat.
- **Shareable Payment Links:** Merchants can generate simple, shareable URLs (`/pay/:merchantSlug/:paymentPda`) that can be embedded anywhere.
- **Real-time On-Chain Verification:** Payment details and statuses are fetched and verified directly from the Solana Devnet blockchain—preventing URL tampering.
- **Wallet Agnostic:** Built with **Wagmi** and **RainbowKit** for seamless EVM wallet connections, alongside the **Solana Wallet Adapter** for merchant setups.
- **Premium UI/UX:** Styled with **Tailwind CSS** and animated using **Framer Motion** for a stunning, responsive, and dynamic interface.

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 18, Vite, TypeScript
- **Styling & UI:** Tailwind CSS, Framer Motion, Radix UI, Hugeicons
- **Cross-Chain Routing:** `@lifi/sdk`
- **EVM Integration:** `wagmi`, `viem`, `@rainbow-me/rainbowkit`
- **Solana Integration:** `@solana/web3.js`, `@coral-xyz/anchor`, `@solana/wallet-adapter-react`

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- `pnpm` (or `npm`/`yarn`)

### Installation

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/0xAfterSnow/PayAnywhere
   cd PayAnywhere
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   pnpm install
   \`\`\`

3. **Environment Variables:**
   Create a `.env.local` file in the root directory and add any necessary environment variables (e.g., WalletConnect Project ID for RainbowKit):
   \`\`\`env
   VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
   VITE_USE_TESTNET=true
   \`\`\`

4. **Start the development server:**
   \`\`\`bash
   pnpm dev
   \`\`\`

The app will be available at `http://localhost:5173`.

---

## 📖 How it Works

### For Merchants
1. Connect a Solana wallet and navigate to the **Dashboard**.
2. Initialize a merchant profile (creates an on-chain PDA).
3. Generate a Payment Link by specifying a label and an exact USDC amount.
4. Share the generated URL with customers.

### For Payers
1. Click the payment link to access the secure Checkout page.
2. The page fetches the exact payment requirement directly from the Solana Devnet.
3. Connect any EVM wallet (MetaMask, WalletConnect, etc.).
4. Select the source chain and token to pay with.
5. Sign the transaction. LI.FI handles the bridging and execution, dropping the exact USDC amount into the merchant's Solana escrow.

---

## 🏗️ Architecture Notes

- **SDK vs. Widget:** The project integrates the raw `@lifi/sdk` rather than the pre-built widget. This allows for a completely custom, white-labeled checkout experience while maintaining robust routing capabilities.
- **Security:** Payment data (amount, recipient) is never trusted from the URL parameters alone. The checkout page always queries the Solana program using the payment PDA to enforce integrity.

---

## 📄 License

This project is licensed under the MIT License.
