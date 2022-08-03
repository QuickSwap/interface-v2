import { ChainId } from '@uniswap/sdk';

export const ETH_TOKEN_DATA = {
  symbol: 'ETH',
  address: '0x0000000000000000000000000000000000000000',
  name: 'Ethereum Network Token',
  decimals: 18,
  color: '#627EEA',
  overlayTextColor: '#fff',
  logoURL:
    'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/64/Ethereum-ETH-icon.png',
  extraData: {},
};

export interface TokenData {
  name: string | null;
  symbol: string | null;
  address: string | null;
  decimals: number | null;
  color: string | null;
  overlayTextColor: string | null;
  logoURL: string | null;
  extraData: Record<any, any>;
}

export const fetchTokenData = async (
  address: string,
  chainId?: ChainId,
): Promise<TokenData> => {
  if (address === ETH_TOKEN_DATA.address) {
    return ETH_TOKEN_DATA;
  }
  let data: TokenData;

  try {
    if (address === '') {
      throw new Error('address is empty');
    }
    if (!chainId) throw new Error('Wrong network');
    data = await fetch(
      `${process.env.REACT_APP_MARKET_API_URL}/tokenData?address=${address}&chainId=${chainId}`,
    ).then((res) => res.json());

    data.address = address;
  } catch (e) {
    data = {
      name: null,
      address: null,
      symbol: null,
      decimals: null,
      color: null,
      overlayTextColor: null,
      logoURL: null,
      extraData: {},
    };
  }
  return data;
};
