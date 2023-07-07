import { ChainId } from '@uniswap/sdk';

export const getMaticPrice: (chainId: ChainId) => Promise<number[]> = async (
  chainId: ChainId,
) => {
  let maticPrice = 0;
  let maticPriceOneDay = 0;
  let priceChangeMatic = 0;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_LEADERBOARD_APP_URL}/utils/matic-price?chainId=${chainId}`,
  );
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      errorText || res.statusText || `Failed to get global data v2`,
    );
  }
  const data = await res.json();
  if (data && data.data) {
    maticPrice = data.data.maticPrice;
    maticPriceOneDay = data.data.maticPriceOneDay;
    priceChangeMatic = data.data.priceChangeMatic;
  }

  return [maticPrice, maticPriceOneDay, priceChangeMatic];
};

//Token Helpers

const WETH_ADDRESSES = ['0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'];

export function formatTokenSymbol(address: string, symbol: string) {
  if (WETH_ADDRESSES.includes(address)) {
    return 'MATIC';
  } else if (symbol.toLowerCase() === 'mimatic') {
    return 'MAI';
  } else if (symbol.toLowerCase() === 'amaticc') {
    return 'ankrMATIC';
  }
  return symbol;
}

export function formatTokenName(address: string, name: string) {
  if (WETH_ADDRESSES.includes(address)) {
    return 'Matic';
  }
  return name;
}
