import { getDashboardStats, formatUSD } from "@/lib/data";
import { BarChart3, TrendingUp, DollarSign, Users } from "lucide-react";

export default function StatsOverview() {
  const stats = getDashboardStats();

  const cards = [
    {
      label: "Total Auctions",
      value: stats.totalAuctions.toString(),
      icon: BarChart3,
      color: "text-accent",
    },
    {
      label: "Avg Winning Bid",
      value: formatUSD(stats.avgBidUSD),
      icon: TrendingUp,
      color: "text-green-400",
    },
    {
      label: "Total Revenue",
      value: formatUSD(stats.totalRevenueUSD),
      icon: DollarSign,
      color: "text-yellow-400",
    },
    {
      label: "Unique Projects",
      value: stats.uniqueProjects.toString(),
      icon: Users,
      color: "text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-card-bg border border-card-border rounded-xl p-4 hover:border-accent/30 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <card.icon className={`w-4 h-4 ${card.color}`} />
            <span className="text-xs text-muted uppercase tracking-wide">
              {card.label}
            </span>
          </div>
          <div className="text-2xl font-bold">{card.value}</div>
        </div>
      ))}
    </div>
  );
}
