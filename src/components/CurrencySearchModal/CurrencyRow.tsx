import { CurrencyAmount, currencyEquals, ETHER, Token } from '@uniswap/sdk';
import { NativeCurrency } from '@uniswap/sdk-core';
import React from 'react';
import { Box } from 'theme/components';
import Loader from 'components/Loader';
import { useActiveWeb3React } from 'hooks';
import { WrappedTokenInfo } from 'state/lists/hooks';
import { useAddUserToken, useRemoveUserAddedToken } from 'state/user/hooks';
import { useCurrencyBalance } from 'state/wallet/hooks';
import { useIsUserAddedToken } from 'hooks/Tokens';
import { CurrencyLogo } from 'components';
import { getTokenLogoURL } from 'utils/getTokenLogoURL';
import { PlusHelper } from 'components/QuestionHelper';
import { ReactComponent as TokenSelectedIcon } from 'assets/images/TokenSelected.svg';
import useUSDCPrice from 'utils/useUSDCPrice';
import { default as useUSDCPriceV3 } from 'hooks/v3/useUSDCPrice';
import { formatTokenAmount } from 'utils';
import { useTranslation } from 'react-i18next';
import { toToken } from 'constants/v3/routing';
import { WMATIC_EXTENDED } from 'constants/v3/addresses';
import { TooltipOnHover } from 'components/v3/Tooltip';

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
      <TooltipOnHover text={tag.description}>
        <Box className='tag' key={tag.id}>
          {tag.name}
        </Box>
      </TooltipOnHover>
      {tags.length > 1 ? (
        <TooltipOnHover
          text={tags
            .slice(1)
            .map(({ name, description }) => `${name}: ${description}`)
            .join('; \n')}
        >
          <Box className='tag'>...</Box>
        </TooltipOnHover>
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
}

const CurrencyRow: React.FC<CurrenyRowProps> = ({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
  isOnSelectedList,
}) => {
  const { t } = useTranslation();

  const { ethereum } = window as any;
  const { account, chainId } = useActiveWeb3React();
  const key = currencyKey(currency);

  const usdPriceV2 = useUSDCPrice(currency);
  const usdPriceV2Number = usdPriceV2 ? Number(usdPriceV2.toSignificant()) : 0;
  const currencyV3 =
    chainId && currency
      ? currencyEquals(currency, ETHER)
        ? ({
            ...ETHER,
            isNative: true,
            isToken: false,
            wrapped: WMATIC_EXTENDED[chainId],
          } as NativeCurrency)
        : toToken(currency)
      : undefined;
  const usdPriceV3 = useUSDCPriceV3(currencyV3);
  const usdPriceV3Number = usdPriceV3 ? Number(usdPriceV3.toSignificant()) : 0;
  const usdPrice = usdPriceV3Number ?? usdPriceV2Number;
  const balance = useCurrencyBalance(account ?? undefined, currency);
  const customAdded = useIsUserAddedToken(currency);

  const removeToken = useRemoveUserAddedToken();
  const addToken = useAddUserToken();
  const isMetamask =
    ethereum &&
    ethereum.isMetaMask &&
    Number(ethereum.chainId) === 137 &&
    isOnSelectedList;

  const addTokenToMetamask = (
    tokenAddress: any,
    tokenSymbol: any,
    tokenDecimals: any,
    tokenImage: any,
  ) => {
    if (ethereum) {
      ethereum
        .request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20', // Initially only supports ERC20, but eventually more!
            options: {
              address: tokenAddress, // The address that the token is at.
              symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
              decimals: tokenDecimals, // The number of decimals in the token
              image: tokenImage, // A string url of the token logo
            },
          },
        })
        .catch((error: any) => {
          if (error.code === 4001) {
            // EIP-1193 userRejectedRequest error
            console.log('We can encrypt anything without the key.');
          } else {
            console.error(error);
          }
        });
    }
  };

  // only show add or remove buttons if not on selected list
  return (
    <Box
      style={style}
      key={key}
      padding='6px 8px'
      className='cursor-pointer'
      onClick={() => {
        if (!isSelected && !otherSelected) onSelect();
      }}
    >
      <Box className='currencyRow'>
        {(otherSelected || isSelected) && <TokenSelectedIcon />}
        <CurrencyLogo currency={currency} size='32px' />
        <Box margin='0 0 0 8px'>
          <Box className='flex items-center'>
            <small className='currencySymbol'>{currency.symbol}</small>
            {isMetamask && currency !== ETHER && (
              <Box
                className='flex cursor-pointer'
                margin='0 0 0 2px'
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
                margin='0 0 0 4px'
                className='text-primary'
                onClick={(event) => {
                  event.stopPropagation();
                  if (customAdded) {
                    if (chainId && currency instanceof Token)
                      removeToken(chainId, currency.address);
                  } else {
                    if (currency instanceof Token) addToken(currency);
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
                ${(Number(balance.toExact()) * usdPrice).toLocaleString('us')}
              </span>
            </>
          ) : account ? (
            <Loader size='24px' color='#344252' />
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default CurrencyRow;
