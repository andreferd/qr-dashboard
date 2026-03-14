import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QR Auction Dashboard | Daily Onchain Attention Machine",
  description:
    "Explore every QR auction winner with AI-powered project summaries, bid analytics, and on-chain data from qrcoin.fun on Base.",
  openGraph: {
    title: "QR Auction Dashboard",
    description: "Explore every QR auction winner with project summaries and bid analytics.",
    siteName: "QR Dashboard",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <header className="border-b border-card-border bg-card-bg/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <span className="text-accent font-bold text-sm">QR</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  QR Auction Dashboard
                </h1>
                <p className="text-xs text-muted -mt-0.5">
                  The Onchain Attention Machine
                </p>
              </div>
            </Link>
            <nav className="flex items-center gap-4">
              <a
                href="https://qrcoin.fun"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted hover:text-accent transition-colors"
              >
                qrcoin.fun
              </a>
              <a
                href="https://dune.com/qrcoin/qr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted hover:text-accent transition-colors"
              >
                Dune
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-card-border mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-muted">
            <p>
              Community dashboard for{" "}
              <a
                href="https://qrcoin.fun"
                className="text-accent hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                qrcoin.fun
              </a>{" "}
              | Built on Base | Not affiliated with the QR team
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
