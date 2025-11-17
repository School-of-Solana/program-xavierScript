"use client";

import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEscrowProgram } from "@/hooks/useEscrowProgram";

export default function MakeEscrow() {
  const { publicKey } = useWallet();
  const { makeEscrow, loading } = useEscrowProgram();

  const [mintA, setMintA] = useState("");
  const [mintB, setMintB] = useState("");
  const [seed, setSeed] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [txSignature, setTxSignature] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      setError("Please connect your wallet");
      return;
    }

    setError("");
    setTxSignature("");

    try {
      const mintAPubkey = new PublicKey(mintA);
      const mintBPubkey = new PublicKey(mintB);
      const seedBigInt = BigInt(seed);
      const depositAmountBigInt = BigInt(depositAmount);
      const receiveAmountBigInt = BigInt(receiveAmount);

      const signature = await makeEscrow(
        mintAPubkey,
        mintBPubkey,
        seedBigInt,
        depositAmountBigInt,
        receiveAmountBigInt
      );

      setTxSignature(signature);

      // Reset form
      setMintA("");
      setMintB("");
      setSeed("");
      setDepositAmount("");
      setReceiveAmount("");
    } catch (err: any) {
      console.error("Error creating escrow:", err);
      setError(err.message || "Failed to create escrow");
    }
  };

  return (
    <div className="card rounded-lg shadow-md p-6 animate-fade-up">
      <h2 className="text-2xl font-bold mb-4">Create Escrow</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Token A Mint Address (You Deposit)
          </label>
          <input
            type="text"
            value={mintA}
            onChange={(e) => setMintA(e.target.value)}
            placeholder="Enter Token A mint address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deposit Amount (Token A)
          </label>
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Amount to deposit"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Token B Mint Address (You Receive)
          </label>
          <input
            type="text"
            value={mintB}
            onChange={(e) => setMintB(e.target.value)}
            placeholder="Enter Token B mint address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Receive Amount (Token B)
          </label>
          <input
            type="number"
            value={receiveAmount}
            onChange={(e) => setReceiveAmount(e.target.value)}
            placeholder="Amount to receive"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seed (Unique Identifier)
          </label>
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Enter unique seed number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
            min="0"
          />
        </div>

        <button
          type="submit"
          disabled={!publicKey || loading}
          className="w-full btn-primary py-2 px-4 rounded-full disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
        >
          {loading ? "Creating Escrow..." : "Create Escrow"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {txSignature && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="font-medium">Escrow created successfully!</p>
          <a
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline break-all"
          >
            View transaction: {txSignature}
          </a>
        </div>
      )}
    </div>
  );
}
