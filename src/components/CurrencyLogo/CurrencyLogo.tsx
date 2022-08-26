import { Currency, ETHER, Token } from '@uniswap/sdk';
import React, { useMemo } from 'react';
import { Box } from '@material-ui/core';
import EthereumLogo from 'assets/images/Currency/PolygonSwap.svg';
import useHttpLocations from 'hooks/useHttpLocations';
import { WrappedTokenInfo } from 'state/lists/hooks';
import { Logo } from 'components';
import { getTokenLogoURL } from 'utils/getTokenLogoURL';
import 'components/styles/CurrencyLogo.scss';
import { stringToColour } from 'utils/stringToColour';

interface CurrencyLogoProps {
  currency?: Currency;
  size?: string;
  style?: React.CSSProperties;
}

const CurrencyLogo: React.FC<CurrencyLogoProps> = ({
  currency,
  size = '24px',
  style,
}) => {
  const uriLocations = useHttpLocations(
    currency instanceof WrappedTokenInfo ? currency.logoURI : undefined,
  );

  const srcs: string[] = useMemo(() => {
    if (currency === ETHER) return [];

    if (currency instanceof Token) {
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, ...getTokenLogoURL(currency.address)];
      }

      return getTokenLogoURL(currency.address);
    }
    return [];
  }, [currency, uriLocations]);

  if (currency === ETHER) {
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
  const symbol = currency?.symbol ?? '';
  return (
    <Box
      style={{
        ...style,
        background: stringToColour(symbol).background,
        color: stringToColour(symbol).text,
        border: stringToColour(symbol).border,

        fontSize: size === '18px' ? '8px' : size === '24px' ? '12px' : '10px',
      }}
      width={size}
      height={size}
      borderRadius={size}
      className='currencyLogo bg-white'
    >
      <Logo
        srcs={srcs}
        size={size}
        alt={`${currency?.symbol ?? '??'} logo`}
      />
    </Box>
  );
};

export default CurrencyLogo;
