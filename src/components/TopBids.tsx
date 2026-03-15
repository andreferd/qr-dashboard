"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuctions, getProjectForAuction, formatUSD, formatDate } from "@/lib/data";
import { Trophy } from "lucide-react";
import SafeLinkModal from "./SafeLinkModal";
import { ExternalLink } from "lucide-react";

const MEDAL = ["🥇", "🥈", "🥉"];

export default function TopBids() {
  const router = useRouter();
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const top10 = [...getAuctions()]
    .sort((a, b) => b.totalBidUSD - a.totalBidUSD)
    .slice(0, 10);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h2 className="text-xl font-bold">Top 10 Biggest Bids</h2>
      </div>

      <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
        {top10.map((auction, i) => {
          const project = getProjectForAuction(auction);
          const isTop3 = i < 3;

          return (
            <div
              key={auction.id}
              role="link"
              tabIndex={0}
              onClick={() => router.push(`/auction/${auction.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter") router.push(`/auction/${auction.id}`);
              }}
              className={`flex items-center gap-4 px-4 py-3 border-t first:border-t-0 border-card-border hover:bg-accent/5 transition-colors cursor-pointer ${
                isTop3 ? "bg-yellow-500/5" : ""
              }`}
            >
              {/* Rank */}
              <div className="w-8 text-center flex-shrink-0">
                {i < 3 ? (
                  <span className="text-lg">{MEDAL[i]}</span>
                ) : (
                  <span className="text-sm font-mono text-muted font-bold">#{i + 1}</span>
                )}
              </div>

              {/* Project info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {auction.favicon && (
                    <img
                      src={auction.favicon}
                      alt=""
                      className="w-4 h-4 rounded flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <span className="font-medium truncate text-sm">
                    {auction.title || auction.domain}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingUrl(auction.url);
                    }}
                    className="text-muted hover:text-accent flex-shrink-0"
                    title="Open external link"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-xs text-muted mt-0.5">
                  Auction #{auction.id} · {formatDate(auction.date)}
                </div>
              </div>

              {/* Bid amount */}
              <div className={`font-mono font-bold text-sm flex-shrink-0 ${isTop3 ? "text-yellow-400" : "text-white"}`}>
                {formatUSD(auction.totalBidUSD)}
              </div>
            </div>
          );
        })}
      </div>

      <SafeLinkModal url={pendingUrl} onClose={() => setPendingUrl(null)} />
    </div>
  );
}
