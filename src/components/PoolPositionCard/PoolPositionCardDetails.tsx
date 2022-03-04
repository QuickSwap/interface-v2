import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Typography, Button, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Pair, JSBI, Percent } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useTokenBalance } from 'state/wallet/hooks';
import { useTotalSupply } from 'data/TotalSupply';
import { CurrencyLogo, RemoveLiquidityModal } from 'components';
import { currencyId, formatTokenAmount } from 'utils';

const useStyles = makeStyles(({ palette }) => ({
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
        textDecoration: 'none',
      },
      '& p': {
        color: palette.text.primary,
      },
    },
    '& .MuiButton-outlined': {
      width: '49%',
      background: 'transparent',
      border: '1px solid #404557',
    },
    '& .MuiButton-contained': {
      width: '24%',
      border: '1px solid transparent',
      backgroundImage: 'linear-gradient(286deg, #004ce6, #3d71ff)',
      backgroundColor: 'transparent',
    },
  },
  cardRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    '& p': {
      color: palette.text.primary,
    },
  },
}));

const PoolPositionCardDetails: React.FC<{ pair: Pair }> = ({ pair }) => {
  const classes = useStyles();
  const history = useHistory();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const { account } = useActiveWeb3React();
  const [openRemoveModal, setOpenRemoveModal] = useState(false);

  const currency0 = unwrappedToken(pair.token0);
  const currency1 = unwrappedToken(pair.token1);

  const userPoolBalance = useTokenBalance(
    account ?? undefined,
    pair.liquidityToken,
  );
  const totalPoolTokens = useTotalSupply(pair.liquidityToken);

  const poolTokenPercentage =
    !!userPoolBalance &&
    !!totalPoolTokens &&
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined;

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(
            pair.token0,
            totalPoolTokens,
            userPoolBalance,
            false,
          ),
          pair.getLiquidityValue(
            pair.token1,
            totalPoolTokens,
            userPoolBalance,
            false,
          ),
        ]
      : [undefined, undefined];

  return (
    <>
      <Box px={isMobile ? 1.5 : 3} mb={3}>
        <Box className={classes.cardRow}>
          <Typography variant='body2'>Your pool tokens:</Typography>
          <Typography variant='body2'>
            {formatTokenAmount(userPoolBalance)}
          </Typography>
        </Box>
        <Box className={classes.cardRow}>
          <Typography variant='body2'>Pooled {currency0.symbol}:</Typography>
          <Box display='flex' alignItems='center'>
            <Typography variant='body2' style={{ marginRight: 10 }}>
              {formatTokenAmount(token0Deposited)}
            </Typography>
            <CurrencyLogo size='20px' currency={currency0} />
          </Box>
        </Box>

        <Box className={classes.cardRow}>
          <Typography variant='body2'>Pooled {currency1.symbol}:</Typography>
          <Box display='flex' alignItems='center'>
            <Typography variant='body2' style={{ marginRight: 10 }}>
              {formatTokenAmount(token1Deposited)}
            </Typography>
            <CurrencyLogo size='20px' currency={currency1} />
          </Box>
        </Box>

        <Box className={classes.cardRow}>
          <Typography variant='body2'>Your pool share:</Typography>
          <Typography variant='body2'>
            {poolTokenPercentage
              ? poolTokenPercentage.toSignificant() + '%'
              : '-'}
          </Typography>
        </Box>

        <Box className={classes.poolButtonRow}>
          <Button
            variant='outlined'
            onClick={() =>
              history.push(`/analytics/pair/${pair.liquidityToken.address}`)
            }
          >
            <Typography variant='body2'>View Analytics</Typography>
          </Button>
          <Button
            variant='contained'
            onClick={() => {
              history.push(
                `/pools?currency0=${currencyId(
                  currency0,
                )}&currency1=${currencyId(currency1)}`,
              );
            }}
          >
            <Typography variant='body2'>Add</Typography>
          </Button>
          <Button
            variant='contained'
            onClick={() => {
              setOpenRemoveModal(true);
            }}
          >
            <Typography variant='body2'>Remove</Typography>
          </Button>
        </Box>
      </Box>
      {openRemoveModal && (
        <RemoveLiquidityModal
          currency0={currency0}
          currency1={currency1}
          open={openRemoveModal}
          onClose={() => setOpenRemoveModal(false)}
        />
      )}
    </>
  );
};

export default PoolPositionCardDetails;
