"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuctions, getProjectForAuction, formatUSD, getCategoryColor, formatDate } from "@/lib/data";
import { ExternalLink, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import CategoryFilter from "./CategoryFilter";
import SafeLinkModal from "./SafeLinkModal";

const PAGE_SIZE = 20;

export default function WinnersTable() {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const allAuctions = getAuctions();

  // Filter by category
  const filteredAuctions = categoryFilter
    ? allAuctions.filter((a) => {
        const project = getProjectForAuction(a);
        return project?.category === categoryFilter;
      })
    : allAuctions;

  const totalPages = Math.ceil(filteredAuctions.length / PAGE_SIZE);
  const pageAuctions = filteredAuctions.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold">All Auction Winners</h2>
        <CategoryFilter
          selected={categoryFilter}
          onSelect={(cat) => {
            setCategoryFilter(cat);
            setPage(0);
          }}
        />
      </div>

      <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[60px_1fr_100px_120px] md:grid-cols-[70px_1fr_120px_100px_140px] gap-4 px-4 py-3 bg-card-border/30 text-xs text-muted uppercase tracking-wider">
          <div>#</div>
          <div>Project</div>
          <div className="hidden md:block">Category</div>
          <div className="text-right">Bid</div>
          <div className="text-right">Date</div>
        </div>

        {/* Rows */}
        {pageAuctions.map((auction) => {
          const project = getProjectForAuction(auction);

          return (
            <div
              key={auction.id}
              role="link"
              tabIndex={0}
              onClick={() => router.push(`/auction/${auction.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter") router.push(`/auction/${auction.id}`);
              }}
              className="grid grid-cols-[60px_1fr_100px_120px] md:grid-cols-[70px_1fr_120px_100px_140px] gap-4 px-4 py-4 border-t border-card-border hover:bg-accent/5 transition-colors items-center cursor-pointer"
            >
              {/* Auction number */}
              <div className="text-muted font-mono text-sm">#{auction.id}</div>

              {/* Project info */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {auction.favicon && (
                    <img
                      src={auction.favicon}
                      alt=""
                      className="w-4 h-4 rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <span className="font-medium truncate">
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
                <div className="text-xs text-muted truncate mt-0.5">
                  {auction.domain}
                </div>
                {project?.tagline && (
                  <div className="text-[11px] text-muted/60 truncate mt-0.5 italic">
                    {project.tagline}
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="hidden md:block">
                {project?.category && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${getCategoryColor(project.category)}`}
                  >
                    {project.category}
                  </span>
                )}
              </div>

              {/* Bid amount */}
              <div className="text-right font-mono font-semibold text-sm">
                {formatUSD(auction.totalBidUSD)}
              </div>

              {/* Date */}
              <div className="text-right text-sm text-muted">
                {formatDate(auction.date)}
              </div>
            </div>
          );
        })}

        {pageAuctions.length === 0 && (
          <div className="px-4 py-12 text-center text-muted">
            No auctions found for this filter.
          </div>
        )}
      </div>

      {/* Safe link modal */}
      <SafeLinkModal
        url={pendingUrl}
        onClose={() => setPendingUrl(null)}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted">
            Showing {page * PAGE_SIZE + 1}-
            {Math.min((page + 1) * PAGE_SIZE, filteredAuctions.length)} of{" "}
            {filteredAuctions.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="p-2 rounded-lg border border-card-border hover:border-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg border border-card-border hover:border-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted px-2">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg border border-card-border hover:border-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg border border-card-border hover:border-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
