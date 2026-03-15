import { getDashboardStats, formatUSD } from "@/lib/data";

export default function HeroBanner() {
  const stats = getDashboardStats();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-card-border bg-card-bg">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-center gap-8 p-6 md:p-8">

        {/* Left: text content */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-3 py-1 text-xs text-accent font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Live on Base
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
            The Onchain<br />
            <span className="text-accent">Attention Machine</span>
          </h2>

          <p className="text-sm text-muted leading-relaxed mb-6 max-w-md">
            Every day, the highest bidder controls where the permanent{" "}
            <span className="text-white font-medium">$QR</span> code points.
            This dashboard tracks every winner with project summaries and on-chain bid data.
          </p>

          {/* Quick stats row */}
          <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-6">
            <div>
              <div className="text-xl font-bold text-white">{stats.totalAuctions}</div>
              <div className="text-xs text-muted">Auctions</div>
            </div>
            <div className="w-px bg-card-border" />
            <div>
              <div className="text-xl font-bold text-white">{formatUSD(stats.totalRevenueUSD)}</div>
              <div className="text-xs text-muted">Total Revenue</div>
            </div>
            <div className="w-px bg-card-border" />
            <div>
              <div className="text-xl font-bold text-white">{stats.uniqueProjects}</div>
              <div className="text-xs text-muted">Projects</div>
            </div>
          </div>

          <a
            href="https://qrcoin.fun"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent text-black font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-accent/90 transition-colors"
          >
            Place a Bid →
          </a>
        </div>

        {/* Right: big QR logo */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-accent/20 blur-2xl scale-110" />
            {/* Logo container */}
            <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden ring-2 ring-accent/40 shadow-2xl shadow-accent/20">
              <img
                src="https://qrcoin.fun/qrLogo.png"
                alt="QR Coin"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-2 -right-2 bg-accent text-black text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
              Daily
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
