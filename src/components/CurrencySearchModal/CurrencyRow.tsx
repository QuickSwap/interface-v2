import { ChainId, CurrencyAmount, ETHER, Token } from '@uniswap/sdk';
import { Currency as V3Currency } from '@uniswap/sdk-core';
import React, { useState, useCallback, useMemo } from 'react';
import { Box, Tooltip, CircularProgress, ListItem } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';
import { WrappedTokenInfo } from 'state/lists/hooks';
import { useAddUserToken, useRemoveUserAddedToken } from 'state/user/hooks';
import { useIsUserAddedToken, useCurrency } from 'hooks/Tokens';
import { CurrencyLogo } from 'components';
import { getTokenLogoURL } from 'utils/getTokenLogoURL';
import { PlusHelper } from 'components/QuestionHelper';
import { ReactComponent as TokenSelectedIcon } from 'assets/images/TokenSelected.svg';
import { formatNumber, formatTokenAmount } from 'utils';
import { useTranslation } from 'react-i18next';
import { getIsMetaMaskWallet } from 'connectors/utils';
import TokenWarningModal from 'components/v3/TokenWarningModal';
import { wrappedCurrency } from 'utils/wrappedCurrency';

//TODO Investigate: shouldnt this key return 'ETH' not 'ETHER'
function currencyKey(currency: Token): string {
  return currency instanceof Token
    ? currency.address
    : currency === ETHER
    ? 'ETHER'
    : '';
}

function Balance({ balance }: { balance: CurrencyAmount }) {
  return (
    <p className='small' title={balance.toExact()}>
      {formatTokenAmount(balance)}
    </p>
  );
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
        <Box className='tag' key={tag.id}>
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
          <Box className='tag'>...</Box>
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
  balance: CurrencyAmount | undefined;
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

  const { account, chainId, library } = useActiveWeb3React();
  const key = currencyKey(currency);
  const customAdded = useIsUserAddedToken(currency);
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const nativeCurrency = ETHER[chainIdToUse];

  const removeToken = useRemoveUserAddedToken();
  const addToken = useAddUserToken();
  const isMetamask = getIsMetaMaskWallet() && isOnSelectedList;

  const addTokenToMetamask = (
    tokenAddress: any,
    tokenSymbol: any,
    tokenDecimals: any,
    tokenImage: any,
  ) => {
    if (library && library.provider && library.provider.request) {
      library.provider.request({
        method: 'wallet_watchAsset',
        params: {
          //@ts-ignore
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: tokenImage,
          },
        },
      });
    }
  };

  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(true);

  const selectedToken = useCurrency(
    wrappedCurrency(currency, chainId)?.address,
  );

  const selectedTokens: Token[] = useMemo(
    () => [selectedToken]?.filter((c): c is Token => c instanceof Token) ?? [],
    [selectedToken],
  );

  const selectedTokensNotInDefault = selectedTokens;

  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true);
  }, []);

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true);
  }, []);

  // only show add or remove buttons if not on selected list
  return (
    <>
      <TokenWarningModal
        isOpen={!dismissTokenWarning}
        tokens={selectedTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
        onDismiss={handleDismissTokenWarning}
      />
      <ListItem
        button
        style={style}
        key={key}
        selected={otherSelected || isSelected}
        onClick={() => {
          if (!isSelected && !otherSelected) onSelect();
        }}
      >
        <Box className='currencyRow'>
          {(otherSelected || isSelected) && <TokenSelectedIcon />}
          <CurrencyLogo currency={currency} size='32px' />
          <Box ml={1} height={32}>
            <Box className='flex items-center'>
              <small className='currencySymbol'>{currency.symbol}</small>
              {isMetamask &&
                currency !== nativeCurrency &&
                !(currency as V3Currency).isNative && (
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
            {isOnSelectedList ? (
              <span className='currencyName'>{currency.name}</span>
            ) : (
              <Box className='flex items-center'>
                <span>
                  {customAdded ? t('addedByUser') : t('foundByAddress')}
                </span>
                <Box
                  ml={0.5}
                  className='text-primary'
                  onClick={(event) => {
                    event.stopPropagation();
                    if (customAdded) {
                      if (chainId && currency instanceof Token)
                        removeToken(chainId, currency.address);
                    } else {
                      if (currency instanceof Token) {
                        addToken(currency);
                        setDismissTokenWarning(false);
                      }
                    }
                  }}
                >
                  <span>
                    {customAdded ? `(${t('remove')})` : `(${t('add')})`}
                  </span>
                </Box>
              </Box>
            )}
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
    </>
  );
};

export default CurrencyRow;
