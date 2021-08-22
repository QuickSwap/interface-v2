import { getAddress } from '@ethersproject/address';
import { Contract } from '@ethersproject/contracts'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { abi as IUniswapV2Router02ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { CurrencyAmount, ChainId, Percent, JSBI, Currency, ETHER, Token } from '@uniswap/sdk';
import { BigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants'
import { TokenAddressMap } from 'state/lists/hooks';
import { ALLOWED_PRICE_IMPACT_HIGH, PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN, ROUTER_ADDRESS, MIN_ETH } from 'constants/index'

export { default as addMaticToMetamask } from './addMaticToMetamask';

export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

/**
 * Given the price impact, get user confirmation.
 *
 * @param priceImpactWithoutFee price impact of the trade without the fee.
 */
export function confirmPriceImpactWithoutFee(priceImpactWithoutFee: Percent): boolean {
  if (!priceImpactWithoutFee.lessThan(PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN)) {
    return (
      window.prompt(
        `This swap has a price impact of at least ${PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN.toFixed(
          0
        )}%. Please type the word "confirm" to continue with this swap.`
      ) === 'confirm'
    )
  } else if (!priceImpactWithoutFee.lessThan(ALLOWED_PRICE_IMPACT_HIGH)) {
    return window.confirm(
      `This swap has a price impact of at least ${ALLOWED_PRICE_IMPACT_HIGH.toFixed(
        0
      )}%. Please confirm that you would like to continue with this swap.`
    )
  }
  return true
}

export function maxAmountSpend(currencyAmount?: CurrencyAmount): CurrencyAmount | undefined {
  if (!currencyAmount) return undefined
  if (currencyAmount.currency === ETHER) {
    if (JSBI.greaterThan(currencyAmount.raw, MIN_ETH)) {
      return CurrencyAmount.ether(JSBI.subtract(currencyAmount.raw, MIN_ETH))
    } else {
      return CurrencyAmount.ether(JSBI.BigInt(0))
    }
  }
  return currencyAmount
}

export function getRouterContract(_: number, library: Web3Provider, account?: string): Contract {
  return getContract(ROUTER_ADDRESS, IUniswapV2Router02ABI, library, account)
}

export function isTokenOnList(defaultTokens: TokenAddressMap, currency?: Currency): boolean {
  if (currency === ETHER) return true
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}

export function getEtherscanLink(chainId: ChainId, data: string, type: 'transaction' | 'token' | 'address' | 'block'): string {
  const prefix = "https://" + (chainId === 80001 ? "polygonscan.com":"polygonscan.com");

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'token': {
      return `${prefix}/token/${data}`
    }
    case 'block': {
      return `${prefix}/block/${data}`
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`
    }
  }
}

export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

export function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider, 'any')
  library.pollingInterval = 15000
  return library
}

export function isZero(hexNumberString: string) {
  return /^0x0*$/.test(hexNumberString)
}

export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000))
}
