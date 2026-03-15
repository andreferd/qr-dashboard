import StatsOverview from "@/components/StatsOverview";
import TodayWinner from "@/components/TodayWinner";
import WinnersTable from "@/components/WinnersTable";
import BidChart from "@/components/BidChart";
import SafetyBanner from "@/components/SafetyBanner";
import CountdownTimer from "@/components/CountdownTimer";
import TopBids from "@/components/TopBids";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Safety notice */}
      <SafetyBanner />

      {/* Countdown to next auction */}
      <CountdownTimer />

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

      {/* Top 10 biggest bids + All winners table side by side on large screens */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
        {/* All winners table */}
        <WinnersTable />

        {/* Top 10 biggest bids */}
        <TopBids />
      </div>
    </div>
  );
}
