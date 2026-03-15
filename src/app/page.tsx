import StatsOverview from "@/components/StatsOverview";
import TodayWinner from "@/components/TodayWinner";
import WinnersTable from "@/components/WinnersTable";
import BidChart from "@/components/BidChart";
import SafetyBanner from "@/components/SafetyBanner";
import CountdownTimer from "@/components/CountdownTimer";
import TopBids from "@/components/TopBids";
import HeroBanner from "@/components/HeroBanner";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero banner with big QR logo */}
      <HeroBanner />

      {/* Safety notice */}
      <SafetyBanner />

      {/* Countdown to next auction */}
      <CountdownTimer />

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
