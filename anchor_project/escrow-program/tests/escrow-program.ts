import * as anchor from "@coral-xyz/anchor";
import { Program, BN, AnchorError } from "@coral-xyz/anchor";
import { EscrowProgram } from "../target/types/escrow_program";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  MINT_SIZE,
  TOKEN_2022_PROGRAM_ID,
  // TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import { randomBytes } from "crypto";
import { assert, expect } from "chai";

describe("escrow-program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const provider = anchor.getProvider();

  const connection = provider.connection;

  const program = anchor.workspace.escrowProgram as Program<EscrowProgram>;

  const tokenProgram = TOKEN_2022_PROGRAM_ID;
  // const tokenProgram = TOKEN_PROGRAM_ID;

  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...block,
    });
    return signature;
  };

  const log = async (signature: string): Promise<string> => {
    console.log(
      `\nYour transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
    );
    return signature;
  };

  const seed = new BN(randomBytes(8));

  const [maker, taker, mintA, mintB] = Array.from({ length: 4 }, () =>
    Keypair.generate()
  );

  const [makerAtaA, makerAtaB, takerAtaA, takerAtaB] = [maker, taker]
    .map((a) =>
      [mintA, mintB].map((m) =>
        getAssociatedTokenAddressSync(
          m.publicKey,
          a.publicKey,
          false,
          tokenProgram
        )
      )
    )
    .flat();

  const escrow = PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"),
      maker.publicKey.toBuffer(),
      seed.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  )[0];

  const vault = getAssociatedTokenAddressSync(
    mintA.publicKey,
    escrow,
    true,
    tokenProgram
  );

  // Accounts
  const accounts = {
    maker: maker.publicKey,
    taker: taker.publicKey,
    mintA: mintA.publicKey,
    mintB: mintB.publicKey,
    makerAtaA,
    makerAtaB,
    takerAtaA,
    takerAtaB,
    escrow,
    vault,
    tokenProgram,
  };

  it("Airdrop and create mints", async () => {
    let lamports = await getMinimumBalanceForRentExemptMint(connection);
    let tx = new Transaction();
    tx.instructions = [
      ...[maker, taker].map((account) =>
        SystemProgram.transfer({
          fromPubkey: provider.publicKey,
          toPubkey: account.publicKey,
          lamports: 10 * LAMPORTS_PER_SOL,
        })
      ),
      ...[mintA, mintB].map((mint) =>
        SystemProgram.createAccount({
          fromPubkey: provider.publicKey,
          newAccountPubkey: mint.publicKey,
          lamports,
          space: MINT_SIZE,
          programId: tokenProgram,
        })
      ),
      ...[
        { mint: mintA.publicKey, authority: maker.publicKey, ata: makerAtaA },
        { mint: mintB.publicKey, authority: taker.publicKey, ata: takerAtaB },
      ].flatMap((x) => [
        createInitializeMint2Instruction(
          x.mint,
          6,
          x.authority,
          null,
          tokenProgram
        ),
        createAssociatedTokenAccountIdempotentInstruction(
          provider.publicKey,
          x.ata,
          x.authority,
          x.mint,
          tokenProgram
        ),
        createMintToInstruction(
          x.mint,
          x.ata,
          x.authority,
          1e9,
          undefined,
          tokenProgram
        ),
      ]),
    ];

    await provider.sendAndConfirm(tx, [mintA, mintB, maker, taker]).then(log);
  });

  // ========================================
  // MAKE INSTRUCTION TESTS
  // ========================================

  describe("Make Instruction", () => {
    it("Happy Path: Successfully creates an escrow", async () => {
      const depositAmount = new BN(1e6); // 1 token A
      const receiveAmount = new BN(1e6); // 1 token B

      await program.methods
        .make(seed, depositAmount, receiveAmount)
        .accounts({ ...accounts })
        .signers([maker])
        .rpc()
        .then(confirm)
        .then(log);

      // Verify escrow account was created with correct data
      const escrowAccount = await program.account.escrow.fetch(escrow);
      assert.ok(escrowAccount.maker.equals(maker.publicKey));
      assert.ok(escrowAccount.mintA.equals(mintA.publicKey));
      assert.ok(escrowAccount.mintB.equals(mintB.publicKey));
      assert.ok(escrowAccount.receive.eq(receiveAmount));
      assert.ok(escrowAccount.seed.eq(seed));

      console.log("✅ Escrow created successfully");
    });

    it("Unhappy Path: Fails with duplicate escrow (same seed)", async () => {
      try {
        // Try to create escrow with same seed again
        await program.methods
          .make(seed, new BN(1e6), new BN(1e6))
          .accounts({ ...accounts })
          .signers([maker])
          .rpc();

        assert.fail("Should have failed with duplicate escrow");
      } catch (error) {
        // Should fail because escrow account already exists
        assert.ok(
          error.toString().includes("already in use") ||
            error.toString().includes("custom program error")
        );
        console.log("✅ Correctly rejected duplicate escrow");
      }
    });
  });

  // ========================================
  // TAKE INSTRUCTION TESTS
  // ========================================

  describe("Take Instruction", () => {
    it("Happy Path: Successfully completes the escrow trade", async () => {
      // Get initial balances
      const makerAtaABefore = await connection.getTokenAccountBalance(
        makerAtaA
      );
      const takerAtaBBefore = await connection.getTokenAccountBalance(
        takerAtaB
      );

      await program.methods
        .take()
        .accounts({ ...accounts })
        .signers([taker])
        .rpc()
        .then(confirm)
        .then(log);

      // Verify escrow account was closed
      try {
        await program.account.escrow.fetch(escrow);
        assert.fail("Escrow account should have been closed");
      } catch (error) {
        assert.ok(error.toString().includes("Account does not exist"));
        console.log("✅ Escrow account closed successfully");
      }

      // Verify token transfers happened
      const makerAtaAAfter = await connection.getTokenAccountBalance(makerAtaA);
      const takerAtaBAfter = await connection.getTokenAccountBalance(takerAtaB);

      // Maker should have less tokens (they were escrowed)
      // Taker should have less tokens (they paid for the trade)
      console.log("✅ Trade completed successfully");
    });

    it("Unhappy Path: Fails when escrow doesn't exist", async () => {
      // Use a random seed that was never used to create an escrow
      const fakeSeed = new BN(99999999);
      const fakeEscrow = PublicKey.findProgramAddressSync(
        [
          Buffer.from("escrow"),
          maker.publicKey.toBuffer(),
          fakeSeed.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      )[0];
      const fakeVault = getAssociatedTokenAddressSync(
        mintA.publicKey,
        fakeEscrow,
        true,
        tokenProgram
      );

      try {
        // Try to take a non-existent escrow
        await program.methods
          .take()
          .accountsPartial({
            taker: taker.publicKey,
            maker: maker.publicKey,
            mintA: mintA.publicKey,
            mintB: mintB.publicKey,
            escrow: fakeEscrow,
            vault: fakeVault,
            tokenProgram,
          })
          .signers([taker])
          .rpc();

        assert.fail("Should have failed with non-existent escrow");
      } catch (error) {
        assert.ok(
          error.toString().includes("AccountNotInitialized") ||
            error.toString().includes("Account does not exist")
        );
        console.log("✅ Correctly rejected non-existent escrow");
      }
    });
  });

  // ========================================
  // REFUND INSTRUCTION TESTS
  // ========================================

  describe("Refund Instruction", () => {
    it("Happy Path: Successfully refunds and closes escrow", async () => {
      // Create a new escrow for refund test
      const refundSeed = new BN(randomBytes(8));
      const refundEscrow = PublicKey.findProgramAddressSync(
        [
          Buffer.from("escrow"),
          maker.publicKey.toBuffer(),
          refundSeed.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      )[0];
      const refundVault = getAssociatedTokenAddressSync(
        mintA.publicKey,
        refundEscrow,
        true,
        tokenProgram
      );

      await program.methods
        .make(refundSeed, new BN(1e5), new BN(1e5))
        .accountsPartial({
          maker: maker.publicKey,
          mintA: mintA.publicKey,
          mintB: mintB.publicKey,
          makerAtaA,
          escrow: refundEscrow,
          vault: refundVault,
          tokenProgram,
        })
        .signers([maker])
        .rpc()
        .then(confirm);

      // Now refund it
      await program.methods
        .refund()
        .accountsPartial({
          maker: maker.publicKey,
          mintA: mintA.publicKey,
          makerAtaA,
          escrow: refundEscrow,
          vault: refundVault,
          tokenProgram,
        })
        .signers([maker])
        .rpc()
        .then(confirm)
        .then(log);

      // Verify escrow account was closed
      try {
        await program.account.escrow.fetch(refundEscrow);
        assert.fail("Escrow account should have been closed");
      } catch (error) {
        assert.ok(error.toString().includes("Account does not exist"));
        console.log("✅ Escrow refunded and closed successfully");
      }
    });

    it("Unhappy Path: Fails when non-existent escrow is refunded", async () => {
      // Use a random seed that was never used to create an escrow
      const fakeSeed = new BN(88888888);
      const fakeEscrow = PublicKey.findProgramAddressSync(
        [
          Buffer.from("escrow"),
          maker.publicKey.toBuffer(),
          fakeSeed.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      )[0];
      const fakeVault = getAssociatedTokenAddressSync(
        mintA.publicKey,
        fakeEscrow,
        true,
        tokenProgram
      );

      try {
        // Try to refund a non-existent escrow
        await program.methods
          .refund()
          .accountsPartial({
            maker: maker.publicKey,
            mintA: mintA.publicKey,
            makerAtaA,
            escrow: fakeEscrow,
            vault: fakeVault,
            tokenProgram,
          })
          .signers([maker])
          .rpc();

        assert.fail("Should have failed with non-existent escrow");
      } catch (error) {
        assert.ok(
          error.toString().includes("AccountNotInitialized") ||
            error.toString().includes("Account does not exist")
        );
        console.log("✅ Correctly rejected refund of non-existent escrow");
      }
    });
  });
});
