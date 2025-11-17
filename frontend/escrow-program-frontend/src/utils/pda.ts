import { PublicKey } from "@solana/web3.js";
import {
  PROGRAM_ID,
  ESCROW_SEED,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "./constants";

export function getEscrowPDA(
  maker: PublicKey,
  seed: bigint
): [PublicKey, number] {
  const seedBuffer = new ArrayBuffer(8);
  const view = new DataView(seedBuffer);
  view.setBigUint64(0, seed, true); // true = little endian

  return PublicKey.findProgramAddressSync(
    [ESCROW_SEED, maker.toBuffer(), new Uint8Array(seedBuffer)],
    PROGRAM_ID
  );
}

export function getAssociatedTokenAddress(
  mint: PublicKey,
  owner: PublicKey
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];
}

export function getVaultAddress(escrow: PublicKey, mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [escrow.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];
}
