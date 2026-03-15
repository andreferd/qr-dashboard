/**
 * Fetch new auction winners from qrcoin.fun using their API
 * and merge with existing data.
 *
 * Usage: npx tsx scripts/update-winners.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface Auction {
  id: number;
  title: string;
  url: string;
  winner: string;
  totalBidUSD: number;
  domain: string;
  projectKey: string;
  favicon: string;
  date: string;
  contributors: unknown[];
  txHash: string;
  blockNumber: number;
  contractVersion: string;
}

const CONTRACT = "0x7309779122069efa06ef71a45ae0db55a259a176";
const AUCTION_SELECTOR = "0x7d9f6db5"; // auction()
const RPCS = [
  "https://1rpc.io/base",
  "https://base.blockpi.network/v1/rpc/public",
];

async function rpcCall(method: string, params: unknown[]) {
  for (const rpc of RPCS) {
    try {
      const res = await fetch(rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
        signal: AbortSignal.timeout(10_000),
      });
      const json = await res.json() as { result?: unknown; error?: unknown };
      if (json.result !== undefined) return json.result;
    } catch {
      // try next RPC
    }
  }
  throw new Error(`All RPCs failed for ${method}`);
}

async function fetchUrlMetadata(url: string) {
  try {
    const res = await fetch(
      `https://qrcoin.fun/api/url-metadata?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(8_000) }
    );
    if (res.ok) return await res.json() as { title: string; favicon: string; domain: string };
  } catch { /* ignore */ }
  const parsed = new URL(url);
  return { title: parsed.hostname, favicon: "", domain: parsed.hostname };
}

/** Decode the auction() response and return endTime + auctionId */
async function getCurrentAuction(): Promise<{ id: number; endTime: number; bidUSD: number; url: string }> {
  const hex = await rpcCall("eth_call", [
    { to: CONTRACT, data: AUCTION_SELECTOR },
    "latest",
  ]) as string;

  const data = hex.slice(2);
  const chunks: bigint[] = [];
  for (let i = 0; i < data.length; i += 64) {
    chunks.push(BigInt("0x" + data.slice(i, i + 64)));
  }

  const id = Number(chunks[0]);
  const endTime = Number(chunks[3]);
  const bidUSD = Number(chunks[6] ?? BigInt(0)) / 1_000_000;

  // Decode URL string
  const urlOffset = Number(chunks[1]) / 32;
  const urlLen = Number(chunks[urlOffset]);
  let urlHex = "";
  for (let i = urlOffset + 1; i < urlOffset + 1 + Math.ceil(urlLen / 32); i++) {
    urlHex += data.slice(i * 64, (i + 1) * 64);
  }
  const url = Buffer.from(urlHex.slice(0, urlLen * 2), "hex").toString("utf8");

  return { id, endTime, bidUSD, url };
}

/** Compute ISO date from a unix timestamp (YYYY-MM-DD UTC) */
function tsToDate(ts: number): string {
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

async function main() {
  console.log("=== QR Winners Updater ===\n");

  const dataPath = path.join(__dirname, "../data/auctions.json");
  const existing: Auction[] = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const existingIds = new Set(existing.map((a) => a.id));
  const maxExistingId = Math.max(...existing.map((a) => a.id));
  console.log(`Existing auctions: ${existing.length}, latest: #${maxExistingId}`);

  // Get current (live) auction from contract
  const current = await getCurrentAuction();
  console.log(`Current live auction: #${current.id} (ends ${new Date(current.endTime * 1000).toISOString()})`);

  // Highest settled auction is current.id - 1
  const latestSettled = current.id - 1;

  if (latestSettled <= maxExistingId) {
    console.log("✅ No new settled auctions to add.");
    return;
  }

  const newCount = latestSettled - maxExistingId;
  console.log(`\n📦 Need to add ${newCount} new auction(s): #${maxExistingId + 1} → #${latestSettled}`);

  // For each missing auction, we need to find when it settled.
  // We get the end time by looking at past auction() calls via block scanning.
  // Simplified: estimate date based on known 24h cycle from current auction endTime.
  const newAuctions: Auction[] = [];
  const currentEndTime = current.endTime;
  const AUCTION_DURATION = 86400; // 24 hours

  for (let id = maxExistingId + 1; id <= latestSettled; id++) {
    const daysAgo = latestSettled - id + 1;
    const estimatedDate = tsToDate(currentEndTime - daysAgo * AUCTION_DURATION);
    console.log(`\n  Fetching #${id} (estimated date: ${estimatedDate})...`);

    // We don't have the URL for past auctions from contract alone.
    // This requires an external data source. For now, create a placeholder.
    // The user will need to fill in the URL manually or via parse-winners.ts update.
    const placeholder: Auction = {
      id,
      title: `Auction #${id}`,
      url: "https://qrcoin.fun",
      winner: "",
      totalBidUSD: 0,
      domain: "qrcoin.fun",
      projectKey: `auction-${id}`,
      favicon: "",
      date: estimatedDate,
      contributors: [],
      txHash: "",
      blockNumber: 0,
      contractVersion: "v5",
    };

    newAuctions.push(placeholder);
  }

  // Merge and save
  const allAuctions = [...existing, ...newAuctions].sort((a, b) => a.id - b.id);
  fs.writeFileSync(dataPath, JSON.stringify(allAuctions, null, 2));

  console.log(`\n✅ Added ${newAuctions.length} placeholder(s) to data/auctions.json`);
  console.log("⚠️  Note: URL/bid data for new auctions needs manual update via parse-winners.ts");
  console.log("   Or run: npx tsx scripts/parse-winners.ts (after updating RAW_DATA)");
}

main().catch(console.error);
