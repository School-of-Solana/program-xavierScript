# Escrow dApp Frontend

A decentralized escrow application for secure token swaps on Solana, built with Next.js, TypeScript, and Anchor.

## Features

- 🔐 **Secure Token Swaps**: Create escrows to swap tokens safely
- 💼 **Wallet Integration**: Connect with Phantom, Solflare, and other Solana wallets
- 📊 **View All Escrows**: Browse and take available escrows
- 🔄 **Refund Option**: Cancel your escrows and get your tokens back
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS

## Prerequisites

- Node.js 18+ and npm
- A Solana wallet (Phantom, Solflare, etc.)
- Solana CLI tools installed
- Devnet SOL and test tokens

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Make sure `.env.local` file exists with:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=Dyp4fYZC13qTa4TNTuoGqHKsyLZKBoB1iivDNSTdQ5rg
```

### 3. Set Up Test Tokens on Devnet

Before using the dApp, you need to create test tokens on Solana devnet:

**a. Configure Solana CLI to use devnet:**

```bash
solana config set --url devnet
```

**b. Check your CLI wallet address:**

```bash
solana address
```

**c. Airdrop some devnet SOL (if needed):**

```bash
solana airdrop 2
```

**d. Create two test tokens (Token A and Token B):**

```bash
# Create Token A
spl-token create-token
# Save the Token A mint address from the output

# Create Token B
spl-token create-token
# Save the Token B mint address from the output
```

**e. Get your browser wallet address:**

- Open your Phantom/Solflare wallet
- Copy your wallet address (e.g., `55czFRi1njMSE7eJyDLx1R5yS1Bi5GiL2Ek4F1cZPLFx`)

**f. Create token accounts and mint tokens to your browser wallet:**

```bash
# Replace <TOKEN_A_MINT> with your Token A mint address
# Replace <YOUR_BROWSER_WALLET> with your browser wallet address

# For Token A
spl-token create-account <TOKEN_A_MINT>
spl-token mint <TOKEN_A_MINT> 1000
spl-token transfer <TOKEN_A_MINT> 1000 <YOUR_BROWSER_WALLET> --fund-recipient

# For Token B
spl-token create-account <TOKEN_B_MINT>
spl-token mint <TOKEN_B_MINT> 1000
spl-token transfer <TOKEN_B_MINT> 1000 <YOUR_BROWSER_WALLET> --fund-recipient
```

**Example:**

```bash
# If Token A is: EhHWc7K6hsF4p5iabn4YkbtCKDzEaw69P2eZ6RRqoE6A
# And your browser wallet is: 55czFRi1njMSE7eJyDLx1R5yS1Bi5GiL2Ek4F1cZPLFx

spl-token transfer EhHWc7K6hsF4p5iabn4YkbtCKDzEaw69P2eZ6RRqoE6A 1000 55czFRi1njMSE7eJyDLx1R5yS1Bi5GiL2Ek4F1cZPLFx --fund-recipient
```

### 4. Run the Development Server

```bash
npm run dev
```

### 5. Open the App

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Connect Your Wallet

Click the "Connect Wallet" button and select your wallet (Phantom/Solflare).

**Important:** Make sure your wallet is set to **Devnet** network!

## Usage Guide

### Creating an Escrow

1. Connect your Solana wallet
2. Navigate to "Create Escrow" tab
3. Enter the required information:
   - Token A mint address (token you're depositing)
   - Deposit amount
   - Token B mint address (token you want to receive)
   - Receive amount
   - Unique seed number
4. Click "Create Escrow" and confirm the transaction

### Taking an Escrow

1. Connect your wallet
2. Go to "View All Escrows" tab
3. Browse available escrows
4. Click "Take Escrow" on your desired trade
5. Confirm the transaction

### Refunding an Escrow

1. Navigate to "View All Escrows" tab
2. Find your escrow (marked as "Your Escrow")
3. Click "Refund"
4. Confirm the transaction

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Solana, Anchor Framework
- **Wallet Adapters**: @solana/wallet-adapter

## Project Structure

```
src/
├── app/              # Next.js app directory
│   ├── layout.tsx    # Root layout with wallet provider
│   └── page.tsx      # Main page with tabs
├── components/       # React components
│   ├── WalletButton.tsx
│   ├── MakeEscrow.tsx
│   └── ViewEscrows.tsx
├── contexts/         # React contexts
│   └── WalletContextProvider.tsx
├── hooks/            # Custom hooks
│   └── useEscrowProgram.ts
├── idl/              # Anchor IDL and types
│   ├── escrow_program.json
│   └── types.ts
└── utils/            # Utility functions
    ├── constants.ts
    └── pda.ts
```

## Build for Production

```bash
npm run build
npm start
```

## Deploy

Deploy to Vercel with one command:

```bash
vercel
```

Or use any hosting platform that supports Next.js.

## Environment Variables

- `NEXT_PUBLIC_SOLANA_NETWORK`: Network to connect to (devnet/mainnet-beta)
- `NEXT_PUBLIC_SOLANA_RPC_URL`: RPC endpoint URL
- `NEXT_PUBLIC_PROGRAM_ID`: Your deployed escrow program's public key
