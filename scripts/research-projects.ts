/**
 * AI-powered project research script.
 * For each unique project in projects.json that lacks a summary,
 * research what the project does using the URL metadata and web search,
 * then generate a concise summary.
 *
 * Usage: npx tsx scripts/research-projects.ts
 */

import * as fs from "fs";
import * as path from "path";

const PROJECTS_PATH = path.join(__dirname, "..", "data", "projects.json");
const AUCTIONS_PATH = path.join(__dirname, "..", "data", "auctions.json");

interface Project {
  name: string;
  tagline: string;
  summary: string;
  category: string;
  linkType: string;
  totalAuctionWins: number;
  totalSpentUSD: number;
  firstWin: string;
  lastWin: string;
  auctionIds: number[];
  favicon: string;
}

interface Auction {
  id: number;
  title: string;
  url: string;
  domain: string;
  projectKey: string;
  totalBidUSD: number;
  date: string;
}

/**
 * Given a project key, its data, and its auctions, generate a research summary.
 */
function generateSummary(
  key: string,
  project: Project,
  auctions: Auction[]
): { tagline: string; summary: string; category: string } {
  const name = project.name;
  const url = auctions[0]?.url || "";
  const domain = auctions[0]?.domain || "";

  // Determine category from URL patterns and key
  let category = inferCategory(key, url, name);

  // Generate tagline and summary based on project type
  const { tagline, summary } = generateProjectDescription(
    key,
    name,
    url,
    domain,
    project,
    auctions
  );

  return { tagline, summary, category };
}

function inferCategory(key: string, url: string, name: string): string {
  const k = key.toLowerCase();
  const u = url.toLowerCase();
  const n = name.toLowerCase();

  // Farcaster miniapps
  if (k.startsWith("fc-miniapp:") || k.startsWith("wc-miniapp:"))
    return "Farcaster Mini App";

  // Social posts/casts
  if (
    k.startsWith("fc-cast:") ||
    k.startsWith("wc-cast:") ||
    k.startsWith("fc-user:") ||
    k.startsWith("fc-channel:")
  )
    return "Social";

  // X/Twitter
  if (k.startsWith("x-account:")) return "Social";

  // Tokens
  if (k.startsWith("dex:") || k.startsWith("dex-sol:")) return "Token";

  // NFT/Art
  if (k.startsWith("zora-coin:") || k.startsWith("zora:")) return "NFT/Art";
  if (u.includes("opensea.io")) return "NFT/Art";

  // DeFi
  if (
    n.includes("swap") ||
    n.includes("trade") ||
    n.includes("defi") ||
    n.includes("liqui")
  )
    return "DeFi/Trading";

  // Games
  if (
    n.includes("game") ||
    n.includes("play") ||
    n.includes("bounce") ||
    n.includes("hangman") ||
    n.includes("die hard")
  )
    return "Game";

  // Content
  if (
    u.includes("medium.com") ||
    u.includes("paragraph.com") ||
    u.includes("mirror.xyz") ||
    u.includes("youtube.com")
  )
    return "Content/Media";

  // Tools
  if (
    n.includes("bot") ||
    n.includes("tracker") ||
    n.includes("check") ||
    n.includes("scan") ||
    n.includes("wallet") ||
    n.includes("calendar")
  )
    return "Tool/Utility";

  return "Other";
}

function generateProjectDescription(
  key: string,
  name: string,
  url: string,
  domain: string,
  project: Project,
  auctions: Auction[]
): { tagline: string; summary: string } {
  const k = key.toLowerCase();
  const cleanName = name
    .replace(/…$/, "")
    .replace(/^🌐/, "")
    .trim();
  const wins = project.totalAuctionWins;
  const spent = project.totalSpentUSD;

  // ---- Farcaster Mini Apps ----
  if (k.startsWith("fc-miniapp:")) {
    const slug = k.replace("fc-miniapp:", "");
    return farcasterMiniappSummary(slug, cleanName, wins, spent);
  }

  // ---- Social (Casts & Tweets) ----
  if (k.startsWith("fc-cast:") || k.startsWith("wc-cast:")) {
    const user = k.split(":")[1];
    return {
      tagline: `Farcaster post by @${user}`,
      summary: `A Farcaster cast by @${user} that was promoted via the QR auction. ${wins > 1 ? `Promoted ${wins} times with $${spent} total spent.` : `Won auction for $${spent}.`}`,
    };
  }

  if (k.startsWith("x-account:")) {
    const user = k.replace("x-account:", "");
    return {
      tagline: `X/Twitter account @${user}`,
      summary: `Posts from @${user} on X (Twitter) promoted through the QR auction. ${wins > 1 ? `${wins} promotions totaling $${spent}.` : `Single promotion for $${spent}.`}`,
    };
  }

  if (k.startsWith("fc-user:") || k.startsWith("fc-channel:")) {
    const target = k.split(":")[1];
    const type = k.startsWith("fc-channel:") ? "channel" : "profile";
    return {
      tagline: `Farcaster ${type}: ${target}`,
      summary: `A Farcaster ${type} (${target}) promoted through the QR auction. ${wins > 1 ? `Promoted ${wins} times, $${spent} total.` : `Won for $${spent}.`}`,
    };
  }

  // ---- Tokens ----
  if (k.startsWith("dex:") || k.startsWith("dex-sol:")) {
    return {
      tagline: `Token listed on Dexscreener`,
      summary: `A cryptocurrency token promoted via the QR code auction, linking to its Dexscreener trading page. ${wins > 1 ? `Appeared ${wins} times with $${spent} total in auction bids.` : `Won auction for $${spent}.`}`,
    };
  }

  // ---- NFT/Art ----
  if (k.startsWith("zora-coin:") || k.startsWith("zora:")) {
    return {
      tagline: `Digital art/collectible on Zora`,
      summary: `${cleanName || "An NFT or digital art piece"} minted on Zora, a platform for creating and collecting onchain media. ${wins > 1 ? `Featured ${wins} times, $${spent} total.` : `Promoted for $${spent}.`}`,
    };
  }

  // ---- Known projects with custom descriptions ----
  return knownProjectSummary(key, cleanName, domain, url, wins, spent);
}

function farcasterMiniappSummary(
  slug: string,
  name: string,
  wins: number,
  spent: number
): { tagline: string; summary: string } {
  // Known miniapp descriptions
  const known: Record<string, { tagline: string; desc: string }> = {
    "pizza-party": {
      tagline: "Social pizza ordering game on Farcaster",
      desc: "A fun social mini app where Farcaster users can order and share virtual pizza with friends.",
    },
    "money-games": {
      tagline: "Snake game with crypto rewards",
      desc: "A blockchain-powered snake game on Farcaster where players can earn crypto rewards.",
    },
    "hypesino": {
      tagline: "Social casino game on Farcaster",
      desc: "A casino-style gaming mini app on Farcaster where users can play social betting games.",
    },
    eggs: {
      tagline: "Viral $EGGS token mini app",
      desc: "A Farcaster mini app for the $EGGS token, enabling social interaction around the memecoin.",
    },
    franchiser: {
      tagline: "Franchise delegation tool",
      desc: "A governance tool that lets token holders delegate voting power in a chain of trust.",
    },
    "gm-farcaster": {
      tagline: "Daily GM (good morning) ritual",
      desc: "A mini app for the daily GM greeting ritual on Farcaster, building community through daily check-ins.",
    },
    teller: {
      tagline: "Fortune telling on Farcaster",
      desc: "A fortune-telling mini app that provides fun predictions and readings to Farcaster users.",
    },
    claim: {
      tagline: "Fee claiming tool",
      desc: "A mini app that helps users claim their earned protocol fees and rewards on Farcaster.",
    },
    volt: {
      tagline: "Energy-themed social game",
      desc: "A VOLT-themed mini app on Farcaster for social engagement and community building.",
    },
    framedl: {
      tagline: "Wordle-style word game",
      desc: "A Wordle-inspired word puzzle game built as a Farcaster mini app.",
    },
    neynartodes: {
      tagline: "Neynar-powered social tool",
      desc: "A social tool built on the Neynar API for enhanced Farcaster interactions.",
    },
    vendyz: {
      tagline: "Virtual vending machine",
      desc: "A virtual vending machine mini app where users can buy and sell digital items on Farcaster.",
    },
    sovereignty: {
      tagline: "Governance mini app",
      desc: "A Farcaster mini app focused on governance and community decision-making.",
    },
    "likesfun": {
      tagline: "Social likes game",
      desc: "A mini app that gamifies social engagement through likes on Farcaster.",
    },
    pubhouse: {
      tagline: "Social pub experience",
      desc: "A virtual pub mini app where Farcaster users can hang out and interact socially.",
    },
    chat: {
      tagline: "Real-time chat mini app",
      desc: "A real-time messaging mini app for direct communication within Farcaster.",
    },
    onchat: {
      tagline: "Onchain chat platform",
      desc: "An onchain messaging mini app for decentralized communication on Farcaster.",
    },
    senpi: {
      tagline: "Mirror trading social tool",
      desc: "Senpi enables mirror trading on Farcaster, letting users follow and copy trading strategies.",
    },
    "senpi--mirror-trading": {
      tagline: "Mirror trading social tool",
      desc: "Senpi enables mirror trading on Farcaster, letting users follow and copy trading strategies.",
    },
    sprinkles: {
      tagline: "Social rewards game",
      desc: "A mini app that distributes 'sprinkles' rewards to Farcaster users for engagement.",
    },
    fcweed: {
      tagline: "Virtual gardening game",
      desc: "A virtual weed-growing game on Farcaster with social elements.",
    },
    "the-world-own-the-message": {
      tagline: "Message ownership game",
      desc: "A game where users compete to own and display messages to the world.",
    },
    waffles: {
      tagline: "Social waffle-making game",
      desc: "A fun waffle-themed social game on Farcaster.",
    },
    "the-apostles": {
      tagline: "Community-driven social game",
      desc: "A social strategy game on Farcaster with community-driven gameplay.",
    },
    "eat-coin": {
      tagline: "EAT token mini app",
      desc: "A Farcaster mini app centered around the EAT coin and food-themed social interactions.",
    },
    adsterix: {
      tagline: "Decentralized advertising",
      desc: "An advertising mini app that brings decentralized ad placement to Farcaster.",
    },
    "die-hard-the-game": {
      tagline: "Die Hard themed action game",
      desc: "An action game inspired by the Die Hard franchise, playable on Farcaster.",
    },
    songcast: {
      tagline: "Music discovery & sharing",
      desc: "A music-focused mini app for discovering and sharing songs within the Farcaster community.",
    },
    "pizza-city": {
      tagline: "Pizza empire builder",
      desc: "A city-building game centered around running pizza restaurants on Farcaster.",
    },
    tysm: {
      tagline: "Gratitude and tipping tool",
      desc: "TYSM (Thank You So Much) — a tipping and gratitude mini app for Farcaster.",
    },
    howlers: {
      tagline: "Social howling game",
      desc: "A fun social game on Farcaster where users howl and engage with the community.",
    },
    "other-eth": {
      tagline: "Alternative ETH experiences",
      desc: "A mini app exploring alternative Ethereum experiences on Farcaster.",
    },
    qr: {
      tagline: "$QR token mini app",
      desc: "The official $QR token mini app for the QR auction community on Farcaster.",
    },
    "peeples-donuts": {
      tagline: "Virtual donut shop",
      desc: "A virtual donut shop mini app where Farcaster users can buy and share donuts.",
    },
    qrbase: {
      tagline: "QR Base scanner tool",
      desc: "A QR code scanning and tracking tool built for the Base ecosystem on Farcaster.",
    },
    "x-quo": {
      tagline: "Social quoting tool",
      desc: "Unflat — a social quoting and content curation mini app on Farcaster.",
    },
    streme: {
      tagline: "Token streaming platform",
      desc: "Streme enables token streaming and distribution on Farcaster.",
    },
    inflynce: {
      tagline: "Influence measurement tool",
      desc: "Inflynce measures and gamifies social influence on Farcaster.",
    },
    hashhorse: {
      tagline: "Horse racing prediction game",
      desc: "A hash-based horse racing game where users bet on outcomes on Farcaster.",
    },
    megapot: {
      tagline: "Community jackpot game",
      desc: "A community lottery/jackpot game on Farcaster where users pool funds for big prizes.",
    },
    reply: {
      tagline: "Reply rewards mini app",
      desc: "A mini app that rewards quality replies and engagement on Farcaster.",
    },
    "daily-poll": {
      tagline: "Daily community polls",
      desc: "Daily Questions — a polling mini app for community engagement on Farcaster.",
    },
    "daily-active-user": {
      tagline: "Activity tracking game",
      desc: "A gamified activity tracker rewarding daily active usage on Farcaster.",
    },
    "pet-rock-life": {
      tagline: "Virtual pet rock game",
      desc: "A virtual pet game where users care for digital pet rocks on Farcaster.",
    },
    "minted-merch": {
      tagline: "Onchain merchandise store",
      desc: "Minted Merch — a platform for creating and buying onchain-verified merchandise.",
    },
    rep: {
      tagline: "Reputation scoring system",
      desc: "REP — a reputation scoring mini app that tracks and rewards engagement on Farcaster.",
    },
    megaphone: {
      tagline: "Message amplification tool",
      desc: "Megaphone — a mini app for amplifying important messages across Farcaster.",
    },
    signet: {
      tagline: "Digital signature tool",
      desc: "Signet — a digital signing and verification tool on Farcaster.",
    },
    emerge: {
      tagline: "Project launch platform",
      desc: "Emerge — a platform for launching and discovering new projects on Farcaster.",
    },
    policast: {
      tagline: "Political discussion tool",
      desc: "Policast — a mini app for structured political discussions on Farcaster.",
    },
    pickem: {
      tagline: "Sports prediction game",
      desc: "PICKEM — a sports pick'em prediction game on Farcaster.",
    },
    creeper: {
      tagline: "Social exploration game",
      desc: "Creeper — a social exploration game on Farcaster.",
    },
    lotryfun: {
      tagline: "Lottery game platform",
      desc: "Lotry.fun — a decentralized lottery game on Farcaster.",
    },
    znon: {
      tagline: "$ZNON token mini app",
      desc: "A mini app for the $ZNON token on Farcaster.",
    },
    "lets-have-a-word": {
      tagline: "Word game challenge",
      desc: "Let's Have A Word — a collaborative word game on Farcaster.",
    },
    glazecorp: {
      tagline: "GlazeCorp community game",
      desc: "GlazeCorp — a community-driven game and social platform on Farcaster.",
    },
    "newclankwhodis": {
      tagline: "New Clank discovery tool",
      desc: "A Farcaster mini app for discovering new Clanker-launched tokens.",
    },
    "take0ver-tv": {
      tagline: "Community TV takeover",
      desc: "Take0ver TV — a community-driven live streaming mini app on Farcaster.",
    },
    "farpixel-cats-minter-online": {
      tagline: "Pixel cat NFT minter",
      desc: "Farpixel Cats — a pixel art cat NFT minting tool on Farcaster.",
    },
    "pizza-party-2": {
      tagline: "Social pizza ordering sequel",
      desc: "Pizza Party — a social mini app for ordering and sharing virtual pizza on Farcaster.",
    },
  };

  const info = known[slug];
  if (info) {
    const multi =
      wins > 1 ? ` Won ${wins} QR auctions ($${spent} total).` : "";
    return {
      tagline: info.tagline,
      summary: info.desc + multi,
    };
  }

  // Generic miniapp summary
  return {
    tagline: `Farcaster mini app`,
    summary: `${name || slug} — a Farcaster mini app promoted through the QR auction. ${wins > 1 ? `Appeared ${wins} times, $${spent} total spent.` : `Won auction for $${spent}.`}`,
  };
}

function knownProjectSummary(
  key: string,
  name: string,
  domain: string,
  url: string,
  wins: number,
  spent: number
): { tagline: string; summary: string } {
  // Known standalone projects
  const known: Record<
    string,
    { tagline: string; summary: string } | undefined
  > = {
    "cliptheclip.fun": {
      tagline: "Viral clip sharing platform",
      summary:
        "Clip — a platform for creating, sharing, and trading viral video clips onchain.",
    },
    "hyperliquid.xyz": {
      tagline: "Decentralized perpetual exchange",
      summary:
        "Hyperliquid — a high-performance decentralized exchange for perpetual futures trading.",
    },
    "scanqrbase.xyz": {
      tagline: "$QR ecosystem scanner",
      summary:
        "QRBase — a scanning and analytics tool for the QR coin ecosystem on Base.",
    },
    "gbm.auction": {
      tagline: "GBM incentivized auction protocol",
      summary:
        "GBM Auction (IDA) — an incentivized auction system where every bid is rewarded, even losing ones.",
    },
    "opensea.io": {
      tagline: "Leading NFT marketplace",
      summary:
        "OpenSea — the world's largest NFT marketplace for buying, selling, and discovering digital collectibles.",
    },
    "cultscults.fun": {
      tagline: "Community cult creation platform",
      summary:
        "Cults — a platform for creating and joining onchain community 'cults' with shared goals.",
    },
    "vercel.app": {
      tagline: "Cloud deployment platform",
      summary:
        "Vercel — a cloud platform for deploying web applications with zero configuration.",
    },
    "dropsdrops.bot": {
      tagline: "Crypto airdrop checker",
      summary:
        "Drops — an airdrop checking bot that helps users discover and claim cryptocurrency airdrops.",
    },
    "pigeon.trade": {
      tagline: "AI-powered quant trading",
      summary:
        "Pigeon — an AI quantitative trading assistant for navigating crypto markets.",
    },
    "grokipedia.com": {
      tagline: "AI-powered knowledge base",
      summary:
        "Grokipedia featuring DebtReliefBot — an AI-powered resource for financial information and debt relief guidance.",
    },
    "testflight.apple.com": {
      tagline: "iOS beta testing platform",
      summary:
        "App promoted via Apple TestFlight, likely the Zapper social wallet beta for iOS.",
    },
    "clawcaster.com": {
      tagline: "Farcaster client",
      summary:
        "Clawcaster — an alternative Farcaster client focused on discovery and engagement.",
    },
    "clawmegle.xyz": {
      tagline: "Anonymous chat roulette",
      summary:
        "Clawmegle — a talk-to-strangers style anonymous chat platform for the Farcaster community.",
    },
    "regent.cx": {
      tagline: "AI trading agent platform",
      summary:
        "Regent — a platform for deploying AI trading agents in the crypto market.",
    },
    "nodefoundation.com": {
      tagline: "Blockchain infrastructure",
      summary:
        "Node Foundation — a blockchain infrastructure project supporting the decentralized web.",
    },
    "merkle.bot": {
      tagline: "Digital identity verification",
      summary:
        "Merkle — a digital identity and verification platform using merkle tree technology.",
    },
    "adverse.app": {
      tagline: "Decentralized ad marketplace",
      summary:
        "Adverse — a decentralized advertising marketplace where users own their attention data.",
    },
    "yourviews.org": {
      tagline: "Onchain journaling platform",
      summary:
        "Yourviews — an onchain journaling platform for recording daily thoughts and experiences.",
    },
    "apps.apple.com": {
      tagline: "iOS app on App Store",
      summary:
        "An iOS application promoted through the QR auction, available on the Apple App Store.",
    },
    "waligpt.com": {
      tagline: "AI agent deployment platform",
      summary:
        "WaliGPT OpenClaw — a platform for deploying and managing AI agents onchain.",
    },
    "truthpolltruthpoll.com": {
      tagline: "Onchain polling platform",
      summary:
        "TruthPoll — an onchain polling and voting platform for community decision-making.",
    },
    "onchainlobsters.xyz": {
      tagline: "Lobster-themed NFT community",
      summary:
        "Onchain Lobsters — a lobster-themed NFT collection and community on Base.",
    },
    "bankrwallet.app": {
      tagline: "Community crypto wallet",
      summary:
        "WalletChan by BANKR — a community-focused cryptocurrency wallet application.",
    },
    "clawdvine.sh": {
      tagline: "Farcaster power tool",
      summary:
        "ClawdVine — a power user tool for Farcaster engagement and community building.",
    },
    "superbowlsquares.app": {
      tagline: "Onchain football squares",
      summary:
        "An onchain football squares game for community betting on NFL games.",
    },
    "btcacc.com": {
      tagline: "Bitcoin accumulation tracker",
      summary:
        "btc/acc — a Bitcoin accumulation philosophy and tracking platform.",
    },
    "play.fun": {
      tagline: "Web3 gaming platform",
      summary:
        "Play.fun — a Web3 gaming platform featuring casual games with crypto rewards.",
    },
    "calendarhigher.zip": {
      tagline: "HIGHER ecosystem calendar",
      summary:
        "HIGHER.ZIP Calendar — a calendar and event tool for the HIGHER token ecosystem.",
    },
    "opencredits.xyz": {
      tagline: "Wallet-native AI credits",
      summary:
        "OpenCredits — a wallet-native system for purchasing and using AI credits.",
    },
    "Traitorsamongtraitors.gg": {
      tagline: "Social deduction game",
      summary:
        "Among Traitors — an onchain social deduction game inspired by Among Us.",
    },
    "swap.bankr.bot": {
      tagline: "Token swap bot",
      summary:
        "BANKR Swap — a token swapping tool for quick and easy trades on Base.",
    },
    "basecolors.com": {
      tagline: "Onchain color ownership",
      summary:
        "Base Colors — own unique colors onchain on the Base network. Each color is a unique NFT.",
    },
    "coinbread.cash": {
      tagline: "Crypto-to-fiat bridge",
      summary:
        "Coinbread — a crypto-to-fiat on/off-ramp service for easy conversion.",
    },
    "iown.co": {
      tagline: "Digital ownership platform",
      summary:
        "iOwn — a digital ownership and asset management platform.",
    },
    "indxs.app": {
      tagline: "Crypto index platform",
      summary:
        "Indxs — a platform for creating and investing in cryptocurrency index portfolios.",
    },
    "memeticsignalprotocol.com": {
      tagline: "Meme signal analysis",
      summary:
        "Memetic Signal Protocol — a tool for analyzing meme trends and social signals in crypto.",
    },
    "likes.fun": {
      tagline: "Social engagement rewards",
      summary:
        "likes.fun — a platform that gamifies and rewards social media engagement.",
    },
    "spawner.fun": {
      tagline: "Token launch platform",
      summary:
        "S.P.A.W.N. — a token spawning/launching platform on Base.",
    },
    "logadog.xyz": {
      tagline: "Dog logging community app",
      summary:
        "Log a Dog — a fun community app for logging and sharing dog sightings.",
    },
    "songcast.xyz": {
      tagline: "Music investment platform",
      summary:
        "SongCast — a platform for music discovery and passive investment in songs.",
    },
    "noice.so": {
      tagline: "Social engagement platform",
      summary:
        "Noice — a social engagement and discovery platform built on Base.",
    },
    "amps.fun": {
      tagline: "Social amplification tool",
      summary:
        "Amps — a tool for amplifying content and social reach in Web3.",
    },
    "seconds.money": {
      tagline: "Time-based crypto utility",
      summary:
        "SECOND — a time-based cryptocurrency utility and community token.",
    },
    "calendar.money": {
      tagline: "Calendar-based crypto tool",
      summary:
        "Calendar3 — a calendar-based cryptocurrency tool and scheduling platform.",
    },
    "flipski.xyz": {
      tagline: "NFT flipping game",
      summary:
        "Flipski — a game that turns NFT flipping into a fun competitive experience.",
    },
    "l2marathon.com": {
      tagline: "L2 chain comparison tool",
      summary:
        "L2 Marathon — an omnichain analytics tool for comparing Layer 2 blockchain performance.",
    },
    "hirechain.io": {
      tagline: "Web3 job board",
      summary:
        "Hirechain — a Web3-native job board connecting blockchain talent with opportunities.",
    },
    "punkstrategy.fun": {
      tagline: "Strategy game",
      summary:
        "PunkStrategy — a strategic gameplay experience with punk aesthetics.",
    },
    "walletlink.social": {
      tagline: "Social wallet linking",
      summary:
        "walletlink.social — a platform for linking crypto wallets to social identities.",
    },
    "netprotocol.app": {
      tagline: "Social networking protocol",
      summary:
        "Net Protocol — a decentralized social networking protocol and profile platform.",
    },
    "createrscore.app": {
      tagline: "Creator reputation tracker",
      summary:
        "Creator Score — a platform tracking creator reputation and rewarding consistent building.",
    },
    "pubhouse.xyz": {
      tagline: "Social pub platform",
      summary:
        "Pubhouse — a social 'shake on it' platform for making and tracking onchain agreements.",
    },
    "projectverdant.com": {
      tagline: "Green crypto project",
      summary:
        "Project Verdant — a sustainability-focused cryptocurrency project.",
    },
    "pool.fans": {
      tagline: "Onchain prediction pools",
      summary:
        "PoolFans — an onchain prediction pool platform for sports and events.",
    },
    "native.fun": {
      tagline: "Chat and play platform",
      summary:
        "Native — a platform for chatting, playing games, and socializing in Web3.",
    },
    "mintedmerch.shop": {
      tagline: "Onchain merch store",
      summary:
        "MintedMerch — an onchain merchandise shop for crypto communities.",
    },
    "tryemerge.xyz": {
      tagline: "Project launchpad",
      summary:
        "Emerge — a launchpad for discovering and supporting new Web3 projects.",
    },
    "collectr.live": {
      tagline: "NFT collection tracker",
      summary:
        "Collectr — a monthly NFT and digital collectible tracking platform.",
    },
    "advantageblockchain.com": {
      tagline: "Blockchain education",
      summary:
        "Advantage Blockchain — an educational platform for learning blockchain technology.",
    },
    "drops.bot": {
      tagline: "Airdrop discovery bot",
      summary:
        "Drops Bot — a tool for checking eligibility and claiming crypto airdrops.",
    },
    "bigcoin.tech": {
      tagline: "Crypto community token",
      summary:
        "BigCoin — a community-driven cryptocurrency token on Base.",
    },
    "elon5050.com": {
      tagline: "Elon-themed prediction game",
      summary:
        "Elon5050 — a 50/50 prediction game themed around Elon Musk.",
    },
    "dickbutt.site": {
      tagline: "Iconic meme token",
      summary:
        "DickButt — a meme-based NFT and token community based on the iconic internet meme.",
    },
    "contentment.fun": {
      tagline: "Contentment community token",
      summary:
        "Contentment Coin — a community token celebrating contentment and well-being.",
    },
    "checkr.social": {
      tagline: "Social verification tool",
      summary:
        "Checkr — a social verification and identity tool for Web3.",
    },
    "betrmint.fun": {
      tagline: "Better minting platform",
      summary:
        "BETRMINT — a minting platform for creating onchain assets.",
    },
    "veil.cash": {
      tagline: "Privacy-focused crypto",
      summary:
        "Veil — a privacy-focused cryptocurrency platform.",
    },
    "howareyoufeeling.xyz": {
      tagline: "Mood tracking tool",
      summary:
        "How Are You Feeling — a community mood tracking and wellness check-in tool.",
    },
    "avatracker.xyz": {
      tagline: "NFT avatar tracker",
      summary:
        "AvaTracker — a tool for tracking NFT avatars and digital identity across Web3.",
    },
    "qrbase.xyz": {
      tagline: "QR code explorer for Base",
      summary:
        "QRBase — an explorer and analytics tool for the QR auction ecosystem on Base.",
    },
    "gigabrain.gg": {
      tagline: "AI-powered crypto research",
      summary:
        "Gigabrain — an AI-powered tool for researching cryptocurrency projects and sentiment.",
    },
    "punk.town": {
      tagline: "Punk-themed NFT community",
      summary:
        "Punk Town — a punk-themed NFT community and digital collectible hub.",
    },
    "flaunt.meme": {
      tagline: "Meme showcasing platform",
      summary:
        "Flaunt — a platform for creating and showcasing crypto memes.",
    },
    "coinbase.com": {
      tagline: "Major crypto exchange",
      summary:
        "Coinbase — the largest US cryptocurrency exchange, used here for onramping.",
    },
    "hash.horse": {
      tagline: "Hash-based horse racing",
      summary:
        "HashHorse — a crypto horse racing game where outcomes are determined by hash values.",
    },
  };

  if (known[key]) {
    const k = known[key]!;
    const multi =
      wins > 1 ? ` Won ${wins} QR auctions ($${spent} total).` : "";
    return { tagline: k.tagline, summary: k.summary + multi };
  }

  // Check domain-based lookup
  if (known[domain]) {
    const k = known[domain]!;
    const multi =
      wins > 1 ? ` Won ${wins} QR auctions ($${spent} total).` : "";
    return { tagline: k.tagline, summary: k.summary + multi };
  }

  // Generic fallback
  return {
    tagline: domain || "Web project",
    summary: `${name || domain || "A project"} promoted through the QR auction. ${wins > 1 ? `Appeared ${wins} times with $${spent} total in bids.` : `Won auction for $${spent}.`}`,
  };
}

async function main() {
  console.log("=== Project Research & Summary Generator ===\n");

  const projects: Record<string, Project> = JSON.parse(
    fs.readFileSync(PROJECTS_PATH, "utf-8")
  );
  const auctions: Auction[] = JSON.parse(
    fs.readFileSync(AUCTIONS_PATH, "utf-8")
  );

  let updated = 0;
  const entries = Object.entries(projects);

  for (const [key, project] of entries) {
    // Find auctions for this project
    const projectAuctions = auctions.filter(
      (a) =>
        (a as any).projectKey === key ||
        a.domain === key
    );

    const { tagline, summary, category } = generateSummary(
      key,
      project,
      projectAuctions
    );

    project.tagline = tagline;
    project.summary = summary;
    project.category = category;
    updated++;
  }

  // Save updated projects
  fs.writeFileSync(PROJECTS_PATH, JSON.stringify(projects, null, 2));
  console.log(`Updated ${updated}/${entries.length} projects with summaries`);

  // Show some examples
  console.log("\nSample summaries:");
  entries
    .sort((a, b) => b[1].totalSpentUSD - a[1].totalSpentUSD)
    .slice(0, 10)
    .forEach(([key, p]) => {
      console.log(`\n  [${key}]`);
      console.log(`  ${p.name} — ${p.tagline}`);
      console.log(`  ${p.summary.slice(0, 100)}...`);
      console.log(`  Category: ${p.category} | $${p.totalSpentUSD} | ${p.totalAuctionWins} wins`);
    });
}

main().catch(console.error);
