import React, { useState } from 'react';
import { Box, Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ChevronDown, ChevronUp } from 'react-feather';
import { Pair, JSBI, Percent, Currency } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useTokenBalance } from 'state/wallet/hooks';
import { useTotalSupply } from 'data/TotalSupply';
import { CurrencyLogo, DoubleCurrencyLogo, RemoveLiquidityModal } from 'components';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  poolButtonRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '& .MuiButton-root': {
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      borderRadius: 10,
      '& a': {
        textDecoration: 'none'
      },
      '& p': {
        color: '#ebecf2'
      }
    },
    '& .MuiButton-outlined': {
      width: '49%',
      background: 'transparent',
      border: '1px solid #404557'
    },
    '& .MuiButton-contained': {
      width: '24%',
      border: '1px solid transparent',
      backgroundImage: 'linear-gradient(286deg, #004ce6, #3d71ff)',
      backgroundColor: 'transparent'
    }
  }
}));

interface PoolPositionCardProps {
  pair: Pair
  handleAddLiquidity: (currency0: Currency, currency1: Currency) => void
}

const PoolPositionCard: React.FC<PoolPositionCardProps> = ({ pair, handleAddLiquidity }) => {
  const classes = useStyles();
  const { account } = useActiveWeb3React();

  const [ openRemoveLiquidityModal, setOpenRemoveLiquidityModal ] = useState(false);

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  return (
    <Box width={1} border='1px solid #282d3d' borderRadius={10} bgcolor={ showMore ? '#282d3d' : 'transparent' } style={{ overflow: 'hidden' }}>
      {
        openRemoveLiquidityModal &&
          <RemoveLiquidityModal
            currency0={currency0}
            currency1={currency1}
            open={openRemoveLiquidityModal}
            onClose={() => setOpenRemoveLiquidityModal(false)}
          />
      }
      <Box padding={3} display='flex' alignItems='center' justifyContent='space-between'>
        <Box display='flex' alignItems='center'>
          <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={28} />
          <Typography variant='h6' style={{ color: '#ebecf2', marginLeft: 16 }}>
            {!currency0 || !currency1 ? 'Loading' : `${currency0.symbol}/${currency1.symbol}`}
          </Typography>
        </Box>

        <Box display='flex' alignItems='center' color='#448aff' style={{ cursor: 'pointer' }} onClick={() => setShowMore(!showMore)}>
          <Typography variant='body1' style={{ marginRight: 8 }}>Manage</Typography>
          {showMore ? (
            <ChevronUp size="20" />
          ) : (
            <ChevronDown size="20" />
          )}
        </Box>
      </Box>

      {showMore && (
        <Box px={3} mb={3} >
          <Box display='flex' alignItems='center' justifyContent='space-between' mb={1.5}>
            <Typography variant='body2' style={{ color: '#c7cad9' }}>
              Your pool tokens:
            </Typography>
            <Typography variant='body2' style={{ color: '#c7cad9' }}>
              {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
            </Typography>
          </Box>
          <Box display='flex' alignItems='center' justifyContent='space-between' mb={1.5}>
            <Typography variant='body2' style={{ color: '#c7cad9' }}>
              Pooled {currency0.symbol}:
            </Typography>
            {token0Deposited ? (
              <Box display='flex' alignItems='center'>
                <Typography variant='body2' style={{ color: '#c7cad9', marginRight: 10 }}>
                  {token0Deposited?.toSignificant(6)}
                </Typography>
                <CurrencyLogo size="20px" currency={currency0} />
              </Box>
            ) : (
              '-'
            )}
          </Box>

          <Box display='flex' alignItems='center' justifyContent='space-between' mb={1.5}>
            <Typography variant='body2' style={{ color: '#c7cad9' }}>
              Pooled {currency1.symbol}:
            </Typography>
            {token1Deposited ? (
              <Box display='flex' alignItems='center'>
                <Typography variant='body2' style={{ color: '#c7cad9', marginRight: 10 }}>
                  {token1Deposited?.toSignificant(6)}
                </Typography>
                <CurrencyLogo size="20px" currency={currency1} />
              </Box>
            ) : (
              '-'
            )}
          </Box>

          <Box display='flex' alignItems='center' justifyContent='space-between' mb={1.5}>
            <Typography variant='body2' style={{ color: '#c7cad9' }}>
              Your pool share:
            </Typography>
            <Typography variant='body2' style={{ color: '#c7cad9' }}>
              {poolTokenPercentage ? poolTokenPercentage.toFixed(2) + '%' : '-'}
            </Typography>
          </Box>

          <Box className={classes.poolButtonRow}>
            <Button variant='outlined'>
              <a href={`https://info.quickswap.exchange/account/${account}`} target='_blank' rel='noreferrer'>
                <Typography variant='body2'>View Analytics</Typography>
              </a>
            </Button>
            <Button variant='contained' onClick={() => { handleAddLiquidity(currency0, currency1); }}>
              <Typography variant='body2'>Add</Typography>
            </Button>
            <Button variant='contained' onClick={() => { setOpenRemoveLiquidityModal(true); }}>
              <Typography variant='body2'>Remove</Typography>
            </Button>
          </Box>
        </Box>
      )}
      <Box bgcolor='#404557' height='36px' paddingX={3} display='flex' alignItems='center'>
        <Typography variant='body2'>Earn <span style={{ color: '#0fc679' }}>49% APY</span> by staking your LP tokens in {currency0.symbol?.toUpperCase()} / {currency1.symbol?.toUpperCase()} Farm</Typography>
      </Box>
    </Box>
  )
}

export default PoolPositionCard;
