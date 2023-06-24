import { ethers } from "ethers";
import { getContract } from "../Addresses";

const TOKENS = {
  1101: [
    // polygon zkEVM
    {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      address: ethers.constants.AddressZero,
      coingeckoUrl: "https://www.coingecko.com/en/coins/ethereum",
      isNative: true,
      isShortable: true,
      displayDecimals:2
    },
    {
      name: "Wrapped Ether",
      symbol: "WETH",
      decimals: 18,
      address: "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9",
      coingeckoUrl: "https://www.coingecko.com/en/coins/ethereum",
      isWrapped: true,
      baseSymbol: "ETH",
      displayDecimals:2
    },
    {
      name: "Bitcoin",
      symbol: "BTC",
      address: "0xEA034fb02eB1808C2cc3adbC15f447B93CbE08e1",
      coingeckoUrl: "https://www.coingecko.com/en/coins/bitcoin",
      decimals: 8,
      isShortable: true,
      displayDecimals:2
    },
    {
      name: "Matic",
      symbol: "MATIC",
      decimals: 18,
      address: "0xa2036f0538221a77A3937F1379699f44945018d0",
      coingeckoUrl: "https://www.coingecko.com/en/coins/polygon",
      isShortable: true,
      displayDecimals:4
    },
    {
      name: "USDC",
      symbol: "USDC",
      address: "0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035",
      coingeckoUrl: "https://www.coingecko.com/en/coins/usd-coin",
      decimals: 6,
      isStable: true,
      displayDecimals:4
    },
    {
      name: "USDT",
      symbol: "USDT",
      address: "0x1E4a5963aBFD975d8c9021ce480b42188849D41d",
      coingeckoUrl: "https://www.coingecko.com/en/coins/tether",
      decimals: 6,
      isStable: true,
      displayDecimals:4
    },
    {
      name: "Dai",
      symbol: "DAI",
      address: "0xC5015b9d9161Dca7e18e32f6f25C4aD850731Fd4",
      coingeckoUrl: "https://www.coingecko.com/en/coins/dai",
      decimals: 18,
      isStable: true,
      displayDecimals:4
    },

  ],
};

const ADDITIONAL_TOKENS = {
  1101: [
    {
      name: "QUICK LP",
      symbol: "QLP",
      address: getContract(1101, "QLP"),
      decimals: 18,
    },
  ],
};

const CHAIN_IDS = [1101];

const TOKENS_MAP = {};
const TOKENS_BY_SYMBOL_MAP = {};

for (let j = 0; j < CHAIN_IDS.length; j++) {
  const chainId = CHAIN_IDS[j];
  TOKENS_MAP[chainId] = {};
  TOKENS_BY_SYMBOL_MAP[chainId] = {};
  let tokens = TOKENS[chainId];
  if (ADDITIONAL_TOKENS[chainId]) {
    tokens = tokens.concat(ADDITIONAL_TOKENS[chainId]);
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    TOKENS_MAP[chainId][token.address] = token;
    TOKENS_BY_SYMBOL_MAP[chainId][token.symbol] = token;
  }
}

const WRAPPED_TOKENS_MAP = {};
const NATIVE_TOKENS_MAP = {};
for (const chainId of CHAIN_IDS) {
  for (const token of TOKENS[chainId]) {
    if (token.isWrapped) {
      WRAPPED_TOKENS_MAP[chainId] = token;
    } else if (token.isNative) {
      NATIVE_TOKENS_MAP[chainId] = token;
    }
  }
}

export function getWrappedToken(chainId) {
  return WRAPPED_TOKENS_MAP[chainId];
}

export function getNativeToken(chainId) {
  return NATIVE_TOKENS_MAP[chainId];
}

export function getTokens(chainId) {
  return TOKENS[chainId];
}

export function isValidToken(chainId, address) {
  if (!TOKENS_MAP[chainId]) {
    throw new Error(`Incorrect chainId ${chainId}`);
  }
  return address in TOKENS_MAP[chainId];
}

export function getToken(chainId, address) {
  if (!TOKENS_MAP[chainId]) {
    throw new Error(`Incorrect chainId ${chainId}`);
  }
  if (!TOKENS_MAP[chainId][address]) {
    localStorage.removeItem("Exchange-token-selection-v2");
    localStorage.removeItem("BuyQlp-swap-token-address");
    //window.location.reload();
  }
  return TOKENS_MAP[chainId][address];
}

export function getTokenBySymbol(chainId, symbol) {
  const token = TOKENS_BY_SYMBOL_MAP[chainId][symbol];
  if (!token) {
    throw new Error(`Incorrect symbol "${symbol}" for chainId ${chainId}`);
  }
  return token;
}

export function getWhitelistedTokens(chainId) {
  return TOKENS[chainId].filter((token) => token.symbol !== "USDQ");
}
