import { ChainId, Currency, currencyEquals, ETHER, Token } from '@uniswap/sdk';
import { Currency as V3Currency, Token as V3Token } from '@uniswap/sdk-core';
import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import useHttpLocations from 'hooks/useHttpLocations';
import { WrappedTokenInfo } from 'state/lists/hooks';
import { WrappedTokenInfo as V3WrappedTokenInfo } from 'state/lists/v3/wrappedTokenInfo';
import { Logo } from 'components';
import { getTokenLogoURL } from 'utils/getTokenLogoURL';
import styles from 'styles/components/CurrencyLogo.module.scss';
import Image from 'next/image';
import { useActiveWeb3React } from 'hooks';

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
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const nativeCurrency = ETHER[chainIdToUse];
  const nativeCurrencyImage = `/${currency?.symbol}.png`;
  const uriLocations = useHttpLocations(
    currency instanceof WrappedTokenInfo ||
      currency instanceof V3WrappedTokenInfo
      ? currency.logoURI ?? currency.tokenInfo.logoURI
      : undefined,
  );

  const srcs: string[] = useMemo(() => {
    if (
      currency &&
      (currencyEquals(currency, nativeCurrency) ||
        (currency as V3Currency).isNative)
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
  }, [currency, nativeCurrency, uriLocations]);

  if (
    currency &&
    (currencyEquals(currency, nativeCurrency) ||
      (currency as V3Currency).isNative)
  ) {
    return (
      <Box
        style={style}
        width={size}
        height={size}
        borderRadius={size}
        className={styles.currencyLogo}
      >
        <Image
          className={styles.ethereumLogo}
          src={nativeCurrencyImage}
          alt='Ethereum Logo'
          width={100}
          height={100}
        />
      </Box>
    );
  }

  return (
    <Box
      width={size}
      height={size}
      borderRadius={withoutBg ? 0 : size}
      className={`${styles.currencyLogo} ${withoutBg ? '' : 'bg-white'}`}
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