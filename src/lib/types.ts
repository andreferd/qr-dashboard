export interface Contributor {
  address: string;
  amount: number; // USD
  timestamp: number;
}

export interface Auction {
  id: number;
  date: string; // ISO date
  url: string;
  title: string;
  favicon: string;
  domain: string;
  projectKey: string;
  totalBidUSD: number;
  contributors: Contributor[];
  txHash: string;
  blockNumber: number;
  contractVersion: string;
}

export interface ProjectSummary {
  name: string;
  tagline: string;
  summary: string;
  category: ProjectCategory;
  linkType: string;
  totalAuctionWins: number;
  totalSpentUSD: number;
  firstWin: string;
  lastWin: string;
  auctionIds: number[];
}

export type ProjectCategory =
  | "Farcaster Mini App"
  | "DeFi/Trading"
  | "Game"
  | "Social"
  | "NFT/Art"
  | "Token"
  | "Tool/Utility"
  | "Content/Media"
  | "Other";

export const CATEGORIES: ProjectCategory[] = [
  "Farcaster Mini App",
  "DeFi/Trading",
  "Game",
  "Social",
  "NFT/Art",
  "Token",
  "Tool/Utility",
  "Content/Media",
  "Other",
];

export interface DashboardStats {
  totalAuctions: number;
  avgBidUSD: number;
  totalRevenueUSD: number;
  uniqueProjects: number;
}
