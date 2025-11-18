# Escrow Program (Anchor)

Solana Anchor program implementing a simple token escrow with three instructions: `make`, `take`, and `refund`.

- Program ID: `9pdSoyn1kfAN4bD4cWFTZCu82sg44tEAdTGVtKLpUoCd`
- IDL: `anchor_project/escrow-program/target/idl/escrow_program.json`
- Types: `anchor_project/escrow-program/target/types/escrow_program.ts`

## Prerequisites

- Rust toolchain, Solana CLI, Anchor CLI
- Solana config set to Devnet (or your chosen cluster)

```powershell
solana --version
anchor --version
solana config set --url devnet
```

## Build

```powershell
cd anchor_project/escrow-program
anchor build
```

## Test

Tests cover happy and unhappy paths for all instructions using Token-2022 CPIs.

```powershell
cd anchor_project/escrow-program
anchor test
```

## Deploy

Ensure your deployer wallet has Devnet SOL; then:

```powershell
cd anchor_project/escrow-program
anchor deploy
```

After deploy, confirm the on-chain program ID matches `9pdSoyn1kfAN4bD4cWFTZCu82sg44tEAdTGVtKLpUoCd`.

## Instructions

- `make(seed: u64, deposit: u64, receive: u64)`

  - Creates escrow PDA `seeds=["escrow", maker, seed]`
  - Transfers `deposit` of `mintA` from maker to vault ATA (authority=PDA)

- `take()`

  - Taker pays `receive` of `mintB` to maker
  - Sends entire vault balance of `mintA` to taker, then closes vault

- `refund()`
  - Maker withdraws `mintA` from vault back to their ATA, closes vault

## Accounts (high-level)

- `Escrow` account stores: `seed`, `maker`, `mintA`, `mintB`, `receive`, `bump`
- Vault ATA is the ATA of `mintA` with authority = Escrow PDA

## Frontend

A Next.js frontend is available and deployed:

- Live: https://escrow-frontend-nu.vercel.app/
- Source: `frontend/escrow-program-frontend`

Set `NEXT_PUBLIC_PROGRAM_ID` in the frontend to the Program ID above when running locally.
