import fetch from 'isomorphic-unfetch';

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

export const fetchTokenData = async (address: string): Promise<TokenData> => {
  if (address === ETH_TOKEN_DATA.address) {
    return ETH_TOKEN_DATA;
  }
  let data: TokenData;

  try {
    if (address === '') {
      throw new Error('address is empty');
    }
    data = await fetch(
      'https://sls.market.xyz/api/tokenData?address=' + address,
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
