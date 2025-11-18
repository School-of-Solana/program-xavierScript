# Project Description

**Deployed Frontend URL:** https://escrow-frontend-nu.vercel.app/

**Solana Program ID:** 9pdSoyn1kfAN4bD4cWFTZCu82sg44tEAdTGVtKLpUoCd

## Project Overview

### Description

A decentralized escrow application for secure token swaps on Solana. Makers can lock Token A into a vault and specify how much Token B they want to receive. A taker can fulfill the trade by paying the requested Token B, after which the program releases the vaulted Token A to the taker. The maker can refund the escrow any time before it is taken. The app consists of an Anchor on-chain program and a Next.js frontend.

### Key Features

- **Create Escrow (Maker):** Lock Token A and define the desired amount of Token B to receive.
- **Take Escrow (Taker):** Pay Token B to receive the locked Token A; vault is closed atomically.
- **Refund (Maker):** Cancel an open escrow and reclaim the locked Token A.
- **Browse Escrows:** List existing escrows with maker, mints, and amounts.
- **Wallet Integration:** Phantom, Solflare, and other wallets via wallet-adapter.

### How to Use the dApp

1. **Connect Wallet** – Switch your wallet to Devnet and connect.
2. **Create Escrow (Maker)** – Enter Token A mint, deposit amount, Token B mint, receive amount, and a unique numeric seed; submit to create.
3. **Take Escrow (Taker)** – Open “View All Escrows”, pick one, ensure you have enough Token B, and click Take.
4. **Refund (Maker)** – In “View All Escrows”, locate your escrow and click Refund to reclaim Token A.

Notes:

- Both Token A and Token B must exist on Devnet and you must hold sufficient balances in your ATAs.
- The frontend validates obvious issues (e.g., missing token accounts) and gives actionable CLI hints when possible.

Example tokens (Devnet) for quick testing:

- Token A mint: `EhHWc7K6hsF4p5iabn4YkbtCKDzEaw69P2eZ6RRqoE6A`
- Token B mint: `AR5Drmboy5dVcLYACo4Zb6zb3YMJz8yxDtMpAXiUEhei`

## Program Architecture

The program follows a minimal escrow design with three instructions. An `Escrow` PDA stores trade parameters and is the authority of a vault ATA holding Token A. On `take`, the taker transfers Token B to the maker, and the program releases the vault’s Token A to the taker, then closes the vault and the `Escrow` account.

### PDA Usage

The program uses deterministic PDAs to ensure uniqueness per maker and seed.

**PDAs Used:**

- **Escrow PDA:** `seeds = [b"escrow", maker, seed_u64_le]` – stores escrow metadata; authority over vault.
- **Vault ATA:** Associated Token Account for `mintA` with `authority = Escrow PDA` – holds the maker’s deposited Token A.

### Program Instructions

**Instructions Implemented:**

- **make(seed: u64, deposit: u64, receive: u64):**
  - Initializes `Escrow` PDA and vault ATA for `mintA` with authority set to the `Escrow` PDA.
  - Transfers `deposit` amount of `mintA` from maker’s ATA into the vault.
- **take():**
  - Taker transfers `receive` amount of `mintB` to the maker.
  - Program transfers entire `mintA` balance from the vault to the taker and closes the vault and `Escrow` account.
- **refund():**
  - Maker withdraws the vault’s `mintA` back to their ATA and the program closes the vault and `Escrow` account.

### Account Structure

```rust
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Escrow {
        pub seed: u64,     // Unique per maker to allow multiple escrows
        pub maker: Pubkey, // Maker’s public key
        pub mint_a: Pubkey, // Token to deposit into vault
        pub mint_b: Pubkey, // Token the maker wants to receive
        pub receive: u64,   // Amount of mint_b expected from taker
        pub bump: u8,       // PDA bump
}
```

## Testing

### Test Coverage

Comprehensive tests exist under `anchor_project/escrow-program/tests/escrow-program.ts` covering both success and failure cases for each instruction. Tests use Token-2022 for minting local test tokens and associated token accounts.

**Happy Path Tests:**

- **Make:** Creates escrow and vault; verifies `Escrow` data is correct.
- **Take:** Transfers Token B to maker, releases Token A to taker, and closes accounts.
- **Refund:** Returns Token A to maker and closes accounts.

**Unhappy Path Tests:**

- **Duplicate Make (same seed):** Fails because the `Escrow` PDA already exists.
- **Take Non-existent Escrow:** Fails with account-not-initialized / account missing.
- **Refund Non-existent Escrow:** Fails with account-not-initialized / account missing.

### Running Tests

```powershell
cd anchor_project/escrow-program
anchor test
```

### Additional Notes for Evaluators

- Frontend source is in `frontend/escrow-program-frontend` and is deployed at the URL above.
- The frontend reads the Anchor IDL and `NEXT_PUBLIC_PROGRAM_ID`; defaults to the Program ID noted.
- Program ID declared in code: `declare_id!("9pdSoyn1kfAN4bD4cWFTZCu82sg44tEAdTGVtKLpUoCd")`.

```

```

## Flowchart

![Escrow Flowchart](./flowchart/escrow-flowchart.png "Escrow dApp Flowchart: make, take, refund")
