// Contract Configuration
export const CONTRACT_ADDRESS = "0xA3592BbAd3D34Bf5197FAEcaBCA6b87552cb5676";

// Monad Testnet Configuration
export const MONAD_TESTNET = {
  id: 10143,
  name: "Monad Testnet",
  network: "monad-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MON",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
    public: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
};

// Default Settings
export const DEFAULT_TWITCH_CHANNEL = "ninja";
export const EXPLORER_URL = "https://testnet.monadexplorer.com";

// Reaction Emojis
export const REACTION_EMOJIS = ["❤️", "😂", "😮", "🔥", "👏"];