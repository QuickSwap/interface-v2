import { Currency, currencyEquals, ETHER, Token } from '@uniswap/sdk';
import { Currency as V3Currency, Token as V3Token } from '@uniswap/sdk-core';
import React, { useMemo } from 'react';
import { Box } from '@material-ui/core';
import EthereumLogo from 'assets/images/Currency/PolygonSwap.svg';
import useHttpLocations from 'hooks/useHttpLocations';
import { WrappedTokenInfo } from 'state/lists/hooks';
import { WrappedTokenInfo as V3WrappedTokenInfo } from 'state/lists/v3/wrappedTokenInfo';
import { Logo } from 'components';
import { getTokenLogoURL } from 'utils/getTokenLogoURL';
import 'components/styles/CurrencyLogo.scss';

interface CurrencyLogoProps {
  currency?: Currency;
  size?: string;
  style?: React.CSSProperties;
  withoutBg?: boolean;
}

const CurrencyLogo: React.FC<CurrencyLogoProps> = ({
  currency,
  size = '24px',
  style,
  withoutBg,
}) => {
  const uriLocations = useHttpLocations(
    currency instanceof WrappedTokenInfo ||
      currency instanceof V3WrappedTokenInfo
      ? currency.logoURI ?? currency.tokenInfo.logoURI
      : undefined,
  );

  const srcs: string[] = useMemo(() => {
    if (
      currency &&
      (currencyEquals(currency, ETHER) || (currency as V3Currency).isNative)
    )
      return [];

    if (
      currency instanceof WrappedTokenInfo ||
      currency instanceof V3WrappedTokenInfo
    ) {
      return [
        ...getTokenLogoURL(currency.address ?? currency.tokenInfo.address),
        ...uriLocations,
      ];
    }
    if (currency instanceof Token || currency instanceof V3Token) {
      return getTokenLogoURL(currency.address);
    }

    return [];
  }, [currency, uriLocations]);

  if (
    currency &&
    (currencyEquals(currency, ETHER) || (currency as V3Currency).isNative)
  ) {
    return (
      <Box
        style={style}
        width={size}
        height={size}
        borderRadius={size}
        className='currencyLogo'
      >
        <img className='ethereumLogo' src={EthereumLogo} alt='Ethereum Logo' />
      </Box>
    );
  }

  return (
    <Box
      width={size}
      height={size}
      borderRadius={withoutBg ? 0 : size}
      className={`currencyLogo${withoutBg ? '' : ' bg-white'}`}
    >
      <Logo
        srcs={srcs}
        size={size}
        alt={`${currency?.symbol ?? 'token'} logo`}
        symbol={currency?.symbol}
      />
    </Box>
  );
};

export default CurrencyLogo;
