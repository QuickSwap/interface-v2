import { Price, Token } from '@uniswap/sdk-core';

interface UseInverterAttr {
  priceLower?: Price<Token, Token>;
  priceUpper?: Price<Token, Token>;
  quote?: Token;
  base?: Token;
  invert?: boolean;
}

interface UseInverterReturn {
  priceLower?: Price<Token, Token>;
  priceUpper?: Price<Token, Token>;
  quote?: Token;
  base?: Token;
}

export const useInverter = ({
  priceLower,
  priceUpper,
  quote,
  base,
  invert,
}: UseInverterAttr): UseInverterReturn => {
  return {
    priceUpper: invert ? priceLower?.invert() : priceUpper,
    priceLower: invert ? priceUpper?.invert() : priceLower,
    quote: invert ? base : quote,
    base: invert ? quote : base,
  };
};
