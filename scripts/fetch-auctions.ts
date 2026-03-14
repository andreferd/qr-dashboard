/**
 * Fetch all QR auction settled events using BaseScan API
 * and enrich with metadata from qrcoin.fun API.
 *
 * Usage: npx tsx scripts/fetch-auctions.ts
 *
 * Uses BaseScan API (free, no key needed for basic usage)
 * which is much more reliable than the public RPC for historical data.
 */

import { decodeAbiParameters } from "viem";
import * as fs from "fs";
import * as path from "path";

const AUCTION_V5_ADDRESS = "0x7309779122069efa06ef71a45ae0db55a259a176";
const USDC_DECIMALS = 6;

// AuctionSettled event topic0
// keccak256("AuctionSettled(uint256,(uint256,string,(address,uint256,uint256)[]))")
const AUCTION_SETTLED_TOPIC =
  "0x0341035e69ef48b17253c0db48604a08b36340580f19fe73ec7652d6ef2c0e8d";

interface AuctionData {
  id: number;
  date: string;
  url: string;
  title: string;
  favicon: string;
  domain: string;
  totalBidUSD: number;
  contributors: {
    address: string;
    amount: number;
    timestamp: number;
  }[];
  txHash: string;
  blockNumber: number;
  contractVersion: string;
}

interface WinnerOverride {
  auction_id: number;
  override_url?: string;
}

interface UrlMetadata {
  title: string;
  favicon: string;
  domain: string;
}

async function fetchWinnerOverrides(): Promise<Map<number, WinnerOverride>> {
  console.log("Fetching winner overrides from qrcoin.fun...");
  try {
    const resp = await fetch("https://qrcoin.fun/api/winner-overrides");
    const json = await resp.json();
    const overrides = new Map<number, WinnerOverride>();
    if (json.data && Array.isArray(json.data)) {
      for (const item of json.data) {
        overrides.set(item.auction_id, item);
      }
    }
    console.log(`  Found ${overrides.size} overrides`);
    return overrides;
  } catch (err) {
    console.error("  Failed to fetch overrides:", err);
    return new Map();
  }
}

async function fetchUrlMetadata(url: string): Promise<UrlMetadata> {
  try {
    const resp = await fetch(
      `https://qrcoin.fun/api/url-metadata?url=${encodeURIComponent(url)}`
    );
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } catch {
    try {
      const parsed = new URL(url);
      return { title: parsed.hostname, favicon: "", domain: parsed.hostname };
    } catch {
      return { title: url, favicon: "", domain: url };
    }
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchEventsFromBaseScan(): Promise<AuctionData[]> {
  console.log("Fetching AuctionSettled events via BaseScan API...");

  const auctions: AuctionData[] = [];
  let page = 1;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const url = `https://api.basescan.org/api?module=logs&action=getLogs&address=${AUCTION_V5_ADDRESS}&topic0=${AUCTION_SETTLED_TOPIC}&fromBlock=0&toBlock=latest&page=${page}&offset=${pageSize}&sort=asc`;

    console.log(`  Fetching page ${page}...`);

    try {
      const resp = await fetch(url);
      const json = await resp.json();

      if (json.status !== "1" || !json.result || json.result.length === 0) {
        console.log(`  No more results on page ${page}`);
        hasMore = false;
        break;
      }

      const logs = json.result;
      console.log(`  Got ${logs.length} events on page ${page}`);

      for (const log of logs) {
        try {
          // topic1 is the indexed tokenId
          const tokenId = parseInt(log.topics[1], 16);

          // Decode the non-indexed data (winningBid struct)
          const decoded = decodeAbiParameters(
            [
              {
                type: "tuple",
                components: [
                  { name: "totalAmount", type: "uint256" },
                  { name: "urlString", type: "string" },
                  {
                    name: "contributions",
                    type: "tuple[]",
                    components: [
                      { name: "contributor", type: "address" },
                      { name: "amount", type: "uint256" },
                      { name: "timestamp", type: "uint256" },
                    ],
                  },
                ],
              },
            ],
            log.data as `0x${string}`
          );

          const winningBid = decoded[0] as {
            totalAmount: bigint;
            urlString: string;
            contributions: readonly {
              contributor: string;
              amount: bigint;
              timestamp: bigint;
            }[];
          };

          const totalBidUSD =
            Number(winningBid.totalAmount) / 10 ** USDC_DECIMALS;

          // Use block timestamp for date
          const blockTimestamp = parseInt(log.timeStamp, 16);
          const date = new Date(blockTimestamp * 1000)
            .toISOString()
            .split("T")[0];

          const urlStr = winningBid.urlString || "";
          const contributors = (winningBid.contributions || []).map((c) => ({
            address: c.contributor,
            amount: Number(c.amount) / 10 ** USDC_DECIMALS,
            timestamp: Number(c.timestamp),
          }));

          auctions.push({
            id: tokenId,
            date,
            url: urlStr,
            title: "",
            favicon: "",
            domain: "",
            totalBidUSD,
            contributors,
            txHash: log.transactionHash || "",
            blockNumber: parseInt(log.blockNumber, 16),
            contractVersion: "v5",
          });
        } catch (err) {
          console.error(`  Error decoding event:`, err);
        }
      }

      if (logs.length < pageSize) {
        hasMore = false;
      } else {
        page++;
        // Rate limit for BaseScan free tier (5 req/sec)
        await sleep(250);
      }
    } catch (err) {
      console.error(`  Error fetching page ${page}:`, err);
      hasMore = false;
    }
  }

  console.log(`  Total events found: ${auctions.length}`);
  return auctions.sort((a, b) => a.id - b.id);
}

async function enrichWithMetadata(
  auctions: AuctionData[],
  overrides: Map<number, WinnerOverride>
): Promise<AuctionData[]> {
  console.log("Enriching auctions with metadata...");

  // Apply overrides first
  for (const auction of auctions) {
    const override = overrides.get(auction.id);
    if (override?.override_url) {
      console.log(
        `  Override for #${auction.id}: ${auction.url} -> ${override.override_url}`
      );
      auction.url = override.override_url;
    }
  }

  // Fetch URL metadata with rate limiting and caching
  const urlCache = new Map<string, UrlMetadata>();
  let processed = 0;

  for (const auction of auctions) {
    if (!auction.url) continue;

    if (urlCache.has(auction.url)) {
      const cached = urlCache.get(auction.url)!;
      auction.title = cached.title;
      auction.favicon = cached.favicon;
      auction.domain = cached.domain;
    } else {
      const metadata = await fetchUrlMetadata(auction.url);
      urlCache.set(auction.url, metadata);
      auction.title = metadata.title;
      auction.favicon = metadata.favicon;
      auction.domain = metadata.domain;
      // Rate limit
      await sleep(80);
    }

    processed++;
    if (processed % 50 === 0) {
      console.log(`  Processed ${processed}/${auctions.length} auctions...`);
    }
  }

  console.log(`  Done enriching ${auctions.length} auctions`);
  return auctions;
}

async function main() {
  console.log("=== QR Auction Data Fetcher ===\n");

  const overrides = await fetchWinnerOverrides();
  const auctions = await fetchEventsFromBaseScan();
  const enriched = await enrichWithMetadata(auctions, overrides);

  // Save auctions
  const outputPath = path.join(__dirname, "..", "data", "auctions.json");
  fs.writeFileSync(outputPath, JSON.stringify(enriched, null, 2));
  console.log(`\nSaved ${enriched.length} auctions to ${outputPath}`);

  // Generate project groupings
  const projectMap = new Map<
    string,
    {
      name: string;
      domain: string;
      totalWins: number;
      totalSpent: number;
      auctionIds: number[];
      firstWin: string;
      lastWin: string;
      favicon: string;
    }
  >();

  for (const auction of enriched) {
    const key = auction.domain || auction.url;
    if (!key) continue;

    if (projectMap.has(key)) {
      const proj = projectMap.get(key)!;
      proj.totalWins++;
      proj.totalSpent += auction.totalBidUSD;
      proj.auctionIds.push(auction.id);
      proj.lastWin = auction.date;
    } else {
      projectMap.set(key, {
        name: auction.title || key,
        domain: auction.domain || key,
        totalWins: 1,
        totalSpent: auction.totalBidUSD,
        auctionIds: [auction.id],
        firstWin: auction.date,
        lastWin: auction.date,
        favicon: auction.favicon,
      });
    }
  }

  const projects: Record<string, any> = {};
  for (const [key, proj] of projectMap.entries()) {
    projects[key] = {
      name: proj.name,
      tagline: "",
      summary: "",
      category: categorizeProject(proj.domain, proj.name),
      linkType: detectLinkType(proj.domain),
      totalAuctionWins: proj.totalWins,
      totalSpentUSD: Math.round(proj.totalSpent * 100) / 100,
      firstWin: proj.firstWin,
      lastWin: proj.lastWin,
      auctionIds: proj.auctionIds,
      favicon: proj.favicon,
    };
  }

  const projectsPath = path.join(__dirname, "..", "data", "projects.json");
  fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2));
  console.log(
    `Saved ${Object.keys(projects).length} unique projects to ${projectsPath}`
  );
}

// Auto-categorize based on URL patterns
function categorizeProject(domain: string, name: string): string {
  const d = domain.toLowerCase();
  const n = name.toLowerCase();

  if (d.includes("farcaster.xyz/miniapps")) return "Farcaster Mini App";
  if (d.includes("farcaster.xyz")) return "Social";
  if (d.includes("dexscreener") || d.includes("gecko")) return "Token";
  if (d.includes("zora.co")) return "NFT/Art";
  if (d.includes("x.com") || d.includes("twitter")) return "Social";
  if (
    n.includes("game") ||
    n.includes("play") ||
    n.includes("bounce") ||
    n.includes("party")
  )
    return "Game";
  if (n.includes("swap") || n.includes("trade") || n.includes("defi"))
    return "DeFi/Trading";

  return "Other";
}

function detectLinkType(domain: string): string {
  if (domain.includes("farcaster.xyz/miniapps")) return "farcaster-miniapp";
  if (domain.includes("farcaster.xyz")) return "farcaster-post";
  if (domain.includes("x.com") || domain.includes("twitter.com"))
    return "social-media";
  if (domain.includes("dexscreener") || domain.includes("gecko"))
    return "token-tracker";
  if (domain.includes("zora.co")) return "nft-marketplace";
  return "web-app";
}

main().catch(console.error);
