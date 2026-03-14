/**
 * Parse the qrcoin.fun/winners page text data into our JSON format
 * and enrich with metadata from the qrcoin.fun API.
 *
 * Usage: npx tsx scripts/parse-winners.ts
 */

import * as fs from "fs";
import * as path from "path";

// Raw page text extracted from qrcoin.fun/winners
// Format per entry: #<id><title><url><winner><bid>
const RAW_DATA = `#371OpenCredits - Walle…app.opencredits.xyz$204
#370Among Traitorsamongtraitors.gg/?share=spectator-recap&gameId=9781d426-45b5-4b8d-9b73-1a85aff36121@saltorious.eth$157
#369Pizza Partyfarcaster.xyz/miniapps/wgY6OPqYoIkz/pizza-party+1 others$186
#368MONEY GAMESfarcaster.xyz/miniapps/LiIQ4G6y5ELU/money-games/snake@trifle$171
#367Bizarre Bounce - Bi…play.fun/s/5g7g56i$171
#366HIGHER.ZIP Calendarhigher.zip/shop@clfx.eth$222
#365Vendyzvendyz.vercel.app+752 others$1,772
#364@ledgerville's tweetx.com/ledgerville/status/2029566845507006741@ledgerville$230
#363@ledgerville's tweetx.com/ledgerville/status/2029161883044081744@ledgerville$200
#362Yourviews — Onchain…yourviews.org/entry/20515/0$235
#361Rev for Vercel App …apps.apple.com/app/rev-for-vercel/id6740740427@chrisdom$161
#360WaliGPT | OpenClaw …app.waligpt.com$232
#359🌐truthpolltruthpoll.com@TruthPollHQ$153
#358Adverse - The World…adverse.app@AdverseApp$175
#357@clawdvine's tweetx.com/clawdvine/status/2027058628771856409?s=20@clawdvine.eth$273
#356dexscreenerdexscreener.com/base/0xc99add2ddf69f6fc85af155aadefb43d87b3614e$191
#355🌐DebtReliefBot — Gro…grokipedia.com/page/debtreliefbot$220
#354Onchain Lobstersonchainlobsters.xyz$201
#353Sovereigntyfarcaster.xyz/miniapps/VTV_JjqRR6JW/sovereignty@sovereignty$200
#352WaliGPT | OpenClaw …app.waligpt.com$206
#351Vendyzfarcaster.xyz/miniapps/f17s0yDDGlXv/vendyz$248
#350@letshaveaword's ca…farcaster.xyz/letshaveaword/0xfacdafb2$327
#349Claim — Fees are y…farcaster.xyz/miniapps/MiAspAXiw6cZ/claim+563 others$1,374
#348VOLTfarcaster.xyz/miniapps/A33F5gIJDifq/volt@0xhohenheim$212
#347@0xsonarbot on Xx.com/0xsonarbot$375
#346Framedlfarcaster.xyz/miniapps/KdCXV0aKWcm6/framedl@ds8$250
#345dexscreenerdexscreener.com/base/0x0a30f9b28652e8909a38839b1e55ac0a00912007833561061553c47cce72461f$291
#344Tellerfarcaster.xyz/miniapps/2Ts-0TIKtjXW/teller@teller$260
#343Merkle 🌿 - Digital…merkle.bot$508
#342GM Farcasterfarcaster.xyz/miniapps/RWk7UVoMf6vW/gm-farcaster$262
#341@tellrbot on Xx.com/tellrbot@tellrbot$420
#340dexscreenerdexscreener.com/base/0x0f4a85526e8b27b71c8d26a129d79ee4454d9c40dc1f5a5852845224a58158cc@atown$300
#339Football - Ultimate…superbowlsquares.app+4 others$365
#338@wwxpost on Xx.com/wwxpost@wwxpost$342
#337WaliGPT | OpenClaw …app.waligpt.com@waligpt$400
#336Clawmegle - Talk to…clawmegle.xyz$421
#335WalletChanbankrwallet.app@apoorvlathey$410
#334ClawdVineclawdvine.sh+2 others$536
#333NEYNARtodesfarcaster.xyz/miniapps/uaKwcOvUry8F/neynartodes$330
#332GM Farcasterfarcaster.xyz/miniapps/RWk7UVoMf6vW/gm-farcaster$361
#331Clawcaster - Where …clawcaster.com$600
#330Pizza Partyfarcaster.xyz/miniapps/wgY6OPqYoIkz/pizza-party+6 others$357
#329Regent Platformregent.cx+4 others$829
#328dexscreenerdexscreener.com/base/0xd7e82c10269ce007050f0d12706ba4e355ac670e91b952aa584f2990a3742222@siyana$600
#327Tellerfarcaster.xyz/miniapps/2Ts-0TIKtjXW/teller$501
#326@theneetguy on Xx.com/theneetguy$336
#325OCCUPYnodefoundation.com/occupy$327
#324@lotry's castfarcaster.xyz/lotry/0x7b51d166@lotry$365
#323Lotry.funfarcaster.xyz/miniapps/BSH6BFagQpZC/lotryfun@lotry$333
#322@lotry's castfarcaster.xyz/lotry/0x5a10805e$446
#321likes.funfarcaster.xyz/miniapps/j2lmAs761_oP/likesfun$331
#320$MoonShot Channel o…farcaster.xyz/~/channel/moonshot-on-base+9 others$360
#319likes.funfarcaster.xyz/miniapps/j2lmAs761_oP/likesfun$342
#318walletlink.social —…walletlink.social@starl3xx.eth$340
#317$toby - cute frog o…toadgod.xyz+34 others$807
#316🌐DebtReliefBot — Gro…grokipedia.com/page/debtreliefbot+5 others$792
#315GlazeCorpglazecorp.io+11 others$458
#314dexscreenerdexscreener.com/base/0xf44ab962d787444f4ae6674a7fb61a8e66581b07+10 others$478
#313@skippywalks's castfarcaster.xyz/skippywalks/0xb280dcb2+140 others$622
#312Senpi — Mirror Trad…farcaster.xyz/miniapps/28xbPU0xYYK9/senpi--mirror-trading@senpi.eth$362
#311likes.funfarcaster.xyz/miniapps/j2lmAs761_oP/likesfun$399
#310Pubhousefarcaster.xyz/miniapps/rx_RZQiWYnZc/pubhouse$522
#309chatfarcaster.xyz/miniapps/5gHjZvqGAjml/chat$500
#308OnChatfarcaster.xyz/miniapps/4bo9FDQQDd1-/onchat+1 others$454
#307@Veildotcash's tweetx.com/Veildotcash/status/2008790740961513939@apex_ether$500
#306$znonfarcaster.xyz/miniapps/zd7mrzqhIVdA/znon$334
#305Senpi — Mirror Trad…farcaster.xyz/miniapps/28xbPU0xYYK9/senpi--mirror-trading$353
#304farcasterfarcaster.xyz/miniapps/5argX24fr_Tq/sprinkles+6 others$373
#303FCWeedfarcaster.xyz/miniapps/s5TFzzv8IX0S/fcweed@0xcocaine$355
#302Let's Have A Word!farcaster.xyz/miniapps/yzTRNYuz4cok/lets-have-a-word+2 others$525
#301horsezora.co/coin/base:0xf1fc9580784335b2613c1392a530c1aa2a69ba3d$555
#300🌐@theneetguy.eth on …farcaster.xyz/theneetguy.eth$400
#299NEYNARtodesfarcaster.xyz/miniapps/uaKwcOvUry8F/neynartodes$352
#298FCWeedfarcaster.xyz/miniapps/s5TFzzv8IX0S/fcweed$351
#297The World: Own the …farcaster.xyz/miniapps/gsje7zMB3A47/the-world-own-the-message$331
#296FCWeedfarcaster.xyz/miniapps/s5TFzzv8IX0S/fcweed@0xcocaine$530
#295Wafflesfarcaster.xyz/miniapps/sbpPNle-R2-V/waffles@thecyberverse$440
#294The Apostlesfarcaster.xyz/miniapps/y3JyVxonCq_o/the-apostles+8 others$800
#293EAT Coinfarcaster.xyz/miniapps/L-Bgk2RtvL-M/eat-coin$402
#292Adsterixfarcaster.xyz/miniapps/nOlHtdHWXJ6H/adsterix$369
#291Die Hard: The Gamefarcaster.xyz/miniapps/oT7lGF0ooNeB/die-hard-the-game+1 others$458
#290SongCastfarcaster.xyz/miniapps/mYB-AY4azNE5/songcast@dabus.eth$333
#289Pizza Cityfarcaster.xyz/miniapps/aLK9q29dGfoa/pizza-city+1 others$405
#288Franchiserfarcaster.xyz/miniapps/yetHcJ1rdN-n/franchiser+16 others$2,518
#287🌐@thebestpizza.eth's…farcaster.xyz/thebestpizza.eth/0x17af7b4e+1 others$409
#286unflatfarcaster.xyz/miniapps/Pc4mqNrBe03E/x-quo@alevenox$570
#285TYSMfarcaster.xyz/miniapps/nUvYVEakjfKm/tysm$734
#284BANKR Swapswap.bankr.bot+1 others$876
#283Howlersfarcaster.xyz/miniapps/yBlGKitosGjY/howlers$400
#282Howlersfarcaster.xyz/miniapps/yBlGKitosGjY/howlers$385
#281$EGGSfarcaster.xyz/miniapps/Qqjy9efZ-1Qu/eggs+171 others$3,573
#280dexscreenerdexscreener.com/base/0x2a0F410422951F53CD2F3E9F6d0f29FccB1426E9@scanqrbase.eth$444
#279Other ETHfarcaster.xyz/miniapps/fnWIijESdvRN/other-eth$676
#278NEYNARtodesfarcaster.xyz/miniapps/uaKwcOvUry8F/neynartodes$505
#277$QRfarcaster.xyz/miniapps/cmHEZhAwO_dW/qr@blockx$362
#276@scanqrbase.eth's c…farcaster.xyz/scanqrbase.eth/0x58fdc9d1@ScanQRBase$1,111
#275Peeples Donutsfarcaster.xyz/miniapps/OBSXNsOaGYv1/peeples-donuts+1 others$660
#274dexscreenerdexscreener.com/base/0x2a0f410422951f53cd2f3e9f6d0f29fccb1426e9$1,333
#273@starl3xx.eth's castfarcaster.xyz/starl3xx.eth/0xd0c7a045@starl3xx.eth$325
#272QRbasefarcaster.xyz/miniapps/pSTSE9GDxQA7/qrbase?path=/fast-mode$555
#271unflatfarcaster.xyz/miniapps/Pc4mqNrBe03E/x-quo@alevenox$334
#270dexscreenerdexscreener.com/base/0x2a0f410422951f53cd2f3e9f6d0f29fccb1426e9$300
#269Netnetprotocol.app/app/profile/base/0xEeFdd3379c7Ba3A6A67b63e21476c49ACEC18916@flanneldonut$305
#268Farpixel Cats Minte…farcaster.xyz/miniapps/9OxRZU1Osxp2/farpixel-cats-minter-online$293
#267unflatfarcaster.xyz/miniapps/Pc4mqNrBe03E/x-quo$311
#266geckoterminalgeckoterminal.com/monad/pools/0xd2e649c17a0b56dd3167487b6613c836c90f86e276c97fb25953a4e34e690c82+1 others$370
#265idaida.gbm.auction@GBMauction$820
#264idaida.gbm.auction@GBMauction$500
#263idaida.gbm.auction@GBMauction$1,169
#262Farpixel Cats Minte…farcaster.xyz/miniapps/9OxRZU1Osxp2/farpixel-cats-minter-online$338
#261HIGHER MARKETshop.highermarket.xyz$402
#260Beeperbeep.works/app$410
#259Hypesinofarcaster.xyz/miniapps/nj7AMLCDK05_/hypesino@alec.eth$310
#258@vocast's castfarcaster.xyz/vocast/0xb6f0fd6a$306
#257404: NOT_FOUNDfarcaster.xyz/miniapps/aQ9nULJBBFTm/newclankwhodis@newclankwhodis$330
#256Minted Merchfarcaster.xyz/miniapps/1rQnrU1XOZie/minted-merch+4 others$456
#255seeingbluezora.co/@seeingblue@seeingblue$273
#254QRBase -$SCANqrbase.xyz/fast-mode@ScanQRBase$333
#253@vocast's castfarcaster.xyz/vocast/0x801fd74b@vocast$305
#252@sahil's castfarcaster.xyz/sahil/0x1110f84a$386
#251@regent's castfarcaster.xyz/regent/0xff499bbc$450
#250GlazeCorpfarcaster.xyz/miniapps/fOIgVq2bFKru/glazecorp$650
#249Hypesinofarcaster.xyz/miniapps/nj7AMLCDK05_/hypesino@alec.eth$538
#248Hypesinofarcaster.xyz/miniapps/nj7AMLCDK05_/hypesino@alec.eth$315
#247PICKEM - NFL Pick'e…f.pickemgame.app@frensHouse$300
#246REPfarcaster.xyz/miniapps/4eKV9rQmIeAQ/rep@rep-hq$411
#245@starl3xx.eth's castfarcaster.xyz/starl3xx.eth/0x0b4892f4+86 others$12,261
#244@neet_sol's tweetx.com/neet_sol/status/1985048281949299177@theneetguy$300
#243@wydeorg's tweetx.com/wydeorg/status/1985480001618428209@wydeorg$403
#242farcasterfarcaster.xyz/miniapps/Uuwx_-3CSz_y/creeper@blockcreeper$900
#241a0a0.design/red$331
#240@PubhouseXYZ's tweetx.com/PubhouseXYZ/status/1984315251601653986@pita$470
#239Megaphonefarcaster.xyz/miniapps/8a3bQEQSKgNN/megaphone$251
#238@whatthefirkin's tw…x.com/whatthefirkin/status/1983650056386572372?s=46$606
#237@collectr's castfarcaster.xyz/collectr/0x5af80e24@kiwi-eth$467
#236@faircaster on Xx.com/faircaster$616
#235dexscreenerdexscreener.com/base/0x53932cbd6cddbb907ce1bb108496c7bd8aaa5dce+1 others$2,519
#234@noiceagent on Xx.com/noiceagent$888
#233@noiceagent on Xx.com/noiceagent$600
#232Hypesinofarcaster.xyz/miniapps/nj7AMLCDK05_/hypesino@alec.eth$321
#231Hypesinofarcaster.xyz/miniapps/nj7AMLCDK05_/hypesino@alec.eth$370
#230@skycastletokens on…x.com/skycastletokens?s=21@itsbasil$275
#229Hypesinofarcaster.xyz/miniapps/nj7AMLCDK05_/hypesino$330
#228🌐@iamtheoneapp.eth o…farcaster.xyz/iamtheoneapp.eth@iamtheoneapp.eth$450
#227Signetfarcaster.xyz/miniapps/RkN8wr33nYAz/signet+4 others$270
#226Emergefarcaster.xyz/miniapps/pmZbrBBIA6wT/emerge$241
#225@clearlyrepute's tw…x.com/clearlyrepute/status/1978864809329451386@clearlyrepute$250
#224@lior's castfarcaster.xyz/lior/0x8ee4a56e@productclank$330
#223CODYf.codygame.com@codygame$270
#222404: NOT_FOUNDfarcaster.xyz/miniapps/FaAL7QdAofGO/take0ver-tv$251
#221HashHorse - Mini Apphash.horse/miniapp$300
#220@songcastxyz on Xx.com/songcastxyz@dabus.eth$321
#219PICKEMfarcaster.xyz/miniapps/35a8KZnAKGv9/pickem@frensHouse$420
#218POLICASTfarcaster.xyz/miniapps/SHnAJj9vutAc/policast@javabu.eth$440
#217@GoatTradingDex's t…x.com/GoatTradingDex/status/1976310394990784912@GoatTradingDex$450
#216HashHorsefarcaster.xyz/miniapps/fN556fxhC7ti/hashhorse@GoatTradingDex$416
#215@STORMEcoin on Xx.com/STORMEcoin$287
#214@zxbt_labs's tweetx.com/zxbt_labs/status/1975216375774765169@zxbt_labs$1,380
#213PunkStrategy™punkstrategy.fun/app$288
#212@helloworld_base on…x.com/helloworld_base$334
#211HashHorsefarcaster.xyz/miniapps/fN556fxhC7ti/hashhorse@GoatTradingDex$475
#210Minted Merchfarcaster.xyz/miniapps/1rQnrU1XOZie/minted-merch$667
#209@collectr's castfarcaster.xyz/collectr/0x95aa9a14$1,275
#208NODEnodefoundation.com$622
#207@firkin.eth's castfarcaster.xyz/firkin.eth/0x8c0570e4+1 others$361
#206CODYf.codygame.com$274
#205🌐@fromtiktok's castfarcaster.xyz/fromtiktok/0x469e3706+96 others$476
#204dexscreenerdexscreener.com/base/0x0f4a85526e8b27b71c8d26a129d79ee4454d9c40dc1f5a5852845224a58158cc@atown$222
#203@reserveprotocol's …x.com/reserveprotocol/status/1970846191127547907$525
#202@playminiapp's tweetx.com/playminiapp/status/1970550177326121050$492
#201Native • Chat, Play…native.fun+1 others$365
#200MintedMerch - Where…coin.mintedmerch.shop+6 others$343
#199PoolFans - Onchain …pool.fans+14 others$367
#198Emergetryemerge.xyz/launch$541
#197ShapeShift DAOapp.shapeshift.com/#/trade/bip122:000000000019d6689c085ae165831e93/slip44:0/eip155:8453/slip44:60/1000000000000000000@hpayne_writer$650
#196dexscreenerdexscreener.com/solana/96tpukyw1uapjg5eocyssopuu1bhq1hosmqdoarhpump$715
#195Buy BASE DISK ($BSD…vibechain.com/market/base-disk?ref=AMLY4BKTRR4R$472
#194Pigeon—Your AI quan…pigeon.trade+1 others$1,058
#193dexscreenerdexscreener.com/base/0xd7e82c10269ce007050f0d12706ba4e355ac670e91b952aa584f2990a3742222$2,222
#192Memetic Signal Prot…memeticsignalprotocol.com$454
#191Buy "VIBENZA" ($"VB…vibechain.com/market/vibenza$431
#190@STORMEcoin on Xx.com/STORMEcoin@STORMEcoin$457
#189likes.funlikes.fun$777
#188@theborklar's tweetx.com/theborklar/status/1965807393113260352?s=46&t=KFwdL1MonCbWLtvWIZq7PQ@theborklar$290
#187Running Wildzora.co/coin/base:0xdd81728310ed6e9d83d9784b42d0910146aba22c?referrer=0x019b773872d1eb81b727ce7c56e7857f6ccedf00@bondy.eth$390
#186Running Wildzora.co/coin/base:0xdd81728310ed6e9d83d9784b42d0910146aba22c?referrer=0x019b773872d1eb81b727ce7c56e7857f6ccedf00$297
#185dexscreenerdexscreener.com/base/0xe610ddc70eb7f2cff4a18d55b0cf0cef1f6e0f5f$300
#184discographydiscography.arweave.net@discman$280
#183@asylum's castfarcaster.xyz/asylum/0xd03be7af$552
#182trifle ♧like.trifle.life/lottery$485
#181Big Bang (BANG) | C…clanker.world/clanker/0x9039365E0d3d2Ec104DD85ac3533ADC92Af1fB07@bigbangwheels.eth$250
#180@seedclubhq's tweetx.com/seedclubhq/status/1962881951414812979@seedclubhq$469
#179Pubhouse | Shake on…pubhouse.xyz$300
#178Building Pays Offcreatorscore.app$456
#177projectverdantprojectverdant.com@yarscript$350
#176Pet Rock Lifefarcaster.xyz/miniapps/REZhOpYYtK7f/pet-rock-life+4 others$470
#175Streme in the Gameparagraph.com/@readme/streme$203
#174@dry_tortuga's tweetx.com/dry_tortuga/status/1960362023583367501$386
#173@helloworld_base on…x.com/helloworld_base@helloworld_base$333
#172@joincreatordao on Xx.com/joincreatordao@joincreatordao$250
#171Crypto Airdrop Chec…drops.bot/?r=QR@DropsBotHQ$370
#170Farcasterfarcaster.xyz/~/compose@JackDishman$555
#169HashHorsefarcaster.xyz/miniapps/fN556fxhC7ti/hashhorse@GoatTradingDex$520
#168@pita's castfarcaster.xyz/pita/0x3176c8e2@pita$699
#167$BUTTHOLE – Weaponi…butthole.stream$666
#166dexscreenerdexscreener.com/base/0xe610ddc70eb7f2cff4a18d55b0cf0cef1f6e0f5f$552
#165dexscreenerdexscreener.com/solana/5wnu5qhdprgrl37ffcd6tmmqzugqgxwafgz477rshthy@defipolice_$1,520
#164dexscreenerdexscreener.com/base/0x0db97887b9ebca78d1d14755c091f5306f56b32e@ScanQRBase$777
#163openseaopensea.io/collection/glowbuds/tokens$2,166
#162QRBase -$SCANqrbase.xyz/base/0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe$1,011
#161dexscreenerdexscreener.com/base/0xCC28456d4Ff980CeE3457Ca809a257E52Cd9CDb0+14 others$1,065
#160QRBase -$SCANqrbase.xyz/base/0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4+1 others$1,112
#159SCANzora.co/coin/base:0x20429f731096e359910921994a267d32ef576720$3,333
#158sonofagarbagemanzora.co/@sonofagarbageman@sonofgarbageman$660
#157songcastzora.co/@songcast@dabus.eth$400
#156dexscreenerdexscreener.com/base/0xf02c421e15abdf2008bb6577336b0f3d7aec98f0@jumpbox.eth$550
#155dexscreenerdexscreener.com/base/0xf02c421e15abdf2008bb6577336b0f3d7aec98f0@qrcoindotfun$469
#154Daily Questionsfarcaster.xyz/miniapps/5E-wFvcxzFwy/daily-poll@dailypoll$669
#153dexscreenerdexscreener.com/base/0xf02c421e15abdf2008bb6577336b0f3d7aec98f0@qrcoindotfun$1,800
#152dexscreenerdexscreener.com/base/0xf02c421e15abdf2008bb6577336b0f3d7aec98f0@qrcoindotfun$1,150
#151apemanctoapemancto.com@ApeManCTO$665
#150@neet_sol on Xx.com/neet_sol@defipolice_$444
#149BRND Landbrnd.land@brnd$369
#148Emergetryemerge.xyz@atown$369
#147zxbt0xxzora.co/zxbt0xx@zxbt_$1,258
#146Daily Active Userfarcaster.xyz/miniapps/1g9Kz0z_Luix/daily-active-user@dau$757
#145Join the Zapper: So…testflight.apple.com/join/CTBAvdAz@zapper$1,000
#144Higheraimhigher.net@0xkwydk$1,000
#143dexscreenerdexscreener.com/base/0xb09877aA2a13233b57735E987de24083CcA4aBec@kryptocockcoin$669
#142Stremefarcaster.xyz/miniapps/tmjNyAmp7nkC/streme@zeni.eth$1,000
#141@aavegotchi's tweetx.com/aavegotchi/status/1948718066730188841@GoobzGG$1,500
#140flauntflaunt.meme@flauntmeme$815
#139@xicojam's tweetx.com/xicojam/status/1948013924554527084@startupoppa$1,396
#138Inflyncefarcaster.xyz/miniapps/TrnTSlXGbRDg/inflynce@inflynce$1,000
#137cultscults.fun@gtm$666
#136HashHorsefarcaster.xyz/miniapps/fN556fxhC7ti/hashhorse0xFa...E170$510
#135@blocktrader365's t…x.com/blocktrader365/status/1946585869927776707@blocktrader365$365
#134HashHorsefarcaster.xyz/miniapps/fN556fxhC7ti/hashhorse0xFa...E170$941
#133@bvdani_el's tweetx.com/bvdani_el/status/1945226782954684580@bvdani_el$870
#132@xicojam's tweetx.com/xicojam/status/1945509286345363856@perl$1,869
#131dexscreenerdexscreener.com/base/0xf02c421e15abdf2008bb6577336b0f3d7aec98f0@qrcoindotfun$500
#130indxsindxs.app@indxsapp$402
#129dexscreenerdexscreener.com/base/0xcc4511f3537fd598e00e7b676edf7818ce2ca43b174070de3ab8d95ddcc9a1e5@_seehad$421
#128dexscreenerdexscreener.com/base/0xfb192c68dcdaee359a3f2b6d584ba3093883f525@hammallama7$305
#127YHSSmokerst.me/CircusDotFun@nicky_sap$303
#126dexscreenerdexscreener.com/base/0x41b4439D518953B98cCce8Fa97942a43fEFFa90b@clfx.eth$338
#125dexscreenerdexscreener.com/base/0x41b4439d518953b98ccce8fa97942a43feffa90b@fffflood$320
#124@blocktrader365 on Xx.com/blocktrader365@blocktrader365$250
#123Log a Doglogadog.xyz@mykcryptodev$275
#122Calendar3calendar.money@YazhisaiSivanat$300
#121SongCast - Music At…songcast.xyz/passive-investment@dabusthebuilder$386
#120Crypto Airdrop Chec…drops.bot?r=QR@dropsbothq$277
#119Megapotfarcaster.xyz/miniapps/HmVjqouHgnKx/megapot@patrick_lung$517
#118Replyfarcaster.xyz/miniapps/ZuqxLQnWC2Nh/reply@andreworix$562
#117coinbasecoinbase.com/onramp@organ_danny$628
#116@sirsu.eth's castfarcaster.xyz/sirsu.eth/0x4dcfa244@sirsuhayb$400
#115flipskiflipski.xyz/flipski@nftkid23$421
#114@sirsu.eth's castfarcaster.xyz/sirsu.eth/0x8833af5d@sirsuhayb$720
#113@GrindingPoet's twe…x.com/GrindingPoet/status/1938223960146122819defipolice.eth$800
#112@anoncoin_ on Xx.com/anoncoin_@0xchomu$444
#111seeingbluemintoftheday.com@seeing_blue$234
#110L2 Marathon | Omnic…l2marathon.com@L2Marathon$333
#109@anoncoin_ on Xx.com/anoncoin_@0xchomu$750
#108@pawthereum's tweetx.com/pawthereum/status/1936070911465013468@mykcryptodev$825
#107@dubdub_tv on Xx.com/dubdub_tv@0xchomu$750
#106Ampsamps.fun@philmohun$586
#105@intori on Farcasterfarcaster.xyz/intori@intorihq$751
#104SECONDseconds.money@YazhisaiSivanat$740
#103@iownco on Xx.com/iownco@0xbhargav$491
#102coinbreadcoinbread.cash@CoinbreadCash$807
#101Base Colorsbasecolors.com@jake$1,000
#100@ChartCoinIntern on…x.com/ChartCoinIntern@ChartCoinIntern$689
#99@frocisbased's tweetx.com/frocisbased/status/1932791633919291634?s=46&t=A9lkaOF9ji0yIbctDEodrA@based_froc$820
#98@procoin's castfarcaster.xyz/procoin/0x8be97def@mjayceee$2,222
#97Cliptheclip.fun/post/0xb0766a10fb9c7ca14507a6ecde8cf07f4c1d423f@theclipdotfun$3,500
#96@theclipdotfun on Xx.com/theclipdotfun@theclipdotfun$1,200
#95iowniown.co@0xbhargav$1,100
#94Cliptheclip.fun@0xchomu$1,000
#93@thecabalcoin on Xx.com/thecabalcoin@rhynotic$1,100
#92@Victor928 on Xx.com/Victor928@victor928$667
#91@thecryptos.eth on …farcaster.xyz/thecryptos.eth@thecryptos.eth$672
#90@thecabalcoin on Xx.com/thecabalcoin@rhynotic$1,000
#89@defidough's tweetx.com/defidough/status/1929550225045086397@defidough$733
#88dropsdrops.bot/lfg/twitter@dropsbothq$666
#87dropsdrops.bot/lfg/twitter@dropsbothq$969
#86cultscults.fun@taydotfun$1,212
#85@mjc716's castfarcaster.xyz/mjc716/0xde2f1d05@mjc716$1,800
#84@tryoharaAI's tweetx.com/tryoharaAI/status/1925643998279966730oharaai.base.eth$1,431
#83@tator_trader's twe…x.com/tator_trader/status/1927372800718770382ninja-dev3-x.base.eth$1,680
#82dexscreenerdexscreener.com/base/0x294799c95eab673d44c37e96ce350ff9e66e6a700xb0...4C6F$760
#81@reserveprotocol's …x.com/reserveprotocol/status/1924842686588092439@reserveprotocol$775
#80$COATcoatdog.com/creator0x92...52d3$1,999
#79@heettike's tweetx.com/heettike/status/1925663270834176034?s=46@srijancse$1,869
#78@srijan.eth's castwarpcast.com/srijan.eth/0x67516f67@srijancse$669
#77noicenoice.so@srijancse$222
#76@noicedotso on Xx.com/noicedotso@srijancse$420
#75@noiceapp on Farcas…warpcast.com/noiceapp@srijancse$555
#74@codeofcrypto's castwarpcast.com/codeofcrypto/0x48bb5a1d@codeofcrypto$256
#73@yes2crypto.eth on …warpcast.com/yes2crypto.eth@yes2crypto1$272
#72@Victor928 on Xx.com/Victor928@victor928$300
#71@AInalyst_ on Xx.com/AInalyst_0xb0...4C6F$400
#70Collectr - Monthly …collectr.live/2025/may@collectrs$370
#69@Rhynotic's tweetx.com/Rhynotic/status/1922044364575875530@rhynotic$165
#68@intent on Xx.com/intent/post@basedfk$87
#67seeingbluezora.co/@seeingblue@seeing_blue$44
#66@tipn's castwarpcast.com/tipn/0xccfc23fb@niftytime$69
#65Warp Rampwarpcast.com/miniapps/IicCFtcNbkXu/warp-ramp@saltorious1$75
#64Songbirdzsongbirdz.cc@taydotfun$42
#63FLOC* | Web3 Strate…wearefloc.com@esdotge$45
#62clanker worldclanker.world@david_tomu$82
#61GM Farcasteryoutube.com/@gmfarcaster@age_shulman$64
#60Warpswarps.fun@gskrovina$47
#59The Rise of Blus: A…nouns.movie@anaroth__$48
#58TickTockticktock.fun@taydotfun$68
#57dexscreenerdexscreener.com/base/0xf02c421e15abdf2008bb6577336b0f3d7aec98f0@qrcoindotfun$66
#56dexscreenerdexscreener.com/base/0xf02c421e15abdf2008bb6577336b0f3d7aec98f0@qrcoindotfun$46
#55BETRMINTbetrmint.fun@toady_hawk$236
#54@mjayceee's tweetx.com/mjayceee/status/1915532105536372935@mjc716$52
#53@zoiner's castwarpcast.com/zoiner/0x08092809@thescoho$55
#52@base_colors's tweetx.com/base_colors/status/1915244681278992878?s=46&t=FJ9Ia-2v_9ftxl0My0axTg@mykcryptodev$51
#51@frocisbased's tweetx.com/frocisbased/status/1914853564201247228?s=460x96...648E$188
#50Contentmentcoincontentment.fun@rhynotic$451
#49dexscreenerdexscreener.com/base/0x0d47db7fe2964d1e67268691138fc741f988ed430x81...E66C$834
#48dickbuttdickbutt.site@dickbuttbull$276
#47@panicdotfun on Xx.com/panicdotfun@taydotfun$152
#46Checkrcheckr.social@david_tomu$201
#45BigCoinbigcoin.tech?ref=0x95Be0AFb27C2426D9457ceEe22EDab30650cDcb0@bowtiednt$325
#44@tipn's castwarpcast.com/tipn/0x0f1f47de@kompreni$277
#43@_seacasa's tweetx.com/_seacasa/status/1912230433649205396?s=46&t=N0Rb3EM92M7D0kdXCFZgWg@_seacasa$463
#42@junglebayac's tweetx.com/junglebayac/status/1911902437402918956?s=46&t=N0Rb3EM92M7D0kdXCFZgWg@_seacasa$490
#41mirrormirror.xyz/sartoshi.eth@_seacasa$503
#40@junglebayac's tweetx.com/junglebayac/status/1896011339191238683?s=46&t=N0Rb3EM92M7D0kdXCFZgWg@_seacasa$597
#39@junglebayac's tweetx.com/junglebayac/status/1910696457604391332?s=46&t=N0Rb3EM92M7D0kdXCFZgWg@_seacasa$291
#38dexscreenerdexscreener.com/base/0xc1a6fbedae68e1472dbb91fe29b51f7a0bd44f97@proxystudio.eth$333
#37Open to the Publicopentothepublic.org@0xnaaate$204
#36@joelkruger's tweetx.com/joelkruger/status/1910012522377207938?s=46@joelkruger$159
#35Base | Jobsbase.org/jobs@mykcryptodev$67
#34@vsck on Farcasterwarpcast.com/vsck@cdeburner$88
#33@MLeeJr's tweetx.com/MLeeJr/status/1906799328909250745@mleejr$70
#32Bitcoin 2028zora.co/coin/base:0xd0d6b565637c846276a5017777c697c30463087f@thecryptos.eth$43
#31@mleejr's tweetx.com/mleejr/status/1906799328909250745?s=46&t=K-K-XWNW7-zukEgbiC3E5w0xbf...bA30$22
#30elon5050elon5050.com0xbf...bA30$28
#29S.P.A.W.N.spawner.fun@rhynotic$67
#28Project EVMavericks…giveth.io/project/evmavericks-doots-podcast@bbroad25$31
#27Custom Hangman Gamehangmanwords.com/play/custom@facebucks.eth$42
#26@DanaBuidl's tweetx.com/DanaBuidl/status/1906256564018921663defipolice.eth$71
#25openseaopensea.io/collection/based-fellas43things.eth$26
#24@applefather.eth's …warpcast.com/applefather.eth/0x912acd9e@0xbamboostrong$67
#23@jestrbot on Xx.com/jestrbot@nicky_sap$110
#22Blockchain Educatio…advantageblockchain.com@whitetaillp$49
#21Gigabraingigabrain.ggdefipolice.eth$103
#20punkpunk.town0x04...4543$137
#19GiveDirectly: Send …givedirectly.orgmrkibbles.base.eth$100
#18Alpha One - Trading…t.me/alpha_web3_bot?start=w4VbTY6s0x9B...1717$150
#17Welcome to Hirechai…hirechain.io@nocodejac$190
#16Onchain March Madne…linktr.ee/onchainmarchmadness2025@mykcryptodev$60
#15dexscreenerdexscreener.com/base/0xd6a4dac466fa6df5245726386c7300d0d133c15c@ayushxgarg$514
#14@ripdotfun on Xx.com/ripdotfun@softwarecurator$584
#13ᗷᗩᔕEᗪ ᖴᖇOᑕmedium.com/@basedfrocarmy0x02...Bfc8$231
#12Zorazora.co@js_horne$1,047
#11thevibecodedthevibecoded.xyz@bbroad25$90
#10In Publicinpublic.funbuildinginpublic.eth$191
#9Blockchain Educatio…advantageblockchain.com@whitetaillp$82
#8Veilveil.cash@apex_ether$229
#7How are you feeling?howareyoufeeling.xyz@sushilathreya$77
#6avatrackeravatracker.xyz0xaa...5178$279
#5QRBase -$SCANqrbase.xyz0x9C...503b$121
#4313 - First Mover Ad…zora.co/coin/base:0xb56c9af02832af6b135efd926612b94eec22037b@thecryptos.eth$440
#3btc/acc - Bitcoin A…btcacc.com@rhynotic$565
#2Hyperliquidapp.hyperliquid.xyz/join/FORFRIENDSdefipolice.eth$3,303
#1`;

interface ParsedAuction {
  id: number;
  title: string;
  url: string;
  winner: string;
  totalBidUSD: number;
  domain: string;
  projectKey: string;
  favicon: string;
  date: string;
  contributors: { address: string; amount: number; timestamp: number }[];
  txHash: string;
  blockNumber: number;
  contractVersion: string;
}

function extractDomain(url: string): string {
  try {
    const full = url.startsWith("http") ? url : `https://${url}`;
    return new URL(full).hostname;
  } catch {
    return url.split("/")[0];
  }
}

function parseRawData(): ParsedAuction[] {
  const auctions: ParsedAuction[] = [];
  const lines = RAW_DATA.trim().split("\n");

  // Auction #1 was on Feb 7, 2025. #371 is Mar 12, 2026.
  // Each auction is ~1 day apart. We approximate dates counting backwards.
  const LATEST_ID = 371;
  const LATEST_DATE = new Date(2026, 2, 12); // Mar 12, 2026 (local)

  // Sequential ID tracking: entries are in descending order 371→1
  let expectedId = LATEST_ID;

  for (const line of lines) {
    if (!line.startsWith("#")) continue;

    // === STEP 1: Extract the correct ID using sequential tracking ===
    // The raw data has no delimiter between ID and title, so #4313... could be
    // ID=4 with title "313..." or ID=43 with title "13...". We use expectedId
    // to resolve the ambiguity.
    let id = 0;
    let rest = "";

    // Try expectedId first, then scan downward (handles any skipped IDs)
    for (let tryId = expectedId; tryId >= Math.max(1, expectedId - 10); tryId--) {
      const prefix = `#${tryId}`;
      if (line.startsWith(prefix)) {
        id = tryId;
        rest = line.substring(prefix.length);
        break;
      }
    }

    if (id === 0) continue;
    expectedId = id - 1;

    // === STEP 2: Extract bid amount (always last $NNN in line) ===
    const bidMatch = rest.match(/\$([0-9,]+)$/);
    if (!bidMatch) continue;

    const bid = parseFloat(bidMatch[1].replace(/,/g, ""));
    const middle = rest.substring(0, rest.length - bidMatch[0].length);

    // === STEP 3: Extract URL, title, and winner from middle text ===
    let title = "";
    let url = "";
    let winner = "";

    // URL patterns to look for in the middle text (specific first!)
    const urlPatterns = [
      /(x\.com\/[^\s@+]*)/,
      /(farcaster\.xyz\/[^\s@+]*)/,
      /(warpcast\.com\/[^\s@+]*)/,
      /(dexscreener\.com\/[^\s@+]*)/,
      /(zora\.co\/[^\s@+]*)/,
      /(opensea\.io\/[^\s@+]*)/,
      /(geckoterminal\.com\/[^\s@+]*)/,
      /(apps\.apple\.com\/[^\s@+]*)/,
      /(testflight\.apple\.com\/[^\s@+]*)/,
      /(youtube\.com\/[^\s@+]*)/,
      /(medium\.com\/[^\s@+]*)/,
      /(paragraph\.com\/[^\s@+]*)/,
      /(mirror\.xyz\/[^\s@+]*)/,
      /(linktr\.ee\/[^\s@+]*)/,
      /(t\.me\/[^\s@+]*)/,
      /(giveth\.io\/[^\s@+]*)/,
      /(givedirectly\.org[^\s@+]*)/,
      /(base\.org\/[^\s@+]*)/,
      /(coinbase\.com\/[^\s@+]*)/,
      /(vibechain\.com\/[^\s@+]*)/,
      /(discography\.arweave\.net[^\s@+]*)/,
      // Generic TLD pattern — last so more specific patterns take priority
      /([a-zA-Z0-9][-a-zA-Z0-9]*\.(?:com|xyz|fun|app|org|io|net|gg|cc|sh|bot|so|co|meme|town|money|cash|trade|stream|life|social|works|land|horse|movie|design|tech|site|live|world|auction|zip)(?:\/[^\s@+]*)?)/,
    ];

    let urlMatch: RegExpMatchArray | null = null;
    for (const pattern of urlPatterns) {
      urlMatch = middle.match(pattern);
      if (urlMatch) break;
    }

    if (urlMatch) {
      const urlIdx = middle.indexOf(urlMatch[1]);
      title = middle.substring(0, urlIdx).replace(/[🌐]/g, "").trim();
      url = urlMatch[1];

      // Extract winner after URL
      const afterUrl = middle.substring(urlIdx + urlMatch[1].length);
      const winnerMatch = afterUrl.match(
        /@([a-zA-Z0-9_.-]+(?:\.eth)?)|(\+\d+ others)|(0x[a-fA-F0-9]{2}\.{3}[a-fA-F0-9]{4})/
      );
      if (winnerMatch) {
        winner = winnerMatch[0];
      }
    } else {
      title = middle;
    }

    // Clean up title - remove trailing ellipsis and emoji prefixes
    title = title.replace(/…$/, "").replace(/^🌐/, "").trim();

    // === STEP 4: Calculate approximate date (local time, no UTC shift) ===
    const daysDiff = LATEST_ID - id;
    const auctionDate = new Date(LATEST_DATE);
    auctionDate.setDate(auctionDate.getDate() - daysDiff);
    const date = `${auctionDate.getFullYear()}-${String(auctionDate.getMonth() + 1).padStart(2, "0")}-${String(auctionDate.getDate()).padStart(2, "0")}`;

    const domain = url ? extractDomain(url) : "";
    const fullUrl = url ? `https://${url}` : "";
    const projectKey = getProjectKey(fullUrl, domain);

    auctions.push({
      id,
      title: title || domain,
      url: fullUrl,
      winner,
      totalBidUSD: bid,
      domain,
      projectKey,
      favicon: "",
      date,
      contributors: winner
        ? [{ address: winner, amount: bid, timestamp: 0 }]
        : [],
      txHash: "",
      blockNumber: 0,
      contractVersion: "v5",
    });
  }

  return auctions.sort((a, b) => b.id - a.id);
}

/**
 * Compute a project grouping key from an auction's URL.
 * Groups related auctions together (same miniapp, same Twitter account, etc.)
 */
function getProjectKey(url: string, domain: string): string {
  // Farcaster miniapps: group by miniapp slug
  const fcMiniapp = url.match(
    /farcaster\.xyz\/miniapps\/[^/]+\/([^/?]+)/
  );
  if (fcMiniapp) return `fc-miniapp:${fcMiniapp[1].toLowerCase()}`;

  // Warpcast miniapps
  const wcMiniapp = url.match(
    /warpcast\.com\/miniapps\/[^/]+\/([^/?]+)/
  );
  if (wcMiniapp) return `wc-miniapp:${wcMiniapp[1].toLowerCase()}`;

  // Farcaster casts: group by username
  const fcCast = url.match(/farcaster\.xyz\/([^/]+)\/0x/);
  if (fcCast) return `fc-cast:${fcCast[1].toLowerCase()}`;

  // Farcaster channels/profiles
  const fcProfile = url.match(/farcaster\.xyz\/~\/channel\/([^/?]+)/);
  if (fcProfile) return `fc-channel:${fcProfile[1].toLowerCase()}`;

  // Farcaster user pages (compose, profile)
  const fcUser = url.match(/farcaster\.xyz\/([^/]+)$/);
  if (fcUser && fcUser[1] !== "miniapps")
    return `fc-user:${fcUser[1].toLowerCase()}`;

  // Warpcast casts
  const wcCast = url.match(/warpcast\.com\/([^/]+)\/0x/);
  if (wcCast) return `wc-cast:${wcCast[1].toLowerCase()}`;

  // X/Twitter tweets: group by account
  const xTweet = url.match(/x\.com\/([^/]+)\/status/);
  if (xTweet) return `x-account:${xTweet[1].toLowerCase()}`;

  // X/Twitter profiles
  const xProfile = url.match(/x\.com\/([^/?]+)/);
  if (xProfile) return `x-account:${xProfile[1].toLowerCase()}`;

  // Dexscreener: group by token (first 10 hex chars)
  const dex = url.match(/dexscreener\.com\/[^/]+\/(0x[a-fA-F0-9]{10})/i);
  if (dex) return `dex:${dex[1].toLowerCase()}`;

  // Dexscreener solana
  const dexSol = url.match(/dexscreener\.com\/solana\/([a-zA-Z0-9]{10})/);
  if (dexSol) return `dex-sol:${dexSol[1].toLowerCase()}`;

  // Zora coins
  const zoraCoin = url.match(/zora\.co\/coin\/[^:]+:([^/?]+)/);
  if (zoraCoin) return `zora-coin:${zoraCoin[1].slice(0, 10).toLowerCase()}`;

  // Zora profiles
  const zoraProfile = url.match(/zora\.co\/@([^/?]+)/);
  if (zoraProfile) return `zora:${zoraProfile[1].toLowerCase()}`;

  // Default: use domain
  return domain || url;
}

function categorizeByUrl(url: string, title: string): string {
  const u = url.toLowerCase();
  const t = title.toLowerCase();

  if (u.includes("farcaster.xyz/miniapps") || u.includes("warpcast.com/miniapps"))
    return "Farcaster Mini App";
  if (u.includes("farcaster.xyz/") || u.includes("warpcast.com/"))
    return "Social";
  if (u.includes("dexscreener") || u.includes("geckoterminal"))
    return "Token";
  if (u.includes("zora.co")) return "NFT/Art";
  if (u.includes("opensea.io")) return "NFT/Art";
  if (u.includes("x.com") || u.includes("twitter")) return "Social";
  if (u.includes("youtube.com")) return "Content/Media";
  if (u.includes("medium.com") || u.includes("paragraph.com") || u.includes("mirror.xyz"))
    return "Content/Media";
  if (t.includes("game") || t.includes("play") || t.includes("bounce") || t.includes("party") || t.includes("die hard"))
    return "Game";
  if (t.includes("swap") || t.includes("trade") || t.includes("dex") || t.includes("defi"))
    return "DeFi/Trading";

  return "Other";
}

async function fetchUrlMetadata(
  url: string
): Promise<{ title: string; favicon: string; domain: string }> {
  try {
    const resp = await fetch(
      `https://qrcoin.fun/api/url-metadata?url=${encodeURIComponent(url)}`
    );
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } catch {
    return { title: "", favicon: "", domain: "" };
  }
}

async function main() {
  console.log("=== QR Winners Parser ===\n");

  // Parse raw data
  const auctions = parseRawData();
  console.log(`Parsed ${auctions.length} auctions from page data`);

  // Enrich with metadata from qrcoin.fun API
  console.log("Enriching with metadata...");
  const urlCache = new Map<string, { title: string; favicon: string; domain: string }>();
  let enriched = 0;

  for (const auction of auctions) {
    if (!auction.url) continue;

    // Helper to check if a metadata title is valid (not an error page)
    const isValidTitle = (t: string) =>
      t &&
      !t.includes("NOT_FOUND") &&
      !t.includes("404") &&
      !t.includes("Error") &&
      t.length > 1;

    if (urlCache.has(auction.url)) {
      const cached = urlCache.get(auction.url)!;
      if (isValidTitle(cached.title)) auction.title = cached.title;
      if (cached.favicon) auction.favicon = cached.favicon;
      if (cached.domain) auction.domain = cached.domain;
    } else {
      const metadata = await fetchUrlMetadata(auction.url);
      urlCache.set(auction.url, metadata);
      if (isValidTitle(metadata.title)) auction.title = metadata.title;
      if (metadata.favicon) auction.favicon = metadata.favicon;
      if (metadata.domain) auction.domain = metadata.domain;
      // Rate limit
      await new Promise((r) => setTimeout(r, 60));
    }

    enriched++;
    if (enriched % 50 === 0)
      console.log(`  Enriched ${enriched}/${auctions.length}...`);
  }

  // Save auctions
  const outputPath = path.join(__dirname, "..", "data", "auctions.json");
  fs.writeFileSync(outputPath, JSON.stringify(auctions, null, 2));
  console.log(`\nSaved ${auctions.length} auctions to ${outputPath}`);

  // Generate project groupings using smart project keys
  const projectMap = new Map<string, any>();
  for (const auction of auctions) {
    const key = getProjectKey(auction.url, auction.domain) || auction.title;
    if (!key) continue;

    if (projectMap.has(key)) {
      const p = projectMap.get(key)!;
      p.totalAuctionWins++;
      p.totalSpentUSD += auction.totalBidUSD;
      p.auctionIds.push(auction.id);
      p.lastWin = auction.date;
    } else {
      projectMap.set(key, {
        name: auction.title || key,
        tagline: "",
        summary: "",
        category: categorizeByUrl(auction.url, auction.title),
        linkType: "web",
        totalAuctionWins: 1,
        totalSpentUSD: auction.totalBidUSD,
        firstWin: auction.date,
        lastWin: auction.date,
        auctionIds: [auction.id],
        favicon: auction.favicon,
      });
    }
  }

  const projects: Record<string, any> = {};
  for (const [key, proj] of projectMap.entries()) {
    projects[key] = {
      ...proj,
      totalSpentUSD: Math.round(proj.totalSpentUSD * 100) / 100,
    };
  }

  const projectsPath = path.join(__dirname, "..", "data", "projects.json");
  fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2));
  console.log(
    `Saved ${Object.keys(projects).length} unique projects to ${projectsPath}`
  );
}

main().catch(console.error);
