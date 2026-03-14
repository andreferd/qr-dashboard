import { getAuctions, getProjectForAuction, formatUSD, getCategoryColor } from "@/lib/data";
import { Trophy, ExternalLink, Calendar } from "lucide-react";

export default function TodayWinner() {
  const auctions = getAuctions();
  const latest = auctions[0];
  if (!latest) return null;

  const project = getProjectForAuction(latest);

  return (
    <div className="bg-gradient-to-br from-accent/10 via-card-bg to-card-bg border border-accent/30 rounded-2xl p-6 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-accent" />
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">
            Latest Winner — Auction #{latest.id}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {latest.title || latest.domain}
            </h2>

            {project?.tagline && (
              <p className="text-muted text-lg mb-3">{project.tagline}</p>
            )}

            {project?.summary && (
              <p className="text-foreground/70 text-sm leading-relaxed mb-4 max-w-2xl">
                {project.summary}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {project?.category && (
                <span
                  className={`text-xs px-3 py-1 rounded-full border ${getCategoryColor(project.category)}`}
                >
                  {project.category}
                </span>
              )}

              <div className="flex items-center gap-1.5 text-sm text-muted">
                <Calendar className="w-3.5 h-3.5" />
                {latest.date}
              </div>

              <a
                href={latest.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {latest.domain}
              </a>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl md:text-4xl font-bold text-accent">
              {formatUSD(latest.totalBidUSD)}
            </div>
            <div className="text-sm text-muted mt-1">winning bid</div>
            {latest.contributors.length > 1 && (
              <div className="text-xs text-muted mt-1">
                {latest.contributors.length} contributors
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
