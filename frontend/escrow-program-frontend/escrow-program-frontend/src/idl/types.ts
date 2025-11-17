import { PublicKey } from "@solana/web3.js";

export type Escrow = {
  seed: bigint;
  maker: PublicKey;
  mintA: PublicKey;
  mintB: PublicKey;
  receive: bigint;
  bump: number;
};
