import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { AnchorProvider, Program, BN, Idl } from "@coral-xyz/anchor";
import { useState, useMemo } from "react";
import {
  PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
} from "@/utils/constants";
import {
  getEscrowPDA,
  getAssociatedTokenAddress,
  getVaultAddress,
} from "@/utils/pda";
import IDL from "@/idl/escrow_program.json";
// import { EscrowProgram } from "@/idl/types";

export function useEscrowProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);

  const provider = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;

    return new AnchorProvider(connection, wallet as any, {
      commitment: "confirmed",
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(IDL as Idl, provider);
  }, [provider]);

  const makeEscrow = async (
    mintA: PublicKey,
    mintB: PublicKey,
    seed: bigint,
    depositAmount: bigint,
    receiveAmount: bigint
  ) => {
    if (!program || !wallet.publicKey) {
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    try {
      // Validate that mints exist
      const mintAInfo = await connection.getAccountInfo(mintA);
      if (!mintAInfo) {
        throw new Error(
          `Token A mint (${mintA.toBase58()}) does not exist on devnet. Please create it first or use a valid mint address.`
        );
      }

      const mintBInfo = await connection.getAccountInfo(mintB);
      if (!mintBInfo) {
        throw new Error(
          `Token B mint (${mintB.toBase58()}) does not exist on devnet. Please create it first or use a valid mint address.`
        );
      }

      // Check if user has token account for Token A
      const [escrow] = getEscrowPDA(wallet.publicKey, seed);
      const makerAtaA = getAssociatedTokenAddress(mintA, wallet.publicKey);

      const ataInfo = await connection.getAccountInfo(makerAtaA);
      if (!ataInfo) {
        throw new Error(
          `You don't have a token account for Token A.\n\n` +
            `Run this command:\n` +
            `spl-token create-account ${mintA.toBase58()}\n\n` +
            `Then mint some tokens:\n` +
            `spl-token mint ${mintA.toBase58()} 1000`
        );
      }

      const vault = getVaultAddress(escrow, mintA);

      const tx = await program.methods
        .make(
          new BN(seed.toString()),
          new BN(depositAmount.toString()),
          new BN(receiveAmount.toString())
        )
        .accounts({
          maker: wallet.publicKey,
          mintA,
          mintB,
          makerAtaA,
          escrow,
          vault,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .rpc();

      return tx;
    } finally {
      setLoading(false);
    }
  };

  const takeEscrow = async (
    maker: PublicKey,
    mintA: PublicKey,
    mintB: PublicKey,
    escrowAccount: any
  ) => {
    if (!program || !wallet.publicKey) {
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    try {
      const [escrow] = getEscrowPDA(
        maker,
        BigInt(escrowAccount.seed.toString())
      );

      const takerAtaA = getAssociatedTokenAddress(mintA, wallet.publicKey);
      const takerAtaB = getAssociatedTokenAddress(mintB, wallet.publicKey);
      const makerAtaB = getAssociatedTokenAddress(mintB, maker);
      const vault = getVaultAddress(escrow, mintA);

      const tx = await program.methods
        .take()
        .accounts({
          taker: wallet.publicKey,
          maker,
          mintA,
          mintB,
          takerAtaA,
          takerAtaB,
          makerAtaB,
          escrow,
          vault,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .rpc();

      return tx;
    } finally {
      setLoading(false);
    }
  };

  const refundEscrow = async (mintA: PublicKey, escrowAccount: any) => {
    if (!program || !wallet.publicKey) {
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    try {
      const [escrow] = getEscrowPDA(
        wallet.publicKey,
        BigInt(escrowAccount.seed.toString())
      );
      const makerAtaA = getAssociatedTokenAddress(mintA, wallet.publicKey);
      const vault = getVaultAddress(escrow, mintA);

      const tx = await program.methods
        .refund()
        .accounts({
          maker: wallet.publicKey,
          mintA,
          makerAtaA,
          escrow,
          vault,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .rpc();

      return tx;
    } finally {
      setLoading(false);
    }
  };

  const getEscrow = async (maker: PublicKey, seed: bigint) => {
    if (!program) return null;

    try {
      const [escrowPDA] = getEscrowPDA(maker, seed);
      const escrow = await (program.account as any).escrow.fetch(escrowPDA);
      return escrow;
    } catch (error) {
      console.error("Error fetching escrow:", error);
      return null;
    }
  };

  const getAllEscrows = async () => {
    if (!program) return [];

    try {
      const escrows = await (program.account as any).escrow.all();
      return escrows;
    } catch (error) {
      console.error("Error fetching all escrows:", error);
      return [];
    }
  };

  return {
    program,
    makeEscrow,
    takeEscrow,
    refundEscrow,
    getEscrow,
    getAllEscrows,
    loading,
  };
}
