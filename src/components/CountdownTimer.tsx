"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface AuctionStatus {
  auctionId: number;
  endTime: number; // unix seconds (UTC)
  currentBidUSD: number;
  settled: boolean;
}

export default function CountdownTimer() {
  const [status, setStatus] = useState<AuctionStatus | null>(null);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [mounted, setMounted] = useState(false);

  // Fetch real auction end time from blockchain API
  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/auction-status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {
      // silent fail — countdown keeps running from last known value
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchStatus();
    // Re-fetch every 30 seconds to catch bid extensions
    const fetchId = setInterval(fetchStatus, 30_000);
    return () => clearInterval(fetchId);
  }, []);

  // Tick countdown every second
  useEffect(() => {
    const tick = () => {
      if (!status) return;
      const now = Math.floor(Date.now() / 1000);
      const diff = Math.max(0, status.endTime - now);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setTimeLeft({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [status]);

  if (!mounted || !status) return (
    <div className="bg-card-bg border border-card-border rounded-xl p-4 flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-muted" />
        <span className="text-sm text-muted">Loading auction...</span>
      </div>
      <div className="font-mono font-bold text-xl text-muted">--:--:--</div>
    </div>
  );

  const pad = (n: number) => String(n).padStart(2, "0");
  const urgent = timeLeft.h === 0 && timeLeft.m < 30;
  const ended = timeLeft.h === 0 && timeLeft.m === 0 && timeLeft.s === 0;

  return (
    <div className={`bg-card-bg border rounded-xl p-4 flex items-center justify-between transition-colors ${
      urgent ? "border-red-500/40" : "border-card-border"
    }`}>
      <div className="flex items-center gap-2">
        <Clock className={`w-4 h-4 ${urgent ? "text-red-400" : "text-accent"}`} />
        <div>
          <span className="text-sm text-muted">
            {ended ? "Auction #" + status.auctionId + " ended" : "Auction #" + status.auctionId + " ends in"}
          </span>
          <div className="text-xs text-muted/60">
            Current bid: <span className="text-white font-semibold">
              ${status.currentBidUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <div className={`font-mono font-bold text-xl tracking-widest ${urgent ? "text-red-400" : "text-white"}`}>
        {ended ? "🔔 Ended" : (
          <>
            {pad(timeLeft.h)}
            <span className="opacity-50 mx-0.5">:</span>
            {pad(timeLeft.m)}
            <span className="opacity-50 mx-0.5">:</span>
            {pad(timeLeft.s)}
          </>
        )}
      </div>

      <a
        href="https://qrcoin.fun"
        target="_blank"
        rel="noopener noreferrer"
        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
          urgent
            ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
            : "bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30"
        }`}
      >
        {urgent ? "🔥 Bid Now!" : "Place Bid →"}
      </a>
    </div>
  );
}
