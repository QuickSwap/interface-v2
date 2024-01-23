import { ChainId, ETHER, Token } from '@uniswap/sdk';
import { Currency, CurrencyAmount } from '@uniswap/sdk-core';
import React from 'react';
import { Box, Tooltip, CircularProgress, ListItem } from '@mui/material';
import { useActiveWeb3React } from 'hooks';
import { WrappedTokenInfo } from 'state/lists/hooks';
import { CurrencyLogo } from 'components';
import { getTokenLogoURL } from 'utils/getTokenLogoURL';
import { PlusHelper } from 'components/QuestionHelper';
import { formatNumber } from 'utils';
import { useTranslation } from 'next-i18next';
import { getIsMetaMaskWallet } from 'connectors/utils';
import styles from 'styles/components/CurrencySearchModal.module.scss';
import TokenSelected from 'svgs/TokenSelected.svg';

//TODO Investigate: shouldnt this key return 'ETH' not 'ETHER'
function currencyKey(currency: Token): string {
  return currency instanceof Token
    ? currency.address
    : currency === ETHER
    ? 'ETHER'
    : '';
}

function Balance({ balance }: { balance: CurrencyAmount<Currency> }) {
  return <p className='small'>{formatNumber(balance.toExact())}</p>;
}

function TokenTags({ currency }: { currency: Token }) {
  if (!(currency instanceof WrappedTokenInfo)) {
    return <span />;
  }

  const tags = currency.tags;
  if (!tags || tags.length === 0) return <span />;

  const tag = tags[0];
  return (
    <Box>
      <Tooltip title={tag.description}>
        <Box className={styles.tag} key={tag.id}>
          {tag.name}
        </Box>
      </Tooltip>
      {tags.length > 1 ? (
        <Tooltip
          title={tags
            .slice(1)
            .map(({ name, description }) => `${name}: ${description}`)
            .join('; \n')}
        >
          <Box className={styles.tag}>...</Box>
        </Tooltip>
      ) : null}
    </Box>
  );
}

interface CurrenyRowProps {
  currency: Token;
  onSelect: () => void;
  isSelected: boolean;
  otherSelected: boolean;
  style: any;
  isOnSelectedList?: boolean;
  balance: CurrencyAmount<Currency> | undefined;
  usdPrice: number;
}

const CurrencyRow: React.FC<CurrenyRowProps> = ({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
  isOnSelectedList,
  balance,
  usdPrice,
}) => {
  const { t } = useTranslation();

  const { account, chainId, connector } = useActiveWeb3React();
  const key = currencyKey(currency);
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const nativeCurrency = ETHER[chainIdToUse];

  const isMetamask = getIsMetaMaskWallet() && isOnSelectedList;

  const addTokenToMetamask = (
    tokenAddress: any,
    tokenSymbol: any,
    tokenDecimals: any,
    tokenImage: any,
  ) => {
    if (connector.watchAsset) {
      connector.watchAsset({
        address: tokenAddress,
        symbol: tokenSymbol,
        decimals: tokenDecimals,
        image: tokenImage,
      });
    }
  };

  // only show add or remove buttons if not on selected list
  return (
    <ListItem
      style={style}
      key={key}
      onClick={() => {
        if (!isSelected && !otherSelected) onSelect();
      }}
    >
      <Box className={styles.currencyRow}>
        {(otherSelected || isSelected) && <TokenSelected />}
        <CurrencyLogo currency={currency} size={32} />
        <Box ml={1} height={32}>
          <Box className='flex items-center'>
            <small className={styles.currencySymbol}>{currency.symbol}</small>
            {isMetamask &&
              currency !== nativeCurrency &&
              !(currency as Currency).isNative && (
                <Box
                  className='cursor-pointer'
                  ml='2px'
                  onClick={(event: any) => {
                    addTokenToMetamask(
                      currency.address,
                      currency.symbol,
                      currency.decimals,
                      getTokenLogoURL(currency.address),
                    );
                    event.stopPropagation();
                  }}
                >
                  <PlusHelper text={t('addToMetamask')} />
                </Box>
              )}
          </Box>
          <span className={styles.currencyName}>{currency.name}</span>
        </Box>

        <Box flex={1}></Box>
        <TokenTags currency={currency} />
        <Box textAlign='right'>
          {balance ? (
            <>
              <Balance balance={balance} />
              <span className='text-secondary'>
                ${formatNumber(Number(balance.toExact()) * usdPrice)}
              </span>
            </>
          ) : account ? (
            <CircularProgress size={24} color='secondary' />
          ) : null}
        </Box>
      </Box>
    </ListItem>
  );
};

export default CurrencyRow;
