"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function WalletButton() {
  const { publicKey } = useWallet();

  return (
    <div className="flex items-center gap-4">
      {publicKey && (
        <div className="hidden sm:block text-sm text-gray-600">
          {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
        </div>
      )}
      <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
    </div>
  );
}
