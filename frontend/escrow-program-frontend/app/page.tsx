"use client";

import { useState } from "react";
import WalletButton from "@/components/WalletButton";
import MakeEscrow from "@/components/MakeEscrow";
import ViewEscrows from "@/components/ViewEscrows";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"create" | "view">("create");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Escrow dApp</h1>
              <p className="text-sm text-gray-500">
                Secure token swaps on Solana
              </p>
            </div>
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-6 flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("create")}
            className={`pb-2 px-4 font-medium transition-colors ${
              activeTab === "create"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Create Escrow
          </button>
          <button
            onClick={() => setActiveTab("view")}
            className={`pb-2 px-4 font-medium transition-colors ${
              activeTab === "view"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            View All Escrows
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === "create" ? <MakeEscrow /> : <ViewEscrows />}
          </div>

          {/* Info Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-3">How it Works</h3>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>Connect your Solana wallet</li>
                <li>Create an escrow by depositing Token A</li>
                <li>Specify Token B you want to receive</li>
                <li>Other users can take your offer</li>
                <li>Tokens are swapped automatically</li>
                <li>Or refund your escrow anytime</li>
              </ol>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-purple-900">
                Network Info
              </h3>
              <div className="text-sm text-purple-800 space-y-2">
                <p>
                  <span className="font-medium">Network:</span> Devnet
                </p>
                <p>
                  <span className="font-medium">Program ID:</span>
                  <br />
                  <code className="text-xs break-all">
                    {process.env.NEXT_PUBLIC_PROGRAM_ID ||
                      "9pdSoyn1kfAN4bD4cWFTZCu82sg44tEAdTGVtKLpUoCd"}
                  </code>
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-yellow-900">
                ⚠️ Important
              </h3>
              <p className="text-sm text-yellow-800">
                This dApp is running on Solana Devnet. Make sure you have devnet
                SOL and test tokens in your wallet.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Built with Anchor and Next.js • Solana Escrow Program
          </p>
        </div>
      </footer>
    </div>
  );
}
