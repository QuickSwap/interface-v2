import { CurrencyAmount, currencyEquals, ETHER, Token, Currency } from '@uniswap/sdk'
import React, { useMemo, useCallback } from 'react'
import { Box, Tooltip, Typography, Button, CircularProgress, ListItem } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import { FixedSizeList } from 'react-window';
import { useActiveWeb3React } from 'hooks'
import { useSelectedTokenList, WrappedTokenInfo } from 'state/lists/hooks'
import { useAddUserToken, useRemoveUserAddedToken } from 'state/user/hooks'
import { useIsUserAddedToken } from 'hooks/Tokens'
import { CurrencyLogo } from 'components'
import { isTokenOnList } from 'utils'
import { getTokenLogoURL } from 'components/CurrencyLogo'
import { PlusHelper } from 'components/QuestionHelper'
import { ReactComponent as TokenSelectedIcon } from 'assets/images/TokenSelected.svg'
import useUSDCPrice from 'utils/useUSDCPrice';

function currencyKey(currency: Token): string {
  return currency instanceof Token ? currency.address : currency === ETHER ? 'ETHER' : ''
}

const useStyles = makeStyles(({ palette, breakpoints }) => ({
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
        stroke: 'black'
      },
      '& div': {
        background: 'transparent'
      }
    },
  },
  currencySymbol: {
    color: '#c7cad9',
    lineHeight: 1
  },
  currencyName: {
    color: '#696c80',
  }
}));

function Balance({ balance }: { balance: CurrencyAmount }) {
  return <Typography variant='body2' title={balance.toExact()} style={{ color: '#c7cad9' }}>{balance.toSignificant(4)}</Typography>
}

function TokenTags({ currency }: { currency: Token }) {
  const classes = useStyles();
  if (!(currency instanceof WrappedTokenInfo)) {
    return <span />
  }

  const tags = currency.tags
  if (!tags || tags.length === 0) return <span />

  const tag = tags[0]

  return (
    <Box>
      <Tooltip title={tag.description}>
        <Box className={classes.tag} key={tag.id}>{tag.name}</Box>
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
  )
}

interface CurrenyRowProps {
  currency: Token
  onSelect: () => void
  isSelected: boolean
  otherSelected: boolean
  style: any
  balance: CurrencyAmount | undefined
}

const CurrencyRow: React.FC<CurrenyRowProps> = ({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
  balance
}) => {
  const { ethereum } = (window as any);
  const classes = useStyles();

  const { account, chainId } = useActiveWeb3React()
  const key = currencyKey(currency)
  const selectedTokenList = useSelectedTokenList()
  const isOnSelectedList = isTokenOnList(selectedTokenList, currency)
  const customAdded = useIsUserAddedToken(currency)
  const usdPrice = useUSDCPrice(currency)

  const removeToken = useRemoveUserAddedToken()
  const addToken = useAddUserToken()
  const isMetamask = (ethereum && ethereum.isMetaMask && Number(ethereum.chainId) === 137 && isOnSelectedList);

  const addTokenToMetamask = (tokenAddress:any, tokenSymbol:any, tokenDecimals:any, tokenImage:any) => {
    if(ethereum) {
      ethereum.request({
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
      .then((result:any) => {
      })
      .catch((error:any) => {
        if (error.code === 4001) {
          // EIP-1193 userRejectedRequest error
          console.log('We can encrypt anything without the key.');
        } else {
          console.error(error);
        }
      });
    }
    
  }

  // only show add or remove buttons if not on selected list
  return (
    <ListItem button style={style} key={key} selected={otherSelected || isSelected} onClick={() => { if(!isSelected && !otherSelected) onSelect(); }}>
      <Box className={classes.currencyRow}>
        { (otherSelected || isSelected)  && <TokenSelectedIcon /> }
        <CurrencyLogo currency={currency} size={'32px'} />
        <Box ml={1} height={32}>
          <Box display='flex' alignItems='center'>
            <Typography variant='body2' className={classes.currencySymbol}>
              {currency.symbol}
            </Typography>
            {
              isMetamask && currency !== ETHER && (
                <Button
                  style={{cursor: 'pointer', marginLeft: 2}}
                  onClick={(event: any) => {
                    addTokenToMetamask(
                      currency.address,
                      currency.symbol,
                      currency.decimals,
                      getTokenLogoURL(currency.address),
                    )
                    event.stopPropagation()
                  }}
                  >
                  <PlusHelper text="Add to metamask." />
                </Button>
              )
            }
          </Box>
          <Typography variant='caption' className={classes.currencyName}>
            {currency.name}
          </Typography>
        </Box>
          
        <Box flex={1}>
          {!isOnSelectedList && customAdded ? (
            <Typography>
              Added by user
              <Button
                onClick={event => {
                  event.stopPropagation()
                  if (chainId && currency instanceof Token) removeToken(chainId, currency.address)
                }}
              >
                (Remove)
              </Button>
            </Typography>
          ) : null}
          {!isOnSelectedList && !customAdded ? (
            <Typography>
              Found by address
              <Button
                onClick={event => {
                  event.stopPropagation()
                  if (currency instanceof Token) addToken(currency)
                }}
              >
                (Add)
              </Button>
            </Typography>
          ) : null}
        </Box>
        <TokenTags currency={currency} />
        <Box textAlign='right'>
          {balance
            ? <>
                <Balance balance={balance} />
                <Typography variant='caption' style={{ color: '#696c80' }}>${ (Number(balance.toSignificant()) * (usdPrice ? Number(usdPrice.toSignificant()) : 0)).toLocaleString() }</Typography>
              </>
            : account ? <CircularProgress size={24} color='secondary' /> : null}
        </Box>
      </Box>
    </ListItem>
  )
}

interface CurrencyListProps {
  currencies: Token[]
  height: number
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Token) => void
  otherCurrency?: Currency | null
  showETH: boolean
  balances: (CurrencyAmount | undefined)[]
}

const CurrencyList: React.FC<CurrencyListProps> = ({
  currencies,
  height,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  showETH,
  balances
}) => {
  const itemData = useMemo(() => (showETH ? [Token.ETHER, ...currencies] : currencies), [currencies, showETH])
  const Row = useCallback(
    ({ data, index, style }) => {
      const currency: Token = data[index]
      const isSelected = Boolean(selectedCurrency && currencyEquals(selectedCurrency, currency))
      const otherSelected = Boolean(otherCurrency && currencyEquals(otherCurrency, currency))
      const handleSelect = () => onCurrencySelect(currency)
      const balance = balances[index]
      return (
        <CurrencyRow
          style={style}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
          otherSelected={otherSelected}
          balance={balance}
        />
      )
    },
    [onCurrencySelect, otherCurrency, selectedCurrency, balances]
  )

  return (
    <FixedSizeList
      height={height}
      width="100%"
      itemData={itemData}
      itemCount={itemData.length}
      itemSize={56}
    >
      {Row}
    </FixedSizeList>
  )
}

export default CurrencyList;
