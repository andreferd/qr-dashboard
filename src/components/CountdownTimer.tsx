"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function getNextAuctionEnd(): Date {
  // QR auction settles daily at ~00:00 UTC (midnight UTC)
  const now = new Date();
  const next = new Date();
  next.setUTCHours(0, 0, 0, 0);
  // If midnight has already passed today, target tomorrow
  if (next <= now) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next;
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const now = new Date();
      const end = getNextAuctionEnd();
      const diff = Math.max(0, end.getTime() - now.getTime());
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setTimeLeft({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return null;

  const pad = (n: number) => String(n).padStart(2, "0");
  const urgent = timeLeft.h === 0 && timeLeft.m < 30;

  return (
    <div className="bg-card-bg border border-card-border rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Clock className={`w-4 h-4 ${urgent ? "text-red-400" : "text-accent"}`} />
        <span className="text-sm text-muted">Next auction ends in</span>
      </div>
      <div className={`font-mono font-bold text-xl tracking-widest ${urgent ? "text-red-400" : "text-white"}`}>
        {pad(timeLeft.h)}
        <span className="opacity-50 mx-0.5">:</span>
        {pad(timeLeft.m)}
        <span className="opacity-50 mx-0.5">:</span>
        {pad(timeLeft.s)}
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
