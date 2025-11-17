import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { WalletContextProvider } from "@/contexts/WalletContextProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Escrow dApp - Solana Token Swap",
  description: "Decentralized escrow service for secure token swaps on Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetMono.variable} antialiased`}>
        <WalletContextProvider>{children}</WalletContextProvider>
      </body>
    </html>
  );
}
