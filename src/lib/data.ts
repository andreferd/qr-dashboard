import auctionsData from "../../data/auctions.json";
import projectsData from "../../data/projects.json";
import type { Auction, ProjectSummary, DashboardStats } from "./types";

export function getAuctions(): Auction[] {
  return (auctionsData as Auction[]).sort((a, b) => b.id - a.id);
}

export function getProjects(): Record<string, ProjectSummary> {
  return projectsData as Record<string, ProjectSummary>;
}

export function getAuctionById(id: number): Auction | undefined {
  return (auctionsData as Auction[]).find((a) => a.id === id);
}

export function getProjectForAuction(
  auction: Auction
): ProjectSummary | undefined {
  const projects = getProjects();
  // Look up by projectKey first, then fall back to domain
  return projects[auction.projectKey] || projects[auction.domain] || undefined;
}

export function getDashboardStats(): DashboardStats {
  const auctions = getAuctions();
  const projects = getProjects();
  const totalBids = auctions.reduce((sum, a) => sum + a.totalBidUSD, 0);

  return {
    totalAuctions: auctions.length,
    avgBidUSD: auctions.length > 0 ? Math.round(totalBids / auctions.length) : 0,
    totalRevenueUSD: Math.round(totalBids),
    uniqueProjects: Object.keys(projects).length,
  };
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    "Farcaster Mini App": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "DeFi/Trading": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "Game": "bg-green-500/20 text-green-400 border-green-500/30",
    "Social": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "NFT/Art": "bg-pink-500/20 text-pink-400 border-pink-500/30",
    "Token": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "Tool/Utility": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    "Content/Media": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    "Other": "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };
  return colors[category] || colors["Other"];
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function shortenAddress(address: string): string {
  if (address.length <= 13) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
