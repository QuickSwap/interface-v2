import { ChainId } from '@uniswap/sdk';
import { CHAIN_INFO } from 'constants/v3/chains';
import { useAppSelector } from 'state';

export function useDefaultGasPrice(chainId: ChainId | undefined): number {
  //We don't know the gas price for the chain
  //but we don't want transactions to get stuck
  //since currently we're polygon based chains
  //we're going to override the gas price to be higher
  //than what it normally would be to assure that the
  //gas transaction should pass
  const defaultUnknownChainGasPrice = 75;
  const chainInfo = chainId ? CHAIN_INFO[chainId] : undefined;

  const gasPrice = useAppSelector((state) => {
    if (!chainInfo) {
      console.log(
        `No chain info for chainId: ${chainId} overriding default gas price to  ${defaultUnknownChainGasPrice}`,
      );
    }

    const defaultGasPrice =
      chainInfo?.defaultGasPrice ?? defaultUnknownChainGasPrice;

    // TODO: This is a work around since our gas update currently only works with matic
    // Remove this once, we have a gas update for dogechain
    if (chainId != ChainId.MATIC) {
      return defaultGasPrice;
    }

    if (!state.application.gasPrice.fetched) {
      return defaultGasPrice;
    }
    return state.application.gasPrice.override
      ? defaultGasPrice
      : state.application.gasPrice.fetched;
  });

  return gasPrice;
}
