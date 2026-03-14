import StatsOverview from "@/components/StatsOverview";
import TodayWinner from "@/components/TodayWinner";
import WinnersTable from "@/components/WinnersTable";
import BidChart from "@/components/BidChart";
import SafetyBanner from "@/components/SafetyBanner";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Safety notice */}
      <SafetyBanner />

      {/* About section */}
      <div className="bg-card-bg/50 border border-card-border rounded-xl p-4 text-sm text-muted">
        <p>
          <span className="text-accent font-semibold">$QR</span> runs a daily
          auction where the highest bidder controls where a permanent QR code
          points for 24 hours. This dashboard tracks every winner with
          AI-researched project summaries and on-chain bid data.
        </p>
      </div>

      {/* Latest winner hero */}
      <TodayWinner />

      {/* Stats overview */}
      <StatsOverview />

      {/* Bid trend chart */}
      <BidChart />

      {/* All winners table */}
      <WinnersTable />
    </div>
  );
}
