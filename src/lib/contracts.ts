// QR Auction contract addresses across all versions on Base
export const AUCTION_CONTRACTS = [
  {
    version: "v5",
    address: "0x7309779122069efa06ef71a45ae0db55a259a176" as const,
    // Deployed around Dec 2025, currently active
    startBlock: BigInt(24000000), // approximate
  },
  // Earlier versions can be added later by checking Dune table names:
  // qrauction_v4_base, qrauction_v3_base, qrauction_v2_base, qrauction_v1_base
] as const;

export const QR_TOKEN_ADDRESS = "0x2b5050F01d64FBb3e4Ac44dc07f0732BFb5ecadF" as const;

export const BASE_CHAIN_ID = 8453;
export const BASE_RPC_URL = "https://mainnet.base.org";

// ABI for AuctionSettled event from QRAuctionV5
// Event: AuctionSettled(uint256 indexed tokenId, WinningBid winningBid)
// WinningBid is a struct: { uint256 totalAmount, string urlString, Contribution[] contributions }
// Contribution: { address contributor, uint256 amount, uint256 timestamp }
export const AUCTION_SETTLED_EVENT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "totalAmount",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "urlString",
            type: "string",
          },
          {
            components: [
              {
                internalType: "address",
                name: "contributor",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "timestamp",
                type: "uint256",
              },
            ],
            internalType: "struct AuctionTypesV5.Contribution[]",
            name: "contributions",
            type: "tuple[]",
          },
        ],
        indexed: false,
        internalType: "struct AuctionTypesV5.WinningBid",
        name: "winningBid",
        type: "tuple",
      },
    ],
    name: "AuctionSettled",
    type: "event",
  },
] as const;

// Simplified ABI for reading current auction state
export const AUCTION_READ_ABI = [
  {
    inputs: [],
    name: "auction",
    outputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "startTime", type: "uint256" },
      { internalType: "uint256", name: "endTime", type: "uint256" },
      { internalType: "bool", name: "settled", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllBids",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "tokenId", type: "uint256" },
          { internalType: "address", name: "bidder", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "bool", name: "refunded", type: "bool" },
          { internalType: "string", name: "urlString", type: "string" },
          { internalType: "string", name: "name", type: "string" },
          {
            components: [
              { internalType: "address", name: "contributor", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              { internalType: "uint256", name: "timestamp", type: "uint256" },
            ],
            internalType: "struct AuctionTypesV5.Contribution[]",
            name: "contributions",
            type: "tuple[]",
          },
        ],
        internalType: "struct AuctionTypesV5.Bid[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getBidCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
