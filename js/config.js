// Everything that changes per deploy lives here; every page reads the name and
// the trigger from this file.

export const BRAND = {
  name: "CommenterPad",
  trigger: "@CommenterPad", // what people type in a comment (the account they tag)
  x: "https://x.com/CommenterPad",
  // The official coin. Empty until it launches; once set, the header, the hero and
  // the footer show it (its name and ticker are read from DexScreener).
  token: "",
};

export const CONFIG = {
  // The service. Until it answers with launched coins, the feed shows examples.
  api: "https://commenterpad-bot.onrender.com",
  pumpUrl: (mint) => `https://pump.fun/coin/${mint}`,
  solscan: (addr) => `https://solscan.io/token/${addr}`,
};

// Every launch is paired with its platform's coin instead of SOL.
export const PAIRS = [
  { id: "x", platform: "X", coin: "X Coin", ticker: "X", mint: "9Hcksg9o6oXbJWN7FTAL2HFrvknqTzmmNybBYP4UA6cP", live: true },
  { id: "instagram", platform: "Instagram", coin: "Instagram Coin", ticker: "Instagram", mint: "FeMg8o2Ek7zKWT33MfdfwXrPoMdgqyXYPjTLWvEr34XF", live: false },
  { id: "tiktok", platform: "TikTok", coin: "TikTok Coin", ticker: "TikTok", mint: "64oAuE88tNP7KsSyaiJTKGP4sWmLMFGWLUs9eBTLYgCp", live: false },
];
