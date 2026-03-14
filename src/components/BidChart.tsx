"use client";

import { getAuctions, formatUSD } from "@/lib/data";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function BidChart() {
  const auctions = getAuctions()
    .slice()
    .reverse(); // chronological order

  const data = auctions.map((a) => ({
    auction: `#${a.id}`,
    bid: a.totalBidUSD,
    date: a.date,
    name: a.title || a.domain,
  }));

  return (
    <div className="bg-card-bg border border-card-border rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">Bid Amount Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="bidGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2a2a2a"
              vertical={false}
            />
            <XAxis
              dataKey="auction"
              stroke="#888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#141414",
                border: "1px solid #2a2a2a",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#888" }}
              formatter={(value) => [formatUSD(Number(value)), "Winning Bid"]}
              labelFormatter={(label) => {
                const item = data.find((d) => d.auction === label);
                return item
                  ? `${label} — ${item.name} (${item.date})`
                  : label;
              }}
            />
            <Area
              type="monotone"
              dataKey="bid"
              stroke="#00d4aa"
              strokeWidth={2}
              fill="url(#bidGradient)"
              dot={{ fill: "#00d4aa", r: 3 }}
              activeDot={{ r: 5, fill: "#00d4aa" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
