import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAuctions,
  getAuctionById,
  getProjectForAuction,
  formatUSD,
  shortenAddress,
  formatDate,
  getCategoryColor,
} from "@/lib/data";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Hash,
  Users,
  Trophy,
  Link as LinkIcon,
} from "lucide-react";
import FaviconImage from "@/components/FaviconImage";
import SafeExternalLink from "@/components/SafeExternalLink";

// Generate static params for all known auctions
export function generateStaticParams() {
  const auctions = getAuctions();
  return auctions.map((a) => ({ id: a.id.toString() }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AuctionPage({ params }: PageProps) {
  const { id } = await params;
  const auctionId = parseInt(id, 10);
  const auction = getAuctionById(auctionId);

  if (!auction) {
    notFound();
  }

  const project = getProjectForAuction(auction);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back navigation */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Auction header */}
      <div className="bg-card-bg border border-card-border rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="text-sm text-muted">Auction</div>
              <div className="text-2xl font-bold">#{auction.id}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-accent">
              {formatUSD(auction.totalBidUSD)}
            </div>
            <div className="text-sm text-muted">winning bid</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {formatDate(auction.date)}
          </div>
          <div className="flex items-center gap-1.5">
            <Hash className="w-4 h-4" />
            Block {auction.blockNumber.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {auction.contributors.length} contributor
            {auction.contributors.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Winning link */}
      <div className="bg-card-bg border border-card-border rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-accent" />
          Winning Link
        </h2>

        <div className="flex items-start gap-4">
          {auction.favicon && (
            <FaviconImage src={auction.favicon} />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold">
              {auction.title || auction.domain}
            </h3>
            <SafeExternalLink
              href={auction.url}
              className="text-accent hover:text-accent/80 text-sm flex items-center gap-1.5 mt-1 break-all text-left"
            >
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
              {auction.url}
            </SafeExternalLink>
          </div>
        </div>
      </div>

      {/* Project summary (if available) */}
      {project && project.summary && (
        <div className="bg-card-bg border border-card-border rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold mb-3">About This Project</h2>

          {project.category && (
            <span
              className={`inline-block text-xs px-3 py-1 rounded-full border mb-3 ${getCategoryColor(project.category)}`}
            >
              {project.category}
            </span>
          )}

          {project.tagline && (
            <p className="text-muted text-sm italic mb-2">
              {project.tagline}
            </p>
          )}

          <p className="text-foreground/80 leading-relaxed">
            {project.summary}
          </p>

          {project.totalAuctionWins > 1 && (
            <div className="mt-4 pt-4 border-t border-card-border text-sm text-muted">
              This project has won{" "}
              <span className="text-foreground font-semibold">
                {project.totalAuctionWins} auctions
              </span>{" "}
              and spent a total of{" "}
              <span className="text-foreground font-semibold">
                {formatUSD(project.totalSpentUSD)}
              </span>
              .
            </div>
          )}
        </div>
      )}

      {/* Contributors */}
      {auction.contributors.length > 0 && (
        <div className="bg-card-bg border border-card-border rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">
            Contributors ({auction.contributors.filter(c => !c.address.includes("others")).length})
          </h2>

          <div className="space-y-3">
            {auction.contributors
              .filter((c) => !c.address.includes("others"))
              .map((c, i) => {
                // Only link valid full-length Ethereum addresses (0x + 40 hex chars)
                const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(c.address);

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 border-b border-card-border last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-mono text-accent">
                        {i + 1}
                      </div>
                      <div>
                        {isValidAddress ? (
                          <a
                            href={`https://basescan.org/address/${c.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-sm hover:text-accent transition-colors"
                          >
                            {shortenAddress(c.address)}
                          </a>
                        ) : (
                          <span className="text-sm font-medium text-muted/70">
                            {c.address}
                          </span>
                        )}
                        {c.timestamp > 0 && (
                          <div className="text-xs text-muted">
                            {new Date(c.timestamp * 1000).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="font-mono font-semibold text-sm">
                      {formatUSD(c.amount)}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Transaction link — BaseScan is a trusted block explorer, direct link is fine */}
      {auction.txHash && auction.txHash !== "0x" && (
        <div className="text-center">
          <a
            href={`https://basescan.org/tx/${auction.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View settlement transaction on BaseScan
          </a>
        </div>
      )}
    </div>
  );
}
