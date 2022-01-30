import { Currency, ETHER, Token } from '@uniswap/sdk';
import React, { useMemo } from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import EthereumLogo from 'assets/images/Currency/PolygonSwap.svg';
import useHttpLocations from 'hooks/useHttpLocations';
import { WrappedTokenInfo } from 'state/lists/hooks';
import { Logo } from 'components';
import { getTokenLogoURL } from 'utils/getTokenLogoURL';

const useStyles = makeStyles(({}) => ({
  logoStyled: {
    boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.075)',
    borderRadius: 24,
  },
}));

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
  const classes = useStyles();
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
        overflow='hidden'
      >
        <img
          className={classes.logoStyled}
          style={{ width: size, height: size }}
          src={EthereumLogo}
          alt='Ethereum Logo'
        />
      </Box>
    );
  }

  return (
    <Box
      width={size}
      height={size}
      borderRadius={size}
      overflow='hidden'
      bgcolor='white'
      display='flex'
      justifyContent='center'
      alignItems='center'
    >
      <Logo
        srcs={srcs}
        size={size}
        alt={`${currency?.symbol ?? 'token'} logo`}
      />
    </Box>
  );
};

export default CurrencyLogo;
