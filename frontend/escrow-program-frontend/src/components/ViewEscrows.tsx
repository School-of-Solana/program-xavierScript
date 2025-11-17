"use client";

import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEscrowProgram } from "@/hooks/useEscrowProgram";

interface EscrowData {
  publicKey: PublicKey;
  account: {
    seed: any;
    maker: PublicKey;
    mintA: PublicKey;
    mintB: PublicKey;
    receive: any;
    bump: number;
  };
}

export default function ViewEscrows() {
  const { publicKey } = useWallet();
  const { getAllEscrows, takeEscrow, refundEscrow, loading } =
    useEscrowProgram();

  const [escrows, setEscrows] = useState<EscrowData[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState("");
  const [error, setError] = useState("");

  const fetchEscrows = async () => {
    setFetchLoading(true);
    try {
      const allEscrows = await getAllEscrows();
      setEscrows(allEscrows as any);
    } catch (err) {
      console.error("Error fetching escrows:", err);
      setError("Failed to fetch escrows");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchEscrows();
  }, []);

  const handleTakeEscrow = async (escrow: EscrowData) => {
    if (!publicKey) {
      setError("Please connect your wallet");
      return;
    }

    setError("");
    setTxSignature("");
    setActionLoading(escrow.publicKey.toBase58());

    try {
      const signature = await takeEscrow(
        escrow.account.maker,
        escrow.account.mintA,
        escrow.account.mintB,
        escrow.account
      );

      setTxSignature(signature);
      await fetchEscrows(); // Refresh list
    } catch (err: any) {
      console.error("Error taking escrow:", err);
      setError(err.message || "Failed to take escrow");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefundEscrow = async (escrow: EscrowData) => {
    if (!publicKey) {
      setError("Please connect your wallet");
      return;
    }

    setError("");
    setTxSignature("");
    setActionLoading(escrow.publicKey.toBase58());

    try {
      const signature = await refundEscrow(
        escrow.account.mintA,
        escrow.account
      );

      setTxSignature(signature);
      await fetchEscrows(); // Refresh list
    } catch (err: any) {
      console.error("Error refunding escrow:", err);
      setError(err.message || "Failed to refund escrow");
    } finally {
      setActionLoading(null);
    }
  };

  const isMyEscrow = (escrow: EscrowData) => {
    return publicKey && escrow.account.maker.equals(publicKey);
  };

  return (
    <div className="card rounded-lg shadow-md p-6 animate-fade-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Active Escrows</h2>
        <button
          onClick={fetchEscrows}
          disabled={fetchLoading}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded text-sm transition-colors"
        >
          {fetchLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {txSignature && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="font-medium">Transaction successful!</p>
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

      {fetchLoading ? (
        <div className="text-center py-8 text-gray-500">Loading escrows...</div>
      ) : escrows.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No active escrows found
        </div>
      ) : (
        <div className="space-y-4">
          {escrows.map((escrow) => (
            <div
              key={escrow.publicKey.toBase58()}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white/60"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Maker</p>
                  <p className="text-sm font-mono break-all">
                    {escrow.account.maker.toBase58()}
                  </p>
                  {isMyEscrow(escrow) && (
                    <span className="inline-block mt-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      Your Escrow
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Seed</p>
                  <p className="text-sm font-mono">
                    {escrow.account.seed.toString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Token A (Deposited)</p>
                  <p className="text-sm font-mono break-all">
                    {escrow.account.mintA.toBase58()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Token B (Requested)</p>
                  <p className="text-sm font-mono break-all">
                    {escrow.account.mintB.toBase58()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Receive Amount</p>
                  <p className="text-sm font-mono">
                    {escrow.account.receive.toString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                {isMyEscrow(escrow) ? (
                  <button
                    onClick={() => handleRefundEscrow(escrow)}
                    disabled={
                      loading || actionLoading === escrow.publicKey.toBase58()
                    }
                    className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {actionLoading === escrow.publicKey.toBase58()
                      ? "Refunding..."
                      : "Refund"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleTakeEscrow(escrow)}
                    disabled={
                      loading ||
                      actionLoading === escrow.publicKey.toBase58() ||
                      !publicKey
                    }
                    className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {actionLoading === escrow.publicKey.toBase58()
                      ? "Taking..."
                      : "Take Escrow"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
