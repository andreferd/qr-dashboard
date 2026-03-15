import { NextResponse } from "next/server";

const BASE_RPC = "https://mainnet.base.org";
const AUCTION_CONTRACT = "0x7309779122069efa06ef71a45ae0db55a259a176";
// keccak256("auction()")[0:4]
const AUCTION_SELECTOR = "0x7d9f6db5";

export const revalidate = 0; // never cache — always fresh

export async function GET() {
  try {
    const res = await fetch(BASE_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [{ to: AUCTION_CONTRACT, data: AUCTION_SELECTOR }, "latest"],
        id: 1,
      }),
      next: { revalidate: 0 },
    });

    const json = await res.json();
    const hex: string = json.result;

    if (!hex || hex === "0x") {
      throw new Error("Empty response from RPC");
    }

    // Strip leading 0x and split into 32-byte (64 char) chunks
    const data = hex.slice(2);
    const chunks = [];
    for (let i = 0; i < data.length; i += 64) {
      chunks.push(BigInt("0x" + data.slice(i, i + 64)));
    }

    // Struct layout from ABI decoding:
    // [0] auctionId
    // [1] offset to URL string
    // [2] startTime (unix seconds)
    // [3] endTime (unix seconds)
    // [4] settled (bool)
    // [5] offset to second string
    // [6] currentBidUSDC (6 decimals)

    const auctionId = Number(chunks[0]);
    const startTime = Number(chunks[2]);
    const endTime   = Number(chunks[3]);
    const settled   = chunks[4] !== BigInt(0);
    const bidRaw    = chunks[6] ?? BigInt(0);
    const currentBidUSD = Number(bidRaw) / 1_000_000;

    return NextResponse.json({
      auctionId,
      startTime,
      endTime,
      settled,
      currentBidUSD,
    });
  } catch (err) {
    console.error("auction-status error:", err);
    return NextResponse.json({ error: "Failed to fetch auction status" }, { status: 500 });
  }
}
