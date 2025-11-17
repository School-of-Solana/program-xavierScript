"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function WalletButton() {
  const { publicKey } = useWallet();

  return (
    <div className="flex items-center gap-4">
      {publicKey && (
        <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-700 px-3 py-1 rounded-full bg-white/60 border border-transparent">
          <span className="font-mono text-xs text-zinc-500">
            {publicKey.toBase58().slice(0, 6)}
          </span>
          <span className="text-xs text-zinc-400">•</span>
          <span className="font-mono text-xs text-zinc-500">
            {publicKey.toBase58().slice(-6)}
          </span>
        </div>
      )}
      <WalletMultiButton className="wallet-adapter-button btn-primary shadow-md hover:shadow-lg transition-all" />
    </div>
  );
}
