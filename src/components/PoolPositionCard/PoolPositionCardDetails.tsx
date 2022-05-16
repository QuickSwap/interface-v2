import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Button, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { Pair, JSBI, Percent } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useTokenBalance } from 'state/wallet/hooks';
import { useTotalSupply } from 'data/TotalSupply';
import { CurrencyLogo, RemoveLiquidityModal } from 'components';
import { currencyId, formatTokenAmount } from 'utils';

const PoolPositionCardDetails: React.FC<{ pair: Pair }> = ({ pair }) => {
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
        <Box className='cardRow'>
          <small>Your pool tokens:</small>
          <small>{formatTokenAmount(userPoolBalance)}</small>
        </Box>
        <Box className='cardRow'>
          <small>Pooled {currency0.symbol}:</small>
          <Box display='flex' alignItems='center'>
            <small style={{ marginRight: 10 }}>
              {formatTokenAmount(token0Deposited)}
            </small>
            <CurrencyLogo size='20px' currency={currency0} />
          </Box>
        </Box>

        <Box className='cardRow'>
          <small>Pooled {currency1.symbol}:</small>
          <Box display='flex' alignItems='center'>
            <small style={{ marginRight: 10 }}>
              {formatTokenAmount(token1Deposited)}
            </small>
            <CurrencyLogo size='20px' currency={currency1} />
          </Box>
        </Box>

        <Box className='cardRow'>
          <small>Your pool share:</small>
          <small>
            {poolTokenPercentage
              ? poolTokenPercentage.toSignificant() + '%'
              : '-'}
          </small>
        </Box>

        <Box className='poolButtonRow'>
          <Button
            variant='outlined'
            onClick={() =>
              history.push(`/analytics/pair/${pair.liquidityToken.address}`)
            }
          >
            <small>View Analytics</small>
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
            <small>Add</small>
          </Button>
          <Button
            variant='contained'
            onClick={() => {
              setOpenRemoveModal(true);
            }}
          >
            <small>Remove</small>
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
