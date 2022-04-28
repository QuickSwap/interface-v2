import { CurrencyAmount, ETHER, Token } from '@uniswap/sdk';
import React from 'react';
import {
  Box,
  Tooltip,
  Typography,
  CircularProgress,
  ListItem,
} from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
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
import { formatTokenAmount } from 'utils';

function currencyKey(currency: Token): string {
  return currency instanceof Token
    ? currency.address
    : currency === ETHER
    ? 'ETHER'
    : '';
}

const useStyles = makeStyles(({ palette }) => ({
  tag: {
    fontSize: 14,
    borderRadius: 4,
    padding: '0.25rem 0.3rem 0.25rem 0.3rem',
    maxWidth: '6rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  currencyRow: {
    width: '100%',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    '& > p': {
      margin: '0 4px',
    },
    '& button': {
      background: 'transparent',
      padding: 0,
      minWidth: 'unset',
      '& svg': {
        fill: 'white',
        stroke: 'black',
      },
      '& div': {
        background: 'transparent',
      },
    },
  },
  currencySymbol: {
    color: palette.text.primary,
    lineHeight: 1,
  },
  currencyName: {
    color: palette.text.secondary,
  },
}));

function Balance({ balance }: { balance: CurrencyAmount }) {
  const { palette } = useTheme();
  return (
    <Typography
      variant='body2'
      title={balance.toExact()}
      style={{ color: palette.text.primary }}
    >
      {formatTokenAmount(balance)}
    </Typography>
  );
}

function TokenTags({ currency }: { currency: Token }) {
  const classes = useStyles();
  if (!(currency instanceof WrappedTokenInfo)) {
    return <span />;
  }

  const tags = currency.tags;
  if (!tags || tags.length === 0) return <span />;

  const tag = tags[0];

  return (
    <Box>
      <Tooltip title={tag.description}>
        <Box className={classes.tag} key={tag.id}>
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
          <Box className={classes.tag}>...</Box>
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
}

const CurrencyRow: React.FC<CurrenyRowProps> = ({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
  isOnSelectedList,
}) => {
  const { ethereum } = window as any;
  const classes = useStyles();
  const { palette } = useTheme();
  const { account, chainId } = useActiveWeb3React();
  const key = currencyKey(currency);

  const usdPrice = useUSDCPrice(currency);
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
    <ListItem
      button
      style={style}
      key={key}
      selected={otherSelected || isSelected}
      onClick={() => {
        if (!isSelected && !otherSelected) onSelect();
      }}
    >
      <Box className={classes.currencyRow}>
        {(otherSelected || isSelected) && <TokenSelectedIcon />}
        <CurrencyLogo currency={currency} size={'32px'} />
        <Box ml={1} height={32}>
          <Box display='flex' alignItems='center'>
            <Typography variant='body2' className={classes.currencySymbol}>
              {currency.symbol}
            </Typography>
            {isMetamask && currency !== ETHER && (
              <Box
                style={{ cursor: 'pointer', marginLeft: 2 }}
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
                <PlusHelper text='Add to metamask.' />
              </Box>
            )}
          </Box>
          {isOnSelectedList ? (
            <Typography variant='caption' className={classes.currencyName}>
              {currency.name}
            </Typography>
          ) : (
            <Box display='flex' alignItems='center'>
              <Typography variant='caption'>
                {customAdded ? 'Added by user' : 'Found by address'}
              </Typography>
              <Box
                ml={0.5}
                color={palette.primary.main}
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
                <Typography variant='caption'>
                  {customAdded ? '(Remove)' : '(Add)'}
                </Typography>
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
              <Typography
                variant='caption'
                style={{ color: palette.text.secondary }}
              >
                $
                {(
                  Number(balance.toExact()) *
                  (usdPrice ? Number(usdPrice.toSignificant()) : 0)
                ).toLocaleString()}
              </Typography>
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
